import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskService } from '../../../src/services/task-manager/TaskService';
import { TaskValidationError, TaskNotFoundError } from '../../../src/services/task-manager/errors';
import { Quadrant } from '../../../src/models/Quadrant';
import type { StorageService } from '../../../src/services/storage/StorageService';

// Mock StorageService
const createMockStorage = (): StorageService => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  isInitialized: vi.fn().mockReturnValue(true),
  readTasksFile: vi.fn().mockResolvedValue(''),
  writeTasksFile: vi.fn().mockResolvedValue(undefined),
  readArchiveFile: vi.fn().mockResolvedValue(''),
  writeArchiveFile: vi.fn().mockResolvedValue(undefined),
  readMindMapFile: vi.fn().mockResolvedValue(''),
  writeMindMapFile: vi.fn().mockResolvedValue(undefined),
  readProfilesConfig: vi.fn().mockResolvedValue({ version: '1.0', profiles: [] }),
  writeProfilesConfig: vi.fn().mockResolvedValue(undefined),
  createProfileFolder: vi.fn().mockResolvedValue(undefined),
});

describe('TaskService', () => {
  let taskService: TaskService;
  let mockStorage: StorageService;

  beforeEach(() => {
    mockStorage = createMockStorage();
    taskService = new TaskService(mockStorage);
  });

  describe('createTask', () => {
    it('should create a new task with generated ID', async () => {
      const taskData = {
        area: 'Work',
        title: 'Test task',
        description: 'Test description',
        urgency: 'urgent' as const,
        businessImpact: 'high' as const,
        quadrant: Quadrant.DO,
        status: 'active' as const,
      };

      const task = await taskService.createTask(taskData);

      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.title).toBe('Test task');
      expect(task.quadrant).toBe(Quadrant.DO);
    });

    it('should calculate correct quadrant from urgency and impact', async () => {
      const taskData = {
        area: 'Work',
        title: 'Strategic planning',
        description: 'Long-term planning',
        urgency: 'not-urgent' as const,
        businessImpact: 'high' as const,
        quadrant: Quadrant.DO, // Wrong, should be recalculated
        status: 'active' as const,
      };

      const task = await taskService.createTask(taskData);
      expect(task.quadrant).toBe(Quadrant.PLAN);
    });

    it('should throw validation error for empty title', async () => {
      const taskData = {
        area: 'Work',
        title: '',
        description: 'Test',
        urgency: 'urgent' as const,
        businessImpact: 'high' as const,
        quadrant: Quadrant.DO,
        status: 'active' as const,
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        TaskValidationError
      );
    });

    it('should throw validation error for title exceeding 200 characters', async () => {
      const taskData = {
        area: 'Work',
        title: 'a'.repeat(201),
        description: 'Test',
        urgency: 'urgent' as const,
        businessImpact: 'high' as const,
        quadrant: Quadrant.DO,
        status: 'active' as const,
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        TaskValidationError
      );
    });

    it('should throw validation error for empty area', async () => {
      const taskData = {
        area: '',
        title: 'Test task',
        description: 'Test',
        urgency: 'urgent' as const,
        businessImpact: 'high' as const,
        quadrant: Quadrant.DO,
        status: 'active' as const,
      };

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        TaskValidationError
      );
    });
  });

  describe('getAllTasks', () => {
    it('should return only active tasks', async () => {
      await taskService.createTask({
        area: 'Work',
        title: 'Active task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const tasks = await taskService.getAllTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe('active');
    });
  });

  describe('getTasksByQuadrant', () => {
    it('should filter tasks by quadrant', async () => {
      await taskService.createTask({
        area: 'Work',
        title: 'DO task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      await taskService.createTask({
        area: 'Work',
        title: 'PLAN task',
        description: 'Test',
        urgency: 'not-urgent',
        businessImpact: 'high',
        quadrant: Quadrant.PLAN,
        status: 'active',
      });

      const doTasks = await taskService.getTasksByQuadrant(Quadrant.DO);
      expect(doTasks).toHaveLength(1);
      expect(doTasks[0].title).toBe('DO task');
    });
  });

  describe('updateTask', () => {
    it('should update existing task', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Original title',
        description: 'Original description',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const updated = await taskService.updateTask(task.id, {
        title: 'Updated title',
      });

      expect(updated.title).toBe('Updated title');
      expect(updated.description).toBe('Original description');
    });

    it('should recalculate quadrant when urgency changes', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Test task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const updated = await taskService.updateTask(task.id, {
        urgency: 'not-urgent',
      });

      expect(updated.quadrant).toBe('PLAN');
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskService.updateTask('non-existent-id', { title: 'Test' })
      ).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('moveToQuadrant', () => {
    it('should update urgency and impact based on target quadrant', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Test task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const moved = await taskService.moveToQuadrant(task.id, Quadrant.ELIMINATE);

      expect(moved.quadrant).toBe(Quadrant.ELIMINATE);
      expect(moved.urgency).toBe('not-urgent');
      expect(moved.businessImpact).toBe('low');
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskService.moveToQuadrant('non-existent-id', Quadrant.DO)
      ).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('completeTask', () => {
    it('should mark task as completed with timestamp', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Test task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const completed = await taskService.completeTask(task.id);

      expect(completed.status).toBe('completed');
      expect(completed.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskService.completeTask('non-existent-id')
      ).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('calculateQuadrant', () => {
    it('should return DO for urgent + high impact', () => {
      const quadrant = taskService.calculateQuadrant('urgent', 'high');
      expect(quadrant).toBe(Quadrant.DO);
    });

    it('should return PLAN for not-urgent + high impact', () => {
      const quadrant = taskService.calculateQuadrant('not-urgent', 'high');
      expect(quadrant).toBe(Quadrant.PLAN);
    });

    it('should return DELEGATE for urgent + low impact', () => {
      const quadrant = taskService.calculateQuadrant('urgent', 'low');
      expect(quadrant).toBe(Quadrant.DELEGATE);
    });

    it('should return ELIMINATE for not-urgent + low impact', () => {
      const quadrant = taskService.calculateQuadrant('not-urgent', 'low');
      expect(quadrant).toBe(Quadrant.ELIMINATE);
    });
  });

  describe('findDuplicate', () => {
    it('should detect similar tasks', async () => {
      await taskService.createTask({
        area: 'Work',
        title: 'Finish project proposal',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const duplicate = await taskService.findDuplicate({
        title: 'Finish project propsal', // Very similar with typo
      });

      expect(duplicate).not.toBeNull();
      expect(duplicate?.title).toBe('Finish project proposal');
    });

    it('should return null for dissimilar tasks', async () => {
      await taskService.createTask({
        area: 'Work',
        title: 'Finish project proposal',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const duplicate = await taskService.findDuplicate({
        title: 'Buy groceries',
      });

      expect(duplicate).toBeNull();
    });
  });

  describe('mergeDuplicate', () => {
    it('should merge duplicate context into existing task', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Project proposal',
        description: 'Original description',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const merged = await taskService.mergeDuplicate(task.id, {
        description: 'Additional context',
      });

      expect(merged.context).toContain('Additional context');
    });

    it('should throw error for non-existent task', async () => {
      await expect(
        taskService.mergeDuplicate('non-existent-id', {})
      ).rejects.toThrow(TaskNotFoundError);
    });
  });

  describe('searchTasks', () => {
    it('should find tasks by title match', async () => {
      await taskService.createTask({
        area: 'Work',
        title: 'Project proposal',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const results = await taskService.searchTasks('project');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Project proposal');
    });

    it('should find tasks by description match', async () => {
      await taskService.createTask({
        area: 'Work',
        title: 'Test task',
        description: 'Something about quarterly planning',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const results = await taskService.searchTasks('quarterly');
      expect(results).toHaveLength(1);
    });
  });

  describe('drag-and-drop quadrant updates', () => {
    it('should move task from DO to PLAN quadrant', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Urgent task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      const moved = await taskService.moveToQuadrant(task.id, Quadrant.PLAN);

      expect(moved.quadrant).toBe(Quadrant.PLAN);
      expect(moved.urgency).toBe('not-urgent');
      expect(moved.businessImpact).toBe('high');
    });

    it('should move task from PLAN to DELEGATE quadrant', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Important task',
        description: 'Test',
        urgency: 'not-urgent',
        businessImpact: 'high',
        quadrant: Quadrant.PLAN,
        status: 'active',
      });

      const moved = await taskService.moveToQuadrant(task.id, Quadrant.DELEGATE);

      expect(moved.quadrant).toBe(Quadrant.DELEGATE);
      expect(moved.urgency).toBe('urgent');
      expect(moved.businessImpact).toBe('low');
    });

    it('should move task from DELEGATE to ELIMINATE quadrant', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Time-sensitive task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'low',
        quadrant: Quadrant.DELEGATE,
        status: 'active',
      });

      const moved = await taskService.moveToQuadrant(task.id, Quadrant.ELIMINATE);

      expect(moved.quadrant).toBe(Quadrant.ELIMINATE);
      expect(moved.urgency).toBe('not-urgent');
      expect(moved.businessImpact).toBe('low');
    });

    it('should move task from ELIMINATE to DO quadrant', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Low priority task',
        description: 'Test',
        urgency: 'not-urgent',
        businessImpact: 'low',
        quadrant: Quadrant.ELIMINATE,
        status: 'active',
      });

      const moved = await taskService.moveToQuadrant(task.id, Quadrant.DO);

      expect(moved.quadrant).toBe(Quadrant.DO);
      expect(moved.urgency).toBe('urgent');
      expect(moved.businessImpact).toBe('high');
    });

    it('should persist quadrant changes across multiple moves', async () => {
      const task = await taskService.createTask({
        area: 'Work',
        title: 'Test task',
        description: 'Test',
        urgency: 'urgent',
        businessImpact: 'high',
        quadrant: Quadrant.DO,
        status: 'active',
      });

      await taskService.moveToQuadrant(task.id, Quadrant.PLAN);
      await taskService.moveToQuadrant(task.id, Quadrant.ELIMINATE);
      const final = await taskService.moveToQuadrant(task.id, Quadrant.DELEGATE);

      expect(final.quadrant).toBe(Quadrant.DELEGATE);
      expect(final.urgency).toBe('urgent');
      expect(final.businessImpact).toBe('low');
    });
  });
});
