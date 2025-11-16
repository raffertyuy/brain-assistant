import React, { useState } from 'react';
import { MindMapNode } from '../../models/MindMap';
import styles from './NodeEditor.module.css';

interface NodeEditorProps {
  node?: MindMapNode;
  isOpen: boolean;
  onSave: (nodeData: { text: string; linkedTaskId?: string }) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  isOpen,
  onSave,
  onCancel,
  mode
}) => {
  const [text, setText] = useState(node?.text || '');
  const [linkedTaskId, setLinkedTaskId] = useState(node?.linkedTaskId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    onSave({
      text: text.trim(),
      linkedTaskId: linkedTaskId.trim() || undefined
    });

    setText('');
    setLinkedTaskId('');
  };

  const handleCancel = () => {
    setText(node?.text || '');
    setLinkedTaskId(node?.linkedTaskId || '');
    onCancel();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{mode === 'create' ? 'Add Node' : 'Edit Node'}</h3>
          <button className={styles.closeButton} onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="node-text">Node Text</label>
            <input
              id="node-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter node text..."
              autoFocus
              maxLength={100}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="linked-task">
              Linked Task ID <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="linked-task"
              type="text"
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
              placeholder="Enter task ID to link..."
              className={styles.input}
            />
            <small className={styles.hint}>
              Link this node to another task for reference
            </small>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={!text.trim()}
            >
              {mode === 'create' ? 'Add Node' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
