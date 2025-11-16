import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AIService } from '../../src/services/ai/AIService';
import { MindMapService } from '../../src/services/mind-map/MindMapService';
import { StorageService } from '../../src/services/storage/StorageService';
import type { Task } from '../../src/models/Task';

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  const MockOpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
  
  return {
    default: MockOpenAI,
  };
});

describe('AI-Assisted Brainstorming Workflow', () => {
  let aiService: AIService;
  let mindMapService: MindMapService;
  let storageService: StorageService;
  let mockOpenAI: any;

  const mockTask: Task = {
    id: 'task-1',
    area: 'Engineering',
    title: 'Build real-time chat feature',
    description: 'Add real-time messaging to the application',
    context: undefined,
    urgency: 'not-urgent',
    businessImpact: 'high',
    quadrant: 'PLAN',
    status: 'active',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    // Setup storage service with mock file system
    storageService = new StorageService();
    await storageService.initialize('test-profile');

    // Setup AI service
    aiService = new AIService('test-api-key');
    mockOpenAI = (aiService as any).client;

    // Setup mind map service
    mindMapService = new MindMapService(storageService);
  });

  it('should generate AI suggestions for brainstorming', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  id: '1',
                  text: 'Use WebSocket for bidirectional communication',
                  type: 'approach',
                },
                {
                  id: '2',
                  text: 'Consider message persistence and offline support',
                  type: 'consideration',
                },
                {
                  id: '3',
                  text: 'How will you handle message ordering and delivery guarantees?',
                  type: 'question',
                },
              ],
            }),
          },
        },
      ],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const suggestions = await aiService.generateBrainstormSuggestions(mockTask);

    expect(suggestions).toHaveLength(3);
    expect(suggestions.find(s => s.type === 'approach')).toBeDefined();
    expect(suggestions.find(s => s.type === 'consideration')).toBeDefined();
    expect(suggestions.find(s => s.type === 'question')).toBeDefined();
  });

  it('should detect overcomplicated plans and suggest simplifications', async () => {
    // Create a mind map with many nodes
    const mindMap = await mindMapService.createMindMap(mockTask.id);
    
    // Add complex structure
    await mindMapService.addNode(mockTask.id, {
      text: 'WebSocket Server',
      parentId: undefined,
      level: 0,
    });
    
    await mindMapService.addNode(mockTask.id, {
      text: 'Custom Protocol',
      parentId: mindMap.nodes[0]?.id,
      level: 1,
    });

    await mindMapService.addNode(mockTask.id, {
      text: 'Binary Message Format',
      parentId: mindMap.nodes[0]?.id,
      level: 1,
    });

    await mindMapService.addNode(mockTask.id, {
      text: 'Custom Compression',
      parentId: mindMap.nodes[0]?.id,
      level: 1,
    });

    // Get mind map content
    const updatedMindMap = await mindMapService.getMindMap(mockTask.id);
    const mindMapContent = mindMapService.toMarkdown(updatedMindMap!);

    // Mock AI response for simplification
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                'Use a proven library like Socket.io instead of building custom WebSocket server',
                'Standard JSON format is sufficient for most chat applications',
                'Browser compression (gzip) handles message compression automatically',
              ],
            }),
          },
        },
      ],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const simplifications = await aiService.suggestSimplifications(mindMapContent);

    expect(simplifications).toHaveLength(3);
    expect(simplifications[0]).toContain('Socket.io');
    expect(simplifications[1]).toContain('JSON');
  });

  it('should generate probing questions based on context', async () => {
    // Create mind map with initial approach
    await mindMapService.createMindMap(mockTask.id);
    await mindMapService.addNode(mockTask.id, {
      text: 'Use WebSocket for real-time communication',
      parentId: undefined,
      level: 0,
    });
    
    const mindMap = await mindMapService.getMindMap(mockTask.id);
    const context = mindMapService.toMarkdown(mindMap!);

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              questions: [
                'What happens when a user loses connection?',
                'How will you scale WebSocket connections across multiple servers?',
                'Have you considered fallback mechanisms for clients behind restrictive firewalls?',
              ],
            }),
          },
        },
      ],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const questions = await aiService.generateProbingQuestions(mockTask, context);

    expect(questions).toHaveLength(3);
    expect(questions[0]).toContain('connection');
    expect(questions[1]).toContain('scale');
  });

  it('should support iterative refinement of suggestions', async () => {
    // Initial suggestions
    const initialResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  id: '1',
                  text: 'Use WebSocket for bidirectional communication',
                  type: 'approach',
                },
              ],
            }),
          },
        },
      ],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(initialResponse);

    const initialSuggestions = await aiService.generateBrainstormSuggestions(mockTask);
    expect(initialSuggestions).toHaveLength(1);

    // User refines: "I want to support mobile apps too"
    const refinedTask = {
      ...mockTask,
      description: `${mockTask.description}\n\nUser refinement: I want to support mobile apps too`,
    };

    const refinedResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  id: '1',
                  text: 'Use Socket.io which has native iOS and Android SDKs',
                  type: 'approach',
                },
                {
                  id: '2',
                  text: 'Consider battery consumption on mobile devices',
                  type: 'consideration',
                },
              ],
            }),
          },
        },
      ],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(refinedResponse);

    const refinedSuggestions = await aiService.generateBrainstormSuggestions(refinedTask);
    expect(refinedSuggestions).toHaveLength(2);
    expect(refinedSuggestions[0].text).toContain('mobile');
  });

  it('should integrate AI suggestions into mind map', async () => {
    // Get AI suggestions
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              suggestions: [
                {
                  id: '1',
                  text: 'Use WebSocket for real-time bidirectional communication',
                  type: 'approach',
                },
              ],
            }),
          },
        },
      ],
    };

    mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

    const suggestions = await aiService.generateBrainstormSuggestions(mockTask);
    
    // Apply suggestion to mind map
    await mindMapService.createMindMap(mockTask.id);
    const updatedMindMap = await mindMapService.addNode(mockTask.id, {
      text: suggestions[0].text,
      parentId: undefined,
      level: 0,
    });

    expect(updatedMindMap.nodes).toHaveLength(1);
    expect(updatedMindMap.nodes[0].text).toBe('Use WebSocket for real-time bidirectional communication');
  });

  it('should handle AI service errors gracefully', async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(
      new Error('API rate limit exceeded')
    );

    await expect(
      aiService.generateBrainstormSuggestions(mockTask)
    ).rejects.toThrow('Failed to generate brainstorm suggestions');
  });

  it('should work without AI service (manual brainstorming only)', async () => {
    // User can still create mind maps manually
    const mindMap = await mindMapService.createMindMap(mockTask.id);
    
    await mindMapService.addNode(mockTask.id, {
      text: 'Manual idea: Use REST polling as fallback',
      parentId: undefined,
      level: 0,
    });

    const updatedMindMap = await mindMapService.getMindMap(mockTask.id);
    
    expect(updatedMindMap?.nodes).toHaveLength(1);
    expect(updatedMindMap?.nodes[0].text).toContain('Manual idea');
  });
});
