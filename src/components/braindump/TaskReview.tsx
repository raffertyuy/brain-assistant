import React, { useState } from 'react';
import type { Task } from '../../models/Task';
import type { DuplicateMatch } from '../../services/ai/AIService';
import styles from './TaskReview.module.css';

interface TaskReviewProps {
  tasks: Partial<Task>[];
  duplicates: DuplicateMatch[];
  onConfirm: (tasksToCreate: Partial<Task>[], duplicatesToMerge: DuplicateMatch[]) => void;
  onCancel: () => void;
}

/**
 * Component to review and confirm extracted tasks
 */
export const TaskReview: React.FC<TaskReviewProps> = ({
  tasks,
  duplicates,
  onConfirm,
  onCancel,
}) => {
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(
    new Set(tasks.map((_, i) => i))
  );
  const [duplicateDecisions, setDuplicateDecisions] = useState<Map<number, 'merge' | 'create'>>(
    new Map()
  );

  const handleTaskToggle = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleDuplicateDecision = (index: number, decision: 'merge' | 'create') => {
    const newDecisions = new Map(duplicateDecisions);
    newDecisions.set(index, decision);
    setDuplicateDecisions(newDecisions);
  };

  const handleConfirm = () => {
    const tasksToCreate = tasks.filter((_, i) => selectedTasks.has(i));
    const duplicatesToMerge = duplicates.filter((_, i) => 
      duplicateDecisions.get(i) === 'merge'
    );
    onConfirm(tasksToCreate, duplicatesToMerge);
  };

  const getQuadrantLabel = (task: Partial<Task>): string => {
    if (task.urgency === 'urgent' && task.businessImpact === 'high') return 'DO';
    if (task.urgency === 'not-urgent' && task.businessImpact === 'high') return 'PLAN';
    if (task.urgency === 'urgent' && task.businessImpact === 'low') return 'DELEGATE';
    return 'ELIMINATE';
  };

  const getQuadrantColor = (quadrant: string): string => {
    switch (quadrant) {
      case 'DO': return 'var(--quadrant-do)';
      case 'PLAN': return 'var(--quadrant-plan)';
      case 'DELEGATE': return 'var(--quadrant-delegate)';
      case 'ELIMINATE': return 'var(--quadrant-eliminate)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Review Extracted Tasks</h2>
        <p className={styles.subtitle}>
          Select which tasks to create and how to handle duplicates
        </p>
      </div>

      {duplicates.length > 0 && (
        <div className={styles.duplicatesSection}>
          <h3 className={styles.sectionTitle}>⚠️ Potential Duplicates Found</h3>
          {duplicates.map((duplicate, index) => (
            <div key={index} className={styles.duplicateCard}>
              <div className={styles.duplicateInfo}>
                <p className={styles.duplicateLabel}>New task:</p>
                <p className={styles.duplicateTaskTitle}>{duplicate.extractedTask.title}</p>
                <p className={styles.duplicateLabel}>Existing task:</p>
                <p className={styles.duplicateTaskTitle}>{duplicate.existingTask.title}</p>
                <p className={styles.duplicateConfidence}>
                  {Math.round(duplicate.confidence * 100)}% similar
                </p>
              </div>
              <div className={styles.duplicateActions}>
                <button
                  className={`${styles.duplicateButton} ${
                    duplicateDecisions.get(index) === 'merge' ? styles.active : ''
                  }`}
                  onClick={() => handleDuplicateDecision(index, 'merge')}
                >
                  Merge into existing
                </button>
                <button
                  className={`${styles.duplicateButton} ${
                    duplicateDecisions.get(index) === 'create' ? styles.active : ''
                  }`}
                  onClick={() => handleDuplicateDecision(index, 'create')}
                >
                  Create as new task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.tasksSection}>
        <h3 className={styles.sectionTitle}>Extracted Tasks ({selectedTasks.size} selected)</h3>
        <div className={styles.tasksList}>
          {tasks.map((task, index) => {
            const quadrant = getQuadrantLabel(task);
            const quadrantColor = getQuadrantColor(quadrant);

            return (
              <div
                key={index}
                className={`${styles.taskCard} ${
                  selectedTasks.has(index) ? styles.selected : ''
                }`}
                onClick={() => handleTaskToggle(index)}
              >
                <div className={styles.taskHeader}>
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(index)}
                    onChange={() => handleTaskToggle(index)}
                    className={styles.checkbox}
                  />
                  <span
                    className={styles.quadrantBadge}
                    style={{ backgroundColor: quadrantColor }}
                  >
                    {quadrant}
                  </span>
                  <span className={styles.areaBadge}>{task.area}</span>
                </div>
                <h4 className={styles.taskTitle}>{task.title}</h4>
                <p className={styles.taskDescription}>{task.description}</p>
                {task.dueDate && (
                  <p className={styles.taskDueDate}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={styles.confirmButton}
          onClick={handleConfirm}
          disabled={selectedTasks.size === 0}
        >
          Create {selectedTasks.size} Task{selectedTasks.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};
