# Tasks: Productivity Brain Assistant

**Input**: Design documents from `/specs/001-productivity-brain-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/service-interfaces.md

**Tests**: This implementation focuses on backend service logic testing with Vitest. Frontend testing is manual using Playwright MCP per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a single-page web application:
- Source code: `src/`
- Tests: `tests/`
- Local storage: `data/` (created at runtime, gitignored)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize TypeScript project with Vite, React 18, and TypeScript 5 dependencies
- [X] T002 [P] Configure ESLint and Prettier for code quality in .eslintrc.cjs and .prettierrc
- [X] T003 [P] Configure Vitest testing framework in vite.config.ts
- [X] T004 [P] Setup project folder structure: src/{components,services,models,utils}, tests/{unit,integration}
- [X] T005 [P] Create TypeScript type definitions in src/models/Task.ts, src/models/Profile.ts, src/models/MindMap.ts, src/models/Quadrant.ts
- [X] T006 [P] Install core dependencies: gray-matter, chrono-node, react-dnd, d3-force
- [X] T007 [P] Setup CSS variables and global styles in src/styles/variables.css
- [X] T008 Create .gitignore to exclude data/ folder and node_modules

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Implement StorageService interface in src/services/storage/StorageService.ts with File System Access API support
- [X] T010 [P] Implement IndexedDB fallback storage in src/services/storage/IndexedDBStorage.ts for non-Chrome browsers
- [X] T011 [P] Implement DateParserService in src/services/utils/DateParserService.ts using chrono-node
- [X] T012 [P] Create storage error classes in src/services/storage/errors.ts (StorageAccessError, FileNotFoundError, StorageWriteError)
- [X] T013 Implement markdown parser utility in src/utils/markdown.ts using gray-matter for YAML frontmatter
- [X] T014 [P] Setup test mocks in tests/mocks/storage.ts for StorageService
- [X] T015 [P] Setup test fixtures in tests/fixtures/tasks.ts and tests/fixtures/profiles.ts
- [X] T016 Write unit tests for StorageService in tests/unit/services/storage.test.ts
- [X] T017 [P] Write unit tests for DateParserService in tests/unit/services/date-parser.test.ts
- [X] T018 [P] Write unit tests for markdown utilities in tests/unit/utils/markdown.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - Multi-Profile Local Data Management (Priority: P1) 🎯 MVP Foundation

**Goal**: Enable users to create and switch between multiple profiles with isolated local storage

**Independent Test**: User can create "Work" profile, add tasks, create "Personal" profile, switch between profiles, and verify each shows only its own tasks

**Why P1 First**: This is foundational infrastructure - entry point to all other functionality. Without profiles, local storage architecture cannot work.

### Implementation for User Story 2

- [X] T019 [P] [US2] Implement ProfileService interface in src/services/profile-manager/ProfileService.ts
- [X] T020 [P] [US2] Create profile validation utilities in src/utils/validation.ts (name uniqueness, invalid characters)
- [X] T021 [US2] Implement profile CRUD operations (getAllProfiles, createProfile, getProfileById, switchProfile) in ProfileService
- [X] T022 [P] [US2] Create profile error classes in src/services/profile-manager/errors.ts (ProfileValidationError, ProfileNotFoundError)
- [X] T023 [US2] Implement profile folder creation logic in ProfileService using StorageService
- [X] T024 [US2] Implement profiles.json read/write with schema version in ProfileService
- [X] T025 [P] [US2] Write unit tests for ProfileService in tests/unit/services/profile-service.test.ts
- [X] T026 [P] [US2] Write integration tests for profile lifecycle in tests/integration/profile-workflow.test.ts
- [X] T027 [US2] Create ProfileSelector component in src/components/profile/ProfileSelector.tsx
- [X] T028 [P] [US2] Create ProfileSelector styles in src/components/profile/ProfileSelector.module.css
- [X] T029 [US2] Create AddProfileDialog component in src/components/profile/AddProfileDialog.tsx
- [X] T030 [US2] Integrate ProfileSelector into App.tsx with profile switching logic
- [X] T031 [US2] Create ProfileContext provider in src/utils/ProfileContext.tsx for managing active profile state

**Checkpoint**: Profile management fully functional - users can create and switch profiles with isolated data

---

## Phase 4: User Story 1 - Quick Task Capture and AI-Powered Organization (Priority: P1) 🎯 MVP Core Feature

**Goal**: Transform mental clutter into organized tasks automatically categorized by Eisenhower Matrix

**Independent Test**: User enters braindump text with 4 tasks, submits, receives structured tasks in correct quadrants, detects duplicates when re-entering similar tasks

**Why This Priority**: Core value proposition - without this, the app has no unique value over traditional task managers

### Implementation for User Story 1

- [X] T032 [P] [US1] Implement AIService interface in src/services/ai/AIService.ts with OpenAI client integration
- [X] T033 [P] [US1] Create AI prompt templates for task extraction in src/services/ai/prompts.ts
- [X] T034 [US1] Implement extractTasksFromBraindump method with JSON mode response parsing in AIService
- [X] T035 [US1] Implement categorizeTask method for quadrant assignment based on urgency/impact in AIService
- [X] T036 [P] [US1] Create AI error classes in src/services/ai/errors.ts (AIServiceError)
- [X] T037 [US1] Implement duplicate detection logic in AIService using similarity scoring
- [X] T038 [P] [US1] Write unit tests for AIService in tests/unit/services/ai-service.test.ts (mocked API calls)
- [X] T039 [P] [US1] Implement TaskService interface in src/services/task-manager/TaskService.ts
- [X] T040 [US1] Implement task CRUD operations (createTask, updateTask, getAllTasks, getTasksByQuadrant) in TaskService
- [X] T041 [US1] Implement task quadrant calculation logic in TaskService based on urgency + businessImpact
- [X] T042 [US1] Implement duplicate merging (mergeDuplicate) in TaskService
- [X] T043 [US1] Implement task completion (completeTask) with archive logic in TaskService
- [X] T044 [P] [US1] Create task error classes in src/services/task-manager/errors.ts (TaskValidationError, TaskNotFoundError)
- [X] T045 [US1] Implement task-to-markdown serialization in TaskService using gray-matter
- [X] T046 [US1] Implement markdown-to-task deserialization in TaskService with YAML frontmatter parsing
- [X] T047 [P] [US1] Write unit tests for TaskService in tests/unit/services/task-service.test.ts
- [X] T048 [P] [US1] Write integration tests for braindump workflow in tests/integration/braindump-workflow.test.ts
- [X] T049 [US1] Create BraindumpInput component in src/components/braindump/BraindumpInput.tsx with distraction-free textarea
- [X] T050 [P] [US1] Create BraindumpInput styles in src/components/braindump/BraindumpInput.module.css
- [X] T051 [US1] Create TaskReview component in src/components/braindump/TaskReview.tsx to show extracted tasks
- [X] T052 [P] [US1] Create TaskReview styles in src/components/braindump/TaskReview.module.css
- [X] T053 [US1] Create DuplicateDialog component in src/components/braindump/DuplicateDialog.tsx for merge confirmations
- [X] T054 [US1] Implement braindump submission flow: extract → review → confirm → create tasks
- [X] T055 [US1] Add loading states and error handling for AI processing in BraindumpInput
- [X] T056 [US1] Create APIKeyConfig component in src/components/shared/APIKeyConfig.tsx for user to enter OpenAI key
- [X] T057 [US1] Store API key in localStorage with security warnings in APIKeyConfig
- [X] T058 [US1] Integrate braindump mode into App.tsx with mode switching (braindump ↔ task board)

**Checkpoint**: Users can braindump thoughts, get AI-organized tasks with duplicate detection - MVP core feature complete

---

## Phase 5: User Story 3 - Visual Quadrant-Based Task Management (Priority: P2)

**Goal**: Provide visual 4-quadrant layout with drag-and-drop task reorganization

**Independent Test**: User views tasks in 4 quadrants, drags task from PLAN to DO, sees updated urgency, edits task details, marks complete, finds in archive

**Why This Priority**: Visual interface for Eisenhower Matrix - enhances P1 features but users could manage with simpler list view

### Implementation for User Story 3

- [X] T059 [P] [US3] Create Quadrant component in src/components/task-board/Quadrant.tsx with drop zone
- [X] T060 [P] [US3] Create Quadrant styles in src/components/task-board/Quadrant.module.css with quadrant colors
- [X] T061 [P] [US3] Create TaskCard component in src/components/task-board/TaskCard.tsx with drag handle
- [X] T062 [P] [US3] Create TaskCard styles in src/components/task-board/TaskCard.module.css
- [X] T063 [US3] Create TaskBoard component in src/components/task-board/TaskBoard.tsx with 4-quadrant grid layout
- [X] T064 [P] [US3] Create TaskBoard styles in src/components/task-board/TaskBoard.module.css
- [X] T065 [US3] Integrate react-dnd with HTML5Backend in TaskBoard component
- [X] T066 [US3] Implement useDrag hook in TaskCard for dragging tasks
- [X] T067 [US3] Implement useDrop hook in Quadrant for accepting dropped tasks
- [X] T068 [US3] Implement moveToQuadrant logic to update task urgency/impact when dropped
- [X] T069 [P] [US3] Create TaskEditDialog component in src/components/task-board/TaskEditDialog.tsx
- [X] T070 [P] [US3] Create TaskEditDialog styles in src/components/task-board/TaskEditDialog.module.css
- [X] T071 [US3] Implement task detail editing (title, description, area, dueDate, businessImpact) in TaskEditDialog
- [X] T072 [US3] Add task completion checkbox in TaskCard with completeTask action
- [X] T073 [US3] Implement archive logic: move completed tasks to archive.md organized by area
- [X] T074 [P] [US3] Create ArchivedTasks component in src/components/task-board/ArchivedTasks.tsx
- [X] T075 [P] [US3] Create SearchBar component in src/components/shared/SearchBar.tsx for archived task search
- [X] T076 [US3] Implement getArchivedTasks and searchTasks methods in TaskService
- [X] T077 [P] [US3] Write unit tests for drag-and-drop quadrant updates in tests/unit/services/task-service.test.ts
- [X] T078 [US3] Integrate TaskBoard into App.tsx with task management mode

**Checkpoint**: Visual 4-quadrant task management with drag-and-drop and archiving fully functional

---

## Phase 6: User Story 4 - Task-Focused Brainstorming and Mind Mapping (Priority: P3)

**Goal**: Enable visual mind mapping for complex task breakdown

**Independent Test**: User selects task, enters brainstorm mode, creates mind map with nodes/connections, saves, returns to task board with persisted mind map

**Why This Priority**: Power-user feature - enhances task completion quality but app delivers core value without it

### Implementation for User Story 4

- [X] T079 [P] [US4] Implement MindMapService interface in src/services/mind-map/MindMapService.ts
- [X] T080 [US4] Implement createMindMap, getMindMap, addNode, updateNode, deleteNode in MindMapService
- [X] T081 [US4] Implement toMarkdown method to convert mind map to hierarchical markdown in MindMapService
- [X] T082 [US4] Implement fromMarkdown method to parse markdown into mind map structure in MindMapService
- [X] T083 [P] [US4] Write unit tests for MindMapService in tests/unit/services/mind-map-service.test.ts
- [X] T084 [P] [US4] Create markdown-to-tree parser utility in src/utils/markdown-tree.ts
- [X] T085 [P] [US4] Create MindMapCanvas component in src/components/mind-map/MindMapCanvas.tsx with SVG rendering
- [X] T086 [P] [US4] Create MindMapCanvas styles in src/components/mind-map/MindMapCanvas.module.css
- [X] T087 [US4] Integrate D3-force simulation for node layout in MindMapCanvas (selective import)
- [X] T088 [US4] Implement node rendering with circles and text labels in MindMapCanvas
- [X] T089 [US4] Implement link/edge rendering between nodes in MindMapCanvas
- [X] T090 [P] [US4] Create NodeEditor component in src/components/mind-map/NodeEditor.tsx for adding/editing nodes
- [X] T091 [P] [US4] Create NodeEditor styles in src/components/mind-map/NodeEditor.module.css
- [X] T092 [US4] Implement add child node functionality in MindMapCanvas
- [X] T093 [US4] Implement delete node functionality in MindMapCanvas
- [X] T094 [US4] Implement task linking: create clickable links to other tasks in mind map
- [X] T095 [US4] Add save button to persist mind map as markdown file in data/{profile}/mind-maps/{taskId}.md
- [X] T096 [US4] Add load logic to retrieve saved mind map when entering brainstorm mode
- [X] T097 [US4] Create BrainstormMode component in src/components/mind-map/BrainstormMode.tsx with task context
- [X] T098 [US4] Integrate brainstorm mode into task flow: click task → "Brainstorm" button → BrainstormMode
- [X] T099 [P] [US4] Write integration tests for mind map lifecycle in tests/integration/mind-map-workflow.test.ts

**Checkpoint**: Mind mapping feature complete - users can visually brainstorm task approaches

---

## Phase 7: User Story 5 - AI-Assisted Brainstorming (Priority: P3)

**Goal**: Leverage AI to enhance brainstorming with suggestions and simplifications

**Independent Test**: User in brainstorm mode requests AI suggestions, receives 3-5 ideas, AI asks probing questions, user modifies suggestion and gets refined alternatives

**Why This Priority**: Enhancement to brainstorming - requires P3 (User Story 4) to exist first

### Implementation for User Story 5

- [X] T100 [P] [US5] Implement generateBrainstormSuggestions method in AIService
- [X] T101 [P] [US5] Implement suggestSimplifications method in AIService to detect overcomplicated plans
- [X] T102 [P] [US5] Implement generateProbingQuestions method in AIService to challenge assumptions
- [X] T103 [P] [US5] Create AI prompt templates for brainstorming in src/services/ai/brainstorm-prompts.ts
- [X] T104 [P] [US5] Write unit tests for AI brainstorming methods in tests/unit/services/ai-service.test.ts
- [X] T105 [P] [US5] Create AISuggestionsPanel component in src/components/mind-map/AISuggestionsPanel.tsx
- [X] T106 [P] [US5] Create AISuggestionsPanel styles in src/components/mind-map/AISuggestionsPanel.module.css
- [X] T107 [US5] Implement "AI Suggestions" button in BrainstormMode to trigger generateBrainstormSuggestions
- [X] T108 [US5] Display AI suggestions as cards in AISuggestionsPanel with types (approach, consideration, question, simplification)
- [X] T109 [US5] Implement suggestion modification: user edits suggestion → request refined alternatives from AI
- [X] T110 [US5] Implement probing questions display with interactive feedback loop
- [X] T111 [US5] Add simplification detection: AI analyzes mind map complexity and suggests simpler approaches
- [X] T112 [US5] Add loading states and error handling for AI brainstorming operations
- [X] T113 [P] [US5] Write integration tests for AI-assisted brainstorming in tests/integration/ai-brainstorm-workflow.test.ts

**Checkpoint**: AI-assisted brainstorming complete - enhances user's creative process with intelligent suggestions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T114 [P] Add responsive design breakpoints for mobile/tablet in CSS modules
- [X] T115 [P] Implement WCAG 2.1 Level AA compliance: keyboard navigation, ARIA labels, focus management
- [X] T116 [P] Add error boundaries in src/components/shared/ErrorBoundary.tsx for graceful error handling
- [X] T117 [P] Create user-friendly error messages for all error types across services
- [X] T118 [P] Add loading spinners and progress indicators in src/components/shared/LoadingSpinner.tsx
- [X] T119 [P] Optimize bundle size: analyze with vite-bundle-visualizer, code-split routes
- [X] T120 [P] Add performance monitoring: measure page load, TTI, drag-and-drop fps
- [X] T121 [P] Create quickstart validation script to test all user scenarios from quickstart.md
- [X] T122 [P] Add JSDoc comments to all service methods per constitution
- [X] T123 [P] Generate API documentation from JSDoc comments
- [X] T124 [P] Update README.md with setup instructions and feature overview
- [X] T125 Run full test suite and ensure >80% coverage per constitution
- [ ] T126 Manual testing with Playwright MCP: test all user stories across browsers and viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 2 - Profiles (Phase 3)**: Depends on Foundational - must complete before User Story 1 (provides storage infrastructure)
- **User Story 1 - Braindump/AI (Phase 4)**: Depends on Profiles (Phase 3) - needs profile context for task storage
- **User Story 3 - Task Board (Phase 5)**: Depends on User Story 1 (Phase 4) - needs tasks to display
- **User Story 4 - Mind Maps (Phase 6)**: Depends on User Story 3 (Phase 5) - needs task board to launch from
- **User Story 5 - AI Brainstorm (Phase 7)**: Depends on User Story 4 (Phase 6) - enhances mind mapping
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 2 (P1 - Profiles)**: FOUNDATIONAL - No dependencies on other stories, but blocks all others
- **User Story 1 (P1 - Braindump/AI)**: Depends on US2 (needs profile context)
- **User Story 3 (P2 - Task Board)**: Depends on US1 (needs tasks to manage)
- **User Story 4 (P3 - Mind Maps)**: Depends on US3 (launches from task board)
- **User Story 5 (P3 - AI Brainstorm)**: Depends on US4 (enhances mind mapping)

### Within Each User Story

- Implementation before integration
- Services before UI components
- Components before styles (can be parallel if different developers)
- Core functionality before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T002, T003, T004, T005, T006, T007 can run in parallel
- **Foundational Phase**: T010, T011, T012, T014, T015 can run in parallel after T009; T016, T017, T018 can run in parallel
- **Within User Stories**: Tasks marked [P] within same story can run in parallel
- **Cross-Story (if team capacity)**: After US2 completes, US1 can start; after US1 completes, US3 can start in parallel with starting US4 prep
- **Polish Phase**: Most tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# These tests can run together:
T038: "Write unit tests for AIService in tests/unit/services/ai-service.test.ts"
T047: "Write unit tests for TaskService in tests/unit/services/task-service.test.ts"
T048: "Write integration tests for braindump workflow in tests/integration/braindump-workflow.test.ts"

# These implementations can run together:
T032: "Implement AIService interface in src/services/ai/AIService.ts"
T033: "Create AI prompt templates in src/services/ai/prompts.ts"
T036: "Create AI error classes in src/services/ai/errors.ts"

# These UI components can run together:
T049: "Create BraindumpInput component in src/components/braindump/BraindumpInput.tsx"
T050: "Create BraindumpInput styles in src/components/braindump/BraindumpInput.module.css"
T051: "Create TaskReview component in src/components/braindump/TaskReview.tsx"
T052: "Create TaskReview styles in src/components/braindump/TaskReview.module.css"
```

