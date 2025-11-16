import React, { useState, useEffect } from 'react';
import styles from './APIKeyConfig.module.css';

const STORAGE_KEY = 'openai_api_key';

interface APIKeyConfigProps {
  onKeySet: (apiKey: string) => void;
}

/**
 * Component for managing OpenAI API key configuration
 */
export const APIKeyConfig: React.FC<APIKeyConfigProps> = ({ onKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      setIsConfigured(true);
      onKeySet(storedKey);
    } else {
      setShowDialog(true);
    }
  }, [onKeySet]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem(STORAGE_KEY, apiKey);
      setIsConfigured(true);
      setShowDialog(false);
      onKeySet(apiKey);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setIsConfigured(false);
    setShowDialog(true);
  };

  if (!showDialog && isConfigured) {
    return (
      <div className={styles.configuredBanner}>
        <span className={styles.statusIcon}>✓</span>
        <span>AI features enabled</span>
        <button className={styles.changeButton} onClick={() => setShowDialog(true)}>
          Change API Key
        </button>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>OpenAI API Configuration</h2>
        </div>

        <div className={styles.content}>
          <div className={styles.warningBox}>
            <span className={styles.warningIcon}>⚠️</span>
            <div>
              <p className={styles.warningTitle}>Security Notice</p>
              <p className={styles.warningText}>
                Your API key will be stored in browser localStorage. Only use this
                on your personal device. Never share your API key with anyone.
              </p>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>
              OpenAI API Key
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={styles.input}
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className={styles.hint}>
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoTitle}>Why do I need this?</p>
            <ul className={styles.infoList}>
              <li>AI-powered task extraction from braindumps</li>
              <li>Automatic task categorization into quadrants</li>
              <li>Duplicate detection</li>
              <li>Brainstorming assistance</li>
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          {isConfigured && (
            <button className={styles.clearButton} onClick={handleClear}>
              Clear & Logout
            </button>
          )}
          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={!apiKey.trim()}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
