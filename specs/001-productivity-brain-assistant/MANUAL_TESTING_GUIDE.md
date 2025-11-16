# Manual Testing Guide - Phase 8 Validation

## Overview
This document provides a comprehensive manual testing checklist for validating all user stories across browsers and viewports using Playwright MCP per constitution.

## Task T126: Manual Testing with Playwright MCP

**Status**: To be completed manually by developer
**Estimated Time**: 2-3 hours
**Tools Required**: Playwright MCP, multiple browsers and devices/viewports

---

## Browser Testing Matrix

Test all user stories in the following environments:

| Browser | Version | Desktop | Tablet | Mobile |
|---------|---------|---------|--------|--------|
| Chrome  | Latest  | ✓       | ✓      | ✓      |
| Firefox | Latest  | ✓       | ✓      | ✓      |
| Safari  | Latest  | ✓       | ✓      | ✓      |
| Edge    | Latest  | ✓       | ✓      | ✓      |

### Viewport Sizes
- **Desktop**: 1920x1080, 1440x900
- **Tablet**: 768x1024 (portrait), 1024x768 (landscape)
- **Mobile**: 375x667 (iPhone), 360x640 (Android)

---

## User Story Testing Checklist

### User Story 2: Multi-Profile Local Data Management

**Test Scenario**: Create and switch between multiple profiles with isolated local storage

**Steps**:
1. [ ] Launch application for first time
2. [ ] Create "Work" profile
3. [ ] Add 3-5 tasks to Work profile
4. [ ] Verify tasks appear in appropriate quadrants
5. [ ] Create "Personal" profile
6. [ ] Add 2-3 different tasks to Personal profile
7. [ ] Switch back to Work profile
8. [ ] Verify Work tasks are displayed (not Personal tasks)
9. [ ] Switch to Personal profile
10. [ ] Verify Personal tasks are displayed (not Work tasks)

**Acceptance Criteria**:
- ✓ Profile creation is smooth and intuitive
- ✓ Profile switching works without errors
- ✓ Data isolation is complete (no cross-contamination)
- ✓ Last used profile is remembered on refresh

---

### User Story 1: Quick Task Capture and AI-Powered Organization

**Test Scenario**: Braindump text with 4 tasks, submit, receive structured tasks, test duplicate detection

**Steps**:
1. [ ] Navigate to Brain Dump mode
2. [ ] Enter braindump text with 4 distinct tasks (vary urgency and impact)
3. [ ] Submit braindump (Ctrl/Cmd+Enter or click button)
4. [ ] Review extracted tasks in review UI
5. [ ] Verify all 4 tasks were extracted
6. [ ] Check categorization into correct quadrants
7. [ ] Confirm and create tasks
8. [ ] Return to Brain Dump mode
9. [ ] Re-enter similar text (duplicate one task)
10. [ ] Verify duplicate detection dialog appears
11. [ ] Test merge options

**Acceptance Criteria**:
- ✓ AI extracts all tasks accurately
- ✓ Quadrant assignments are appropriate
- ✓ Duplicate detection identifies similar tasks
- ✓ Merge functionality works correctly
- ✓ Loading states are clear during AI processing
- ✓ Error handling works if API key is missing

**Example Braindump Text**:
```
Review code for release tomorrow - critical bug fixes needed
Plan Q4 strategy meeting with team next week
Reply to non-urgent emails from yesterday
Delete old archived documents from last year
```

---

### User Story 3: Visual Quadrant-Based Task Management

**Test Scenario**: View tasks in quadrants, drag between quadrants, edit, complete, find in archive

**Steps**:
1. [ ] Navigate to Task Board view
2. [ ] Verify all 4 quadrants are visible
3. [ ] Verify tasks appear in correct quadrants
4. [ ] Drag a task from PLAN to DO
5. [ ] Verify task updates to "urgent" status
6. [ ] Click on a task to edit
7. [ ] Modify title, description, due date, business impact
8. [ ] Save changes and verify updates
9. [ ] Mark a task as complete via checkbox
10. [ ] Navigate to Archive view
11. [ ] Search for completed task
12. [ ] Verify task appears in archive

**Acceptance Criteria**:
- ✓ Drag-and-drop is smooth (60fps)
- ✓ Visual feedback during drag (cursor, drop zones)
- ✓ Task edit dialog is accessible and functional
- ✓ Archive search finds completed tasks
- ✓ Responsive design works on all viewports

---

### User Story 4: Task-Focused Brainstorming and Mind Mapping

**Test Scenario**: Select task, create mind map with 10+ nodes, save, verify persistence

**Steps**:
1. [ ] Select a task from Task Board
2. [ ] Click "Brainstorm" button
3. [ ] Enter brainstorm mode for that task
4. [ ] Create mind map with:
   - [ ] 1 root node (task title)
   - [ ] 3-5 main branches
   - [ ] 2-3 sub-nodes per branch
   - [ ] At least 10 nodes total
5. [ ] Add text to each node
6. [ ] Create at least one link to another task
7. [ ] Save mind map
8. [ ] Return to Task Board
9. [ ] Re-open brainstorm mode for same task
10. [ ] Verify mind map loads with all nodes and links