---

## Implementation Strategy

### MVP First (User Stories 2 + 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 2 - Profiles (infrastructure for all features)
4. Complete Phase 4: User Story 1 - Braindump/AI (core value proposition)
5. **STOP and VALIDATE**: Test profile creation + braindump workflow independently
6. Deploy/demo if ready - this is a usable MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 2 (Profiles) → Test independently
3. Add User Story 1 (Braindump/AI) → Test independently → **Deploy/Demo (MVP!)**
4. Add User Story 3 (Task Board) → Test independently → Deploy/Demo
5. Add User Story 4 (Mind Maps) → Test independently → Deploy/Demo
6. Add User Story 5 (AI Brainstorm) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Complete User Story 2 (Profiles) - required by all
3. Once US2 is done:
   - Developer A: User Story 1 (Braindump/AI)
4. Once US1 is done:
   - Developer A: User Story 3 (Task Board)
   - Developer B: Can start US4 prep (mind map components without integration)
5. Once US3 is done:
   - Developer A or B: Complete User Story 4 (Mind Maps)
6. Once US4 is done:
   - Developer A or B: User Story 5 (AI Brainstorm)

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests focus on backend service logic (Vitest); frontend testing is manual (Playwright MCP)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All service methods must have JSDoc comments per constitution
- Target >80% test coverage per constitution
- Browser compatibility: File System Access API (Chrome/Edge) with IndexedDB fallback (Firefox/Safari)

