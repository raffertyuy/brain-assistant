# Research: Productivity Brain Assistant

**Date**: 2025-11-16  
**Purpose**: Resolve NEEDS CLARIFICATION items and establish technology choices

## Testing Framework for TypeScript/React/Vite

### Decision: Vitest + React Testing Library

**Rationale**:
- **Vitest** is the natural choice for Vite projects - same config, same plugins, same transforms
- Native ESM support without additional configuration
- Extremely fast due to Vite's transform pipeline
- Compatible with Jest API (easy migration path if needed)
- React Testing Library for component testing if needed (though constitution prefers manual UI testing)

**Alternatives Considered**:
- **Jest**: Requires additional configuration for ESM, slower, but more mature ecosystem
  - Rejected: Vitest offers better Vite integration and performance
- **Mocha/Chai**: More configuration required, smaller ecosystem for React
  - Rejected: Less integrated with modern React tooling

**Implementation**:
```bash
npm install -D vitest @vitest/ui
npm install -D @testing-library/react @testing-library/jest-dom
```

Configuration in `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
```

---

## File Format for Task Storage

### Decision: Markdown with YAML frontmatter

**Rationale**:
- **Human-readable**: Users can manually edit task files if needed
- **Structured + Flexible**: YAML frontmatter for metadata, markdown for descriptions
- **Portable**: Standard format works in any text editor, git-friendly
- **Parsing**: Established libraries (gray-matter, front-matter) for parsing
- **Supports rich text**: Task descriptions can include formatting, links, code blocks

**Alternatives Considered**:
- **JSON**: More rigid structure, less human-readable, no rich text in descriptions
  - Rejected: Poor user experience for manual editing
- **YAML only**: Harder to write multi-line descriptions with formatting
  - Rejected: Less ergonomic than markdown for long-form content
- **CSV**: Too limited for nested/hierarchical data
  - Rejected: Cannot represent task relationships or rich descriptions

**File Structure Example**:
```markdown
# Active Tasks

## DO (Urgent + High Impact)

---
area: Q4 Planning
title: Prepare Q4 presentation
due: 2025-11-20
impact: high
urgency: high
created: 2025-11-16
---

Leadership expectations for Friday. Needs financial projections and roadmap slides.

---
area: Team Management
title: Review team's code
due: 2025-11-17
impact: high
urgency: high
created: 2025-11-16
---

PR #123 blocking deployment. Critical path item.

## PLAN (Not Urgent + High Impact)

[Similar structure for other quadrants]
```

**Libraries**:
- `gray-matter`: Parse YAML frontmatter from markdown
- `marked` or `markdown-it`: Render markdown to HTML (minimal bundle)

---

## AI Service Integration

### Decision: Client-side API integration with OpenAI/compatible APIs

**Rationale**:
- **No backend required**: Aligns with local-first architecture
- **User provides API key**: Stored in browser localStorage (with security warnings)
- **OpenAI API** is most mature with:
  - Structured outputs (JSON mode) for task extraction
  - Function calling for complex workflows
  - Good natural language date parsing via GPT-4
- **Compatible with alternatives**: Code can support OpenAI-compatible APIs (Azure OpenAI, local LLMs via LM Studio)

**Alternatives Considered**:
- **Embedded local LLM**: Too large for browser (multi-GB models), poor UX, out of scope per spec
  - Rejected: Spec explicitly states "Offline AI capabilities: out of scope"
- **Cloud function wrapper**: Adds complexity, costs, violates local-first principle
  - Rejected: Requires backend infrastructure

**Implementation**:
```typescript
// services/ai/client.ts
import OpenAI from 'openai';

export class AIClient {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ 
      apiKey, 
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }
  
  async extractTasks(braindumpText: string): Promise<Task[]> {
    const completion = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract tasks from braindump..." },
        { role: "user", content: braindumpText }
      ],
      response_format: { type: "json_object" }
    });
    // Parse and return tasks
  }
}
```

