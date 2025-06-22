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

---

## Phase 13: UI Polish with shadcn/ui

**Objective:** Modernize the application's look and feel by integrating the `shadcn/ui` component library and replacing existing custom components.

### Step 1: Initialize shadcn/ui
- **Goal:** Set up the project with the `shadcn/ui` framework using the user's preferences.
- **Action:** Run `npx shadcn-ui@latest init` with the following configuration:
  - **Base Color:** `Gray`
  - **Primary Color:** `Amber`
  - **CSS Variables:** `Yes`
  - **`tailwind.config.ts` path:** `tailwind.config.ts`
  - **`globals.css` path:** `src/app/globals.css`
  - **Components Alias:** `@/components`
  - **Utils Alias:** `@/lib/utils`
- **Commit:** `feat(ui): initialize shadcn/ui`

### Step 2: Replace Button Component
- **Goal:** Replace the custom `Button` component with the more versatile `shadcn/ui` `Button`.
- **TDD:**
  1. Add the `shadcn/ui` button component by running `npx shadcn-ui@latest add button`. This will overwrite the existing `Button.tsx`.
  2. The existing tests in `page.test.tsx` and `ImagePreview.test.tsx` that interact with buttons (e.g., "Generate Story", "Remove Image") will serve as our verification. They should continue to pass as they find elements by role and name.
  3. Run the full test suite to confirm no regressions.
  4. Delete the now-redundant `src/components/ui/Button.test.tsx` file.
- **Commit:** `feat(ui): replace custom button with shadcn Button`

### Step 3: Replace Preview Container with Card Component
- **Goal:** Replace the custom-styled container for the image preview with the `shadcn/ui` `Card` component for a more structured and theme-consistent look.
- **TDD:**
  1. Add the `Card` component via the CLI: `npx shadcn-ui@latest add card`.
  2. Update `ImagePreview.test.tsx` to assert that the main container has the appropriate `div` structure and classes for a `Card` component, as the semantic role may not be present.
  3. Refactor `ImagePreview.tsx` to use `<Card>`, `<CardContent>`, and other `Card` sub-components to wrap the image or placeholder.
  4. Run the `ImagePreview` test to ensure it passes with the new structure.
- **Commit:** `feat(ui): replace image preview container with shadcn Card`

---

## Phase 14: Layout and Theming Enhancements

**Objective:** Refine the application's layout for better readability and update the color scheme to match a new visual direction.

### Step 1: Adjust DevDebugWrapper Spacing
- **Goal:** Add vertical space below the `DevDebugWrapper` component for better visual separation.
- **TDD:**
  1. Update the `DevDebugWrapper.test.tsx` file to assert that the component's main `div` has the `mb-8` class (Tailwind's class for `margin-bottom: 2rem` or `32px`).
  2. Run the test to confirm it fails.
  3. Add the `mb-8` class to the `div` in `DevDebugWrapper.tsx`.
  4. Run the test again to confirm it passes.
- **Commit:** `style(dev): add bottom margin to DevDebugWrapper`

### Step 2: Encapsulate Description in a Card
- **Goal:** Improve the visual structure of the image description by placing it inside a `shadcn/ui` `Card`.
- **TDD:**
  1. Update `DescriptionDisplay.test.tsx` to mock the `Card` component and assert that the description text is rendered within a `CardContent` element.
  2. Run the test to confirm failure.
  3. Refactor the `DescriptionDisplay.tsx` component to wrap its content in `<Card>` and `<CardContent>`.
  4. Run the test to confirm it passes.
- **Commit:** `feat(ui): display image description within a Card`

### Step 3: Implement Two-Column Layout
- **Goal:** Position the image preview on the left and the description on the right for a more organized desktop view.
- **TDD:**
  1. In `page.test.tsx`, assert that the main container for the content columns has the Tailwind CSS classes `grid` and `md:grid-cols-2`.
  2. Refactor `page.tsx` to wrap the two columns in a `div` with these grid classes. The left column (image) and right column (description) will then align correctly on medium screens and wider.
  3. Run the test to verify the new layout structure.
- **Commit:** `feat(layout): implement two-column view for image and description`

### Step 4: Update Primary Button Color to Blue
- **Goal:** Change the primary action button color from Amber to Blue.
- **TDD:** This is a visual theme change not easily testable with JSDOM. Verification will be done visually after the change.
- **Action:**
  1. Find the HSL values for a suitable blue color from the Tailwind CSS palette (e.g., `blue-500`).
  2. Update the `--primary` and `--primary-foreground` CSS variables in `src/app/globals.css` with the new blue theme values.
- **Commit:** `style(theme): change primary color to blue`

---

## Phase 15: Custom Prompt Input

**Objective:** Allow users to input custom prompts for image descriptions, making the analysis more flexible and user-controlled.

