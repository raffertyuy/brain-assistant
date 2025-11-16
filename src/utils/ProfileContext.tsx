import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Profile } from '../models/Profile';
import type { ProfileService } from '../services/profile-manager/ProfileService';
import type { IStorageService } from '../services/storage/IStorageService';

interface ProfileContextValue {
  activeProfile: Profile | null;
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
  switchProfile: (profileId: string) => Promise<void>;
  createProfile: (name: string) => Promise<Profile>;
  refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

interface ProfileProviderProps {
  profileService: ProfileService;
  storage: IStorageService;
  children: ReactNode;
}

/**
 * ProfileProvider manages the active profile state across the application
 */
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ profileService, storage, children }) => {
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storage.isInitialized()) {
      loadProfiles();
    }
  }, []);

  const loadProfiles = async () => {
    try {
      console.log('loadProfiles called, storage initialized:', storage.isInitialized());
      setIsLoading(true);
      setError(null);

      const allProfiles = await profileService.getAllProfiles();
      console.log('getAllProfiles returned:', allProfiles);
      setProfiles(allProfiles);

      const active = await profileService.getActiveProfile();
      console.log('getActiveProfile returned:', active);
      setActiveProfile(active);
    } catch (err) {
      console.error('loadProfiles error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const switchProfile = async (profileId: string) => {
    try {
      setError(null);
      const profile = await profileService.switchProfile(profileId);
      setActiveProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch profile');
      throw err;
    }
  };

  const createProfile = async (name: string) => {
    try {
      setError(null);
      const newProfile = await profileService.createProfile(name);
      await loadProfiles();
      return newProfile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      throw err;
    }
  };

  const refreshProfiles = async () => {
    console.log('refreshProfiles called');
    await loadProfiles();
  };

  const value: ProfileContextValue = {
    activeProfile,
    profiles,
    isLoading,
    error,
    switchProfile,
    createProfile,
    refreshProfiles,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

/**
 * Hook to access profile context
 * @returns ProfileContext value
 * @throws Error if used outside ProfileProvider
 */
export const useProfile = (): ProfileContextValue => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
