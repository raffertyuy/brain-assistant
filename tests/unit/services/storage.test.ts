import { describe, it, expect, beforeEach } from 'vitest';
import { MockStorageService } from '../../mocks/storage';
import { workProfile } from '../../fixtures/profiles';

describe('StorageService', () => {
  let storage: MockStorageService;

  beforeEach(() => {
    storage = new MockStorageService();
  });

  it('should initialize successfully', async () => {
    await storage.initialize();
    expect(storage.isInitialized()).toBe(true);
  });

  it('should set and get current profile', () => {
    storage.setCurrentProfile('Work');
    expect(storage.getCurrentProfile()).toBe('Work');
  });

  it('should write and read tasks file', async () => {
    await storage.initialize();
    storage.setCurrentProfile('Work');

    const content = '# Tasks\n\nTest content';
    await storage.writeTasksFile(content);

    const read = await storage.readTasksFile();
    expect(read).toBe(content);
  });

  it('should create profile folder', async () => {
    await storage.initialize();
    await storage.createProfileFolder('Work');

    storage.setCurrentProfile('Work');
    const tasks = await storage.readTasksFile();
    const archive = await storage.readArchiveFile();

    expect(tasks).toBe('# Tasks\n\n');
    expect(archive).toBe('# Archive\n\n');
  });

  it('should read and write profiles config', async () => {
    await storage.initialize();

    const config = {
      version: '1.0.0',
      profiles: [workProfile],
      lastSelectedProfileId: workProfile.id,
    };

    await storage.writeProfilesConfig(config);
    const read = await storage.readProfilesConfig();

    expect(read.version).toBe('1.0.0');
    expect(read.profiles).toHaveLength(1);
    expect(read.profiles[0].id).toBe(workProfile.id);
  });

  it('should write and read mind map file', async () => {
    await storage.initialize();
    storage.setCurrentProfile('Work');

    const taskId = '123-456-789';
    const content = '# Mind Map\n\nTest';

    await storage.writeMindMapFile(taskId, content);
    const read = await storage.readMindMapFile(taskId);

    expect(read).toBe(content);
  });

  it('should throw error when reading non-existent mind map', async () => {
    await storage.initialize();
    storage.setCurrentProfile('Work');

    await expect(storage.readMindMapFile('nonexistent')).rejects.toThrow('File not found');
  });
});
