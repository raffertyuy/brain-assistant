import { Task } from '@/models/Task';
import { Quadrant } from '@/models/Quadrant';

export const sampleTask: Task = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  area: 'Q4 Planning',
  title: 'Prepare Q4 presentation',
  description: 'Leadership expectations for Friday. Needs financial projections and roadmap slides.',
  context: 'CFO specifically asked for market share data',
  dueDate: new Date('2025-11-20T23:59:59.000Z'),
  businessImpact: 'high',
  urgency: 'urgent',
  quadrant: Quadrant.DO,
  status: 'active',
  createdAt: new Date('2025-11-16T08:00:00.000Z'),
};

export const urgentLowImpactTask: Task = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  area: 'Admin',
  title: 'Reply to routine emails',
  description: 'Clear inbox of low-priority messages',
  businessImpact: 'low',
  urgency: 'urgent',
  quadrant: Quadrant.DELEGATE,
  status: 'active',
  createdAt: new Date('2025-11-16T09:00:00.000Z'),
};

export const strategicTask: Task = {
  id: '323e4567-e89b-12d3-a456-426614174002',
  area: 'Strategy',
  title: 'Research competitive landscape',
  description: 'Analyze competitor products and market positioning',
  businessImpact: 'high',
  urgency: 'not-urgent',
  quadrant: Quadrant.PLAN,
  status: 'active',
  createdAt: new Date('2025-11-16T10:00:00.000Z'),
};

export const lowPriorityTask: Task = {
  id: '423e4567-e89b-12d3-a456-426614174003',
  area: 'Misc',
  title: 'Organize desktop files',
  description: 'Clean up old documents',
  businessImpact: 'low',
  urgency: 'not-urgent',
  quadrant: Quadrant.ELIMINATE,
  status: 'active',
  createdAt: new Date('2025-11-16T11:00:00.000Z'),
};

export const completedTask: Task = {
  id: '523e4567-e89b-12d3-a456-426614174004',
  area: 'Development',
  title: 'Fix bug in login flow',
  description: 'User reported 500 error',
  businessImpact: 'high',
  urgency: 'urgent',
  quadrant: Quadrant.DO,
  status: 'completed',
  createdAt: new Date('2025-11-15T08:00:00.000Z'),
  completedAt: new Date('2025-11-15T14:30:00.000Z'),
};

export const sampleTasks: Task[] = [
  sampleTask,
  urgentLowImpactTask,
  strategicTask,
  lowPriorityTask,
];
