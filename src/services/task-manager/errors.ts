/**
 * Error classes for task management service
 */

export class TaskValidationError extends Error {
  public readonly userMessage: string;
  
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'TaskValidationError';
    this.userMessage = this.getUserFriendlyMessage(field, message);
  }
  
  private getUserFriendlyMessage(field: string, message: string): string {
    const fieldMessages: Record<string, string> = {
      title: 'Please provide a task title (1-200 characters)',
      area: 'Please provide a project area (1-100 characters)',
      quadrant: 'Task must be assigned to a valid quadrant',
      urgency: 'Task must be marked as urgent or not urgent',
      businessImpact: 'Task must have a business impact rating (high or low)',
    };
    
    return fieldMessages[field] || `Invalid ${field}: ${message}`;
  }
}

export class TaskNotFoundError extends Error {
  public readonly userMessage: string;
  
  constructor(public taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
    this.userMessage = 'The requested task could not be found. It may have been deleted or moved.';
  }
}
