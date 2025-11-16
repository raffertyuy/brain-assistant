import React, { useState, useEffect } from 'react';
import type { Profile } from '../../models/Profile';
import type { ProfileService } from '../../services/profile-manager/ProfileService';
import styles from './ProfileSelector.module.css';

interface ProfileSelectorProps {
  profileService: ProfileService;
  onProfileChange: (profile: Profile | null) => void;
  onAddProfile: () => void;
}

/**
 * ProfileSelector component displays a dropdown for selecting active profile
 * and a button to create new profiles
 */
export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profileService,
  onProfileChange,
  onAddProfile,
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allProfiles = await profileService.getAllProfiles();
      setProfiles(allProfiles);

      const active = await profileService.getActiveProfile();
      setActiveProfile(active);
      onProfileChange(active);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSwitch = async (profileId: string) => {
    try {
      setError(null);
      const profile = await profileService.switchProfile(profileId);
      setActiveProfile(profile);
      onProfileChange(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch profile');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading profiles...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        {error}
        <button onClick={loadProfiles} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No profiles found. Create your first profile to get started.</p>
        <button onClick={onAddProfile} className={styles.addButton}>
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profileSelector}>
      <label htmlFor="profile-select" className={styles.label}>
        Profile:
      </label>
      <select
        id="profile-select"
        className={styles.select}
        value={activeProfile?.id || ''}
        onChange={(e) => handleProfileSwitch(e.target.value)}
      >
        <option value="" disabled>
          Select a profile
        </option>
        {profiles.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.name}
          </option>
        ))}
      </select>
      <button onClick={onAddProfile} className={styles.addButton} title="Create new profile">
        + Add Profile
      </button>
    </div>
  );
};