**Acceptance Criteria**:
- ✓ Mind map canvas is responsive and interactive
- ✓ Node creation/editing is intuitive
- ✓ D3 force simulation positions nodes clearly
- ✓ Task links are clickable and functional
- ✓ Persistence works (markdown file saved correctly)

---

### User Story 5: AI-Assisted Brainstorming

**Test Scenario**: Request AI suggestions, receive ideas/questions, modify suggestion, get refinements

**Steps**:
1. [ ] Open brainstorm mode for a task
2. [ ] Click "AI Suggestions" button
3. [ ] Verify suggestions appear (3-5 items)
4. [ ] Review suggestion types:
   - [ ] Approach suggestions
   - [ ] Considerations
   - [ ] Probing questions
   - [ ] Simplifications
5. [ ] Select a suggestion to modify
6. [ ] Edit the suggestion text
7. [ ] Request refinements from AI
8. [ ] Verify refined alternatives appear
9. [ ] Test simplification detection for complex mind map

**Acceptance Criteria**:
- ✓ AI suggestions are relevant and helpful
- ✓ Probing questions challenge assumptions
- ✓ Simplification recommendations appear for complex maps
- ✓ Iterative refinement works smoothly
- ✓ Loading states are clear during AI processing

---

## Accessibility Testing (WCAG 2.1 Level AA)

### Keyboard Navigation
- [ ] Tab through all interactive elements in logical order
- [ ] Use arrow keys for list navigation (profiles, tasks)
- [ ] Ctrl/Cmd+Enter submits braindump
- [ ] Escape closes modals/dialogs
- [ ] Space/Enter activates buttons and checkboxes

### Screen Reader Testing
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] ARIA labels are present on interactive elements
- [ ] Status changes are announced (task created, profile switched)
- [ ] Error messages are announced

### Color Contrast
- [ ] All text meets 4.5:1 contrast ratio
- [ ] Quadrant colors are distinguishable
- [ ] Focus indicators are visible

### Focus Management
- [ ] Focus visible on all interactive elements
- [ ] Focus trapped in modals
- [ ] Focus returns to trigger element after modal close

---

## Performance Testing

### Page Load Performance
- [ ] Measure page load time on 3G connection simulation
- [ ] Target: < 3 seconds
- [ ] Use browser DevTools Network throttling

### Time to Interactive (TTI)
- [ ] Measure TTI with Lighthouse
- [ ] Target: < 5 seconds

### Drag-and-Drop FPS
- [ ] Monitor FPS during task dragging
- [ ] Target: 60fps
- [ ] Use Performance Monitor in DevTools

### Core Web Vitals
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1

---

## Cross-Browser Compatibility

### Chrome/Edge (File System Access API)
- [ ] File system access permissions work
- [ ] Markdown files are created in selected folder
- [ ] Files are readable with text editor
- [ ] Data persists after browser restart

### Firefox/Safari (IndexedDB Fallback)
- [ ] IndexedDB storage initializes correctly
- [ ] Export functionality creates downloadable files
- [ ] Import functionality restores data
- [ ] Warning message explains limitations

---

## Responsive Design Testing

### Desktop (1920x1080)
- [ ] 4-quadrant grid displays side-by-side (2x2)
- [ ] All UI elements are properly sized
- [ ] No horizontal scrolling

### Tablet (768x1024)
- [ ] Quadrants stack vertically (1 column, 4 rows)
- [ ] Touch-friendly tap targets (min 44x44px)
- [ ] Profile selector adapts to narrower width

### Mobile (375x667)
- [ ] Typography scales appropriately
- [ ] Buttons are thumb-friendly
- [ ] Input fields are easily tappable
- [ ] Braindump textarea is usable

---

## Error Handling Testing

### API Key Missing
- [ ] Clear error message when AI features require key
- [ ] Settings link provided
- [ ] App remains usable for non-AI features

### Network Failure
- [ ] Graceful degradation when AI API is unreachable
- [ ] User-friendly error messages
- [ ] Retry option provided

### Storage Errors
- [ ] Clear messages if file system access denied
- [ ] Fallback to IndexedDB suggested
- [ ] No data loss on permission errors

### Validation Errors
- [ ] Empty task title rejected with helpful message
- [ ] Invalid profile name shows specific error
- [ ] Duplicate profile name prevented

---

## Regression Testing

After completing all manual tests, verify:
- [ ] No features from Phases 1-7 are broken
- [ ] All previous functionality still works
- [ ] No console errors in any browser
- [ ] No broken links or missing resources
- [ ] No memory leaks during extended use

---

## Test Completion Checklist

- [ ] All user stories tested in all browsers
- [ ] All accessibility criteria met
- [ ] All performance targets achieved
- [ ] All responsive breakpoints validated
- [ ] All error scenarios handled
- [ ] No critical bugs found
- [ ] Documentation updated with any findings

---

## Reporting

Document all test results in:
- **Location**: `specs/001-productivity-brain-assistant/test-results/manual-testing-report.md`
- **Format**: Pass/Fail for each scenario, screenshots of issues, browser/viewport matrix
- **Issues**: Create GitHub issues for any bugs or improvements identified

---

## Sign-off

**Tested by**: _______________________  
**Date**: _______________________  
**Status**: ☐ PASSED ☐ FAILED (see issues)  
**Notes**: _______________________
