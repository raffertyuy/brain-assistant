export enum Quadrant {
  DO = 'DO',
  PLAN = 'PLAN',
  DELEGATE = 'DELEGATE',
  ELIMINATE = 'ELIMINATE',
}

export interface QuadrantDefinition {
  key: Quadrant;
  label: string;
  description: string;
  urgency: 'urgent' | 'not-urgent';
  businessImpact: 'high' | 'low';
  color: string;
}

export const QUADRANT_DEFINITIONS: Record<Quadrant, QuadrantDefinition> = {
  [Quadrant.DO]: {
    key: Quadrant.DO,
    label: 'Do First',
    description: 'Critical tasks requiring immediate attention',
    urgency: 'urgent',
    businessImpact: 'high',
    color: '#ef4444',
  },
  [Quadrant.PLAN]: {
    key: Quadrant.PLAN,
    label: 'Schedule',
    description: 'Important strategic work to schedule',
    urgency: 'not-urgent',
    businessImpact: 'high',
    color: '#3b82f6',
  },
  [Quadrant.DELEGATE]: {
    key: Quadrant.DELEGATE,
    label: 'Delegate',
    description: 'Time-sensitive but low-value tasks',
    urgency: 'urgent',
    businessImpact: 'low',
    color: '#f59e0b',
  },
  [Quadrant.ELIMINATE]: {
    key: Quadrant.ELIMINATE,
    label: 'Eliminate',
    description: 'Low-priority distractions to minimize',
    urgency: 'not-urgent',
    businessImpact: 'low',
    color: '#6b7280',
  },
};
