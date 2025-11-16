import React, { useState } from 'react';
import type { ProfileService } from '../../services/profile-manager/ProfileService';
import { ProfileValidationError } from '../../services/profile-manager/errors';
import styles from './AddProfileDialog.module.css';

interface AddProfileDialogProps {
  profileService: ProfileService;
  onClose: () => void;
  onProfileCreated: () => void;
}

/**
 * AddProfileDialog component provides a modal dialog for creating new profiles
 */
export const AddProfileDialog: React.FC<AddProfileDialogProps> = ({
  profileService,
  onClose,
  onProfileCreated,
}) => {
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileName.trim()) {
      setError('Profile name cannot be empty');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      
      await profileService.createProfile(profileName.trim());
      onProfileCreated();
      onClose();
    } catch (err) {
      console.error('Profile creation error:', err);
      if (err instanceof ProfileValidationError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create profile. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>Create New Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="profile-name" className={styles.label}>
              Profile Name
            </label>
            <input
              id="profile-name"
              type="text"
              className={styles.input}
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g., Work, Personal, Side Project"
              autoFocus
              disabled={isCreating}
              maxLength={50}
            />
            <p className={styles.hint}>
              Letters, numbers, spaces, dashes, and underscores only (max 50 characters)
            </p>
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.createButton}
              disabled={isCreating || !profileName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
