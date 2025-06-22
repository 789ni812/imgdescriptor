# Project Specification: Image Analysis with LM Studio

## Current Status: In Progress 🚧
- **Phases 1-8:** Complete
- **Phase 9: Iconography & Action Elements Refinement:** In Progress
- **Phase 10: Final Polish & Readme:** Not Started

---

## Project Overview
A Next.js application that allows users to upload images and get AI-generated descriptions and stories using the LM Studio SDK. The project follows a strict Test-Driven Development (TDD) workflow.

## Development Phases


### Phase 10: Final Polish & Readme
The goal of this phase is to finalize the application and prepare the final readme file.

- **Task 10.1: Finalize Readme File**
  - **Action:** Write a comprehensive readme file for the project. Ensure all sections are complete and accurate. Review and edit the file for clarity and completeness.
  - **Commit:** `docs: finalize project readme`.

# Phase 10: Developer Experience Enhancements

The goal of this phase is to improve the development workflow by providing more in-browser context about the components and performance.

### Task 10.1: Display Component Filenames
- **Goal:** Visually identify React components in the browser by displaying their source filename. The filename should appear in a small, light-grey font, centered at the bottom of each component's container.
- **TDD:**
  1. Create a `DevDebugLabel` component that takes a `filename` prop. Write a test to ensure it renders the filename with the correct styling.
  2. Create a wrapper component or HOC that applies a border and renders the `DevDebugLabel` at the bottom-center.
  3. Refactor the tests for `ImageUpload`, `ImagePreview`, `DescriptionDisplay`, and `StoryDisplay` to assert that they are wrapped and display the correct filename.
- **Code:**
  1. Implement the `DevDebugLabel` and wrapper.
  2. Wrap the main components in `page.tsx` with the new wrapper.
- **Commit:** `feat(dev): display component filenames in browser`

### Task 10.2: Document Component Naming Convention
- **Goal:** Add a project rule to document the new component filename display feature.
- **Action:** Investigate the project for a `.cursor/rules` directory. If found, add a rule. If not, ask for clarification.
- **Commit:** `docs(dev): document component filename display rule`

### Task 10.3: Add Timer for Image Description
- **Goal:** Display the time elapsed from image upload to description display.
- **TDD:**
  1. Update `page.test.tsx` to mock timers (`performance.now()`).
  2. Write a test to assert that after an image is processed, a timer display (e.g., `Description generated in: X.XXs`) is visible.
- **Code:**
  1. In `page.tsx`, record the start time on image upload.
  2. Record the end time when the description is received and calculate the duration.
  3. Render the duration in the `DescriptionDisplay` component.
- **Commit:** `feat(dev): add timer for description generation`

### Task 10.4: Add Timer for Story Generation
- **Goal:** Display the time elapsed from button press to story display.
- **TDD:**
  1. Update `page.test.tsx` to assert that after a story is generated, a timer display (e.g., `Story generated in: X.XXs`) is visible.
- **Code:**
  1. In `page.tsx`, record the start time when the "Generate Story" button is clicked.
  2. Record the end time when the story is received and calculate the duration.
  3. Render the duration in the `StoryDisplay` component.
- **Commit:** `feat(dev): add timer for story generation` 