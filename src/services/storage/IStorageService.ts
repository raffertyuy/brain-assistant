import { UserProfile } from '@/models/Profile';

export interface ProfilesConfig {
  version: string;
  profiles: UserProfile[];
  lastSelectedProfileId?: string;
}

/**
 * Service for file system operations
 */
export interface IStorageService {
  /**
   * Initialize storage (request directory access if needed)
   * @returns Promise resolving when storage is ready
   * @throws {StorageAccessError} if user denies access
   */
  initialize(): Promise<void>;

  /**
   * Check if storage is initialized
   * @returns True if storage is ready to use
   */
  isInitialized(): boolean;

  /**
   * Read tasks file for current profile
   * @returns Promise resolving to raw markdown content
   * @throws {FileNotFoundError} if file doesn't exist
   */
  readTasksFile(): Promise<string>;

  /**
   * Write tasks file for current profile
   * @param content - Markdown content to write
   * @returns Promise resolving when write completes
   * @throws {StorageWriteError} if write fails
   */
  writeTasksFile(content: string): Promise<void>;

  /**
   * Read archive file for current profile
   * @returns Promise resolving to raw markdown content
   */
  readArchiveFile(): Promise<string>;

  /**
   * Write archive file for current profile
   * @param content - Markdown content to write
   * @returns Promise resolving when write completes
   */
  writeArchiveFile(content: string): Promise<void>;

  /**
   * Read mind map file
   * @param taskId - Task ID (used as filename)
   * @returns Promise resolving to markdown content
   * @throws {FileNotFoundError} if mind map doesn't exist
   */
  readMindMapFile(taskId: string): Promise<string>;

  /**
   * Write mind map file
   * @param taskId - Task ID (used as filename)
   * @param content - Markdown content to write
   * @returns Promise resolving when write completes
   */
  writeMindMapFile(taskId: string, content: string): Promise<void>;

  /**
   * Read profiles configuration
   * @returns Promise resolving to profiles metadata
   */
  readProfilesConfig(): Promise<ProfilesConfig>;

  /**
   * Write profiles configuration
   * @param config - Profiles metadata to write
   * @returns Promise resolving when write completes
   */
  writeProfilesConfig(config: ProfilesConfig): Promise<void>;

  /**
   * Create profile folder
   * @param profileName - Profile name (used for folder name)
   * @returns Promise resolving when folder is created
   */
  createProfileFolder(profileName: string): Promise<void>;

  /**
   * Set current profile
   * @param profileName - Profile name to set as current
   */
  setCurrentProfile(profileName: string): void;

  /**
   * Get current profile name
   * @returns Current profile name or null if not set
   */
  getCurrentProfile(): string | null;
}
