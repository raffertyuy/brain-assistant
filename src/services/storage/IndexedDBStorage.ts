import { IStorageService, ProfilesConfig } from './IStorageService';
import { FileNotFoundError, StorageWriteError } from './errors';

const DB_NAME = 'brain-assistant-db';
const DB_VERSION = 1;
const STORE_NAME = 'files';

/**
 * IndexedDB-based storage service for browsers without File System Access API
 */
export class IndexedDBStorage implements IStorageService {
  private db: IDBDatabase | null = null;
  private initialized = false;
  private currentProfile: string | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open IndexedDB'));

      request.onsuccess = () => {
        this.db = request.result;
        this.initialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
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
    await this.writeFile(`${profileName}/tasks.md`, '# Tasks\n\n');
    await this.writeFile(`${profileName}/archive.md`, '# Archive\n\n');
  }

  private async readFile(path: string): Promise<string> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(path);

      request.onsuccess = () => {
        if (request.result === undefined) {
          reject(new FileNotFoundError(path));
        } else {
          resolve(request.result);
        }
      };

      request.onerror = () => reject(new Error(`Failed to read file: ${path}`));
    });
  }

  private async writeFile(path: string, content: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(content, path);

      request.onsuccess = () => resolve();
      request.onerror = () =>
        reject(new StorageWriteError(`Failed to write file: ${path}`));
    });
  }
}
