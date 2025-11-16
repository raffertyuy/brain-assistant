<!--
Sync Impact Report - Constitution Update
================================================================================
Version Change: [Initial] → 1.0.0
Rationale: Initial constitution creation establishing core development principles

Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles covering code quality, testing, UX, performance, and definition of done)
  - Development Standards
  - Quality Gates
  - Governance

Removed Sections: N/A

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section references this file
  ✅ spec-template.md - User stories and acceptance criteria align with testing principles
  ✅ tasks-template.md - Task organization supports backend testing requirements

Follow-up TODOs: None
================================================================================
-->

# Brain Assistant Constitution

## Core Principles

### I. Code Documentation (NON-NEGOTIABLE)

All methods and functions MUST include documentation comments that explain:
- Purpose and functionality
- Input parameters and their types
- Return values and their types
- Side effects or exceptions raised
- Usage examples for complex functions

**Rationale**: Documentation comments enable maintainability, facilitate code reviews, and serve as inline reference for developers. This is non-negotiable to ensure consistent code quality and knowledge transfer.

### II. Backend Testing Standards (NON-NEGOTIABLE)

Automated testing MUST be implemented for all backend logic:
- Unit tests for individual functions and methods
- Integration tests for service interactions
- Contract tests for API endpoints
- Test-driven development (TDD) approach: write tests → verify they fail → implement → verify they pass

**Rationale**: Backend logic is the core business value and data integrity layer. Automated tests prevent regressions, document expected behavior, and enable confident refactoring.

### III. Frontend Testing Standards

Frontend UI testing follows a manual-first approach with Playwright MCP:
- NO automated Playwright UI tests required
- Manual testing MUST follow functional specifications
- Playwright MCP MUST be used for exploratory testing to identify:
  - Visual issues and layout problems
  - Mobile responsiveness issues and misalignments
  - Functional defects
  - Browser console errors and warnings

**Test Script Validation Process**:
Before fixing any test-identified errors, developers MUST:
1. Review the test script itself for potential errors
2. Understand the intent of the test
3. Simplify test scripts when possible
4. NEVER hardcode dynamic database data
5. Remember that data is dynamic and changing

**Rationale**: Frontend UI testing requires human judgment for visual quality and UX consistency. Playwright MCP provides powerful manual testing capabilities without the brittleness and maintenance overhead of automated UI tests.

### IV. User Experience Consistency

All user-facing features MUST deliver a consistent experience:
- Visual consistency across all screens and components
- Responsive design that works across desktop, tablet, and mobile viewports
- Accessible interfaces following WCAG 2.1 Level AA guidelines
- Intuitive navigation and predictable interaction patterns
- Error messages that are clear, actionable, and user-friendly

**Rationale**: Consistent UX builds user trust, reduces cognitive load, and improves adoption. Poor UX erodes product value regardless of technical excellence.

### V. Performance Requirements

All features MUST meet minimum performance standards:
- Page load time < 3 seconds on 3G connection
- Time to interactive < 5 seconds
- Smooth animations at 60 fps
- Database queries optimized with proper indexing
- API response times < 500ms for p95

**Rationale**: Performance directly impacts user satisfaction and retention. Slow applications create friction that drives users away, regardless of feature completeness.

## Development Standards

### Definition of Done

A feature is considered "done" when ALL of the following criteria are met:

**Code Quality**:
- All methods and functions include documentation comments
- Code follows project style guidelines and passes linting
- No console warnings or errors in browser developer tools
- Code reviewed and approved by at least one other developer

**Testing**:
- Backend logic has automated tests with >80% code coverage
- All tests pass in CI/CD pipeline
- Frontend manually tested with Playwright MCP across target browsers
- Visual regression checked on mobile, tablet, and desktop viewports

**Functionality**:
- All acceptance criteria from specification are met
- Edge cases and error scenarios are handled gracefully
- Feature works as expected in production-like environment

**Documentation**:
- User-facing documentation updated (if applicable)
- API documentation updated (if endpoints changed)
- CHANGELOG.md updated with feature description

**Performance**:
- Performance requirements validated (load time, responsiveness, etc.)
- No performance degradation compared to baseline

## Quality Gates

### Pre-Commit
- All code includes required documentation comments
- Linting and formatting checks pass
- Backend unit tests pass locally

### Pull Request
- All automated tests pass in CI/CD
- Code review completed with approval
- No merge conflicts
- Definition of Done checklist verified

### Pre-Deployment
- Integration tests pass in staging environment
- Manual Playwright MCP testing completed with no critical issues
- Performance benchmarks meet requirements
- Security scan shows no high or critical vulnerabilities

## Governance

This constitution supersedes all other development practices and guidelines. All code changes, feature specifications, and implementation plans MUST comply with these principles.

### Amendment Process

Constitution amendments require:
1. Written proposal with clear rationale
2. Impact analysis on existing features and workflows
3. Team discussion and consensus
4. Migration plan for any breaking changes
5. Version update following semantic versioning:
   - **MAJOR**: Backward incompatible principle removals or redefinitions
   - **MINOR**: New principles added or material expansions
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

- All pull requests MUST verify compliance with constitution principles
- Constitution violations MUST be explicitly justified and documented
- Regular quarterly reviews to ensure constitution remains relevant
- Development guidance files (VIBE_CODING_GUIDE.md, etc.) MUST align with constitution

**Version**: 1.0.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
