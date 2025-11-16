import React, { useState } from 'react';
import styles from './BraindumpInput.module.css';

interface BraindumpInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  error?: string | null;
}

/**
 * Distraction-free textarea for braindump input
 */
export const BraindumpInput: React.FC<BraindumpInputProps> = ({
  onSubmit,
  isProcessing,
  error,
}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim() && !isProcessing) {
      onSubmit(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Brain Dump</h1>
        <p className={styles.subtitle}>
          Just type. Get it all out. AI will organize it for you.
        </p>
      </div>

      <div className={styles.inputWrapper}>
        <textarea
          className={styles.textarea}
          placeholder="What's on your mind? Tasks, ideas, worries... just let it flow."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          autoFocus
        />
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Extract Tasks'}
        </button>
        <p className={styles.hint}>
          Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
        </p>
      </div>

      {isProcessing && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner} />
          <p>AI is extracting tasks from your braindump...</p>
        </div>
      )}
    </div>
  );
};
