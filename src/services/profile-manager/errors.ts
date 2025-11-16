/**
 * Error classes for profile management
 */

/**
 * Thrown when profile validation fails (invalid name, duplicate, etc.)
 */
export class ProfileValidationError extends Error {
  public readonly userMessage: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'ProfileValidationError';
    this.userMessage = this.getUserFriendlyMessage(message);
  }
  
  private getUserFriendlyMessage(message: string): string {
    if (message.includes('duplicate') || message.includes('already exists')) {
      return 'A profile with this name already exists. Please choose a different name.';
    }
    if (message.includes('invalid character')) {
      return 'Profile name contains invalid characters. Please avoid: / \\ : * ? " < > |';
    }
    if (message.includes('empty')) {
      return 'Profile name cannot be empty. Please provide a name (1-50 characters).';
    }
    return `Invalid profile: ${message}`;
  }
}

/**
 * Thrown when a requested profile is not found
 */
export class ProfileNotFoundError extends Error {
  public readonly userMessage: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'ProfileNotFoundError';
    this.userMessage = 'The requested profile could not be found. Please select a different profile.';
  }
}
