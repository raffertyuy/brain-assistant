# Service Contracts: Productivity Brain Assistant

**Date**: 2025-11-16  
**Purpose**: Define internal service interfaces for client-side application

**Note**: This is a local-first application without HTTP APIs. These contracts define TypeScript service interfaces for business logic layer.

---

## Profile Management Service

### Interface Definition

```typescript
/**
 * Service for managing user profiles
 */
interface IProfileService {
  /**
   * Get all available user profiles
   * @returns Promise resolving to array of user profiles
   */
  getAllProfiles(): Promise<UserProfile[]>;
  
  /**
   * Create a new user profile
   * @param name - Profile name (must be unique)
   * @returns Promise resolving to created profile
   * @throws {ProfileValidationError} if name is invalid or already exists
   */
  createProfile(name: string): Promise<UserProfile>;
  
  /**
   * Get a specific profile by ID
   * @param id - Profile UUID
   * @returns Promise resolving to profile or null if not found
   */
  getProfileById(id: string): Promise<UserProfile | null>;
  
  /**
   * Switch active profile
   * @param id - Profile UUID to switch to
   * @returns Promise resolving when profile is loaded
   * @throws {ProfileNotFoundError} if profile doesn't exist
   */
  switchProfile(id: string): Promise<void>;
  
  /**
   * Get currently active profile
   * @returns Currently selected profile or null if none selected
   */
  getCurrentProfile(): UserProfile | null;
  
  /**
   * Update profile last accessed timestamp
   * @param id - Profile UUID
   * @returns Promise resolving when updated
   */
  updateLastAccessed(id: string): Promise<void>;
}
```

### Error Types

```typescript
class ProfileValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ProfileValidationError';
  }
}

class ProfileNotFoundError extends Error {
  constructor(public profileId: string) {
    super(`Profile not found: ${profileId}`);
    this.name = 'ProfileNotFoundError';
  }
}
```

---

## Task Management Service

### Interface Definition

```typescript
/**
 * Service for managing tasks within a profile
 */
interface ITaskService {
  /**
   * Get all active tasks for current profile
   * @returns Promise resolving to array of active tasks
   */
  getAllTasks(): Promise<Task[]>;
  
  /**
   * Get tasks by quadrant
   * @param quadrant - Quadrant to filter by
   * @returns Promise resolving to tasks in specified quadrant
   */
  getTasksByQuadrant(quadrant: Quadrant): Promise<Task[]>;
  
  /**
   * Create a new task
   * @param taskData - Partial task data (ID and timestamps auto-generated)
   * @returns Promise resolving to created task
   * @throws {TaskValidationError} if task data is invalid
   */
  createTask(taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task>;
  
  /**
   * Update existing task
   * @param id - Task UUID
   * @param updates - Partial task data to update
   * @returns Promise resolving to updated task
   * @throws {TaskNotFoundError} if task doesn't exist
   * @throws {TaskValidationError} if updates are invalid
   */
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  
  /**
   * Move task to different quadrant
   * @param id - Task UUID
   * @param targetQuadrant - New quadrant
   * @returns Promise resolving to updated task
   * @throws {TaskNotFoundError} if task doesn't exist
   */
  moveToQuadrant(id: string, targetQuadrant: Quadrant): Promise<Task>;
  
  /**
   * Mark task as completed
   * @param id - Task UUID
   * @returns Promise resolving to completed task
   * @throws {TaskNotFoundError} if task doesn't exist
   */
  completeTask(id: string): Promise<Task>;
  
  /**
   * Get archived (completed) tasks
   * @param filters - Optional filters (by area, date range, etc.)
   * @returns Promise resolving to archived tasks
   */
  getArchivedTasks(filters?: ArchiveFilters): Promise<Task[]>;
  
  /**
   * Search tasks (active and archived)
   * @param query - Search query string
   * @returns Promise resolving to matching tasks
   */
  searchTasks(query: string): Promise<Task[]>;
  
  /**
   * Detect if task is duplicate of existing task
   * @param taskData - Task data to check
   * @returns Promise resolving to potential duplicate or null
   */
  findDuplicate(taskData: Partial<Task>): Promise<Task | null>;
  
  /**
   * Merge duplicate task into existing task
   * @param existingId - Existing task ID
   * @param duplicateData - Duplicate task data to merge
   * @returns Promise resolving to merged task
   */
  mergeDuplicate(existingId: string, duplicateData: Partial<Task>): Promise<Task>;
}

interface ArchiveFilters {
  area?: string;
  startDate?: Date;
  endDate?: Date;
}
```

### Error Types

```typescript
class TaskValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

class TaskNotFoundError extends Error {
  constructor(public taskId: string) {
    super(`Task not found: ${taskId}`);
    this.name = 'TaskNotFoundError';
  }
}
```