**Security Considerations**:
- Warn users about API key security (stored in localStorage)
- Provide option to use environment variables in Electron wrapper (future enhancement)
- Rate limiting to prevent accidental API cost overruns

---

## File System Access in Browser

### Decision: File System Access API with fallback to IndexedDB

**Rationale**:
- **File System Access API** (Chrome/Edge): True file system access, users choose folder location
- **IndexedDB fallback** (Firefox/Safari): Browser storage, export/import via file download
- Aligns with progressive enhancement strategy

**Alternatives Considered**:
- **Electron wrapper**: Native file access but requires desktop app distribution
  - Deferred: Start with web, add Electron wrapper later if needed
- **IndexedDB only**: No true local files, harder to backup/sync manually
  - Rejected: Users want portable markdown files they can access directly

**Implementation Strategy**:
```typescript
// services/storage/filesystem.ts
export class FileSystemService {
  async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle> {
    if ('showDirectoryPicker' in window) {
      return await window.showDirectoryPicker();
    } else {
      throw new Error('File System Access API not supported');
    }
  }
  
  async readTaskFile(dirHandle: FileSystemDirectoryHandle, profile: string): Promise<string> {
    const fileHandle = await dirHandle.getFileHandle(`${profile}/tasks.md`);
    const file = await fileHandle.getFile();
    return await file.text();
  }
  
  async writeTaskFile(dirHandle: FileSystemDirectoryHandle, profile: string, content: string): Promise<void> {
    const fileHandle = await dirHandle.getFileHandle(`${profile}/tasks.md`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }
}
```

**Browser Compatibility**:
- Chrome/Edge 86+: Full support
- Firefox/Safari: Use IndexedDB + download button for export
- Progressive enhancement: Detect capability and adjust UI

---

## Date Parsing for Natural Language

### Decision: Chrono-node for natural language date parsing

**Rationale**:
- Mature library with excellent natural language support
- Handles "tomorrow", "next Friday", "in 2 weeks", "EOD", etc.
- Lightweight (~50KB minified)
- Well-maintained and documented

**Alternatives Considered**:
- **date-fns**: Excellent for date manipulation but no NLP parsing
  - Use alongside Chrono for display/formatting
- **Moment.js**: Deprecated, too large
  - Rejected: Outdated
- **AI-based parsing**: Already using AI for task extraction, can extract dates there
  - Hybrid approach: Let AI extract, validate with Chrono

**Implementation**:
```typescript
import * as chrono from 'chrono-node';

export function parseNaturalDate(text: string): Date | null {
  const results = chrono.parse(text);
  return results.length > 0 ? results[0].start.date() : null;
}

// Example usage:
parseNaturalDate("tomorrow") // Date for tomorrow
parseNaturalDate("next Friday") // Date for next Friday
parseNaturalDate("by EOD") // Date for today end of day
```

---

## Drag-and-Drop for Task Quadrants

### Decision: React DnD (react-dnd) with HTML5 backend

**Rationale**:
- Industry-standard React drag-and-drop library
- Supports touch devices with touch backend
- Accessibility-friendly with keyboard navigation support
- Composable hooks API fits React patterns

**Alternatives Considered**:
- **dnd-kit**: Modern alternative, smaller bundle, better accessibility
  - Equally valid choice, slightly prefer react-dnd for maturity
- **Vanilla HTML5 DnD**: More control but complex to implement correctly
  - Rejected: Reinventing the wheel, poor accessibility
- **react-beautiful-dnd**: Opinionated for lists, not grids
  - Rejected: Doesn't fit 4-quadrant grid layout

**Implementation**:
```typescript
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Wrap app
<DndProvider backend={HTML5Backend}>
  <TaskBoard />
</DndProvider>

// Task card component
const TaskCard = ({ task }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }));
  
  return <div ref={drag} className={isDragging ? 'dragging' : ''}>{task.title}</div>;
};

// Quadrant drop zone
const Quadrant = ({ type, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => onDrop(item.id, type),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }));
  
  return <div ref={drop} className={isOver ? 'drop-target' : ''}>[tasks]</div>;
};
```

