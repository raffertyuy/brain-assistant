/**
 * Validation utilities for profile and task data
 */

/**
 * Validate profile name for uniqueness and invalid characters
 * @param name - Profile name to validate
 * @param existingNames - Array of existing profile names
 * @returns Validation result with isValid flag and optional error message
 */
export function validateProfileName(
  name: string,
  existingNames: string[]
): { isValid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Profile name cannot be empty' };
  }

  if (name.length > 50) {
    return { isValid: false, error: 'Profile name must be 50 characters or less' };
  }

  // Allow letters, numbers, spaces, dashes, and underscores
  const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!validNamePattern.test(name)) {
    return {
      isValid: false,
      error: 'Profile name can only contain letters, numbers, spaces, dashes, and underscores',
    };
  }

  // Check for duplicate (case-insensitive)
  const nameLower = name.toLowerCase();
  if (existingNames.some(existing => existing.toLowerCase() === nameLower)) {
    return { isValid: false, error: 'A profile with this name already exists' };
  }

  return { isValid: true };
}

/**
 * Validate task title
 * @param title - Task title to validate
 * @returns Validation result
 */
export function validateTaskTitle(title: string): { isValid: boolean; error?: string } {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Task title cannot be empty' };
  }

  if (title.length > 200) {
    return { isValid: false, error: 'Task title must be 200 characters or less' };
  }

  return { isValid: true };
}

/**
 * Validate business impact value
 * @param impact - Impact value to validate
 * @returns Validation result
 */
export function validateBusinessImpact(impact: number): { isValid: boolean; error?: string } {
  if (impact < 1 || impact > 5) {
    return { isValid: false, error: 'Business impact must be between 1 and 5' };
  }

  if (!Number.isInteger(impact)) {
    return { isValid: false, error: 'Business impact must be an integer' };
  }

  return { isValid: true };
}
