import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService } from '../../../src/services/ai/AIService';
import { TaskService } from '../../../src/services/task-manager/TaskService';
import type { StorageService } from '../../../src/services/storage/StorageService';
import OpenAI from 'openai';

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

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

describe('Braindump Workflow Integration', () => {
  let aiService: AIService;
  let taskService: TaskService;
  let mockStorage: StorageService;
  let mockOpenAI: any;

  beforeEach(() => {
    mockStorage = createMockStorage();
    aiService = new AIService('test-api-key');
    taskService = new TaskService(mockStorage);
    
    mockOpenAI = (aiService as any).client;
  });

  it('should complete full braindump workflow: extract → review → create tasks', async () => {
    // Step 1: User enters braindump text
    const braindumpText = `
      I need to finish the Q4 project proposal by Friday.
      Also need to schedule a team meeting for next week.
      Don't forget to review John's pull request.
      Maybe look into that new framework everyone's talking about.
    `;

    // Step 2: AI extracts tasks
    const mockExtractedTasks = {
      tasks: [
        {
          area: 'Work',
          title: 'Finish Q4 project proposal',
          description: 'Complete the Q4 project proposal document',
          urgency: 'urgent',
          businessImpact: 'high',
          dueDate: '2025-11-22T00:00:00.000Z',
        },
        {
          area: 'Work',
          title: 'Schedule team meeting',
          description: 'Schedule team meeting for next week',
          urgency: 'urgent',
          businessImpact: 'low',
          dueDate: null,
        },
        {
          area: 'Work',
          title: "Review John's pull request",
          description: "Review and provide feedback on John's pull request",
          urgency: 'urgent',
          businessImpact: 'high',
          dueDate: null,
        },
        {
          area: 'Learning',
          title: 'Research new framework',
          description: "Look into the new framework people are discussing",
          urgency: 'not-urgent',
          businessImpact: 'low',
          dueDate: null,
        },
      ],
      clarifications: [],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockExtractedTasks),
          },
        },
      ],
    });

    const extractedResult = await aiService.extractTasksFromBraindump(
      braindumpText,
      []
    );

    expect(extractedResult.tasks).toHaveLength(4);

    // Step 3: User reviews and confirms tasks
    // Step 4: Create tasks in system
    const createdTasks = [];
    for (const taskData of extractedResult.tasks) {
      const task = await taskService.createTask({
        ...taskData,
        quadrant: taskService.calculateQuadrant(
          taskData.urgency as 'urgent' | 'not-urgent',
          taskData.businessImpact as 'high' | 'low'
        ),
        status: 'active',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      });
      createdTasks.push(task);
    }

    expect(createdTasks).toHaveLength(4);

    // Verify quadrant assignments
    const doTasks = await taskService.getTasksByQuadrant('DO');
    const delegateTasks = await taskService.getTasksByQuadrant('DELEGATE');
    const eliminateTasks = await taskService.getTasksByQuadrant('ELIMINATE');

    expect(doTasks).toHaveLength(2); // Q4 proposal, Review PR
    expect(delegateTasks).toHaveLength(1); // Schedule meeting
    expect(eliminateTasks).toHaveLength(1); // Research framework
  });

  it('should detect and handle duplicates during braindump', async () => {
    // Create existing task
    await taskService.createTask({
      area: 'Work',
      title: 'Finish project proposal',
      description: 'Complete the project proposal',
      urgency: 'urgent',
      businessImpact: 'high',
      quadrant: 'DO',
      status: 'active',
    });

    const existingTasks = await taskService.getAllTasks();

    // User enters similar task in braindump
    const braindumpText = 'Need to complete the project proposal ASAP';

    const mockExtractedTasks = {
      tasks: [
        {
          area: 'Work',
          title: 'Complete project proposal',
          description: 'Finish the project proposal urgently',
          urgency: 'urgent',
          businessImpact: 'high',
          dueDate: null,
        },
      ],
      clarifications: [],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify(mockExtractedTasks),
          },
        },
      ],
    });

    const extractedResult = await aiService.extractTasksFromBraindump(
      braindumpText,
      existingTasks
    );

    // Should detect duplicate
    expect(extractedResult.duplicates.length).toBeGreaterThan(0);
    expect(extractedResult.duplicates[0].confidence).toBeGreaterThan(0.7);

    // User chooses to merge
    const duplicateMatch = extractedResult.duplicates[0];
    const mergedTask = await taskService.mergeDuplicate(
      duplicateMatch.existingTask.id,
      duplicateMatch.extractedTask
    );

    expect(mergedTask.context).toContain('Finish the project proposal urgently');

    // Verify no duplicate task was created
    const allTasks = await taskService.getAllTasks();
    expect(allTasks).toHaveLength(1);
  });

  it('should handle AI categorization for ambiguous tasks', async () => {
    const taskData = {
      area: 'Work',
      title: 'Update documentation',
      description: 'Update the project documentation',
    };

    // Mock AI categorization
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              quadrant: 'PLAN',
              reasoning: 'Important for long-term maintenance but not urgent',
            }),
          },
        },
      ],
    });

    const quadrant = await aiService.categorizeTask(taskData);
    expect(quadrant).toBe('PLAN');

    // Create task with AI-suggested quadrant
    const { urgency, businessImpact } = 
      quadrant === 'PLAN' 
        ? { urgency: 'not-urgent' as const, businessImpact: 'high' as const }
        : { urgency: 'urgent' as const, businessImpact: 'low' as const };

    const task = await taskService.createTask({
      ...taskData,
      urgency,
      businessImpact,
      quadrant,
      status: 'active',
    });

    expect(task.quadrant).toBe('PLAN');
  });

  it('should preserve task order within quadrants', async () => {
    // Create multiple tasks in same quadrant
    const task1 = await taskService.createTask({
      area: 'Work',
      title: 'First urgent task',
      description: 'First',
      urgency: 'urgent',
      businessImpact: 'high',
      quadrant: 'DO',
      status: 'active',
    });

    const task2 = await taskService.createTask({
      area: 'Work',
      title: 'Second urgent task',
      description: 'Second',
      urgency: 'urgent',
      businessImpact: 'high',
      quadrant: 'DO',
      status: 'active',
    });

    const doTasks = await taskService.getTasksByQuadrant('DO');
    expect(doTasks).toHaveLength(2);
    expect(doTasks[0].id).toBe(task1.id);
    expect(doTasks[1].id).toBe(task2.id);
  });

  it('should handle empty braindump gracefully', async () => {
    const braindumpText = '   ';

    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              tasks: [],
              clarifications: ['No actionable tasks found in the input'],
            }),
          },
        },
      ],
    });

    const extractedResult = await aiService.extractTasksFromBraindump(
      braindumpText,
      []
    );

    expect(extractedResult.tasks).toHaveLength(0);
    expect(extractedResult.clarifications.length).toBeGreaterThan(0);
  });
});
