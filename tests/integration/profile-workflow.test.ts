import { describe, it, expect, beforeEach } from 'vitest';
import { LocalProfileService } from '../../src/services/profile-manager/ProfileService';
import { MockStorageService } from '../mocks/storage';

describe('Profile Lifecycle Integration Test', () => {
  let storage: MockStorageService;
  let profileService: LocalProfileService;

  beforeEach(() => {
    storage = new MockStorageService();
    profileService = new LocalProfileService(storage);
  });

  it('should complete full profile lifecycle: create, list, switch, isolate data', async () => {
    // Step 1: Create "Work" profile
    const workProfile = await profileService.createProfile('Work');
    expect(workProfile.name).toBe('Work');
    expect(workProfile.id).toBeDefined();

    // Step 2: Verify profile appears in list
    let profiles = await profileService.getAllProfiles();
    expect(profiles).toHaveLength(1);
    expect(profiles[0].name).toBe('Work');

    // Step 3: Create "Personal" profile
    const personalProfile = await profileService.createProfile('Personal');
    expect(personalProfile.name).toBe('Personal');

    // Step 4: Verify both profiles appear in list
    profiles = await profileService.getAllProfiles();
    expect(profiles).toHaveLength(2);
    expect(profiles.map(p => p.name)).toContain('Work');
    expect(profiles.map(p => p.name)).toContain('Personal');

    // Step 5: Switch to Work profile
    await profileService.switchProfile(workProfile.id);
    const activeProfile = await profileService.getActiveProfile();
    expect(activeProfile?.id).toBe(workProfile.id);

    // Step 6: Verify profile folders were created
    const workTasksFolder = storage.getFile(`${workProfile.id}/tasks.md`);
    const workArchiveFolder = storage.getFile(`${workProfile.id}/archive.md`);
    expect(workTasksFolder).toBeDefined();
    expect(workArchiveFolder).toBeDefined();

    const personalTasksFolder = storage.getFile(`${personalProfile.id}/tasks.md`);
    const personalArchiveFolder = storage.getFile(`${personalProfile.id}/archive.md`);
    expect(personalTasksFolder).toBeDefined();
    expect(personalArchiveFolder).toBeDefined();

    // Step 7: Add delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Step 8: Switch to Personal profile
    await profileService.switchProfile(personalProfile.id);
    const newActiveProfile = await profileService.getActiveProfile();
    expect(newActiveProfile?.id).toBe(personalProfile.id);

    // Step 9: Verify lastUsed was updated for Personal profile
    const updatedProfiles = await profileService.getAllProfiles();
    const updatedPersonalProfile = updatedProfiles.find(p => p.id === personalProfile.id);
    expect(new Date(updatedPersonalProfile!.lastUsed).getTime()).toBeGreaterThan(
      new Date(personalProfile.lastUsed).getTime()
    );
  });

  it('should maintain data isolation between profiles', async () => {
    // Create two profiles
    const workProfile = await profileService.createProfile('Work');
    const personalProfile = await profileService.createProfile('Personal');

    // Write task to Work profile folder
    const workTaskPath = `${workProfile.id}/tasks.md`;
    storage.setFile(workTaskPath, '# Work Task\n\nDo work stuff');

    // Write task to Personal profile folder
    const personalTaskPath = `${personalProfile.id}/tasks.md`;
    storage.setFile(personalTaskPath, '# Personal Task\n\nBuy groceries');

    // Verify files are in separate folders
    const workTaskContent = storage.getFile(workTaskPath);
    const personalTaskContent = storage.getFile(personalTaskPath);

    expect(workTaskContent).toContain('Do work stuff');
    expect(personalTaskContent).toContain('Buy groceries');
    expect(workTaskContent).not.toContain('Buy groceries');
    expect(personalTaskContent).not.toContain('Do work stuff');
  });

  it('should handle edge cases: duplicate names, invalid names, nonexistent profiles', async () => {
    // Create profile
    await profileService.createProfile('Work');

    // Try to create duplicate (should fail)
    await expect(profileService.createProfile('Work')).rejects.toThrow();

    // Try to get nonexistent profile (should fail)
    await expect(profileService.getProfileById('nonexistent')).rejects.toThrow();

    // Try to switch to nonexistent profile (should fail)
    await expect(profileService.switchProfile('nonexistent')).rejects.toThrow();

    // Try invalid names
    await expect(profileService.createProfile('')).rejects.toThrow();
    await expect(profileService.createProfile('Work@Home')).rejects.toThrow();
    await expect(profileService.createProfile('a'.repeat(51))).rejects.toThrow();
  });

  it('should sort profiles by creation date (newest first)', async () => {
    // Create profiles in sequence
    await profileService.createProfile('First');
    
    // Add small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await profileService.createProfile('Second');
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await profileService.createProfile('Third');

    const profiles = await profileService.getAllProfiles();

    expect(profiles[0].name).toBe('Third');
    expect(profiles[1].name).toBe('Second');
    expect(profiles[2].name).toBe('First');
  });
});
