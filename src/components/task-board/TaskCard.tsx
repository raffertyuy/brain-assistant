import React from 'react';
import { useDrag } from 'react-dnd';
import type { Task } from '../../models/Task';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (taskId: string) => void;
  onBrainstorm?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onComplete, onBrainstorm }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onComplete(task.id);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={drag}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      onClick={() => onEdit(task)}
    >
      <div className={styles.header}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={task.status === 'completed'}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          aria-label="Mark task as complete"
        />
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{task.title}</h3>
          {task.area && <span className={styles.area}>{task.area}</span>}
        </div>
      </div>
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}
      <div className={styles.footer}>
        {task.dueDate && (
          <span className={styles.dueDate}>📅 {formatDate(task.dueDate)}</span>
        )}
        <span className={styles.impact}>
          {task.businessImpact === 'high' ? '🔥 High Impact' : '💡 Low Impact'}
        </span>
        {onBrainstorm && (
          <button
            className={styles.brainstormButton}
            onClick={(e) => {
              e.stopPropagation();
              onBrainstorm(task);
            }}
            aria-label="Open brainstorm mode"
          >
            🧠 Brainstorm
          </button>
        )}
      </div>
    </div>
  );
};
