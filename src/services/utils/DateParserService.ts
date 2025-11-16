import * as chrono from 'chrono-node';

/**
 * Service for parsing natural language dates
 */
export class DateParserService {
  /**
   * Parse natural language date string
   * @param text - Natural language text (e.g., "tomorrow", "next Friday")
   * @returns Parsed date or null if unparseable
   */
  parse(text: string): Date | null {
    const results = chrono.parse(text);
    return results.length > 0 ? results[0].start.date() : null;
  }

  /**
   * Format date for display
   * @param date - Date to format
   * @param format - Format style ('short' | 'long' | 'relative')
   * @returns Formatted date string
   */
  format(date: Date, format: 'short' | 'long' | 'relative'): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });

      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

      case 'relative':
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
        if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
        return this.format(date, 'short');

      default:
        return date.toLocaleDateString();
    }
  }

  /**
   * Check if date is overdue
   * @param date - Date to check
   * @returns True if date is in the past
   */
  isOverdue(date: Date): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < now;
  }

  /**
   * Check if date is urgent (within next 24-48 hours)
   * @param date - Date to check
   * @returns True if date is within urgency threshold
   */
  isUrgent(date: Date): boolean {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 48;
  }
}
