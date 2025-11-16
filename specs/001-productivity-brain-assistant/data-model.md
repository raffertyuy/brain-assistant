# Data Model: Productivity Brain Assistant

**Date**: 2025-11-16  
**Purpose**: Define core entities, relationships, and validation rules

## Entity Definitions

### 1. User Profile

**Description**: Represents a distinct context (e.g., Work, Personal) with isolated data storage.

**Fields**:
```typescript
interface UserProfile {
  id: string;                    // UUID
  name: string;                  // Profile name (e.g., "Work", "Personal")
  createdAt: Date;              // Creation timestamp
  folderPath: string;           // Relative path to data folder (e.g., "data/Work")
  lastAccessedAt: Date;         // Last time profile was opened
}
```

**Validation Rules**:
- `name` MUST be unique across all profiles
- `name` MUST NOT contain invalid folder name characters: `/ \ : * ? " < > |`
- `name` length MUST be 1-50 characters
- `name` MUST NOT be empty or only whitespace
- `folderPath` MUST follow pattern `data/{sanitizedName}` where sanitizedName replaces spaces with hyphens

**State Transitions**:
- Created → Active (on first selection)
- Active → Active (on subsequent selections, updates `lastAccessedAt`)
- No deletion in MVP (can be added later)

**Storage Format**:
```json
// data/profiles.json
{
  "profiles": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Work",
      "createdAt": "2025-11-16T08:00:00.000Z",
      "folderPath": "data/Work",
      "lastAccessedAt": "2025-11-16T10:30:00.000Z"
    }
  ],
  "lastSelectedProfileId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 2. Task

**Description**: Represents an actionable item within a specific quadrant.

**Fields**:
```typescript
interface Task {
  id: string;                    // UUID
  area: string;                  // Project/area name (e.g., "Q4 Planning", "Team Management")
  title: string;                 // Task title (brief, actionable)
  description: string;           // Detailed description (markdown supported)
  context?: string;              // Additional context, notes, or related information
  dueDate?: Date;                // Optional due date
  businessImpact: 'high' | 'low'; // Impact on business goals
  urgency: 'urgent' | 'not-urgent'; // Time sensitivity
  quadrant: Quadrant;            // Derived from urgency + businessImpact
  status: 'active' | 'completed'; // Task status
  createdAt: Date;               // Creation timestamp
  completedAt?: Date;            // Completion timestamp (if status === 'completed')
  mindMapId?: string;            // Optional link to associated mind map
}
```

**Validation Rules**:
- `title` MUST NOT be empty
- `title` length MUST be 1-200 characters
- `area` MUST NOT be empty
- `area` length MUST be 1-100 characters
- `quadrant` MUST match combination of `urgency` + `businessImpact`:
  - `{ urgency: 'urgent', businessImpact: 'high' }` → `DO`
  - `{ urgency: 'not-urgent', businessImpact: 'high' }` → `PLAN`
  - `{ urgency: 'urgent', businessImpact: 'low' }` → `DELEGATE`
  - `{ urgency: 'not-urgent', businessImpact: 'low' }` → `ELIMINATE`
- `completedAt` MUST be set if and only if `status === 'completed'`
- `dueDate` if present MUST be a valid date (not in the past for active tasks warning only)

**State Transitions**:
```
Created (active) → Completed
  ↓ (quadrant change)
DO ↔ PLAN ↔ DELEGATE ↔ ELIMINATE (via drag-and-drop or edit)
```

**Relationships**:
- Belongs to one `UserProfile` (via folder location)
- May link to one `MindMap` (optional, via `mindMapId`)
- May reference other `Task`s in description or mind map (via markdown links)

**Storage Format** (Markdown with YAML frontmatter):
```markdown
---
id: 123e4567-e89b-12d3-a456-426614174000
area: Q4 Planning
title: Prepare Q4 presentation
businessImpact: high
urgency: urgent
quadrant: DO
status: active
dueDate: 2025-11-20T23:59:59.000Z
createdAt: 2025-11-16T08:00:00.000Z
mindMapId: 789e4567-e89b-12d3-a456-426614174999
---

Leadership expectations for Friday. Needs financial projections and roadmap slides.

**Context**: CFO specifically asked for market share data and competitor analysis.
```

---

### 3. Quadrant (Enumeration)

**Description**: Represents one of the four Eisenhower Matrix categories.

**Values**:
```typescript
enum Quadrant {
  DO = 'DO',                    // Urgent + High Impact
  PLAN = 'PLAN',                // Not Urgent + High Impact
  DELEGATE = 'DELEGATE',        // Urgent + Low Impact
  ELIMINATE = 'ELIMINATE'       // Not Urgent + Low Impact
}

