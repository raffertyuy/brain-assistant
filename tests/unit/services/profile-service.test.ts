import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalProfileService } from '../../../src/services/profile-manager/ProfileService';
import { ProfileValidationError, ProfileNotFoundError } from '../../../src/services/profile-manager/errors';
import type { IStorageService, ProfilesConfig } from '../../../src/services/storage/IStorageService';

describe('ProfileService', () => {
  let mockStorage: IStorageService;
  let profileService: LocalProfileService;

  beforeEach(() => {
    // Create mock storage service
    mockStorage = {
      initialize: vi.fn(),
      isInitialized: vi.fn().mockReturnValue(true),
      readTasksFile: vi.fn(),
      writeTasksFile: vi.fn(),
      readArchiveFile: vi.fn(),
      writeArchiveFile: vi.fn(),
      readMindMapFile: vi.fn(),
      writeMindMapFile: vi.fn(),
      readProfilesConfig: vi.fn(),
      writeProfilesConfig: vi.fn(),
      createProfileFolder: vi.fn(),
      setCurrentProfile: vi.fn(),
      getCurrentProfile: vi.fn(),
    } as IStorageService;

    profileService = new LocalProfileService(mockStorage);
  });

  describe('createProfile', () => {
    it('should create a new profile with valid name', async () => {
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };
      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      const profile = await profileService.createProfile('Work');

      expect(profile.name).toBe('Work');
      expect(profile.id).toBeDefined();
      expect(profile.createdAt).toBeDefined();
      expect(profile.lastUsed).toBeDefined();
      expect(mockStorage.createProfileFolder).toHaveBeenCalled();
      expect(mockStorage.writeProfilesConfig).toHaveBeenCalled();
    });

    it('should reject empty profile name', async () => {
      await expect(profileService.createProfile('')).rejects.toThrow(ProfileValidationError);
      await expect(profileService.createProfile('   ')).rejects.toThrow(ProfileValidationError);
    });

    it('should reject profile name longer than 50 characters', async () => {
      const longName = 'a'.repeat(51);
      await expect(profileService.createProfile(longName)).rejects.toThrow(ProfileValidationError);
    });

    it('should reject profile name with invalid characters', async () => {
      await expect(profileService.createProfile('Work@Home')).rejects.toThrow(ProfileValidationError);
      await expect(profileService.createProfile('Work/Personal')).rejects.toThrow(ProfileValidationError);
      await expect(profileService.createProfile('Work\\Personal')).rejects.toThrow(ProfileValidationError);
    });

    it('should accept profile name with valid characters', async () => {
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };
      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      await expect(profileService.createProfile('Work-Projects')).resolves.toBeDefined();
      await expect(profileService.createProfile('Personal_Tasks')).resolves.toBeDefined();
      await expect(profileService.createProfile('Home Stuff')).resolves.toBeDefined();
    });

    it('should reject duplicate profile names (case-insensitive)', async () => {
      const profilesConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [
          {
            id: 'profile_1',
            name: 'Work',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
        ],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(profilesConfig);

      await expect(profileService.createProfile('Work')).rejects.toThrow(ProfileValidationError);
      await expect(profileService.createProfile('work')).rejects.toThrow(ProfileValidationError);
      await expect(profileService.createProfile('WORK')).rejects.toThrow(ProfileValidationError);
    });

    it('should create profile folder structure', async () => {
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };
      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      const profile = await profileService.createProfile('Work');

      expect(mockStorage.createProfileFolder).toHaveBeenCalledWith(profile.id);
    });
  });

  describe('getAllProfiles', () => {
    it('should return empty array when no profiles exist', async () => {
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };
      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      const profiles = await profileService.getAllProfiles();

      expect(profiles).toEqual([]);
    });

    it('should return all profiles sorted by createdAt (newest first)', async () => {
      const profilesConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [
          {
            id: 'profile_1',
            name: 'Work',
            createdAt: '2024-01-01T00:00:00.000Z',
            lastUsed: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'profile_2',
            name: 'Personal',
            createdAt: '2024-01-02T00:00:00.000Z',
            lastUsed: '2024-01-02T00:00:00.000Z',
          },
          {
            id: 'profile_3',
            name: 'Side Project',
            createdAt: '2024-01-03T00:00:00.000Z',
            lastUsed: '2024-01-03T00:00:00.000Z',
          },
        ],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(profilesConfig);

      const profiles = await profileService.getAllProfiles();

      expect(profiles).toHaveLength(3);
      expect(profiles[0].name).toBe('Side Project');
      expect(profiles[1].name).toBe('Personal');
      expect(profiles[2].name).toBe('Work');
    });
  });

  describe('getProfileById', () => {
    it('should return profile when it exists', async () => {
      const profilesConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [
          {
            id: 'profile_1',
            name: 'Work',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
        ],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(profilesConfig);

      const profile = await profileService.getProfileById('profile_1');

      expect(profile.id).toBe('profile_1');
      expect(profile.name).toBe('Work');
    });

    it('should throw ProfileNotFoundError when profile does not exist', async () => {
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      await expect(profileService.getProfileById('nonexistent')).rejects.toThrow(
        ProfileNotFoundError
      );
    });
  });

  describe('switchProfile', () => {
    it('should switch to existing profile and update lastUsed', async () => {
      const oldDate = '2024-01-01T00:00:00.000Z';
      const profilesConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [
          {
            id: 'profile_1',
            name: 'Work',
            createdAt: oldDate,
            lastUsed: oldDate,
          },
        ],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(profilesConfig);

      const profile = await profileService.switchProfile('profile_1');

      expect(profile.id).toBe('profile_1');
      expect(profile.lastUsed).not.toBe(oldDate);
      expect(new Date(profile.lastUsed).getTime()).toBeGreaterThan(new Date(oldDate).getTime());
      expect(mockStorage.writeProfilesConfig).toHaveBeenCalled();
      expect(mockStorage.setCurrentProfile).toHaveBeenCalledWith('profile_1');
    });

    it('should throw ProfileNotFoundError when profile does not exist', async () => {
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      await expect(profileService.switchProfile('nonexistent')).rejects.toThrow(
        ProfileNotFoundError
      );
    });
  });

  describe('getActiveProfile', () => {
    it('should return null when no profile is active', async () => {
      const activeProfile = await profileService.getActiveProfile();

      expect(activeProfile).toBeNull();
    });

    it('should return active profile after switching', async () => {
      const profilesConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [
          {
            id: 'profile_1',
            name: 'Work',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
        ],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(profilesConfig);

      await profileService.switchProfile('profile_1');
      const activeProfile = await profileService.getActiveProfile();

      expect(activeProfile).not.toBeNull();
      expect(activeProfile?.id).toBe('profile_1');
    });

    it('should return null if active profile was deleted', async () => {
      const profilesConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [
          {
            id: 'profile_1',
            name: 'Work',
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
          },
        ],
      };

      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(profilesConfig);

      await profileService.switchProfile('profile_1');

      // Simulate profile deletion
      const emptyConfig: ProfilesConfig = {
        version: '1.0.0',
        profiles: [],
      };
      vi.mocked(mockStorage.readProfilesConfig).mockResolvedValue(emptyConfig);

      const activeProfile = await profileService.getActiveProfile();

      expect(activeProfile).toBeNull();
    });
  });
});
