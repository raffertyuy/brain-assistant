import { describe, it, expect } from 'vitest';
import { parseTasksFromMarkdown, taskToMarkdown, tasksToMarkdown } from '../../../src/utils/markdown';
import { sampleTask, sampleTasks } from '../../fixtures/tasks';

describe('markdown utilities', () => {
  describe('taskToMarkdown', () => {
    it('should convert task to markdown with YAML frontmatter', () => {
      const markdown = taskToMarkdown(sampleTask);

      expect(markdown).toContain('id: ' + sampleTask.id);
      expect(markdown).toContain('area: Q4 Planning');
      expect(markdown).toContain('title: Prepare Q4 presentation');
      expect(markdown).toContain('quadrant: DO');
      expect(markdown).toContain(sampleTask.description);
    });

    it('should include optional fields when present', () => {
      const markdown = taskToMarkdown(sampleTask);

      expect(markdown).toContain('dueDate:');
      expect(markdown).toContain('context:');
    });
  });

  describe('parseTasksFromMarkdown', () => {
    it('should parse markdown with single task', () => {
      const markdown = taskToMarkdown(sampleTask);
      const tasks = parseTasksFromMarkdown(markdown);

      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe(sampleTask.id);
      expect(tasks[0].title).toBe(sampleTask.title);
      expect(tasks[0].quadrant).toBe(sampleTask.quadrant);
    });

    it('should parse markdown with multiple tasks', () => {
      const markdown = tasksToMarkdown(sampleTasks);
      const tasks = parseTasksFromMarkdown(markdown);

      expect(tasks.length).toBeGreaterThanOrEqual(sampleTasks.length);
    });

    it('should handle empty markdown', () => {
      const tasks = parseTasksFromMarkdown('# Tasks\n\n');
      expect(tasks).toHaveLength(0);
    });
  });

  describe('tasksToMarkdown', () => {
    it('should organize tasks by quadrant', () => {
      const markdown = tasksToMarkdown(sampleTasks);

      expect(markdown).toContain('# Tasks');
      expect(markdown).toContain('## DO');
      expect(markdown).toContain('## PLAN');
      expect(markdown).toContain('## DELEGATE');
      expect(markdown).toContain('## ELIMINATE');
    });

    it('should include all task details', () => {
      const markdown = tasksToMarkdown([sampleTask]);

      expect(markdown).toContain(sampleTask.id);
      expect(markdown).toContain(sampleTask.title);
      expect(markdown).toContain(sampleTask.description);
    });

    it('should handle empty task array', () => {
      const markdown = tasksToMarkdown([]);
      expect(markdown).toBe('# Tasks\n\n');
    });
  });
});
