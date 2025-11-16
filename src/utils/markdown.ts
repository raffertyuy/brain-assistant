import matter from 'gray-matter';
import { Task } from '@/models/Task';
import { Quadrant } from '@/models/Quadrant';

/**
 * Parse markdown file with YAML frontmatter into tasks
 * @param content - Markdown content with YAML frontmatter
 * @returns Array of parsed tasks
 */
export function parseTasksFromMarkdown(content: string): Task[] {
  const tasks: Task[] = [];
  const sections = content.split(/^---$/m);

  for (let i = 1; i < sections.length; i += 2) {
    if (i + 1 < sections.length) {
      const frontmatterText = sections[i].trim();
      const description = sections[i + 1].trim();

      try {
        const parsed = matter(`---\n${frontmatterText}\n---\n${description}`);
        const data = parsed.data;

        const task: Task = {
          id: data.id || '',
          area: data.area || '',
          title: data.title || '',
          description: parsed.content.trim(),
          context: data.context,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          businessImpact: data.businessImpact || 'low',
          urgency: data.urgency || 'not-urgent',
          quadrant: data.quadrant || Quadrant.ELIMINATE,
          status: data.status || 'active',
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
          mindMapId: data.mindMapId,
        };

        tasks.push(task);
      } catch (error) {
        console.error('Failed to parse task frontmatter:', error);
      }
    }
  }

  return tasks;
}

/**
 * Convert task to markdown format with YAML frontmatter
 * @param task - Task object to convert
 * @returns Markdown string with YAML frontmatter
 */
export function taskToMarkdown(task: Task): string {
  const frontmatter = {
    id: task.id,
    area: task.area,
    title: task.title,
    businessImpact: task.businessImpact,
    urgency: task.urgency,
    quadrant: task.quadrant,
    status: task.status,
    ...(task.dueDate && { dueDate: task.dueDate.toISOString() }),
    createdAt: task.createdAt.toISOString(),
    ...(task.completedAt && { completedAt: task.completedAt.toISOString() }),
    ...(task.mindMapId && { mindMapId: task.mindMapId }),
    ...(task.context && { context: task.context }),
  };

  return matter.stringify(task.description, frontmatter);
}

/**
 * Convert array of tasks to organized markdown file
 * @param tasks - Array of tasks to convert
 * @returns Markdown string with tasks organized by quadrant
 */
export function tasksToMarkdown(tasks: Task[]): string {
  const quadrants = {
    [Quadrant.DO]: [] as Task[],
    [Quadrant.PLAN]: [] as Task[],
    [Quadrant.DELEGATE]: [] as Task[],
    [Quadrant.ELIMINATE]: [] as Task[],
  };

  tasks.forEach((task) => {
    quadrants[task.quadrant].push(task);
  });

  let markdown = '# Tasks\n\n';

  for (const quadrant of Object.values(Quadrant)) {
    const quadrantTasks = quadrants[quadrant];
    if (quadrantTasks.length > 0) {
      markdown += `## ${quadrant}\n\n`;
      quadrantTasks.forEach((task) => {
        markdown += taskToMarkdown(task) + '\n';
      });
    }
  }

  return markdown;
}
