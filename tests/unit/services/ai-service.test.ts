import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '../../../src/services/ai/AIService';
import { AIServiceError } from '../../../src/services/ai/errors';
import type { Task } from '../../../src/models/Task';

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

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAI: any;

  beforeEach(async () => {
    aiService = new AIService('test-api-key');
    mockOpenAI = (aiService as any).client;
  });

  describe('extractTasksFromBraindump', () => {
    it('should extract tasks from braindump text', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                tasks: [
                  {
                    area: 'Work',
                    title: 'Finish project proposal',
                    description: 'Complete the Q4 project proposal',
                    urgency: 'urgent',
                    businessImpact: 'high',
                    dueDate: null,
                  },
                ],
                clarifications: [],
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.extractTasksFromBraindump(
        'I need to finish the project proposal for Q4',
        []
      );

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe('Finish project proposal');
      expect(result.duplicates).toHaveLength(0);
    });

    it('should detect duplicates', async () => {
      const existingTasks: Task[] = [
        {
          id: '1',
          area: 'Work',
          title: 'Finish project proposal',
          description: 'Q4 proposal',
          context: undefined,
          urgency: 'urgent',
          businessImpact: 'high',
          quadrant: 'DO',
          status: 'active',
          createdAt: new Date(),
        },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                tasks: [
                  {
                    area: 'Work',
                    title: 'Complete project proposal',
                    description: 'Finish the project proposal',
                    urgency: 'urgent',
                    businessImpact: 'high',
                    dueDate: null,
                  },
                ],
                clarifications: [],
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.extractTasksFromBraindump(
        'I need to complete the project proposal',
        existingTasks
      );

      expect(result.duplicates.length).toBeGreaterThan(0);
      expect(result.duplicates[0].confidence).toBeGreaterThan(0.7);
    });

    it('should throw AIServiceError if not initialized', async () => {
      const uninitializedService = new AIService();

      await expect(
        uninitializedService.extractTasksFromBraindump('test', [])
      ).rejects.toThrow(AIServiceError);
    });

    it('should throw AIServiceError on API failure', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        aiService.extractTasksFromBraindump('test', [])
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('categorizeTask', () => {
    it('should categorize task into quadrant', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                quadrant: 'DO',
                reasoning: 'Urgent and high impact',
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const quadrant = await aiService.categorizeTask({
        title: 'Critical bug fix',
        description: 'Production is down',
        area: 'Engineering',
      });

      expect(quadrant).toBe('DO');
    });

    it('should throw AIServiceError if not initialized', async () => {
      const uninitializedService = new AIService();

      await expect(
        uninitializedService.categorizeTask({ title: 'test' })
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('setApiKey', () => {
    it('should update API key', () => {
      const service = new AIService();
      expect(service.isReady()).toBe(false);

      service.setApiKey('new-key');
      expect(service.isReady()).toBe(true);
    });
  });

  describe('isReady', () => {
    it('should return true when API key is set', () => {
      const service = new AIService('test-key');
      expect(service.isReady()).toBe(true);
    });

    it('should return false when API key is not set', () => {
      const service = new AIService();
      expect(service.isReady()).toBe(false);
    });
  });

  describe('generateBrainstormSuggestions', () => {
    const mockTask: Task = {
      id: '1',
      area: 'Work',
      title: 'Build authentication system',
      description: 'Implement user authentication with OAuth',
      context: undefined,
      urgency: 'not-urgent',
      businessImpact: 'high',
      quadrant: 'PLAN',
      status: 'active',
      createdAt: new Date(),
    };

    it('should generate brainstorm suggestions', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  {
                    id: '1',
                    text: 'Consider using OAuth 2.0 with PKCE flow for better security',
                    type: 'approach',
                  },
                  {
                    id: '2',
                    text: 'Think about session management and token refresh strategies',
                    type: 'consideration',
                  },
                  {
                    id: '3',
                    text: 'What are the specific authentication providers you need to support?',
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
      expect(suggestions[0].type).toBe('approach');
      expect(suggestions[1].type).toBe('consideration');
      expect(suggestions[2].type).toBe('question');
    });

    it('should throw AIServiceError if not initialized', async () => {
      const uninitializedService = new AIService();

      await expect(
        uninitializedService.generateBrainstormSuggestions(mockTask)
      ).rejects.toThrow(AIServiceError);
    });

    it('should handle API errors', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        aiService.generateBrainstormSuggestions(mockTask)
      ).rejects.toThrow(AIServiceError);
    });
  });

  describe('suggestSimplifications', () => {
    const mindMapContent = `
- Authentication Module
  - OAuth Integration
    - Google Provider
    - GitHub Provider
    - Custom SAML Provider
  - Session Management
    - Redis-based sessions
    - JWT tokens
    - Refresh token rotation
  - Password Reset Flow
    - Email verification
    - SMS verification
    - Security questions
`;

    it('should suggest simplifications for complex approach', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [
                  'Start with just one OAuth provider instead of three',
                  'Use a proven library instead of building session management from scratch',
                  'Email-only password reset is sufficient for MVP',
                ],
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const simplifications = await aiService.suggestSimplifications(mindMapContent);

      expect(simplifications).toHaveLength(3);
      expect(simplifications[0]).toContain('one OAuth provider');
    });

    it('should throw AIServiceError if not initialized', async () => {
      const uninitializedService = new AIService();

      await expect(
        uninitializedService.suggestSimplifications(mindMapContent)
      ).rejects.toThrow(AIServiceError);
    });

    it('should handle empty mind map content', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                suggestions: [],
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const simplifications = await aiService.suggestSimplifications('');

      expect(simplifications).toHaveLength(0);
    });
  });

  describe('generateProbingQuestions', () => {
    const mockTask: Task = {
      id: '1',
      area: 'Work',
      title: 'Optimize database queries',
      description: 'Improve query performance',
      context: undefined,
      urgency: 'urgent',
      businessImpact: 'high',
      quadrant: 'DO',
      status: 'active',
      createdAt: new Date(),
    };

    const context = `
- Add database indexes
- Use query caching
- Implement connection pooling
`;

    it('should generate probing questions', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                questions: [
                  'Have you identified which specific queries are slow?',
                  'What is the current query response time and what is your target?',
                  'Are there any database schema changes that could help?',
                  'How will you measure the improvement?',
                ],
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const questions = await aiService.generateProbingQuestions(mockTask, context);

      expect(questions).toHaveLength(4);
      expect(questions[0]).toContain('specific queries');
    });

    it('should throw AIServiceError if not initialized', async () => {
      const uninitializedService = new AIService();

      await expect(
        uninitializedService.generateProbingQuestions(mockTask, context)
      ).rejects.toThrow(AIServiceError);
    });

    it('should handle empty context', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                questions: [
                  'What approach are you considering?',
                  'Have you analyzed the root cause?',
                ],
              }),
            },
          },
        ],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const questions = await aiService.generateProbingQuestions(mockTask, '');

      expect(questions).toHaveLength(2);
    });
  });
});