### Step 1: Create Custom Prompt Input Component
- **Goal:** Build a new component that allows users to input custom prompts for image analysis.
- **TDD:**
  1. Create `src/components/CustomPromptInput.test.tsx` with tests for:
     - Rendering a text input field with a label
     - Displaying a default placeholder text
     - Handling user input changes
     - Validating that the component calls an `onPromptChange` callback
  2. Run the test to confirm it fails.
  3. Create `src/components/CustomPromptInput.tsx` with a textarea input and proper state management.
  4. Run the test to confirm it passes.
- **Commit:** `feat(components): add CustomPromptInput component`

### Step 2: Integrate Custom Prompt into Image Upload Flow
- **Goal:** Modify the image upload process to include the custom prompt input.
- **TDD:**
  1. Update `src/components/ImageUpload.test.tsx` to test that the component renders the `CustomPromptInput` and passes the prompt value to the parent.
  2. Refactor `src/components/ImageUpload.tsx` to include the custom prompt input and pass the prompt value to the `onImageSelect` callback.
  3. Run the test to verify the integration works correctly.
- **Commit:** `feat(upload): integrate custom prompt input into image upload flow`

### Step 3: Update Image Analysis Hook
- **Goal:** Modify the `useImageAnalysis` hook to accept and use custom prompts.
- **TDD:**
  1. Update `src/hooks/useImageAnalysis.test.ts` to test that the `analyzeImage` function accepts a custom prompt parameter.
  2. Modify `src/hooks/useImageAnalysis.ts` to accept a `prompt` parameter in the `analyzeImage` function.
  3. Update the API call to use the custom prompt instead of the hardcoded one.
  4. Run the test to confirm the hook works with custom prompts.
- **Commit:** `feat(hooks): update useImageAnalysis to accept custom prompts`

### Step 4: Update Main Page Component
- **Goal:** Connect the custom prompt input to the image analysis workflow in the main page.
- **TDD:**
  1. Update `src/app/page.test.tsx` to test that the page handles custom prompt input and passes it to the image analysis.
  2. Modify `src/app/page.tsx` to manage custom prompt state and pass it through the component chain.
  3. Update the `handleImageSelect` function to include the custom prompt.
  4. Run the test to verify the complete workflow functions correctly.
- **Commit:** `feat(page): integrate custom prompt into main page workflow`

### Step 5: Add Prompt Persistence
- **Goal:** Save the user's custom prompt in localStorage so it persists between sessions.
- **TDD:**
  1. Create `src/hooks/useLocalStorage.test.ts` to test localStorage functionality.
  2. Create `src/hooks/useLocalStorage.ts` hook for managing localStorage state.
  3. Update `CustomPromptInput` to use the localStorage hook for prompt persistence.
  4. Run tests to confirm prompt persistence works correctly.
- **Commit:** `feat(storage): add localStorage persistence for custom prompts`

### Step 6: Add Prompt Templates
- **Goal:** Provide users with predefined prompt templates they can select from.
- **TDD:**
  1. Update `src/components/CustomPromptInput.test.tsx` to test template selection functionality.
  2. Add a dropdown or button group to `CustomPromptInput.tsx` with common prompt templates.
  3. Test that selecting a template updates the prompt input field.
  4. Run tests to verify template functionality works correctly.
- **Commit:** `feat(ui): add prompt templates for common use cases`

### Step 7: Update API Route
- **Goal:** Ensure the API route properly handles custom prompts.
- **TDD:**
  1. Update `src/app/api/analyze-image/route.test.ts` to test that the API accepts and uses custom prompts.
  2. Modify `src/app/api/analyze-image/route.ts` to use the custom prompt from the request body.
  3. Run tests to confirm the API works with custom prompts.
- **Commit:** `feat(api): update analyze-image route to use custom prompts`

### Step 8: Add Prompt Validation
- **Goal:** Add validation to ensure prompts are not empty and have reasonable length limits.
- **TDD:**
  1. Update `src/components/CustomPromptInput.test.tsx` to test validation scenarios.
  2. Add validation logic to `CustomPromptInput.tsx` for minimum/maximum prompt length.
  3. Show validation messages to users when prompts are invalid.
  4. Run tests to confirm validation works correctly.
- **Commit:** `feat(validation): add prompt validation and error handling`

### Step 9: Update UI/UX for Prompt Input
- **Goal:** Improve the visual design and user experience of the prompt input.
- **TDD:**
  1. Update component tests to verify proper styling and layout.
  2. Style the `CustomPromptInput` component with proper spacing, labels, and visual feedback.
  3. Ensure the component integrates well with the existing design system.
  4. Run tests to confirm the UI improvements work correctly.
- **Commit:** `style(ui): enhance custom prompt input design and UX`

### Step 10: Add Prompt History
- **Goal:** Allow users to view and reuse previously used prompts.
- **TDD:**
  1. Create `src/hooks/usePromptHistory.test.ts` to test prompt history functionality.
  2. Create `src/hooks/usePromptHistory.ts` hook for managing prompt history.
  3. Add a history dropdown to `CustomPromptInput.tsx` showing recent prompts.
  4. Run tests to confirm prompt history works correctly.
- **Commit:** `feat(history): add prompt history functionality` 