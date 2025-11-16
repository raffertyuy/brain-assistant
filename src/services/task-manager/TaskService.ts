import type { Task } from '../../models/Task';
import { Quadrant } from '../../models/Quadrant';
import type { StorageService } from '../storage/StorageService';
import { TaskValidationError, TaskNotFoundError } from './errors';
import { v4 as uuidv4 } from 'uuid';
import matter from 'gray-matter';

export interface ArchiveFilters {
  area?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Service for managing tasks within a profile
 */
export class TaskService {
  private tasks: Task[] = [];
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  /**
   * Load tasks from storage
   */
  async loadTasks(): Promise<void> {
    try {
      const content = await this.storage.readTasksFile();
      this.tasks = this.deserializeTasksFromMarkdown(content);
    } catch (error) {
      // If file doesn't exist yet, start with empty array
      this.tasks = [];
    }
  }

  /**
   * Save tasks to storage
   */
  async saveTasks(): Promise<void> {
    const content = this.serializeTasksToMarkdown(this.tasks);
    await this.storage.writeTasksFile(content);
  }

  /**
   * Get all active tasks for current profile
   * @returns Promise resolving to array of active tasks
   */
  async getAllTasks(): Promise<Task[]> {
    return this.tasks.filter(t => t.status === 'active');
  }

  /**
   * Get tasks by quadrant
   * @param quadrant - Quadrant to filter by
   * @returns Promise resolving to tasks in specified quadrant
   */
  async getTasksByQuadrant(quadrant: Quadrant): Promise<Task[]> {
    return this.tasks.filter(t => t.status === 'active' && t.quadrant === quadrant);
  }

  /**
   * Create a new task
   * @param taskData - Partial task data (ID and timestamps auto-generated)
   * @returns Promise resolving to created task
   * @throws {TaskValidationError} if task data is invalid
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    this.validateTask(taskData);

    const task: Task = {
      id: uuidv4(),
      createdAt: new Date(),
      ...taskData,
    };

    // Ensure quadrant matches urgency + businessImpact
    task.quadrant = this.calculateQuadrant(task.urgency, task.businessImpact);

    this.tasks.push(task);
    await this.saveTasks();

    return task;
  }

  /**
   * Update existing task
   * @param id - Task UUID
   * @param updates - Partial task data to update
   * @returns Promise resolving to updated task
   * @throws {TaskNotFoundError} if task doesn't exist
   * @throws {TaskValidationError} if updates are invalid
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new TaskNotFoundError(id);
    }

    const task = { ...this.tasks[taskIndex], ...updates };
    this.validateTask(task);

    // Recalculate quadrant if urgency or businessImpact changed
    if (updates.urgency || updates.businessImpact) {
      task.quadrant = this.calculateQuadrant(task.urgency, task.businessImpact);
    }

    this.tasks[taskIndex] = task;
    await this.saveTasks();

    return task;
  }

  /**
   * Move task to different quadrant
   * @param id - Task UUID
   * @param targetQuadrant - New quadrant
   * @returns Promise resolving to updated task
   * @throws {TaskNotFoundError} if task doesn't exist
   */
  async moveToQuadrant(id: string, targetQuadrant: Quadrant): Promise<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new TaskNotFoundError(id);
    }

    const task = this.tasks[taskIndex];

    // Update urgency and businessImpact based on target quadrant
    const { urgency, businessImpact } = this.getQuadrantAttributes(targetQuadrant);
    task.urgency = urgency;
    task.businessImpact = businessImpact;
    task.quadrant = targetQuadrant;

    this.tasks[taskIndex] = task;
    await this.saveTasks();

