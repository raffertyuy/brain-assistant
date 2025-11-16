import type { Profile } from '../../models/Profile';
import type { IStorageService } from '../storage/IStorageService';
import { ProfileValidationError, ProfileNotFoundError } from './errors';

/**
 * ProfileService manages user profiles with isolated local storage.
 * Each profile has its own data folder containing tasks, mind maps, and configuration.
 */
export interface ProfileService {
  /**
   * Get all available profiles
   * @returns Array of all profiles sorted by createdAt (newest first)
   * @throws StorageAccessError if profiles.json cannot be read
   */
  getAllProfiles(): Promise<Profile[]>;

  /**
   * Create a new profile with validation
   * @param name - Profile name (must be unique, 1-50 chars, no special chars except space, dash, underscore)
   * @returns Newly created profile
   * @throws ProfileValidationError if name is invalid or duplicate
   * @throws StorageWriteError if profile creation fails
   */
  createProfile(name: string): Promise<Profile>;

  /**
   * Get profile by ID
   * @param id - Profile ID
   * @returns Profile object
   * @throws ProfileNotFoundError if profile doesn't exist
   */
  getProfileById(id: string): Promise<Profile>;

  /**
   * Switch to a different profile
   * @param id - Profile ID to switch to
   * @returns Updated profile with lastUsed timestamp
   * @throws ProfileNotFoundError if profile doesn't exist
   */
  switchProfile(id: string): Promise<Profile>;

  /**
   * Get currently active profile
   * @returns Active profile or null if none selected
   */
  getActiveProfile(): Promise<Profile | null>;
}

/**
 * ProfileService implementation using local file storage
 */
export class LocalProfileService implements ProfileService {
  private activeProfileId: string | null = null;

  constructor(private storage: IStorageService) {}

  async getAllProfiles(): Promise<Profile[]> {
    const profilesConfig = await this.storage.readProfilesConfig();
    return profilesConfig.profiles.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createProfile(name: string): Promise<Profile> {
    this.validateProfileName(name);

    const profilesConfig = await this.storage.readProfilesConfig();
    
    // Check for duplicate name
    if (profilesConfig.profiles.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      throw new ProfileValidationError(`Profile with name "${name}" already exists`);
    }

    const newProfile: Profile = {
      id: this.generateProfileId(),
      name,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    // Create profile folder structure
    await this.storage.createProfileFolder(newProfile.id);

    // Add to profiles list
    profilesConfig.profiles.push(newProfile);
    await this.storage.writeProfilesConfig(profilesConfig);

    return newProfile;
  }

  async getProfileById(id: string): Promise<Profile> {
    const profilesConfig = await this.storage.readProfilesConfig();
    const profile = profilesConfig.profiles.find(p => p.id === id);
    
    if (!profile) {
      throw new ProfileNotFoundError(`Profile with ID "${id}" not found`);
    }

    return profile;
  }

  async switchProfile(id: string): Promise<Profile> {
    const profilesConfig = await this.storage.readProfilesConfig();
    const profileIndex = profilesConfig.profiles.findIndex(p => p.id === id);

    if (profileIndex === -1) {
      throw new ProfileNotFoundError(`Profile with ID "${id}" not found`);
    }

    // Update lastUsed timestamp
    profilesConfig.profiles[profileIndex].lastUsed = new Date().toISOString();
    await this.storage.writeProfilesConfig(profilesConfig);

    // Set active profile in storage service
    this.activeProfileId = id;
    this.storage.setCurrentProfile(id);
    
    return profilesConfig.profiles[profileIndex];
  }

  async getActiveProfile(): Promise<Profile | null> {
    if (!this.activeProfileId) {
      return null;
    }

    try {
      return await this.getProfileById(this.activeProfileId);
    } catch (error) {
      if (error instanceof ProfileNotFoundError) {
        this.activeProfileId = null;
        return null;
      }
      throw error;
    }
  }

  private validateProfileName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ProfileValidationError('Profile name cannot be empty');
    }

    if (name.length > 50) {
      throw new ProfileValidationError('Profile name must be 50 characters or less');
    }

    // Allow letters, numbers, spaces, dashes, and underscores
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNamePattern.test(name)) {
      throw new ProfileValidationError(
        'Profile name can only contain letters, numbers, spaces, dashes, and underscores'
      );
    }
  }

  private generateProfileId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