interface QuadrantDefinition {
  key: Quadrant;
  label: string;
  description: string;
  urgency: 'urgent' | 'not-urgent';
  businessImpact: 'high' | 'low';
  color: string;                // UI color theme
}
```

**Quadrant Definitions**:
| Quadrant | Label | Urgency | Impact | Description | Color |
|----------|-------|---------|--------|-------------|-------|
| DO | Do First | Urgent | High | Critical tasks requiring immediate attention | Red (#ef4444) |
| PLAN | Schedule | Not Urgent | High | Important strategic work to schedule | Blue (#3b82f6) |
| DELEGATE | Delegate | Urgent | Low | Time-sensitive but low-value tasks | Yellow (#f59e0b) |
| ELIMINATE | Eliminate | Not Urgent | Low | Low-priority distractions to minimize | Gray (#6b7280) |

**Validation Rules**:
- Quadrant values MUST be one of: `DO`, `PLAN`, `DELEGATE`, `ELIMINATE`
- Quadrant CANNOT be custom-defined (fixed Eisenhower Matrix)

---

### 4. Braindump

**Description**: Represents raw free-form text input from user containing multiple potential tasks.

**Fields**:
```typescript
interface Braindump {
  id: string;                    // UUID
  rawText: string;               // User's original braindump text
  submittedAt: Date;             // Submission timestamp
  processedAt?: Date;            // When AI processing completed
  extractedTasks: Task[];        // Tasks extracted by AI
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;         // Error details if status === 'failed'
}
```

**Validation Rules**:
- `rawText` MUST NOT be empty
- `rawText` length SHOULD be 1-50,000 characters (warn if exceeds, chunk if needed)
- `extractedTasks` MUST be empty if `processingStatus !== 'completed'`
- `processedAt` MUST be set if `processingStatus === 'completed'`

**State Transitions**:
```
Created (pending) → Processing → Completed
                             ↓
                          Failed
```

**Storage Format**:
Braindumps are ephemeral (not persisted after processing). Only extracted tasks are saved to task files.

---

### 5. Mind Map

**Description**: Represents a visual brainstorming session for a specific task.

**Fields**:
```typescript
interface MindMap {
  id: string;                    // UUID
  taskId: string;                // Associated task ID
  title: string;                 // Mind map title (usually task title)
  nodes: MindMapNode[];          // Hierarchical nodes
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}

interface MindMapNode {
  id: string;                    // UUID
  text: string;                  // Node content
  parentId?: string;             // Parent node ID (null for root)
  children?: string[];           // Child node IDs
  linkedTaskId?: string;         // Optional link to another task
  level: number;                 // Depth in hierarchy (0 = root)
}
```

**Validation Rules**:
- `nodes` MUST contain exactly one root node (where `parentId === null`)
- Each node's `parentId` MUST reference an existing node (except root)
- `level` MUST be calculated from tree depth (0 for root, +1 for each level)
- Circular references MUST NOT exist (child cannot be ancestor of parent)

**Relationships**:
- Belongs to one `Task` (via `taskId`)
- May link to other `Task`s (via `MindMapNode.linkedTaskId`)

**Storage Format** (Hierarchical Markdown):
```markdown
# Prepare Q4 Presentation

## Research
- Gather financial data
- Review Q3 results
  - Sales numbers
  - Customer feedback

## Content Creation
- Create slide deck
  - Title slide
  - Financial overview
  - Roadmap

## Related Tasks
- Review team's code [[123e4567-e89b-12d3-a456-426614174001]]
```

File location: `data/{profile}/mind-maps/{taskId}.md`

---

## Entity Relationships

```
UserProfile (1) ──< (many) Task
     │
     └──< (many) MindMap

Task (1) ──< (0..1) MindMap
  │
  └──< (many) Task (via markdown links in description or mind map)

Braindump (ephemeral) ──> (many) Task (creates)
```

---

## Data Storage Structure

```
data/
├── profiles.json              # All user profiles metadata
├── {profile-name}/            # Per-profile data folder
│   ├── tasks.md               # Active tasks (all quadrants)
│   ├── archive.md             # Completed tasks
│   └── mind-maps/             # Mind map files
│       ├── {task-id-1}.md
│       ├── {task-id-2}.md
│       └── ...
```

---

## Validation Summary

### Cross-Entity Rules
1. **Profile Name Uniqueness**: No two profiles can have the same name
2. **Task-MindMap Integrity**: If `task.mindMapId` is set, corresponding mind map file MUST exist
3. **Quadrant Consistency**: `task.quadrant` MUST always match the combination of `task.urgency` and `task.businessImpact`
4. **Completion Invariant**: `task.completedAt` MUST be set if and only if `task.status === 'completed'`
5. **Mind Map Tree Integrity**: Mind map nodes MUST form a valid tree (single root, no cycles)

### File System Rules
1. **Profile Folders**: Each profile MUST have a dedicated folder at `data/{profile-name}/`
2. **Task Files**: Active tasks in `tasks.md`, completed tasks in `archive.md`
3. **Mind Map Files**: Named by task ID: `mind-maps/{task.id}.md`
4. **Atomic Writes**: File updates MUST be atomic (write to temp file, then rename)

---

## Data Migration Considerations

**V1 → V2** (if schema changes):
- Add migration scripts in `src/services/storage/migrations/`
- Version tracking in `profiles.json`: `{ version: "1.0.0", ... }`
- Automatic migration on app load if version mismatch detected
- Backup original files before migration

**Export/Import**:
- Export profile: ZIP entire `data/{profile-name}/` folder
- Import profile: Unzip and validate all files against schema
- Provide clear error messages for corrupt or incompatible data
