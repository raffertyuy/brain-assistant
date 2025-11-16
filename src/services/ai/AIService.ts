import OpenAI from 'openai';
import type { Task } from '../../models/Task';
import { Quadrant } from '../../models/Quadrant';
import { AIServiceError } from './errors';
import { TASK_EXTRACTION_PROMPT, TASK_CATEGORIZATION_PROMPT } from './prompts';
import { BRAINSTORM_SUGGESTIONS_PROMPT, SIMPLIFICATION_PROMPT, PROBING_QUESTIONS_PROMPT } from './brainstorm-prompts';

export interface ExtractedTasksResult {
  tasks: Partial<Task>[];
  duplicates: DuplicateMatch[];
  clarifications: string[];
}

export interface DuplicateMatch {
  extractedTask: Partial<Task>;
  existingTask: Task;
  confidence: number;
}

export interface BrainstormSuggestion {
  id: string;
  text: string;
  type: 'approach' | 'consideration' | 'question' | 'simplification';
}

/**
 * Service for AI-powered features (task extraction, brainstorming)
 */
export class AIService {
  private client: OpenAI | null = null;
  private apiKey: string | null = null;

  /**
   * Initialize AI service with OpenAI API key
   * @param apiKey - OpenAI API key
   */
  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  /**
   * Set or update OpenAI API key
   * @param apiKey - OpenAI API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  /**
   * Check if AI service is ready (has API key)
   */
  isReady(): boolean {
    return this.client !== null;
  }

  /**
   * Extract tasks from braindump text
   * @param rawText - Free-form braindump text
   * @param existingTasks - Current tasks for duplicate detection
   * @returns Promise resolving to extracted tasks with metadata
   * @throws {AIServiceError} if API call fails
   */
  async extractTasksFromBraindump(
    rawText: string,
    existingTasks: Task[]
  ): Promise<ExtractedTasksResult> {
    if (!this.client) {
      throw new AIServiceError('AI service not initialized. Please set API key.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: TASK_EXTRACTION_PROMPT,
          },
          {
            role: 'user',
            content: rawText,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceError('Empty response from AI');
      }

      const parsed = JSON.parse(content);
      const extractedTasks: Partial<Task>[] = parsed.tasks || [];

      // Detect duplicates using similarity scoring
      const duplicates = this.detectDuplicates(extractedTasks, existingTasks);

      return {
        tasks: extractedTasks,
        duplicates,
        clarifications: parsed.clarifications || [],
      };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Failed to extract tasks from braindump',
        error as Error
      );
    }
  }

  /**
   * Categorize task into quadrant based on content
   * @param taskData - Task data to analyze
   * @returns Promise resolving to suggested quadrant
   */
  async categorizeTask(taskData: Partial<Task>): Promise<Quadrant> {
    if (!this.client) {
      throw new AIServiceError('AI service not initialized. Please set API key.');
    }

    try {
      const taskDescription = `
Title: ${taskData.title || 'No title'}
Description: ${taskData.description || 'No description'}
Area: ${taskData.area || 'General'}
Due Date: ${taskData.dueDate ? taskData.dueDate.toISOString() : 'None'}
      `.trim();

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: TASK_CATEGORIZATION_PROMPT,
          },
          {
            role: 'user',
            content: taskDescription,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceError('Empty response from AI');
      }

      const parsed = JSON.parse(content);
      return parsed.quadrant as Quadrant;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Failed to categorize task',
        error as Error
      );
    }
  }

  /**
   * Generate brainstorming suggestions for task
   * @param task - Task to brainstorm about
   * @returns Promise resolving to AI suggestions
   */
  async generateBrainstormSuggestions(task: Task): Promise<BrainstormSuggestion[]> {
    if (!this.client) {
      throw new AIServiceError('AI service not initialized. Please set API key.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: BRAINSTORM_SUGGESTIONS_PROMPT,
          },
          {
            role: 'user',
            content: `Task: ${task.title}\nDescription: ${task.description || 'No description provided'}\nArea: ${task.area}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceError('Empty response from AI');
      }

      const parsed = JSON.parse(content);
      return parsed.suggestions || [];
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Failed to generate brainstorm suggestions',
        error as Error
      );
    }
  }

  /**
   * Ask AI to challenge complexity and suggest simplifications
   * @param mindMapContent - Current mind map content
   * @returns Promise resolving to simplification suggestions
   */
  async suggestSimplifications(mindMapContent: string): Promise<string[]> {
    if (!this.client) {
      throw new AIServiceError('AI service not initialized. Please set API key.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SIMPLIFICATION_PROMPT,
          },
          {
            role: 'user',
            content: `Mind map content:\n${mindMapContent}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceError('Empty response from AI');
      }

      const parsed = JSON.parse(content);
      return parsed.suggestions || [];
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Failed to suggest simplifications',
        error as Error
      );
    }
  }

  /**
   * Get AI to ask probing questions about approach
   * @param task - Task being brainstormed
   * @param context - Current brainstorming context
   * @returns Promise resolving to AI-generated questions
   */
  async generateProbingQuestions(task: Task, context: string): Promise<string[]> {
    if (!this.client) {
      throw new AIServiceError('AI service not initialized. Please set API key.');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: PROBING_QUESTIONS_PROMPT,
          },
          {
            role: 'user',
            content: `Task: ${task.title}\nDescription: ${task.description || 'No description'}\nContext: ${context}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceError('Empty response from AI');
      }

      const parsed = JSON.parse(content);
      return parsed.questions || [];
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Failed to generate probing questions',
        error as Error
      );
    }
  }

  /**
   * Detect duplicates using similarity scoring
   * @param extractedTasks - Newly extracted tasks
   * @param existingTasks - Current tasks in system
   * @returns Array of duplicate matches
   */
  private detectDuplicates(
    extractedTasks: Partial<Task>[],
    existingTasks: Task[]
  ): DuplicateMatch[] {
    const duplicates: DuplicateMatch[] = [];

    for (const extracted of extractedTasks) {
      if (!extracted.title) continue;

      for (const existing of existingTasks) {
        const similarity = this.calculateSimilarity(
          extracted.title.toLowerCase(),
          existing.title.toLowerCase()
        );

        // Consider it a potential duplicate if similarity > 0.7
        if (similarity > 0.7) {
          duplicates.push({
            extractedTask: extracted,
            existingTask: existing,
            confidence: similarity,
          });
        }
      }
    }

    return duplicates;
  }

  /**
   * Calculate simple string similarity score (Dice coefficient)
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
   * Get bigrams (2-character sequences) from string
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
