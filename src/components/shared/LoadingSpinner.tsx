import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading spinner component with optional message
 * 
 * @param size - Spinner size: 'small' (24px), 'medium' (40px), 'large' (64px). Default: 'medium'
 * @param message - Optional loading message to display below spinner
 * @param fullScreen - If true, spinner takes full viewport height. Default: false
 * 
 * @example
 * <LoadingSpinner size="large" message="Loading tasks..." fullScreen />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  fullScreen = false,
}) => {
  const containerClass = fullScreen ? styles.fullScreenContainer : styles.container;
  const spinnerClass = `${styles.spinner} ${styles[size]}`;

  return (
    <div className={containerClass}>
      <div className={spinnerClass} role="status" aria-live="polite">
        <span className={styles.srOnly}>Loading...</span>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

/**
 * Loading overlay component that covers the entire screen
 * 
 * @param message - Optional loading message
 * 
 * @example
 * <LoadingOverlay message="Processing your braindump..." />
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message }) => {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-busy="true">
      <div className={styles.overlayContent}>
        <div className={`${styles.spinner} ${styles.large}`}>
          <span className={styles.srOnly}>Loading...</span>
        </div>
        {message && <p className={styles.overlayMessage}>{message}</p>}
      </div>
    </div>
  );
};

interface LoadingDotsProps {
  text?: string;
}

/**
 * Loading dots animation for inline loading states
 * 
 * @param text - Text to display before the dots
 * 
 * @example
 * <LoadingDots text="Processing" />
 */
export const LoadingDots: React.FC<LoadingDotsProps> = ({ text = 'Loading' }) => {
  return (
    <span className={styles.dotsContainer}>
      {text}
      <span className={styles.dots}>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
        <span className={styles.dot}>.</span>
      </span>
    </span>
  );
};
