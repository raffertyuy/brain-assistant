import { Quadrant } from './Quadrant';

export interface Task {
  id: string;
  area: string;
  title: string;
  description: string;
  context?: string;
  dueDate?: Date;
  businessImpact: 'high' | 'low';
  urgency: 'urgent' | 'not-urgent';
  quadrant: Quadrant;
  status: 'active' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  mindMapId?: string;
}