    return task;
  }

  /**
   * Mark task as completed
   * @param id - Task UUID
   * @returns Promise resolving to completed task
   * @throws {TaskNotFoundError} if task doesn't exist
   */
  async completeTask(id: string): Promise<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) {
      throw new TaskNotFoundError(id);
    }

    const task = this.tasks[taskIndex];
    task.status = 'completed';
    task.completedAt = new Date();

    this.tasks[taskIndex] = task;

    // Move to archive
    await this.archiveTask(task);
    await this.saveTasks();

    return task;
  }

  /**
   * Get archived (completed) tasks
   * @param filters - Optional filters (by area, date range, etc.)
   * @returns Promise resolving to archived tasks
   */
  async getArchivedTasks(filters?: ArchiveFilters): Promise<Task[]> {
    try {
      const content = await this.storage.readArchiveFile();
      let tasks = this.deserializeTasksFromMarkdown(content);

      if (filters) {
        if (filters.area) {
          tasks = tasks.filter(t => t.area === filters.area);
        }
        if (filters.startDate) {
          tasks = tasks.filter(t => 
            t.completedAt && t.completedAt >= filters.startDate!
          );
        }
        if (filters.endDate) {
          tasks = tasks.filter(t => 
            t.completedAt && t.completedAt <= filters.endDate!
          );
        }
      }

      return tasks;
    } catch (error) {
      // No archive file yet
      return [];
    }
  }

  /**
   * Search tasks (active and archived)
   * @param query - Search query string
   * @returns Promise resolving to matching tasks
   */
  async searchTasks(query: string): Promise<Task[]> {
    const lowerQuery = query.toLowerCase();
    const activeTasks = this.tasks.filter(t => 
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.area.toLowerCase().includes(lowerQuery)
    );

    const archivedTasks = await this.getArchivedTasks();
    const matchedArchived = archivedTasks.filter(t => 
      t.title.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.area.toLowerCase().includes(lowerQuery)
    );

    return [...activeTasks, ...matchedArchived];
  }

  /**
   * Detect if task is duplicate of existing task
   * @param taskData - Task data to check
   * @returns Promise resolving to potential duplicate or null
   */
  async findDuplicate(taskData: Partial<Task>): Promise<Task | null> {
    if (!taskData.title) return null;

    const lowerTitle = taskData.title.toLowerCase();
    
    for (const task of this.tasks) {
      if (task.status === 'active') {
        const similarity = this.calculateSimilarity(
          lowerTitle,
          task.title.toLowerCase()
        );
        
        if (similarity > 0.8) {
          return task;
        }
      }
    }

    return null;
  }

  /**
   * Merge duplicate task into existing task
   * @param existingId - Existing task ID
   * @param duplicateData - Duplicate task data to merge
   * @returns Promise resolving to merged task
   */
  async mergeDuplicate(existingId: string, duplicateData: Partial<Task>): Promise<Task> {
    const taskIndex = this.tasks.findIndex(t => t.id === existingId);
    if (taskIndex === -1) {
      throw new TaskNotFoundError(existingId);
    }

    const task = this.tasks[taskIndex];

    // Merge context/description if duplicate has additional info
    if (duplicateData.description && duplicateData.description !== task.description) {
      task.context = task.context 
        ? `${task.context}\n\n${duplicateData.description}`
        : duplicateData.description;
    }

    this.tasks[taskIndex] = task;
    await this.saveTasks();

    return task;
  }

  /**
   * Calculate quadrant based on urgency and business impact
   * @param urgency - Urgency level
   * @param businessImpact - Business impact level
   * @returns Calculated quadrant
   */
  calculateQuadrant(
    urgency: 'urgent' | 'not-urgent',
    businessImpact: 'high' | 'low'
  ): Quadrant {
    if (urgency === 'urgent' && businessImpact === 'high') return Quadrant.DO;
    if (urgency === 'not-urgent' && businessImpact === 'high') return Quadrant.PLAN;
    if (urgency === 'urgent' && businessImpact === 'low') return Quadrant.DELEGATE;
    return Quadrant.ELIMINATE;
  }

  /**
   * Get quadrant attributes (urgency, businessImpact) from quadrant
   * @param quadrant - Target quadrant
   * @returns Urgency and business impact
   */
  private getQuadrantAttributes(quadrant: Quadrant): {
    urgency: 'urgent' | 'not-urgent';
    businessImpact: 'high' | 'low';
  } {
    switch (quadrant) {
      case Quadrant.DO:
        return { urgency: 'urgent', businessImpact: 'high' };
      case Quadrant.PLAN:
        return { urgency: 'not-urgent', businessImpact: 'high' };
      case Quadrant.DELEGATE:
        return { urgency: 'urgent', businessImpact: 'low' };
      case Quadrant.ELIMINATE:
        return { urgency: 'not-urgent', businessImpact: 'low' };
    }
  }

  /**
   * Validate task data
   * @param taskData - Task data to validate
   * @throws {TaskValidationError} if validation fails
   */
  private validateTask(taskData: Partial<Task>): void {
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new TaskValidationError('title', 'Title must not be empty');
    }
    if (taskData.title.length > 200) {
      throw new TaskValidationError('title', 'Title must not exceed 200 characters');
    }
    if (!taskData.area || taskData.area.trim().length === 0) {
      throw new TaskValidationError('area', 'Area must not be empty');
    }
    if (taskData.area.length > 100) {
      throw new TaskValidationError('area', 'Area must not exceed 100 characters');
    }
  }

  /**
   * Serialize tasks to markdown format
   * @param tasks - Tasks to serialize
   * @returns Markdown string with YAML frontmatter
   */
  private serializeTasksToMarkdown(tasks: Task[]): string {
    const activeTasks = tasks.filter(t => t.status === 'active');
    const sections: Record<Quadrant, Task[]> = {
      DO: [],
      PLAN: [],
      DELEGATE: [],
      ELIMINATE: [],
    };

    activeTasks.forEach(task => {
      sections[task.quadrant].push(task);
    });

    let markdown = '# Active Tasks\n\n';

    const quadrants: Quadrant[] = ['DO', 'PLAN', 'DELEGATE', 'ELIMINATE'];
    for (const quadrant of quadrants) {
      const quadrantTasks = sections[quadrant];
      if (quadrantTasks.length > 0) {
        markdown += `## ${quadrant}\n\n`;
        
        for (const task of quadrantTasks) {
          const frontmatter = {
            id: task.id,
            area: task.area,
            urgency: task.urgency,
            businessImpact: task.businessImpact,
            quadrant: task.quadrant,
            status: task.status,
            createdAt: task.createdAt.toISOString(),
            ...(task.dueDate && { dueDate: task.dueDate.toISOString() }),
            ...(task.mindMapId && { mindMapId: task.mindMapId }),
          };

          markdown += matter.stringify(
            `### ${task.title}\n\n${task.description}${task.context ? `\n\n**Context:**\n${task.context}` : ''}`,
            frontmatter
          );
          markdown += '\n\n---\n\n';
        }
      }
    }

    return markdown;
  }

  /**
   * Deserialize tasks from markdown format
   * @param content - Markdown content
   * @returns Array of tasks
   */
  private deserializeTasksFromMarkdown(content: string): Task[] {
    const tasks: Task[] = [];
    
    // Split by task separator
    const taskBlocks = content.split('---\n').filter(block => block.trim());

    for (const block of taskBlocks) {
      if (!block.includes('###')) continue;

      try {
        const parsed = matter(block);
        const data = parsed.data;
        const body = parsed.content;

        // Extract title from markdown heading
        const titleMatch = body.match(/###\s+(.+)/);
        if (!titleMatch) continue;

        const title = titleMatch[1].trim();
        
        // Extract description and context
        const contentAfterTitle = body.substring(body.indexOf(title) + title.length).trim();
        let description = contentAfterTitle;
        let context: string | undefined;

        const contextMatch = contentAfterTitle.match(/\*\*Context:\*\*\n(.+)/s);
        if (contextMatch) {
          context = contextMatch[1].trim();
          description = contentAfterTitle.substring(0, contentAfterTitle.indexOf('**Context:**')).trim();
        }

        const task: Task = {
          id: data.id,
          area: data.area,
          title,
          description,
          ...(context && { context }),
          urgency: data.urgency,
          businessImpact: data.businessImpact,
          quadrant: data.quadrant,
          status: data.status,
          createdAt: new Date(data.createdAt),
          ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
          ...(data.completedAt && { completedAt: new Date(data.completedAt) }),
          ...(data.mindMapId && { mindMapId: data.mindMapId }),
        };

        tasks.push(task);
      } catch (error) {
        console.error('Failed to parse task block:', error);
      }
    }

    return tasks;
  }

  /**
   * Archive a completed task
   * @param task - Task to archive
   */
  private async archiveTask(task: Task): Promise<void> {
    try {
      const content = await this.storage.readArchiveFile();
      const archivedTasks = this.deserializeTasksFromMarkdown(content);
      archivedTasks.push(task);
      
      const archivedContent = this.serializeArchivedTasks(archivedTasks);
      await this.storage.writeArchiveFile(archivedContent);
    } catch (error) {
      // Create new archive file
      const archivedContent = this.serializeArchivedTasks([task]);
      await this.storage.writeArchiveFile(archivedContent);
    }
  }

  /**
   * Serialize archived tasks grouped by area
   * @param tasks - Archived tasks
   * @returns Markdown string
   */
  private serializeArchivedTasks(tasks: Task[]): string {
    const byArea: Record<string, Task[]> = {};

    tasks.forEach(task => {
      if (!byArea[task.area]) {
        byArea[task.area] = [];
      }
      byArea[task.area].push(task);
    });

    let markdown = '# Archived Tasks\n\n';

    for (const [area, areaTasks] of Object.entries(byArea)) {
      markdown += `## ${area}\n\n`;

      for (const task of areaTasks) {
        const frontmatter = {
          id: task.id,
          area: task.area,
          urgency: task.urgency,
          businessImpact: task.businessImpact,
          quadrant: task.quadrant,
          status: task.status,
          createdAt: task.createdAt.toISOString(),
          completedAt: task.completedAt?.toISOString(),
          ...(task.dueDate && { dueDate: task.dueDate.toISOString() }),
        };

        markdown += matter.stringify(
          `### ${task.title}\n\n${task.description}${task.context ? `\n\n**Context:**\n${task.context}` : ''}`,
          frontmatter
        );
        markdown += '\n\n---\n\n';
      }
    }

    return markdown;
  }

  /**
   * Calculate string similarity (Dice coefficient)
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Similarity score 0-1
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const bigrams1 = this.getBigrams(str1);
    const bigrams2 = this.getBigrams(str2);

    const intersection = bigrams1.filter(b => bigrams2.includes(b)).length;
    const union = bigrams1.length + bigrams2.length;

    return union === 0 ? 0 : (2 * intersection) / union;
  }

  /**
   * Get bigrams from string
   * @param str - Input string
   * @returns Array of bigrams
   */
  private getBigrams(str: string): string[] {
    const bigrams: string[] = [];
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.push(str.substring(i, i + 2));
    }
    return bigrams;
  }
}
