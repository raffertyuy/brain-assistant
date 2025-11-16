import { UserProfile } from '@/models/Profile';

export const workProfile: UserProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Work',
  createdAt: new Date('2025-11-16T08:00:00.000Z'),
  folderPath: 'data/Work',
  lastAccessedAt: new Date('2025-11-16T10:30:00.000Z'),
};

export const personalProfile: UserProfile = {
  id: '650e8400-e29b-41d4-a716-446655440001',
  name: 'Personal',
  createdAt: new Date('2025-11-16T09:00:00.000Z'),
  folderPath: 'data/Personal',
  lastAccessedAt: new Date('2025-11-16T11:00:00.000Z'),
};

export const sampleProfiles: UserProfile[] = [workProfile, personalProfile];
