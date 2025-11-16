# Quickstart Guide: Productivity Brain Assistant

**Date**: 2025-11-16  
**Purpose**: Guide for setting up development environment and running the application

---

## Prerequisites

- **Node.js**: 18.x or later
- **npm**: 9.x or later
- **Modern Browser**: Chrome 86+, Edge 86+, Firefox 115+, or Safari 16+
- **OpenAI API Key**: Required for AI features (or compatible API)

---

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd brain-assistant

# Install dependencies
npm install
```

### 2. Configure Environment

Create `.env` file in project root:

```env
# Optional: Default API endpoint (user can override in app)
VITE_DEFAULT_AI_PROVIDER=openai
VITE_OPENAI_API_URL=https://api.openai.com/v1
```

**Note**: Users will provide their own API keys through the application UI. Keys are stored in browser localStorage.

### 3. Start Development Server

```bash
# Start Vite dev server
npm run dev
```

Application will be available at `http://localhost:5173`

---

## Development Workflow

### Project Structure

```
brain-assistant/
├── src/
│   ├── components/       # React components
│   ├── services/         # Business logic
│   ├── models/           # TypeScript types
│   ├── utils/            # Helper functions
│   └── App.tsx           # Main app
├── tests/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── data/                 # Local storage (gitignored)
├── public/               # Static assets
└── specs/                # Feature specifications
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run all tests
npm run test:unit        # Run unit tests only
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Linting & Formatting
npm run lint             # Run ESLint
npm run format           # Run Prettier
npm run type-check       # TypeScript type checking
```

---

## First Run Experience

### 1. Profile Creation

On first launch, the application will:
1. Request directory access for data storage (if File System Access API supported)
2. Prompt user to create first profile
3. Create `data/` folder structure

**Example**:
```
data/
├── profiles.json
└── Work/
    ├── tasks.md
    ├── archive.md
    └── mind-maps/
```

### 2. API Key Configuration

Navigate to Settings and enter OpenAI API key:
- Click "Settings" icon in top-right
- Enter API key in "AI Configuration" section
- Key is stored in browser localStorage
- Test connection with "Test API Key" button

### 3. Create First Task

**Option A: Braindump Mode**
1. Click "Braindump" button
2. Type free-form text: "Need to prepare Q4 presentation by Friday, schedule dentist appointment, review team's code"
3. Click "Process"
4. Review extracted tasks and confirm/edit
5. Tasks appear in appropriate quadrants

**Option B: Manual Creation**
1. Click "+" in any quadrant
2. Fill in task details
3. Save

---

## Key Features Guide

### Braindump Mode

**Purpose**: Quickly capture multiple thoughts and have AI organize them.

**Steps**:
1. Click "Braindump" button (brain icon)
2. Type naturally - include due dates, context, importance cues
3. Submit for AI processing
4. Review extracted tasks:
   - Confirm accurate tasks
   - Edit any mistakes
   - Merge duplicates if suggested
5. Tasks auto-categorized into quadrants

**Tips**:
- Mention urgency: "ASAP", "by Friday", "leadership wants"
- Mention impact: "critical", "nice to have", "strategic"
- Provide context: "for Q4 planning", "team blocker"

### Task Board (4 Quadrants)

**Quadrants**:
- **DO** (Red): Urgent + High Impact → Do immediately
- **PLAN** (Blue): Not Urgent + High Impact → Schedule time
- **DELEGATE** (Yellow): Urgent + Low Impact → Delegate if possible
- **ELIMINATE** (Gray): Not Urgent + Low Impact → Minimize/remove

**Actions**:
- **Drag & Drop**: Move tasks between quadrants
- **Click Task**: View/edit details
- **Complete**: Mark task done → moves to archive
- **Brainstorm**: Open mind map for complex tasks

### Mind Mapping (Brainstorm Mode)

**Purpose**: Break down complex tasks visually.

**Steps**:
1. Click task → "Brainstorm" button
2. Central node = your task
3. Add child nodes for sub-ideas
4. Link to related tasks
5. Use AI assistance for suggestions
6. Save → persists as markdown

**AI Assistance**:
- Click "AI Suggestions" for ideas
- AI asks probing questions
- Challenges complexity
- Suggests simpler approaches

### Archive & Search

**Archive**:
- Completed tasks move to `archive.md`
- Organized by project area
- Includes completion date

**Search**:
- Search active and archived tasks
- Filter by area, date range
- Full-text search in descriptions

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- task.service.test.ts

# Watch mode during development
npm run test:watch