---

## AI Service

### Interface Definition

```typescript
/**
 * Service for AI-powered features (task extraction, brainstorming)
 */
interface IAIService {
  /**
   * Extract tasks from braindump text
   * @param rawText - Free-form braindump text
   * @param existingTasks - Current tasks for duplicate detection
   * @returns Promise resolving to extracted tasks with metadata
   * @throws {AIServiceError} if API call fails
   */
  extractTasksFromBraindump(
    rawText: string,
    existingTasks: Task[]
  ): Promise<ExtractedTasksResult>;
  
  /**
   * Categorize task into quadrant based on content
   * @param taskData - Task data to analyze
   * @returns Promise resolving to suggested quadrant
   */
  categorizeTask(taskData: Partial<Task>): Promise<Quadrant>;
  
  /**
   * Generate brainstorming suggestions for task
   * @param task - Task to brainstorm about
   * @returns Promise resolving to AI suggestions
   */
  generateBrainstormSuggestions(task: Task): Promise<BrainstormSuggestion[]>;
  
  /**
   * Ask AI to challenge complexity and suggest simplifications
   * @param mindMapContent - Current mind map content
   * @returns Promise resolving to simplification suggestions
   */
  suggestSimplifications(mindMapContent: string): Promise<string[]>;
  
  /**
   * Get AI to ask probing questions about approach
   * @param task - Task being brainstormed
   * @param context - Current brainstorming context
   * @returns Promise resolving to AI-generated questions
   */
  generateProbingQuestions(task: Task, context: string): Promise<string[]>;
}

interface ExtractedTasksResult {
  tasks: Partial<Task>[];        // Extracted tasks
  duplicates: DuplicateMatch[];  // Potential duplicates found
  clarifications: string[];      // Fields needing user clarification
}

interface DuplicateMatch {
  extractedTask: Partial<Task>;
  existingTask: Task;
  confidence: number;            // 0-1 similarity score
}

interface BrainstormSuggestion {
  id: string;
  text: string;
  type: 'approach' | 'consideration' | 'question' | 'simplification';
}
```

### Error Types

```typescript
class AIServiceError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AIServiceError';
  }
}
```

---

## Storage Service

### Interface Definition

```typescript
/**
 * Service for file system operations
 */
interface IStorageService {
  /**
   * Initialize storage (request directory access if needed)
   * @returns Promise resolving when storage is ready
   * @throws {StorageAccessError} if user denies access
   */
  initialize(): Promise<void>;
  
  /**
   * Check if storage is initialized
   * @returns True if storage is ready to use
   */
  isInitialized(): boolean;
  
  /**
   * Read tasks file for current profile
   * @returns Promise resolving to raw markdown content
   * @throws {FileNotFoundError} if file doesn't exist
   */
  readTasksFile(): Promise<string>;
  
  /**
   * Write tasks file for current profile
   * @param content - Markdown content to write
   * @returns Promise resolving when write completes
   * @throws {StorageWriteError} if write fails
   */
  writeTasksFile(content: string): Promise<void>;
  
  /**
   * Read archive file for current profile
   * @returns Promise resolving to raw markdown content
   */
  readArchiveFile(): Promise<string>;
  
  /**
   * Write archive file for current profile
   * @param content - Markdown content to write
   * @returns Promise resolving when write completes
   */
  writeArchiveFile(content: string): Promise<void>;
  
  /**
   * Read mind map file
   * @param taskId - Task ID (used as filename)
   * @returns Promise resolving to markdown content
   * @throws {FileNotFoundError} if mind map doesn't exist
   */
  readMindMapFile(taskId: string): Promise<string>;
  
  /**
   * Write mind map file
   * @param taskId - Task ID (used as filename)
   * @param content - Markdown content to write
   * @returns Promise resolving when write completes
   */
  writeMindMapFile(taskId: string, content: string): Promise<void>;
  
  /**
   * Read profiles configuration
   * @returns Promise resolving to profiles metadata
   */
  readProfilesConfig(): Promise<ProfilesConfig>;
  
  /**
   * Write profiles configuration
   * @param config - Profiles metadata to write
   * @returns Promise resolving when write completes
   */
  writeProfilesConfig(config: ProfilesConfig): Promise<void>;
  
  /**
   * Create profile folder
   * @param profileName - Profile name (used for folder name)
   * @returns Promise resolving when folder is created
   */
  createProfileFolder(profileName: string): Promise<void>;
}

interface ProfilesConfig {
  version: string;               // Schema version for migrations
  profiles: UserProfile[];
  lastSelectedProfileId?: string;
}
```

### Error Types

```typescript
class StorageAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageAccessError';
  }
}

class FileNotFoundError extends Error {
  constructor(public filePath: string) {
    super(`File not found: ${filePath}`);
    this.name = 'FileNotFoundError';
  }
}

class StorageWriteError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'StorageWriteError';
  }
}
```

