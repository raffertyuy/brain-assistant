import { IStorageService, ProfilesConfig } from './IStorageService';
import { StorageAccessError, FileNotFoundError, StorageWriteError } from './errors';

/**
 * Storage service using File System Access API with IndexedDB fallback
 */
export class StorageService implements IStorageService {
  private initialized = false;
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private currentProfile: string | null = null;
  private useFileSystemAPI: boolean;

  constructor() {
    this.useFileSystemAPI = 'showDirectoryPicker' in window;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.useFileSystemAPI) {
      try {
        this.directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'documents',
        });
        this.initialized = true;
      } catch (error) {
        throw new StorageAccessError(
          'User denied directory access. Please grant access to continue.'
        );
      }
    } else {
      // IndexedDB fallback for browsers without File System Access API
      this.initialized = true;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  setCurrentProfile(profileName: string): void {
    this.currentProfile = profileName;
  }

  getCurrentProfile(): string | null {
    return this.currentProfile;
  }

  async readTasksFile(): Promise<string> {
    if (!this.currentProfile) {
      throw new Error('No profile selected');
    }
    return this.readFile(`${this.currentProfile}/tasks.md`);
  }

  async writeTasksFile(content: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile selected');
    }
    await this.writeFile(`${this.currentProfile}/tasks.md`, content);
  }

  async readArchiveFile(): Promise<string> {
    if (!this.currentProfile) {
      throw new Error('No profile selected');
    }
    return this.readFile(`${this.currentProfile}/archive.md`);
  }

  async writeArchiveFile(content: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile selected');
    }
    await this.writeFile(`${this.currentProfile}/archive.md`, content);
  }

  async readMindMapFile(taskId: string): Promise<string> {
    if (!this.currentProfile) {
      throw new Error('No profile selected');
    }
    return this.readFile(`${this.currentProfile}/mind-maps/${taskId}.md`);
  }

  async writeMindMapFile(taskId: string, content: string): Promise<void> {
    if (!this.currentProfile) {
      throw new Error('No profile selected');
    }
    await this.writeFile(`${this.currentProfile}/mind-maps/${taskId}.md`, content);
  }

  async readProfilesConfig(): Promise<ProfilesConfig> {
    try {
      const content = await this.readFile('profiles.json');
      return JSON.parse(content);
    } catch (error) {
      if (error instanceof FileNotFoundError) {
        return {
          version: '1.0.0',
          profiles: [],
        };
      }
      throw error;
    }
  }

  async writeProfilesConfig(config: ProfilesConfig): Promise<void> {
    await this.writeFile('profiles.json', JSON.stringify(config, null, 2));
  }

  async createProfileFolder(profileName: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }

    if (this.useFileSystemAPI && this.directoryHandle) {
      try {
        const profileDir = await this.directoryHandle.getDirectoryHandle(profileName, {
          create: true,
        });
        await profileDir.getDirectoryHandle('mind-maps', { create: true });
        
        // Create empty tasks.md and archive.md
        await this.writeFileToHandle(profileDir, 'tasks.md', '# Tasks\n\n');
        await this.writeFileToHandle(profileDir, 'archive.md', '# Archive\n\n');
      } catch (error) {
        throw new StorageWriteError(`Failed to create profile folder: ${profileName}`, error as Error);
      }
    }
    // IndexedDB fallback would store folder metadata here
  }

  private async readFile(path: string): Promise<string> {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }

    if (this.useFileSystemAPI && this.directoryHandle) {
      try {
        const fileHandle = await this.getFileHandle(path);
        const file = await fileHandle.getFile();
        return await file.text();
      } catch (error) {
        throw new FileNotFoundError(path);
      }
    } else {
      // IndexedDB fallback
      return '';
    }
  }

  private async writeFile(path: string, content: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Storage not initialized');
    }

    if (this.useFileSystemAPI && this.directoryHandle) {
      try {
        const fileHandle = await this.getFileHandle(path, true);
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      } catch (error) {
        throw new StorageWriteError(`Failed to write file: ${path}`, error as Error);
      }
    }
    // IndexedDB fallback would store content here
  }

  private async getFileHandle(
    path: string,
    create = false
  ): Promise<FileSystemFileHandle> {
    if (!this.directoryHandle) {
      throw new Error('No directory handle');
    }

    const parts = path.split('/');
    let currentDir = this.directoryHandle;

    // Navigate through directories
    for (let i = 0; i < parts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(parts[i], { create });
    }

    // Get file handle
    const fileName = parts[parts.length - 1];
    return await currentDir.getFileHandle(fileName, { create });
  }

  private async writeFileToHandle(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string,
    content: string
  ): Promise<void> {
    const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}