---

## Summary

**Total Tasks**: 126
**MVP Scope**: Phases 1-4 (Tasks T001-T058) = User Stories 2 + 1
**Test Tasks**: T016-T018, T025-T026, T038, T047-T048, T077, T083, T099, T104, T113, T125-T126

### Task Count per User Story

- **Setup (Phase 1)**: 8 tasks
- **Foundational (Phase 2)**: 10 tasks (3 test tasks)
- **User Story 2 - Profiles (P1)**: 13 tasks (2 test tasks)
- **User Story 1 - Braindump/AI (P1)**: 27 tasks (3 test tasks)
- **User Story 3 - Task Board (P2)**: 20 tasks (1 test task)
- **User Story 4 - Mind Maps (P3)**: 21 tasks (1 test task)
- **User Story 5 - AI Brainstorm (P3)**: 14 tasks (2 test tasks)
- **Polish (Phase 8)**: 13 tasks (2 test tasks)

### Parallel Opportunities Identified

- 6 parallel tasks in Setup phase
- 8 parallel tasks in Foundational phase
- 23 parallel tasks across all User Stories (marked with [P])
- 11 parallel tasks in Polish phase
- **Total**: ~48 tasks (38%) can run in parallel within their phase constraints

### Independent Test Criteria

- **User Story 2**: Create 2 profiles, add tasks to each, switch between them, verify data isolation
- **User Story 1**: Braindump 4 tasks, verify extraction and categorization, re-enter similar task to test duplicate detection
- **User Story 3**: View tasks in quadrants, drag task between quadrants, edit details, complete task, find in archive
- **User Story 4**: Select task, create mind map with 10+ nodes, save, exit, re-enter to verify persistence
- **User Story 5**: Request AI suggestions in brainstorm mode, receive ideas/questions, modify suggestion and get refinements

### Suggested MVP Scope

**Phases 1-4** (User Stories 2 + 1):
- Profile management with local storage
- Braindump mode with AI task extraction
- Automatic categorization into Eisenhower Matrix quadrants
- Duplicate detection and merging
- Basic task creation and viewing

This delivers the core value proposition: transforming mental clutter into organized, prioritized tasks.