---

## Mind Map Service

### Interface Definition

```typescript
/**
 * Service for managing mind maps
 */
interface IMindMapService {
  /**
   * Create mind map for task
   * @param taskId - Task to create mind map for
   * @returns Promise resolving to created mind map
   */
  createMindMap(taskId: string): Promise<MindMap>;
  
  /**
   * Get mind map for task
   * @param taskId - Task ID
   * @returns Promise resolving to mind map or null if none exists
   */
  getMindMap(taskId: string): Promise<MindMap | null>;
  
  /**
   * Add node to mind map
   * @param mindMapId - Mind map ID
   * @param nodeData - Node data
   * @returns Promise resolving to updated mind map
   */
  addNode(mindMapId: string, nodeData: Omit<MindMapNode, 'id'>): Promise<MindMap>;
  
  /**
   * Update node in mind map
   * @param mindMapId - Mind map ID
   * @param nodeId - Node ID to update
   * @param updates - Partial node data
   * @returns Promise resolving to updated mind map
   */
  updateNode(mindMapId: string, nodeId: string, updates: Partial<MindMapNode>): Promise<MindMap>;
  
  /**
   * Delete node from mind map
   * @param mindMapId - Mind map ID
   * @param nodeId - Node ID to delete
   * @returns Promise resolving to updated mind map
   */
  deleteNode(mindMapId: string, nodeId: string): Promise<MindMap>;
  
  /**
   * Convert mind map to markdown format
   * @param mindMap - Mind map to convert
   * @returns Markdown string representation
   */
  toMarkdown(mindMap: MindMap): string;
  
  /**
   * Parse markdown to mind map structure
   * @param markdown - Markdown content
   * @param taskId - Associated task ID
   * @returns Parsed mind map
   */
  fromMarkdown(markdown: string, taskId: string): MindMap;
}
```

---

## Date Parsing Service

### Interface Definition

```typescript
/**
 * Service for parsing natural language dates
 */
interface IDateParserService {
  /**
   * Parse natural language date string
   * @param text - Natural language text (e.g., "tomorrow", "next Friday")
   * @returns Parsed date or null if unparseable
   */
  parse(text: string): Date | null;
  
  /**
   * Format date for display
   * @param date - Date to format
   * @param format - Format style ('short' | 'long' | 'relative')
   * @returns Formatted date string
   */
  format(date: Date, format: 'short' | 'long' | 'relative'): string;
  
  /**
   * Check if date is overdue
   * @param date - Date to check
   * @returns True if date is in the past
   */
  isOverdue(date: Date): boolean;
  
  /**
   * Check if date is urgent (within next 24-48 hours)
   * @param date - Date to check
   * @returns True if date is within urgency threshold
   */
  isUrgent(date: Date): boolean;
}
```

---

## Service Dependencies

```
ProfileService
  └─> StorageService

TaskService
  ├─> StorageService
  ├─> DateParserService
  └─> AIService (for duplicate detection)

AIService
  └─> (External OpenAI API)

MindMapService
  ├─> StorageService
  └─> TaskService (for task lookups)

StorageService
  └─> (Browser File System API or IndexedDB)

DateParserService
  └─> (chrono-node library)
```

---

## Usage Examples

### Profile Management

```typescript
// Create and switch to new profile
const profileService = new ProfileService(storageService);
const workProfile = await profileService.createProfile('Work');
await profileService.switchProfile(workProfile.id);
```

### Task Creation from Braindump

```typescript
// Extract tasks from braindump
const aiService = new AIService(apiKey);
const taskService = new TaskService(storageService, aiService, dateParser);

const existingTasks = await taskService.getAllTasks();
const result = await aiService.extractTasksFromBraindump(braindumpText, existingTasks);

// Handle duplicates
for (const match of result.duplicates) {
  if (match.confidence > 0.8) {
    await taskService.mergeDuplicate(match.existingTask.id, match.extractedTask);
  } else {
    // Prompt user for confirmation
  }
}

// Create new tasks
for (const taskData of result.tasks) {
  await taskService.createTask(taskData);
}
```

### Mind Map Creation

```typescript
// Create mind map for task
const mindMapService = new MindMapService(storageService, taskService);
const mindMap = await mindMapService.createMindMap(task.id);

// Add nodes
await mindMapService.addNode(mindMap.id, {
  text: 'Research phase',
  parentId: null,
  level: 0
});
```

---

## Testing Contracts

All services MUST have corresponding unit tests covering:
- Success cases for all methods
- Error handling for validation errors
- Edge cases (empty inputs, missing data, etc.)
- Integration tests for service interactions

Minimum test coverage: 80% per constitution.
