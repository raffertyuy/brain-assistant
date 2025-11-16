import { IStorageService, ProfilesConfig } from '../../src/services/storage/IStorageService';

/**
 * Mock storage service for testing
 */
export class MockStorageService implements IStorageService {
  private files = new Map<string, string>();
  private initialized = false;
  private currentProfile: string | null = null;

  async initialize(): Promise<void> {
    this.initialized = true;
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
    if (!this.currentProfile) throw new Error('No profile selected');
    const key = `${this.currentProfile}/tasks.md`;
    return this.files.get(key) || '# Tasks\n\n';
  }

  async writeTasksFile(content: string): Promise<void> {
    if (!this.currentProfile) throw new Error('No profile selected');
    this.files.set(`${this.currentProfile}/tasks.md`, content);
  }

  async readArchiveFile(): Promise<string> {
    if (!this.currentProfile) throw new Error('No profile selected');
    const key = `${this.currentProfile}/archive.md`;
    return this.files.get(key) || '# Archive\n\n';
  }

  async writeArchiveFile(content: string): Promise<void> {
    if (!this.currentProfile) throw new Error('No profile selected');
    this.files.set(`${this.currentProfile}/archive.md`, content);
  }

  async readMindMapFile(taskId: string): Promise<string> {
    if (!this.currentProfile) throw new Error('No profile selected');
    const key = `${this.currentProfile}/mind-maps/${taskId}.md`;
    const content = this.files.get(key);
    if (!content) throw new Error('File not found');
    return content;
  }

  async writeMindMapFile(taskId: string, content: string): Promise<void> {
    if (!this.currentProfile) throw new Error('No profile selected');
    this.files.set(`${this.currentProfile}/mind-maps/${taskId}.md`, content);
  }

  async readProfilesConfig(): Promise<ProfilesConfig> {
    const content = this.files.get('profiles.json');
    if (!content) {
      return { version: '1.0.0', profiles: [] };
    }
    return JSON.parse(content);
  }

  async writeProfilesConfig(config: ProfilesConfig): Promise<void> {
    this.files.set('profiles.json', JSON.stringify(config, null, 2));
  }

  async createProfileFolder(profileName: string): Promise<void> {
    this.files.set(`${profileName}/tasks.md`, '# Tasks\n\n');
    this.files.set(`${profileName}/archive.md`, '# Archive\n\n');
  }

  // Test helper methods
  getFile(path: string): string | undefined {
    return this.files.get(path);
  }

  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  clear(): void {
    this.files.clear();
  }
}
