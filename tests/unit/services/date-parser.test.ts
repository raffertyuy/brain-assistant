import { describe, it, expect } from 'vitest';
import { DateParserService } from '@/services/utils/DateParserService';

describe('DateParserService', () => {
  const dateParser = new DateParserService();

  describe('parse', () => {
    it('should parse "tomorrow"', () => {
      const result = dateParser.parse('tomorrow');
      expect(result).toBeInstanceOf(Date);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(result?.getDate()).toBe(tomorrow.getDate());
    });

    it('should parse "next Friday"', () => {
      const result = dateParser.parse('next Friday');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getDay()).toBe(5); // Friday
    });

    it('should parse "in 2 weeks"', () => {
      const result = dateParser.parse('in 2 weeks');
      expect(result).toBeInstanceOf(Date);

      const twoWeeks = new Date();
      twoWeeks.setDate(twoWeeks.getDate() + 14);

      // Allow for some margin in date calculation
      const diffDays = Math.abs(
        (result!.getTime() - twoWeeks.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBeLessThan(1);
    });

    it('should return null for unparseable text', () => {
      const result = dateParser.parse('gibberish xyz 123');
      expect(result).toBeNull();
    });
  });

  describe('format', () => {
    it('should format date as short', () => {
      const date = new Date('2025-11-20');
      const formatted = dateParser.format(date, 'short');
      expect(formatted).toContain('Nov');
      expect(formatted).toContain('20');
    });

    it('should format date as long', () => {
      const date = new Date('2025-11-20');
      const formatted = dateParser.format(date, 'long');
      expect(formatted).toContain('November');
      expect(formatted).toContain('20');
      expect(formatted).toContain('2025');
    });

    it('should format today as relative', () => {
      const today = new Date();
      const formatted = dateParser.format(today, 'relative');
      expect(formatted).toBe('Today');
    });

    it('should format tomorrow as relative', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const formatted = dateParser.format(tomorrow, 'relative');
      expect(formatted).toBe('Tomorrow');
    });
  });

  describe('isOverdue', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(dateParser.isOverdue(yesterday)).toBe(true);
    });

    it('should return false for future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(dateParser.isOverdue(tomorrow)).toBe(false);
    });
  });

  describe('isUrgent', () => {
    it('should return true for dates within 48 hours', () => {
      const soon = new Date();
      soon.setHours(soon.getHours() + 24);
      expect(dateParser.isUrgent(soon)).toBe(true);
    });

    it('should return false for dates beyond 48 hours', () => {
      const later = new Date();
      later.setDate(later.getDate() + 7);
      expect(dateParser.isUrgent(later)).toBe(false);
    });

    it('should return false for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(dateParser.isUrgent(past)).toBe(false);
    });
  });
});
