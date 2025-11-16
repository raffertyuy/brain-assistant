# Implementation Plan: Productivity Brain Assistant

**Branch**: `001-productivity-brain-assistant` | **Date**: 2025-11-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-productivity-brain-assistant/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a productivity application that transforms mental clutter into organized action using the Eisenhower Matrix, with AI-powered task extraction from braindumps, visual quadrant-based task management, and mind-mapping capabilities for brainstorming. The system uses local file storage (markdown-based) with multi-profile support for separating work/personal contexts.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18.x  
**Primary Dependencies**: Vite (build tool), React, minimal libraries (vanilla HTML/CSS/JS preferred)  
**Storage**: Local file system (markdown, JSON, YAML, or CSV files - no database)  
**Testing**: Vitest + React Testing Library (frontend manual testing with Playwright MCP per constitution)  
**Target Platform**: Desktop/Web application with file system access  
**Project Type**: Web application (single-page application with local file storage)  
**Performance Goals**: Page load < 3s on 3G, time to interactive < 5s, 60fps animations  
**Constraints**: No cloud storage, no database, images stored locally, offline-capable with AI requiring internet  
**Scale/Scope**: Hundreds to low thousands of tasks per profile, single-device usage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Phase 0)

✅ **Code Documentation**: All backend logic methods will include JSDoc comments with purpose, parameters, return values, and examples.

✅ **Backend Testing Standards**: Task extraction, duplicate detection, categorization, and file I/O logic will have automated tests. Using Vitest (aligned with Vite toolchain).

✅ **Frontend Testing Standards**: Manual testing with Playwright MCP per constitution. No automated UI tests required.

✅ **User Experience Consistency**: Responsive design across desktop/tablet/mobile, WCAG 2.1 Level AA compliance, consistent visual language.

✅ **Performance Requirements**: Targets align with constitution: <3s load on 3G, <5s TTI, 60fps animations, local file operations <500ms p95.

**Gate Status**: ✅ ALL GATES PASSED - Proceeded to Phase 0

---

### Post-Design Check (After Phase 1)

✅ **Code Documentation**: Service interfaces defined with comprehensive JSDoc comments in `contracts/service-interfaces.md`. All methods documented with parameters, return types, and error conditions.

✅ **Backend Testing Standards**: 
- Test structure defined in `quickstart.md`
- Unit tests for all services: ProfileService, TaskService, AIService, StorageService, MindMapService
- Integration tests for file I/O workflows
- Test coverage target: >80% per constitution
- Example tests provided in quickstart guide

✅ **Frontend Testing Standards**: Manual testing approach documented with Playwright MCP for exploratory testing across browsers and viewports.

✅ **User Experience Consistency**:
- Responsive design with CSS modules and CSS variables
- Accessibility considered (keyboard navigation with react-dnd, ARIA labels planned)
- Consistent quadrant color scheme defined in data model
- Error handling with user-friendly messages specified in service contracts

✅ **Performance Requirements**:
- Local file storage ensures fast data access (<500ms)
- Minimal dependencies strategy (vanilla CSS, D3-force only, no heavy frameworks)
- Progressive enhancement with File System API fallback
- Bundle size optimization via selective D3 imports
- 60fps animations achievable with CSS transitions and transform-based drag-and-drop

**Gate Status**: ✅ ALL GATES PASSED - Ready for Phase 2 Task Planning

**No Constitution Violations** - Complexity tracking table not needed.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/           # React components
│   ├── braindump/       # Braindump mode UI
│   ├── task-board/      # 4-quadrant task management UI
│   ├── mind-map/        # Brainstorming/mind-mapping UI
│   ├── profile/         # User profile management
│   └── shared/          # Reusable UI components
├── services/            # Business logic (backend-like)
│   ├── ai/              # AI integration (task extraction, brainstorming)
│   ├── storage/         # File system operations
│   ├── task-manager/    # Task CRUD, duplicate detection, categorization
│   └── profile-manager/ # Profile management logic
├── models/              # TypeScript interfaces/types
│   ├── Task.ts
│   ├── Profile.ts
│   ├── MindMap.ts
│   └── Quadrant.ts
├── utils/               # Helper functions
│   ├── date-parser.ts   # Natural language date parsing
│   ├── markdown.ts      # Markdown file operations
│   └── validation.ts    # Input validation
└── App.tsx              # Main application entry

tests/
├── unit/                # Unit tests for services and utils
│   ├── ai/
│   ├── storage/
│   ├── task-manager/
│   └── utils/
└── integration/         # Integration tests for file I/O workflows

data/                    # Local storage root (gitignored)
└── [profile-name]/      # Per-profile folders
    ├── tasks.md         # Active tasks
    ├── archive.md       # Completed tasks
    └── mind-maps/       # Mind map files
```

**Structure Decision**: Web application structure with clear separation between UI (components), business logic (services), and data models. The `data/` folder is created at runtime for local file storage, organized by user profile.

## Complexity Tracking

> **No violations to track** - All constitution gates passed without exceptions.

---

## Phase 2 Summary

**Status**: ✅ Planning Complete (Phases 0-1 Finished)

**Generated Artifacts**:
1. ✅ `research.md` - Technology decisions and rationale
2. ✅ `data-model.md` - Entity definitions, relationships, validation rules
3. ✅ `contracts/service-interfaces.md` - Service interface contracts
4. ✅ `quickstart.md` - Development setup and testing guide
5. ✅ Agent context updated (`.github\agents\copilot-instructions.md`)

**Next Steps** (Not executed by this command):
- Run `/speckit.tasks` to generate Phase 2 task breakdown
- Begin implementation following the defined architecture
- Reference `quickstart.md` for development workflow
- Ensure all tests pass per constitution requirements

**Key Decisions**:
- **Testing**: Vitest for backend unit/integration tests, manual Playwright MCP for UI
- **Storage**: Markdown + YAML frontmatter for tasks, progressive enhancement for file system access
- **AI**: Client-side OpenAI API integration with user-provided keys
- **Styling**: CSS Modules + CSS Variables (no Tailwind/CSS-in-JS per minimal dependencies requirement)
- **State**: React Context + hooks (no Redux/Zustand needed for local-first app)
- **Drag-Drop**: react-dnd with accessibility support
- **Mind Maps**: D3-force layout + vanilla SVG for lightweight visualization

**Technology Stack Finalized**:
```
Frontend:   React 18 + TypeScript 5 + Vite
Testing:    Vitest + React Testing Library
Storage:    File System Access API / IndexedDB
AI:         OpenAI API (client-side)
Parsing:    gray-matter (YAML), chrono-node (dates)
UI:         CSS Modules, react-dnd
Viz:        D3-force (selective import)
```

**Branch**: `001-productivity-brain-assistant`  
**Implementation Plan**: `C:\GitRepos\GH-Public\brain-assistant\specs\001-productivity-brain-assistant\plan.md`
