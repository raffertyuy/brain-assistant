# VIBE CODING GUIDE

This project is developed using [Spec Driven Development (SDD)](https://github.com/github/spec-kit/blob/main/spec-driven.md) using the [GitHub Spec Kit](https://github.com/github/spec-kit).

And for flexibility, this project is initialized for both [GitHub Copilot](https://github.com/features/copilot) and [Cursor](https://cursor.com).

## GH Spec Kit Initialization

### 1. Establish project principles

Launch your AI assistant in the project directory. The `/speckit.*` commands are available in the assistant.

Use the **`/speckit.constitution`** command to create your project's governing principles and development guidelines that will guide all subsequent development.

```bash
/speckit.constitution Create principles focused on code quality, testing standards, user experience consistency, and performance requirements.
- Methods and functions must include documentation comments.
- Automated testing must be implemented for backend logic but not for the frontend UI.
- For the frontend UI, no automated Playwright UI testing required. Only use Playwright MCP to test, by following the functional specifications.
- In using Playwright MCP, Watch out for any visual issues, layout problems, misalignments, etc. (especially due to mobile responsiveness). Also watch out for any issues, functionally or in the browser console.
- Before fixing errors caused by any of the tests, ALWAYS take a step back before fixing things, consider that the test script itself might be wrong and that's the one that you should fix.
  - Sometimes the best way to fix a script is to understand the intent of the test script and simplify it.
  - Avoid hardcoding dynamic data that comes from the database, REMEMBER that the data are dynamic and changing.
- Adhere to the definition of done
```

### 2. Create the spec

Use the **`/speckit.specify`** command to describe what you want to build. Focus on the **what** and **why**, not the tech stack.

```bash
/speckit.specify Build an application that can help me organize my mind on the things that I need to do, to be a lot more productive. This application is not a to-do list, but something so much more. It not only organizes my tasks but also helps me brainstorm and to complete the tasks efficiently.

## Tech Stack
- Use Vite and React Typescript.
- No databse, all data is stored locally. Unless specified, use your best judgement on the file format (e.g. markdown, JSON, YAML, CSV, etc.)

## My Productivity Principles

- Tasks should be categorized into 4 quadrants based on urgency and business impact.
  - Quardant 1: Urgent and High Impact (DO)
  - Quadrant 2: Not Urgent but High Impact (PLAN)
  - Quadrant 3: Urgent but Low Impact (DELEGATE)
  - Quadrant 4: Not Urgent and Low Impact (ELIMINATE)
- Urgency is defined by timeline or if it's something that my leadership is expecting me to do immediately.
- Urgency should always be challenged, it is okay to say no. In saying no, provide alternatives or solutions.
- In completing tasks, flow state is important. Minimize distractions and focus on one task at a time.
- In completing a task, brainstorming and mind-mapping helps to be able to think through the task more effectively and efficiently.

## High-level user stories:

### Braindump mode

As a user, I want to be able to quickly jot down all my thoughts on everything that I need to do in a simple and distraction-free multi-line text area, so that I can get everything out of my head and onto the screen.

The application will then use generative AI to extract actionable tasks from my braindump (but still keeping the context). When tasks are extracted, the application checks existing tasks and merges duplicates using generative AI. Sometimes, the old task will have outdated information (or outdated deadlines), so the application will update the task with the latest information from the braindump. Here are some of the information that the AI will look for when extracting tasks:
- Task area or project name (Internal, Operations, Event, Personal, etc.)
- Task title
- Task detailed description
- Task Context or related information
- Due date
- Business impact

The extracted tasks are then categorized into the 4 quadrants based on urgency and business impact using generative AI.

### Task management mode

As a user, I want to be able to view my tasks organized into the 4 quadrants (DO, PLAN, DELEGATE, ELIMINATE), so that I can easily prioritize and manage my tasks based on urgency and business impact.

I should be able to drag and drop tasks between quadrants, edit task details, set deadlines, and mark tasks as complete. Completed tasks are archived but can be searched and retrieved later.

The tasks are saved in a local markdown file using markdown tasks format. Here is an example

````markdown
## {Task Area or Project Name}

- [ ] {Task Title} 📅{due-date:YYYY-MM-DD} #{business-impact} #{quadrant} 
  - Description: {Detailed description of the task}
  - Context: {Any related information or context for the task}
- [ ] Another Task Title 📅{due-date:YYYY-MM-DD} #{business-impact} #{quadrant} 
  - Description: {Detailed description of the task}
  - Context: {Any related information or context for the task}

## {Another Task Area or Project Name}

... and so on...
````

When a task is marked as complete, it is moved to an "Archived Tasks" section at the bottom of the markdown file, under its respective task area or project name.

````markdown
## Archived Tasks

### {Task Area or Project Name}

- [x] {Completed Task Title} 📅{due-date:YYYY-MM-DD} ✅{completed-date:YYYY-MM-DD} #{business-impact} #{quadrant} 
  - Description: {Detailed description of the task}
  - Context: {Any related information or context for the task}

### {Another Task Area or Project Name}

... and so on...
````

### Brainstorm mode

As a user, I want to be able to select a task and enter brainstorm mode, where I can use a mind-mapping interface to brainstorm and organize my thoughts on how to complete the task effectively and efficiently.

AS the task may be related to another task or project, the mind-map should indicate these relationships and show links to related tasks or projects.

The mind-map is saved in a local markdown file, which follows the heiarchical structure of markdowns (like headings, sub-headings, bullet points, etc.). This way, I can easily export the mind-map to other applications that support markdown format.

In brainstorm mode, I can also use generative AI to help me brainstorm ideas and solutions for the task. - The AI can provide suggestions, ask questions, and help me think through the task more effectively.
- The AI will challenge me to keep it simple and complete the task with high quality but in the most efficient way possible.
- I should be able to modify the AI's suggestions and ideas, or prompt it to modify a specific item.

### UI Flow

The application starts with a simple list of users for this application. It will have a button to "Add User" which will create a new user profile.
After selecting a user profile, the user is taken to the main dashboard which has 3 main modes: Braindump mode, Task management mode, and Brainstorm mode. Task management mode is the default mode.

As the application stores everything locally with no database, data for each user profile is stored in a local folder named after the user profile. The data files for each user are stored in the respective user folder.

## Additional Instructions

I've given a lot of information above. Take a step back and think through everything carefully. If you find any conflicting information, use your best judgement to resolve the conflicts in a way that makes the most sense. Think through the entire application flow and user experience before starting. Think Step-by-Step.
```

#### 

### 3. Create a technical implementation plan

Use the **`/speckit.plan`** command to provide your tech stack and architecture choices.

```bash
/speckit.plan The application uses Vite with minimal number of libraries. Use vanilla HTML, CSS, and JavaScript as much as possible. Images are not uploaded anywhere and metadata is stored in a local SQLite database.
```

### 4. Break down into tasks

Use **`/speckit.tasks`** to create an actionable task list from your implementation plan.

```bash
/speckit.tasks
```

### 5. Execute implementation

Use **`/speckit.implement`** to execute all tasks and build your feature according to the plan.

```bash
/speckit.implement
```
