# Productivity Brain Assistant

AI-powered task management application that transforms mental clutter into organized action using the Eisenhower Matrix.

## Features

### 🧠 Brain Dump Mode
- Free-form text input for capturing thoughts and tasks
- AI-powered extraction and categorization
- Natural language date parsing
- Duplicate detection and merging

### 📊 Eisenhower Matrix Task Board
- Visual 4-quadrant layout (DO, PLAN, DELEGATE, ELIMINATE)
- Drag-and-drop task reorganization
- Task editing and completion tracking
- Archive management with search

### 🎨 Mind Mapping
- Visual brainstorming for complex tasks
- D3-force layout for automatic node positioning
- Task linking and hierarchical organization
- Markdown-based persistence

### 🤖 AI-Assisted Brainstorming
- Generate suggestions and alternatives
- Probing questions to challenge assumptions
- Simplification recommendations
- Iterative refinement with AI feedback

### 👥 Multi-Profile Management
- Separate profiles for Work, Personal, etc.
- Isolated data storage per profile
- Easy profile switching

## Tech Stack

- **Frontend**: React 18 + TypeScript 5 + Vite
- **Testing**: Vitest + React Testing Library
- **Storage**: File System Access API / IndexedDB fallback
- **AI**: OpenAI API (client-side, user-provided key)
- **Styling**: CSS Modules + CSS Variables
- **Drag & Drop**: react-dnd
- **Visualization**: D3-force

## Prerequisites

- Node.js 18+ and npm
- Modern browser (Chrome/Edge recommended for File System Access API)
- OpenAI API key (for AI features)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/raffertyuy/brain-assistant.git
   cd brain-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Configuration

### OpenAI API Key

1. Go to Settings in the application
2. Enter your OpenAI API key
3. Key is stored locally in browser localStorage
4. ⚠️ Never commit API keys to version control

### File Storage

**Chrome/Edge**: Uses File System Access API
- First launch: Grant permission to select data folder
- Data stored as markdown files in chosen location

**Firefox/Safari**: Uses IndexedDB fallback
- Data stored in browser storage
- Export/import via download buttons

## Project Structure

```
src/
├── components/           # React components
│   ├── braindump/       # Brain dump mode UI
│   ├── task-board/      # Task management UI
│   ├── mind-map/        # Mind mapping UI
│   ├── profile/         # Profile management
│   └── shared/          # Reusable components
├── services/            # Business logic
│   ├── ai/              # AI integration
│   ├── storage/         # File system operations
│   ├── task-manager/    # Task CRUD
│   └── profile-manager/ # Profile management
├── models/              # TypeScript interfaces
├── utils/               # Helper functions
└── App.tsx              # Main application

tests/
├── unit/                # Unit tests
└── integration/         # Integration tests

data/                    # Local storage (gitignored)
└── [profile-name]/      # Per-profile folders
    ├── tasks.md         # Active tasks
    ├── archive.md       # Completed tasks
    └── mind-maps/       # Mind map files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests in watch mode
- `npm run test:unit` - Run tests once
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- TaskService.test.ts
```

Target: >80% code coverage per constitution

## Browser Compatibility

| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Core functionality | ✅ | ✅ | ✅ |
| File System Access | ✅ | ❌ (IndexedDB) | ❌ (IndexedDB) |
| Drag & Drop | ✅ | ✅ | ✅ |
| AI Features | ✅ | ✅ | ✅ |

## Performance Targets

- Page load: < 3s on 3G
- Time to interactive: < 5s
- Drag-and-drop: 60fps
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Accessibility

WCAG 2.1 Level AA compliant:
- ✅ Keyboard navigation
- ✅ ARIA labels
- ✅ Focus management
- ✅ Color contrast (4.5:1 minimum)
- ✅ Screen reader support

## Data Format

Tasks are stored as markdown files with YAML frontmatter:

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
---

Leadership expectations for Friday. Needs financial projections and roadmap slides.

**Context**: CFO specifically asked for market share data and competitor analysis.
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm test && npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

ISC

## Support

For bugs and feature requests, please [open an issue](https://github.com/raffertyuy/brain-assistant/issues).

## Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [OpenAI API](https://platform.openai.com/)
- [react-dnd](https://react-dnd.github.io/react-dnd/)
- [D3.js](https://d3js.org/)
