import React, { useState } from 'react';
import type { Task } from '../../models/Task';
import styles from './TaskEditDialog.module.css';

interface TaskEditDialogProps {
  task: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ task, onSave, onClose }) => {
  const [formData, setFormData] = useState<Task>({
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      dueDate: value ? new Date(value) : undefined,
    }));
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Task</h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="area" className={styles.label}>
              Area
            </label>
            <input
              id="area"
              name="area"
              type="text"
              className={styles.input}
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g., Work, Personal, Health"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="dueDate" className={styles.label}>
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                className={styles.input}
                value={formatDateForInput(formData.dueDate)}
                onChange={handleDateChange}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="businessImpact" className={styles.label}>
                Business Impact
              </label>
              <select
                id="businessImpact"
                name="businessImpact"
                className={styles.select}
                value={formData.businessImpact}
                onChange={handleChange}
              >
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="urgency" className={styles.label}>
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              className={styles.select}
              value={formData.urgency}
              onChange={handleChange}
            >
              <option value="urgent">Urgent</option>
              <option value="not-urgent">Not Urgent</option>
            </select>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