---

## Mind Map Visualization

### Decision: Vanilla SVG + D3.js (force simulation only)

**Rationale**:
- **Minimal dependencies**: Use D3's force simulation for layout, vanilla SVG for rendering
- **Lightweight**: Only import d3-force module (~15KB), not entire D3
- **Flexible**: Full control over styling and interactions
- **Persistent format**: Mind maps saved as markdown (outline format), rendered as visual tree

**Alternatives Considered**:
- **Full mind-map libraries** (MindMap, jsMind): Heavy, opinionated styling
  - Rejected: Prefer lightweight, customizable solution
- **React Flow**: Excellent but overkill for simple hierarchical trees
  - Rejected: Too complex for simple parent-child relationships
- **Canvas-based**: Harder for accessibility, poor text rendering
  - Rejected: SVG provides better accessibility and text handling

**Implementation**:
```typescript
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

// Render mind map from markdown outline
function renderMindMap(markdownContent: string) {
  const nodes = parseMarkdownToNodes(markdownContent);
  const links = extractLinksFromNodes(nodes);
  
  const simulation = forceSimulation(nodes)
    .force('link', forceLink(links).distance(100))
    .force('charge', forceManyBody().strength(-200))
    .force('center', forceCenter(width / 2, height / 2));
  
  // Render SVG with React
  return (
    <svg width={width} height={height}>
      {links.map(link => <line ... />)}
      {nodes.map(node => <circle ... /><text>{node.text}</text>)}
    </svg>
  );
}
```

**Markdown to Mind Map**:
```markdown
# Task: Prepare Q4 Presentation

## Research
- Gather financial data
- Review Q3 results

## Content Creation
- Create slide deck
  - Title slide
  - Financial overview
  - Roadmap
- Get feedback from team

## Related Tasks
- [[Review team's code]] (link to other task)
```

---

## Styling Approach

### Decision: CSS Modules + CSS Variables

**Rationale**:
- **CSS Modules**: Scoped styles, no global namespace pollution, Vite support built-in
- **CSS Variables**: Theming, responsive breakpoints, maintainable
- **No CSS-in-JS**: Avoid runtime overhead, keep bundle small
- **No Tailwind**: Minimize dependencies per requirement, vanilla CSS preferred

**Alternatives Considered**:
- **Styled-components/Emotion**: Runtime CSS-in-JS, larger bundle
  - Rejected: Adds dependency, runtime cost
- **Tailwind CSS**: Popular but adds dependency, utility-first approach may feel heavy
  - Rejected: Preference for minimal dependencies
- **Plain CSS**: Global namespace conflicts, harder to maintain
  - Rejected: CSS Modules solve this without added libraries

**Implementation**:
```css
/* styles/variables.css */
:root {
  --color-primary: #2563eb;
  --color-urgent: #ef4444;
  --color-important: #f59e0b;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
}

/* components/TaskCard.module.css */
.card {
  padding: var(--spacing-md);
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

---

## Summary of Technology Stack

| Category | Technology | Justification |
|----------|------------|---------------|
| Framework | React 18 + TypeScript 5 | Required by spec, modern development |
| Build Tool | Vite | Required by spec, fast dev experience |
| Testing | Vitest + React Testing Library | Vite-native, fast, Jest-compatible |
| AI Integration | OpenAI API (client-side) | Mature, flexible, user-provided keys |
| File Storage | File System Access API + IndexedDB fallback | Progressive enhancement, browser compatibility |
| Task File Format | Markdown + YAML frontmatter | Human-readable, portable, git-friendly |
| Date Parsing | Chrono-node | Natural language support |
| Drag-and-Drop | react-dnd | Mature, accessible, touch support |
| Mind Map | D3-force + vanilla SVG | Lightweight, flexible, accessible |
| Styling | CSS Modules + CSS Variables | Scoped, maintainable, no runtime cost |
| State Management | React Context + hooks | Built-in, sufficient for local app |

**All NEEDS CLARIFICATION items resolved. Proceeding to Phase 1.**
