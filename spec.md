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

---

## Phase 11: UI/UX Refinements

**Objective:** Enhance the user interface and experience by improving layout, spacing, and feedback during asynchronous operations.

### Step 1: Implement Two-Column Layout
- **Goal:** Position the image preview and the description/story side-by-side.
- **Tasks:**
    - Create a main grid container that splits the content area into two columns on medium to large screens.
    - The left column will contain the `ImageUpload` or `ImagePreview` component.
    - The right column will contain the `DescriptionDisplay` and `StoryDisplay` components.
    - On smaller screens, the layout should revert to a single column.

### Step 2: Add Margins and Padding
- **Goal:** Improve visual clarity and separation between components.
- **Tasks:**
    - Add `space-y-8` (or similar) to the parent containers of the columns to create vertical spacing.
    - Add a `gap-8` (or similar) to the grid container to create horizontal spacing between the two columns.
    - Ensure consistent padding within the main content area.

### Step 3: Enhance Image Upload and Loading UX
- **Goal:** Provide immediate feedback to the user after an image is selected and while waiting for the AI.
- **Tasks:**
    - **TDD:** Write a Jest test to verify that the `ImagePreview` component is rendered immediately after an image is selected.
    - Modify the `Home` page component (`page.tsx`).
    - Upon image selection in `ImageUpload`, immediately hide the upload component and show the `ImagePreview` component with the selected image's preview URL.
    - **TDD:** Write a Jest test to verify that a loading spinner is displayed in the right column while the image description is being fetched.
    - While the `analyze-image` API call is in progress, display a `LoadingSpinner` component in the right-hand column where the `DescriptionDisplay` will appear.
    - Once the description is fetched, replace the loading spinner with the `DescriptionDisplay` component.

---

## Phase 12: Code Refactoring & Optimization

**Objective:** Improve code quality, maintainability, and adherence to best practices by refactoring the main page component and abstracting business logic.

### Step 1: Refactor State Management with `useReducer`
- **Goal:** Simplify state management in `page.tsx` by replacing multiple `useState` hooks with a single `useReducer`.
- **Tasks:**
  - **TDD:** The existing tests for the `Home` page already cover the state transitions. We will use these tests to ensure the refactoring does not break any functionality.
  - Create a `reducer` function that handles all state transitions (e.g., `START_ANALYSIS`, `ANALYZE_SUCCESS`, `ANALYZE_ERROR`, `GENERATE_STORY_START`, `GENERATE_STORY_SUCCESS`, `RESET`).
  - Define a clear `initialState` object.
  - Replace all `useState` calls in `page.tsx` with a single `useReducer` call.
  - Update the event handler functions (`handleImageSelect`, `handleGenerateStory`, `onRemove`) to dispatch actions instead of calling multiple `setState` functions.
- **Commit:** `refactor(state): migrate home page from useState to useReducer`

### Step 2: Abstract Logic into Custom Hooks
- **Goal:** Decouple business logic from the UI by creating custom hooks for API interactions.
- **Tasks:**
  - **TDD:** Create new test files for the custom hooks.
  - **`useImageAnalysis` Hook:**
    - Create a `useImageAnalysis.ts` hook.
    - This hook will manage the `isDescriptionLoading` and `error` states.
    - It will expose a function, `analyzeImage`, that takes the image file and returns the description or an error.
    - Move the `fetch('/api/analyze-image')` logic from `page.tsx` into this hook.
  - **`useStoryGeneration` Hook:**
    - Create a `useStoryGeneration.ts` hook.
    - This hook will manage the `isStoryLoading` and `storyError` states.
    - It will expose a function, `generateStory`, that takes the description and returns a story or an error.
    - Move the `fetch('/api/generate-story')` logic from `page.tsx` into this hook.
  - **Integrate Hooks:** Update `page.tsx` to use these new hooks, simplifying the component's event handlers significantly.
- **Commit:** `refactor(hooks): abstract api logic into custom hooks`

### Step 3: Simplify Component and Props
- **Goal:** Clean up the `page.tsx` component and its props after the refactoring.
- **Tasks:**
  - Create a single `handleReset` function that dispatches the `RESET` action.
  - Pass the `handleReset` function to the `onRemove` prop of the `ImagePreview` component, removing the large inline function.
  - Review all components and remove any props that are no longer needed after the refactoring.
  - Ensure all components follow the Single Responsibility Principle as closely as possible.
- **Commit:** `refactor(ui): simplify home page component and props` 