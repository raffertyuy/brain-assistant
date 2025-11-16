/**
 * Error classes for AI service
 */

export class AIServiceError extends Error {
  public readonly userMessage: string;
  
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AIServiceError';
    this.userMessage = this.getUserFriendlyMessage(message);
  }
  
  private getUserFriendlyMessage(message: string): string {
    if (message.includes('API key')) {
      return 'Please configure your OpenAI API key in settings to use AI features.';
    }
    if (message.includes('rate limit') || message.includes('quota')) {
      return 'You have exceeded your API usage limit. Please try again later or check your OpenAI account.';
    }
    if (message.includes('network') || message.includes('timeout')) {
      return 'Unable to connect to AI service. Please check your internet connection and try again.';
    }
    if (message.includes('invalid') || message.includes('parse')) {
      return 'Failed to process AI response. Please try rephrasing your input.';
    }
    return 'AI service error. Please try again or contact support if the problem persists.';
  }
}