# Generate coverage report
npm run test:coverage
# View coverage at coverage/index.html
```

### Writing Tests

**Unit Test Example** (`tests/unit/services/task-service.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '@/services/task-manager/TaskService';
import { MockStorageService } from '@/tests/mocks/storage';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockStorage: MockStorageService;
  
  beforeEach(() => {
    mockStorage = new MockStorageService();
    taskService = new TaskService(mockStorage);
  });
  
  it('should create task with correct quadrant', async () => {
    const task = await taskService.createTask({
      area: 'Test',
      title: 'Test task',
      description: 'Description',
      urgency: 'urgent',
      businessImpact: 'high',
      status: 'active'
    });
    
    expect(task.quadrant).toBe('DO');
    expect(task.id).toBeDefined();
    expect(task.createdAt).toBeInstanceOf(Date);
  });
  
  it('should throw error for invalid task data', async () => {
    await expect(
      taskService.createTask({ title: '' } as any)
    ).rejects.toThrow('title must not be empty');
  });
});
```

### Manual Testing with Playwright MCP

Per constitution, frontend UI testing is manual using Playwright MCP:

1. Start dev server: `npm run dev`
2. Use Playwright MCP for exploratory testing:
   - Visual issues and layout problems
   - Mobile responsiveness
   - Functional defects
   - Console errors
3. Test against functional specs in `specs/001-productivity-brain-assistant/spec.md`

---

## Browser Compatibility

### File System Access API Support

| Browser | File System Access API | Fallback |
|---------|----------------------|----------|
| Chrome 86+ | ✅ Yes | N/A |
| Edge 86+ | ✅ Yes | N/A |
| Firefox | ❌ No | IndexedDB + Export |
| Safari | ❌ No | IndexedDB + Export |

**Fallback Behavior**:
- Data stored in IndexedDB
- "Export Profile" button downloads ZIP
- "Import Profile" button uploads ZIP

### Feature Detection

Application automatically detects browser capabilities:

```typescript
const hasFileSystemAccess = 'showDirectoryPicker' in window;

if (hasFileSystemAccess) {
  // Use File System Access API
} else {
  // Use IndexedDB fallback
}
```

---

## Common Issues & Solutions

### Issue: API Key Not Working

**Symptoms**: "API Error" when processing braindump  
**Solutions**:
1. Verify API key is correct in Settings
2. Check API key has sufficient credits
3. Test with "Test API Key" button
4. Check browser console for detailed error

### Issue: Data Not Persisting

**Symptoms**: Tasks disappear after refresh  
**Solutions**:
1. Check if directory access was granted (File System API)
2. Verify `data/` folder exists and has write permissions
3. Check browser console for storage errors
4. Try re-selecting data directory in Settings

### Issue: Performance Slow with Many Tasks

**Symptoms**: Lag when dragging tasks or rendering board  
**Solutions**:
1. Archive old completed tasks
2. Create separate profiles for different contexts
3. Use search to find specific tasks instead of browsing all
4. Check Chrome DevTools Performance tab for bottlenecks

### Issue: Mind Map Not Saving

**Symptoms**: Mind map changes lost after closing  
**Solutions**:
1. Ensure "Save" button is clicked before closing
2. Check `data/{profile}/mind-maps/` folder exists
3. Verify markdown file created for task ID
4. Check browser console for write errors

---

## Deployment

### Build for Production

```bash
# Create optimized production build
npm run build

# Output in dist/ folder
# dist/
#   ├── index.html
#   ├── assets/
#   └── ...
```

### Hosting Options

**Static Hosting** (recommended):
- **GitHub Pages**: Free, easy setup
- **Netlify**: Automatic builds, CDN
- **Vercel**: Zero-config deployment
- **Cloudflare Pages**: Fast global CDN

**Configuration**:
- All hosting providers work with standard Vite build
- No server-side rendering required
- No environment variables needed in production (API keys user-provided)

**Example: Deploy to GitHub Pages**:

```bash
# Add to package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# Install gh-pages
npm install -D gh-pages

# Deploy
npm run deploy
```

### Self-Hosting

```bash
# Build application
npm run build

# Serve dist/ folder with any static server
# Example with Python:
cd dist
python -m http.server 8000

# Or with Node.js serve:
npx serve dist
```

---

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_DEFAULT_AI_PROVIDER` | AI provider name | `openai` | No |
| `VITE_OPENAI_API_URL` | OpenAI API base URL | `https://api.openai.com/v1` | No |

**Note**: All AI configuration can be overridden by user in Settings UI.

---

## Next Steps

1. **Explore Features**: Try braindump mode, create tasks, use mind maps
2. **Read Constitution**: Review `.specify/memory/constitution.md` for development standards
3. **Check Spec**: See `specs/001-productivity-brain-assistant/spec.md` for full requirements
4. **Run Tests**: Ensure all tests pass before making changes
5. **Review Data Model**: See `specs/001-productivity-brain-assistant/data-model.md`

---

## Support & Resources

- **Documentation**: See `specs/` folder
- **Issues**: Report bugs in GitHub issues
- **Constitution**: `.specify/memory/constitution.md`
- **Vibe Guide**: `VIBE_CODING_GUIDE.md`

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-16
