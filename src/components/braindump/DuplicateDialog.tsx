import React from 'react';
import type { DuplicateMatch } from '../../services/ai/AIService';
import styles from './DuplicateDialog.module.css';

interface DuplicateDialogProps {
  duplicate: DuplicateMatch;
  onMerge: () => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

/**
 * Dialog for confirming duplicate task merge
 */
export const DuplicateDialog: React.FC<DuplicateDialogProps> = ({
  duplicate,
  onMerge,
  onCreateNew,
  onCancel,
}) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Duplicate Task Detected</h3>
          <button className={styles.closeButton} onClick={onCancel}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.taskComparison}>
            <div className={styles.taskSection}>
              <p className={styles.label}>New Task:</p>
              <p className={styles.taskTitle}>{duplicate.extractedTask.title}</p>
              <p className={styles.taskDescription}>
                {duplicate.extractedTask.description}
              </p>
            </div>

            <div className={styles.separator}>
              <div className={styles.separatorLine} />
              <span className={styles.similarityBadge}>
                {Math.round(duplicate.confidence * 100)}% similar
              </span>
              <div className={styles.separatorLine} />
            </div>

            <div className={styles.taskSection}>
              <p className={styles.label}>Existing Task:</p>
              <p className={styles.taskTitle}>{duplicate.existingTask.title}</p>
              <p className={styles.taskDescription}>
                {duplicate.existingTask.description}
              </p>
            </div>
          </div>

          <div className={styles.info}>
            <p>
              This task appears similar to an existing task. You can merge the new
              information into the existing task or create it as a separate task.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.createButton} onClick={onCreateNew}>
            Create Separate Task
          </button>
          <button className={styles.mergeButton} onClick={onMerge}>
            Merge into Existing
          </button>
        </div>
      </div>
    </div>
  );
};
