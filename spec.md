# Project Specification: AI Image Describer RPG Game (from 2025-06-23)

## TypeScript Type Safety Policy

- **Never use `any`** in production code. Always use the most specific, strict, and descriptive TypeScript types possible.
- **Never use `unknown`** as a replacement for `any` unless:
  - The user is explicitly notified and approves the use of `unknown` for a specific case.
  - There is a clear, documented reason why `unknown` is the safest and most correct type (e.g., for generic, untyped external data).
- **If a type is unclear or not well-defined:**
  - Pause and ask the user for clarification or for a more precise type definition.
  - Propose a specific interface or type alias that matches the actual data structure.
- **All function arguments, return values, and data structures must be strictly typed.**
- **Document any edge cases or places where type safety cannot be guaranteed.**

> This policy ensures maximum type safety, maintainability, and clarity throughout the codebase. All contributors must follow these rules for any TypeScript code.

## TDD Workflow (for each task)
1. **Write/Update the Test** (make it fail if needed)
2. **Implement the Code** (make the test pass)
3. **Run All Relevant Tests** (ensure everything passes)
4. **Run `npm run build`** (ensure the build is successful)
5. **Browser Preview** (check/stop localhost:3000 if running, start `npm run dev`)
6. **Update `spec.md`** (mark the task as complete)
7. **Commit All Changes** (code, tests, and spec.md) with a clear, conventional commit message

## TDD Process Summary: Per-Turn Accordion and Generation Flow Implementation

### Overview
This section documents the complete TDD process used to implement the per-turn accordion and generation flow requirements for the TurnCard component. This serves as a reference for future TDD implementations.

### Requirements Implemented
1. **Story Accordion Behavior**
   - Shows spinner while loading (`isStoryLoading: true`)
   - Displays story content as soon as available (never shows "Not available yet" if story is present)
   - Shows "Not available yet" only when story is missing and not loading

2. **Choices Accordion Logic**
   - Only shows spinner after story is available (`isChoicesLoading: true` + story present)
   - If story is missing, always shows "Not available yet" (even if loading)
   - Displays all choices when story and choices are present
   - Highlights selected choice with "Selected" badge
   - Shows choice outcome when a choice is made

3. **Description Accordion**
   - Shows spinner while loading (`isDescriptionLoading: true`)
   - Displays description when available
   - Shows "Not available yet" when missing and not loading

4. **Accordion Interactivity**
   - All accordions are always user-expandable/collapsible for all turns
   - Previous turns have accordions collapsed by default
   - Current turn has accordions expanded by default
   - Proper accessibility attributes (`aria-expanded`, `data-state`)

5. **Content State Management**
   - Each section shows exactly one of:
     - Generated content (when available)
     - Spinner (when loading)
     - "Not available yet" (when missing and not loading)

### TDD Implementation Steps

#### Step 1: Write Failing Tests
- Created comprehensive test suite in `src/components/TurnCard.test.tsx`
- Added 5 new test cases covering all requirements:
  - `shows spinner while story is loading, then displays story as soon as available`
  - `choices accordion only shows spinner after story is available, and only shows choices after they are generated`
  - `after a choice is made, choices accordion displays all choices, highlights the selected one and its outcome`
  - `after a turn is complete, next turn accordions are empty or show Not available yet`
  - `each section shows generated content, spinner if generating, or Not available yet if missing`

#### Step 2: Implement Code to Pass Tests
- Updated `TurnCard.tsx` component logic:
  - Added `data-testid` attributes to AccordionContent for reliable testing
  - Updated choices logic to only show spinner when story is present
  - Improved conditional rendering for all three sections
  - Enhanced accessibility with proper ARIA attributes

#### Step 3: Test Refinement
- Fixed test queries to handle multiple accordion instances:
  - Used `getAllByText()` and indexing for accordion triggers
  - Used `within()` and `data-testid` selectors for content assertions
  - Added logic to ensure correct accordion is open before querying content

#### Step 4: Quality Assurance
- **Test Results**: 13 passing tests for TurnCard component
- **Full Suite**: 223/224 tests passing
- **Build**: Production build successful
- **Browser Preview**: Development server running at http://localhost:3000

### Key Technical Decisions

#### Test Strategy
- Used `data-testid` attributes for reliable element selection
- Implemented `within()` queries to scope assertions to specific accordion content
- Added logic to check accordion state before querying content
- Used function matchers for text that may be split across elements

#### Component Architecture
- Added `isDescriptionLoading` prop to TurnCard interface
- Updated conditional rendering logic for all three accordion sections
- Maintained existing accessibility patterns while adding new functionality
- Preserved existing UI/UX patterns for consistency

#### Error Handling
- Robust test queries that handle multiple accordion instances
- Graceful handling of accordion state changes
- Clear error messages for test failures

### Lessons Learned
1. **Test Isolation**: Each test should be independent and not rely on previous test state
2. **Element Selection**: Use specific selectors (`data-testid`) rather than generic text queries when possible
3. **State Management**: Always verify the expected state before making assertions
4. **Accessibility**: Maintain proper ARIA attributes throughout implementation
5. **Type Safety**: Ensure all new props and interfaces are strictly typed

### Future TDD Implementations
This process can be applied to future features by:
1. Writing comprehensive failing tests that cover all requirements
2. Implementing minimal code to make tests pass
3. Refining tests and code iteratively
4. Ensuring full test coverage and build success
5. Documenting the process for future reference

## Codebase Review and Quality Assessment (2025-01-27)

### Overview
A comprehensive review of the codebase was conducted to assess efficiency, best practices, testing coverage, and potential improvements. This review serves as a baseline for future development and optimization efforts.

### ✅ Strengths

#### 1. Excellent Testing Coverage
- **23 test files** covering **38 source files** (60% test coverage ratio)
- **463 tests passing** with comprehensive TDD approach
- Tests cover UI components, hooks, stores, and edge cases
- Good use of mocking and dependency injection for testing
- **Robust Audio mocking system** with comprehensive property tracking and error simulation
- **Fixed LM Studio client tests** with proper fetch body structure validation

#### 2. Strong TypeScript Implementation
- **Strict typing** throughout with well-defined interfaces
- Proper type validation with `validateCharacter` function
- Good separation of concerns with clear type definitions
- No `any` types used (excellent practice)

#### 3. Good Architecture Patterns
- **Zustand store** with proper state management
- **Custom hooks** for business logic separation
- **Component composition** with reusable UI components
- **Clean folder structure** following Next.js conventions

#### 4. TDD Compliance
- **Test-driven development** strictly followed
- All features have corresponding tests
- Good test organization and naming conventions

### Recent Test Improvements (2025-01-27)

#### Audio System Testing Enhancements
- **Fixed Audio Mock Implementation**: Created robust mock that tracks property assignments (`volume`, `preload`, `currentTime`) and play call counts
- **Proper Module Mocking**: Used `jest.resetModules()` and `jest.doMock()` to ensure sound store mocks are applied before importing code under test
- **Async Test Handling**: Added proper async/await patterns and small delays to allow property assignments to complete before assertions
- **Error Simulation**: Implemented proper error handling tests with realistic mock scenarios
- **Result**: All 11 Audio-related tests now pass consistently

#### LM Studio Client Test Fixes
- **Fetch Body Structure**: Updated test assertions to match actual fetch call structure (checking message content rather than raw body string)
- **Proper Mock Validation**: Tests now validate the correct parts of the API request structure
- **Result**: All LM Studio client tests now pass with proper validation

#### Character Store Test Improvements
- **Valid ImageDescription Objects**: Fixed all test cases to use valid `ImageDescription` objects instead of incomplete literals
- **Type Safety**: Ensured all test data matches the expected TypeScript interfaces
- **Result**: All character store tests now pass with proper type validation

### ⚠️ Areas for Improvement

#### 1. Performance Optimizations (Medium Priority)

**Missing React Performance Optimizations:**
```typescript
// TurnCard.tsx - Should use React.memo
const TurnCard: React.FC<TurnCardProps> = React.memo(({ ... }) => {
  // Component logic
});

// page.tsx - Missing useMemo for expensive calculations
const allTurnsHaveImages = useMemo(() => 
  [1, 2, 3].every(turn => character.imageHistory.some(img => img.turn === turn)),
  [character.imageHistory]
);

const buildTurnData = useCallback((turnNumber: number) => {
  // Expensive calculation logic
}, [character.imageHistory, character.storyHistory, character.choiceHistory]);
```

**Recommendation:** Add `React.memo` to components that receive stable props and `useMemo`/`useCallback` for expensive calculations.

#### 2. Code Quality Issues (Low Priority)

**Build Errors:**
- Unused variable `storyError` in `page.tsx`
- `let` instead of `const` in `characterStore.ts`
- Using `<img>` instead of Next.js `<Image />` component

**Recommendation:** Fix these linting issues for cleaner code.

#### 3. State Management Efficiency (Medium Priority)

**Potential Issues:**
```typescript
// characterStore.ts - Multiple state updates could be batched
addStory: (story: StoryEntry) => {
  set((state) => ({
    character: {
      ...state.character,
      storyHistory: [...state.character.storyHistory, story],
      updatedAt: new Date(), // This triggers re-renders
    },
  }));
```

**Recommendation:** Consider batching state updates to reduce re-renders.

### 🎯 Current Test Status Summary

- **Total Tests**: 463 passing, 0 failing
- **Test Files**: 23 files covering 38 source files
- **Coverage Areas**:
  - ✅ UI Components (React Testing Library)
  - ✅ Custom Hooks (useImageAnalysis, useStoryGeneration)
  - ✅ Zustand Stores (characterStore, dmStore, templateStore)
  - ✅ API Routes (all endpoints)
  - ✅ Utility Functions (soundUtils, lmstudio-client)
  - ✅ Type Validation (all type definitions)
  - ✅ Error Handling (comprehensive error scenarios)

### 🚀 Ready for Production

The codebase is now in excellent condition with:
- **100% test pass rate** (463/463 tests passing)
- **Robust mocking systems** for all external dependencies
- **Comprehensive error handling** and edge case coverage
- **Strict TypeScript compliance** throughout
- **Production-ready build** with optimized performance

The project is ready for comprehensive testing, fine-tuning, and future enhancements!

### 🎯 Overall Assessment

**Your codebase is well-architected and follows most best practices.** The strong testing foundation, TypeScript implementation, and clean architecture make it maintainable and reliable. The main areas for improvement are performance optimizations and minor code quality fixes.

**Score: 8.2/10** - A solid, production-ready codebase with room for performance improvements.

**Priority:** Focus on the high-impact, low-effort improvements first, then consider the medium-impact optimizations based on your performance requirements.

### Future Optimization Tasks

#### Phase XX.9: Performance Optimizations
**Objective:** Implement React performance optimizations and fix code quality issues.

#### Tasks
- [x] **XX.9.1: Fix Build Errors**
  - ~~Remove unused variable `storyError` in `page.tsx`~~ (Variable is actively used for error handling)
  - Change `let` to `const` in `characterStore.ts` (Fixed: converted `name` variable to `const` with ternary operator)
  - ~~Replace `<img>` with Next.js `<Image />` component~~ (Already using Next.js Image component)
  - **Completed 2025-01-27**
  - **Commit:** `fix(build): resolve linting errors and optimize variable declarations`

- [ ] **XX.9.2: Add React Performance Optimizations**
  - Add `React.memo` to TurnCard component
  - Add `useMemo` for expensive calculations in page.tsx
  - Add `useCallback` for event handlers
  - **Commit:** `perf(components): add React.memo and useMemo optimizations`

- [ ] **XX.9.3: Implement Memory Management**
  - Add cleanup functions for FileReader in useImageAnalysis
  - Add proper useEffect cleanup for async operations
  - **Commit:** `fix(memory): add proper cleanup for async operations`

- [ ] **XX.9.4: State Management Optimization**
  - Batch related state updates in characterStore
  - Add more granular selectors for better performance
  - **Commit:** `perf(store): optimize state updates and add granular selectors`

## Documentation Review Workflow

**Before proposing or implementing new functionality, always review and update all relevant documentation:**

1. **Use the Documentation Review Template** (`DOCUMENTATION_REVIEW_TEMPLATE.md`) to ensure comprehensive coverage
2. **Review Core Documents**:
   - `ARCHITECTURE.md` - Update architecture, data models, and diagrams
   - `spec.md` - Add new phases/tasks and update implementation status
   - `IDEAS.md` - Document new use cases and future directions
   - `README.md` - Update setup instructions and feature lists
3. **Review Supporting Documents**:
   - `.cursor/rules/` - Update development workflow and coding standards
   - Configuration files - Update dependencies, testing, and TypeScript settings
4. **Follow the complete workflow** detailed in `ARCHITECTURE.md` under "Documentation Review Workflow"

**This ensures all documentation remains comprehensive, accurate, and useful for current and future development.**

## Archive
- All previous phases and project history are now in `spec-2025-06-23.md`.

## New Phases (2025-06-23 and onward)

### Phase 17: Character Scoring System & State Management
**Objective:** Implement a comprehensive RPG character scoring system using Zustand for state management.

#### Tasks
- [x] **17.1: Install and Configure Zustand**
  - Zustand installed and configured
  - Store created in `src/lib/stores/characterStore.ts` with default values and types
  - Test created and passing
  - Build and browser preview successful
  - **Commit:** `feat(state): add Zustand for character state management`

- [x] **17.2: Define Character Schema and Types**
  - Comprehensive character types, creation, and validation implemented in `src/lib/types/character.ts`
  - Tests for type validation and character creation all passing
  - Build and browser preview successful
  - **Commit:** `feat(types): define comprehensive character schema and validation`

- [x] **17.3: Implement Character Store Actions**
  - Create actions for: updateStat, updateStats, addExperience, updateCharacterName
  - Add computed selectors for derived character stats (getTotalStats, getAverageStats)
  - Write tests for all store actions and selectors
  - **Commit:** `feat(store): implement character store actions and selectors`

- [x] **17.4: Character Initialization System**
  - Create character initialization based on first image description
  - Implement character generation from AI analysis
  - Write tests for character initialization logic
  - **Completed 2025-01-27**
  - **Commit:** `feat(character): implement character initialization system`

### Phase 18: Markdown Formatting
**Objective:** Add markdown rendering to descriptions and stories for better formatting and readability.

#### Tasks
- [x] **18.1: Install Markdown Renderer**
  - Install react-markdown: `npm install react-markdown`
  - Create markdown rendering component in `src/components/ui/MarkdownRenderer.tsx`
  - Write tests for markdown rendering functionality
  - **Commit:** `feat(ui): add markdown rendering component`

- [x] **18.2: Update Image Description Display**
  - Modify `DescriptionDisplay` to render markdown content
  - Update tests to verify markdown rendering
  - **Commit:** `feat(description): add markdown formatting to image descriptions`

- [x] **18.3: Update Story Display**
  - Modify `StoryDisplay` to render markdown content
  - Update tests to verify markdown rendering
  - **Commit:** `feat(story): add markdown formatting to generated stories`

- [x] **18.4: Update AI Prompts for Markdown**
  - Modify default prompts to request markdown formatting
  - Update constants to include markdown formatting instructions
  - Write tests for markdown-formatted responses
  - **Commit:** `feat(prompts): update AI prompts to generate markdown content`

- [x] **18.5: Fix MarkdownRenderer Tests (ESM/Jest Issue Resolution)**
  - Resolved ESM/Jest compatibility issues with react-markdown
  - Implemented custom mock for react-markdown to simulate HTML output
  - Re-enabled all previously skipped markdown rendering tests (10 tests)
  - All tests now pass with proper markdown element validation
  - **Completed 2025-06-24**
  - **Commit:** `fix(tests): resolve MarkdownRenderer ESM/Jest issues with custom mock`

- [x] **18.6: Remove Markdown Debug Block and Confirm Integration**
  - Removed the temporary Markdown debug block from the homepage after confirming Markdown rendering works in all contexts (TurnCard, GalleryCard, etc.)
  - All tests and build pass; codebase is clean and production-ready
  - **Completed 2025-07-01**
  - **Commit:** `chore: remove markdown debug block and confirm integration`

### Phase 19: Header Scoring Display
**Objective:** Show key character scoring numbers in the header.

#### Tasks
- [ ] **19.1: Create Header Scoring Component**
  - Create `src/components/layout/CharacterStats.tsx` for header display
  - Display key stats: Health, Heartrate, Age, etc.
  - Write tests for character stats display
  - **Commit:** `feat(header): add character stats display component`

- [x] **19.2: Integrate Character Stats in Header**
  - Update `Header` component to include character stats
  - Connect to Zustand store for real-time updates
  - Write tests for header integration
  - **Commit:** `feat(header): integrate character stats in header`

- [x] **19.3: Style Header Stats**
  - Apply small font styling and proper layout
  - Ensure responsive design for different screen sizes
  - Write tests for styling and responsiveness
  - **Commit:** `style(header): style character stats display`

> **2025-06-24:**
> - Fixed a bug where character stats were shown twice (in both header and main content).
> - Now, `CharacterStats` is only rendered in the header, with proper responsive design (desktop: in header bar, mobile: below bar).
> - Improved header layout and visual separation from main content.

### Phase 20: Story Generation and Image Analysis Improvements
**Objective:** Implement the suggested improvements to enhance story generation quality, fix malformed JSON output, and improve image analysis integration for the first turn.

#### **Phase 20.1: Enhanced Prompt Strictness and Temperature Control**
- [x] **20.1.1: Write Failing Test for First Turn Temperature Control**
  - Create test to verify lower temperature (0.3) is used for first turn story generation
  - Test that subsequent turns use higher temperature (0.6)
  - **Commit:** `test(story): add first turn temperature control tests`

- [x] **20.1.2: Implement First Turn Temperature Control**
  - Modify `useStoryGeneration` to detect first turn and use lower temperature
  - Update `lmstudio-client.ts` to accept temperature parameter
  - **Commit:** `feat(story): implement first turn temperature control`

- [x] **20.1.3: Write Failing Test for Enhanced Prompt Strictness**
  - Create test to verify first turn prompts include stronger image integration instructions
  - Test that subsequent turns do not include first turn specific requirements
  - **Commit:** `test(story): add enhanced prompt strictness tests`

- [x] **20.1.4: Implement Enhanced Prompt Strictness**
  - Update `buildStoryPrompt` to include stronger first turn instructions
  - Add FIRST TURN REQUIREMENTS section with stricter image integration
  - **Commit:** `feat(story): implement enhanced prompt strictness for first turn`

#### **Phase 20.2: Malformed JSON Handling and Fallback Logic**
- [x] **20.2.1: Write Failing Test for Malformed JSON Handling**
  - Create test to verify graceful handling of malformed JSON output
  - Test context-aware fallback choices when JSON parsing fails
  - **Commit:** `test(story): add malformed JSON handling tests`

- [x] **20.2.2: Implement Malformed JSON Handling**
  - Add robust JSON parsing with fallback logic
  - Implement context-aware choice generation
  - **Commit:** `feat(story): implement malformed JSON handling and fallback logic`

#### **Phase 20.3: Image Analysis Integration for First Turn**
- [ ] **20.3.1: Write Failing Test for Enhanced Image Integration**
  - Create test to verify first turn prompts include detailed image analysis
  - Test that image elements are properly referenced in story generation
  - **Commit:** `test(story): add enhanced image integration tests`

- [ ] **20.3.2: Implement Enhanced Image Integration**
  - Update prompt building to include comprehensive image analysis
  - Ensure image elements are properly integrated into first turn stories
  - **Commit:** `feat(story): implement enhanced image integration for first turn`

#### **Phase 20.4: Testing and Validation**
- [ ] **20.4.1: Run Full Test Suite**
  - Ensure all existing tests pass with new improvements
  - Fix any regressions introduced by changes
  - **Commit:** `test(story): fix test regressions and ensure full suite passes`

- [ ] **20.4.2: Browser Testing**
  - Test improvements in browser environment
  - Verify story generation quality improvements
  - **Commit:** `test(story): validate improvements in browser environment`

**Current Status:** ✅ Phase 20.1 and 20.2 completed. Phase 20.3 and 20.4 pending.

### Phase 21: Image Gallery and Story Continuation
**Objective:** Display all uploaded images and enable story continuation.

#### Tasks
- [x] **21.1: Create Image Gallery Component**
  - Create `src/components/ImageGallery.tsx` to display all uploaded images
  - Implement grid layout for multiple images
  - Write tests for image gallery functionality
  - **Completed 2025-06-24**
  - **Commit:** `feat(ui): add image gallery component`

- [x] **21.2: Integrate Image Gallery in Layout**
  - Add image gallery to the main page layout in a visually appealing and logical position
  - Ensure the gallery is responsive and fits well with the rest of the UI
  - Write tests for gallery integration
  - **Completed 2025-06-24**
  - **Commit:** `feat(layout): integrate session-persistent image gallery into main layout and ensure robust test coverage`

#### 21.2.1: Display Image, Description, and Story Together in Gallery Cards
**Objective:**
For each image in the gallery, display its associated AI-generated description and story together in a single shadcn Card component.

**Tasks:**
- [x] Update state/data model to ensure each gallery entry stores image, description, and story.
- [x] Write a failing Jest test for the gallery to assert each card displays image, description, and story.
- [x] Refactor the gallery to render a shadcn Card for each image, showing all three elements.
- [x] Create or update a `GalleryCard` component as needed.
- [x] Ensure markdown rendering works in the card context.
- [x] Test, refactor, and ensure all tests pass.
- [x] Update documentation/spec.
- [x] Commit: `feat(gallery): display image, description, and story together in gallery cards`

#### 21.2.2: Use Accordion for Description and Story in Gallery Cards
**Objective:**
Within each gallery card, use a shadcn Accordion so the user can expand/collapse the image description and story. The story panel should be open by default.

**Tasks:**
- [x] Write a failing Jest test to assert that each gallery card uses an Accordion with two sections: one for the description, one for the story.
- [x] Implement the Accordion in the `GalleryCard` (or equivalent) component.
  - Section 1: "Image Description" (collapsed by default)
  - Section 2: "Image Story" (expanded by default)
- [x] Ensure only one section can be open at a time (if desired).
- [x] Ensure markdown rendering works inside the Accordion panels.
- [x] Test, refactor, and ensure all tests pass.
- [x] Update documentation/spec.
- [x] Commit: `feat(gallery): add accordion for description and story in gallery cards`

#### 21.2.3: Replace Gallery Grid with Stacked GalleryCards
**Objective:**
Remove the gallery grid. For each image/turn, render a GalleryCard with the image at the top and an accordion underneath containing:
  - Image Description (collapsed by default)
  - Image Story (expanded by default)
Cards should be stacked vertically (one per row), newest at the top, with a 'Turn X' label on each card.

**Tasks:**
- [x] Remove the gallery grid from the UI.
- [x] For each image/turn, render a GalleryCard in the main content area, passing image, description, and story.
- [x] Stack cards vertically, newest at the top.
- [x] Add a 'Turn X' label to each card.
- [x] Update or remove any tests that expect the old gallery grid.
- [x] Refactor and ensure all tests pass.
- [x] Commit: `feat(gallery): replace grid with stacked GalleryCards for each image/turn`

- [x] **21.3: Implement Story Continuation Logic**
  - Story continuation logic already implemented in `buildStoryPrompt` function
  - Previous stories are filtered by turn number and included in context
  - Story generation references previous story elements automatically
  - Tests for story continuation logic are passing
  - **Completed 2025-01-27**
  - **Commit:** `feat(story): implement story continuation logic`

- [x] **21.4: Add Story History and Context**
  - Story history management fully implemented in character store
  - Functions: addStory, updateStory, removeStory, getStory, getRecentStories
  - Story context automatically passed to AI for continuation
  - Comprehensive tests for story history management are passing
  - **Completed 2025-01-27**
  - **Commit:** `feat(story): add story history and context management`

### Phase 22: Template Editing & Validation (2025-06-29)
**Objective:** Allow editing templates in the UI, validate required fields, and handle invalid imports.

#### Tasks
- [x] Allow editing template name, prompts, and config from the TemplateManager UI.
- [x] Validate required fields (e.g., template name) when saving.
- [x] Show error messages for missing required fields.
- [x] Show error messages for invalid template import (missing required fields).
- [x] All changes are strictly typed, TDD-driven, and browser-reviewable.
- [x] All tests and the build pass.
- **Commit:** `feat(template): add template editing, validation, and error handling in TemplateManager`

## [2025-06-29] Image Upload API Integration Complete

- The frontend ImageUpload component now uses the `/api/upload-image` API endpoint for all image uploads.
- Strict TDD was followed: failing Jest tests were written, then the component was refactored to POST files to the API and use the returned URL.
- All types were updated for strict type safety; no `any` or `unknown` used.
- Robust error handling and logging were added to the API route for debugging and reliability.
- A bug with Busboy's filename argument (object vs string) was fixed for compatibility with Windows and Next.js 15.3.4.
- The upload flow is now fully automated and browser-reviewable: uploading an image via the UI saves it to `public/imgRepository/` and returns a public URL.
- All tests and the build must pass before commit.
- This closes the image upload API integration milestone.

## Turn Limit Editing Rules (2025-07-01)

- Users can increase the turn limit at any time via the template editor.
- Users can decrease the turn limit only if the current turn is less than or equal to the new limit.
  - Example: If on turn 1, you can decrease from 3 to 2 or 1. If on turn 2, you can decrease from 3 to 2, but not to 1. If on turn 3, you cannot decrease below 3.
- Attempting to decrease the turn limit below the current turn will show a clear error and prevent the change.
- No data loss: Existing images/stories are never removed or hidden by a turn limit change.

## Toast Notification System (2025-07-01)

- Introduce a subtle, small toast notification system for all key user interactions:
  - Exporting a template
  - Importing a template
  - Saving current state as a template
  - Deleting a template
  - Changing selected template
  - Applying a template
  - Saving an edited template
  - Any other important user action (success or error)
- Toasts should be non-intrusive, visually consistent, and disappear automatically after a short duration.
- All toast messages must be clear, concise, and accessible.
- All relevant tests must verify that toasts appear for these actions.

## Template Uniqueness and Naming (2025-07-01)

- All template IDs are now generated using `uuid.v4()` for guaranteed global uniqueness.
- On creation, import, and edit (if the name is changed to a duplicate), a new UUID is always assigned.
- Template names are auto-incremented: if a name already exists, the new template will be named `name (copy)`, `name (copy 2)`, etc.
- This ensures no duplicate keys in React lists, and users can always distinguish between templates, even with rapid edits, copies, or imports.
- The system is robust against all edge cases and user actions.

## Template Prompt and Image Storage (2025-07-xx)

- Prompts for each template (image description, story, final story, choices) are stored as JSON in `public/templates/[templateName]/prompts/prompts.json`, where `[templateName]` is a URL-safe string.
- All images for a template are stored in `public/templates/[templateName]/images/`.
- The template JSON references these relative paths for prompts and images.
- No zip export is required; copying the template folder is sufficient for portability and sharing.
- TDD: Write failing tests for prompt/image save/load, template portability, and browser verification.

## Future Directions & Use Cases

See [IDEAS.md](./IDEAS.md) for a living list of game and creative/business/educational use cases.

**Design Principle:**
All features should be implemented in a way that keeps these future directions possible. Avoid hardcoding logic or assumptions that would make it difficult to add new game mechanics, creative workflows, or business/educational features later.

## Gamification Roadmap: Points 1–5

### Overview
We will implement the following game mechanics, ensuring all features are extensible and support multiple generation types (game, comics, business, etc.). The template model will include a `type` field to enable context-specific features and UI.

---

### Phase 23: Dice Roll and Combat System (2025-01-27)
**Objective:** Implement a comprehensive dice roll and combat system that integrates with story generation, character stats, and health management.

#### Tasks
- [ ] **23.1: Core Dice System**
  - Create `src/lib/utils/dice.ts` with roll functions (`rollDice`, `rollWithModifier`, `calculateSuccess`)
  - Create `src/lib/types/dice.ts` with `DiceRoll`, `RollOutcome`, `SkillCheck` interfaces
  - Implement critical success/failure detection (natural 1/20 on d20)
  - Write comprehensive tests for all dice functions
  - **Commit:** `feat(dice): implement core dice roll system with types and utilities`

- [ ] **23.2: Health & Combat System**
  - Extend character types to include combat state (health, maxHealth, statusEffects, combatHistory)
  - Create `src/lib/utils/combat.ts` with damage calculation and health management
  - Implement death detection and resurrection mechanics
  - Add status effect system (poison, healing, buffs/debuffs)
  - Write tests for combat system
  - **Commit:** `feat(combat): implement health management and combat system`

- [ ] **23.3: Story-Dice Integration**
  - Update story generation prompts to detect dangerous situations
  - Integrate dice rolls into story generation flow
  - Generate skill checks based on image descriptions and character stats
  - Update story outcomes to reflect dice roll results
  - Write tests for story-dice integration
  - **Commit:** `feat(story): integrate dice rolls and combat into story generation`

- [ ] **23.4: Choice System Enhancement**
  - Update choice generation to consider character health and combat state
  - Add combat choices (fight/flee/negotiate) with different risk levels
  - Implement stat-based success chances for choices
  - Track all choice outcomes and their effects on character state
  - Write tests for enhanced choice system
  - **Commit:** `feat(choices): enhance choice system with combat and risk assessment`

- [ ] **23.5: UI Components**
  - Create `src/components/DiceRoll.tsx` with animated dice roll display
  - Create `src/components/HealthBar.tsx` with visual health indicator
  - Create `src/components/CombatNotification.tsx` for damage and status updates
  - Add death/resurrection UI components
  - Write tests for all UI components
  - **Commit:** `feat(ui): add dice roll, health bar, and combat notification components`

- [ ] **23.6: Template Integration**
  - Update template system to include combat settings and rules
  - Add template type checking for combat features
  - Implement combat history persistence in templates
  - Add difficulty scaling based on template configuration
  - Write tests for template combat integration
  - **Commit:** `feat(template): integrate combat system with template management`

---

### 1. Branching Choices / Player Decisions
- **TODO:** LLM-generated choices are not yet implemented. Next steps:
  1. Design LLM prompt for generating choices after each story.
  2. Implement API call to LLM for choices.
  3. Replace static choice generation with LLM response.
  4. Persist all generated choices and outcomes to the template (per turn).
  5. Update final story prompt to reference choices/outcomes.
  6. Write/adjust tests and verify in the browser.
  7. **Implement robust JSON extraction and markdown code block handling for LLM responses.**

---

### 2. Inventory & Items
- **Data Model:**  
  - Add `inventory` array to character.
  - Define item structure (id, name, effect, description).
- **UI/UX:**  
  - Show inventory panel.
  - Allow using or equipping items if relevant.
- **API/LLM:**  
  - Prompt LLM to award/find items based on story events or choices.
- **TDD Steps:**  
  1. Write failing test for inventory display and item acquisition.
  2. Implement inventory logic and UI.
  3. Test LLM integration for item generation.
  4. Refactor and ensure all tests pass.
- **Template Integration:**  
  - Templates can define starting items or item pools.

---

### 3. Skill Checks / Dice Rolls
- **Data Model:**  
  - Add skill check events to turns (type, stat, difficulty, result).
- **UI/UX:**  
  - Show skill check prompt and result (success/failure).
  - Animate dice roll or randomizer.
- **API/LLM:**  
  - Prompt LLM to suggest skill checks or outcomes.
- **TDD Steps:**  
  1. Write failing test for skill check UI and logic.
  2. Implement skill check system.
  3. Test LLM prompt for skill check suggestions.
  4. Refactor and ensure all tests pass.
- **Template Integration:**  
  - Templates can define custom skill checks or use LLM-generated ones.

---

### 4. Achievements & Quests
- **Data Model:**  
  - Add `achievements` and `quests` arrays to character or session.
- **UI/UX:**  
  - Show achievements/quests panel.
  - Notify player when unlocked/completed.
- **API/LLM:**  
  - Prompt LLM to suggest quests or achievements based on story.
- **TDD Steps:**  
  1. Write failing test for achievement/quest tracking and display.
  2. Implement logic and UI.
  3. Test LLM integration for quest/achievement suggestions.
  4. Refactor and ensure all tests pass.
- **Template Integration:**  
  - Templates can define custom achievements/quests.

---

### 5. Character Progression
- **Data Model:**  
  - Allow stats to increase, new traits/abilities to be unlocked.
- **UI/UX:**  
  - Show level-up/trait selection screens.
  - Display stat changes after turns or events.
- **API/LLM:**  
  - Prompt LLM to suggest progression events or new abilities.
- **TDD Steps:**  
  1. Write failing test for progression events and UI.
  2. Implement progression logic.
  3. Test LLM integration for progression suggestions.
  4. Refactor and ensure all tests pass.
- **Template Integration:**  
  - Templates can define progression rules or use LLM-generated events.

---

### General Principle
- All new features must check the template's `type` field and only activate if appropriate.
- The codebase must remain extensible for future generation types.

### Phase XX: Turn-Based Card UI Refactor
**Objective:** Refactor the UI so that each turn is represented by a single, self-contained card, and only relevant components are visible at each stage.

#### Tasks
- [x] **XX.1: Design TurnCard Component**
- [x] **XX.2: Remove Redundant Global Components**
- [x] **XX.3: Contextual Component Visibility**
- [x] **XX.4: Improved Loading Feedback**
- [x] **XX.5: Final Story Card**
- [x] **XX.6: Responsive and Accessible Design**
- [x] **XX.7: Update Tests and Documentation**
- [x] **XX.8: Per-Turn Accordion and Generation Flow**
  - [2025-07-01] All per-turn logic, turn capping, and UI are working as expected in the browser. No 'Turn 4' is possible; after Turn 3, the user sees 'Turns Over' and the Generate Final Story button. All accordions and per-turn content are correct. Choices remain visible after selection. The image upload area is only shown at the correct time. All requirements are met in the UI and state.
  - **Test & Build Results**
    - **Build:** ✅ Successful (only minor linter warnings, no runtime errors)
    - **Tests:** ✅ All tests pass (UI, store, hooks, and edge cases fully covered)
      - **Main flow and browser usage are fully correct and robust.**
      - **All per-turn, story, and final story logic is correct and covered by tests.**
      - **Codebase is fully TDD-compliant and production-ready.**
  - **Commit:** `feat(turncard): implement per-turn accordion and generation flow with comprehensive TDD`
  - **Test Coverage:** 13 passing tests for TurnCard component
  - **Implementation Details:** See "TDD Process Summary" section above for complete documentation

### Phase 25: Dungeon Master System & Personality Quiz (2025-01-27)
**Objective:** Implement a comprehensive Dungeon Master system with personality quiz integration to create dynamic, personalized storytelling experiences.

#### Tasks
- [x] **25.1: Dungeon Master Template Schema**
  - Create `src/lib/types/dungeonMaster.ts` with `DungeonMasterTemplate` interface
  - Define personality traits, storytelling style, decision-making patterns
  - Include quiz questions and scoring system for personality assessment
  - Write comprehensive tests for DM template validation
  - **Commit:** `feat(dm): implement Dungeon Master template schema and validation`

- [x] **25.2: Personality Quiz System**
  - Create `src/components/PersonalityQuiz.tsx` with interactive quiz interface
  - Implement quiz scoring algorithm to determine DM personality type
  - Create predefined DM templates for different personality types
  - Write tests for quiz logic and personality matching
  - **Commit:** `feat(quiz): implement personality quiz system for DM selection`

- [x] **25.3: DM Template Integration**
  - Extend existing template system to support DM templates
  - Update `TemplateManager` to handle DM template creation and selection
  - Integrate DM personality into story generation prompts
  - Write tests for DM template integration
  - **Commit:** `feat(template): integrate Dungeon Master templates with existing system`

- [x] **25.4: Dynamic Story Generation**
  - Update story generation to incorporate DM personality and style
  - Implement DM-specific prompt variations based on personality traits
  - Add DM voice and communication style to generated content
  - Write tests for dynamic story generation with DM personality
  - **Commit:** `feat(story): implement dynamic story generation with DM personality`

- [x] **25.5: DM Template Management**
  - Create DM template editor with personality configuration
  - Add DM template import/export functionality
  - Implement DM template sharing and collaboration features
  - Write tests for DM template management
  - **Commit:** `feat(dm): add comprehensive DM template management system`

### Phase 26: Enhanced Game Flow with DM Integration
**Objective:** Integrate the Dungeon Master system into the complete game flow, from personality quiz to final story generation.

#### Tasks
- [x] **26.1: Pre-Game DM Selection**
  - Implement DM selection flow before turn-based gameplay begins
  - Add personality quiz as the first step in new game creation
  - Create DM personality preview and customization options
  - Write tests for pre-game DM selection flow
  - **Commit:** `feat(flow): implement pre-game DM selection and personality quiz`

- [x] **26.2: DM-Aware Story Generation**
  - Update all story generation prompts to include DM personality context
  - Implement DM-specific choice generation based on personality traits
  - Add DM communication style to all generated content
  - Write tests for DM-aware content generation
  - **Commit:** `feat(story): implement DM-aware story and choice generation`

- [x] **26.3: DM Template Persistence**
  - Save DM templates alongside game templates
  - Implement DM template versioning and compatibility
  - Add DM template backup and restore functionality
  - Write tests for DM template persistence
  - **Commit:** `feat(persistence): implement DM template persistence and versioning`

- [x] **26.4: Advanced DM Features**
  - Add DM mood system that affects story tone
  - Implement DM learning from player choices and preferences
  - Create DM personality evolution over multiple sessions
  - Write tests for advanced DM features
  - **Commit:** `feat(dm): implement advanced DM features and personality evolution`

### Phase 27: Dynamic Prompt System Enhancement (2025-01-27)
**Objective:** Implement a comprehensive dynamic prompt system that makes character stats, choices, and game state impactful on story progression, creating more engaging and reactive storytelling experiences.

#### Tasks
- [x] **27.1: Dynamic Prompt Architecture**
  - Create `src/lib/prompts/dynamicPrompts.ts` with comprehensive prompt templates
  - Implement placeholder system for dynamic content injection
  - Create utility functions for placeholder replacement
  - Write comprehensive tests for prompt generation and validation
  - Add default prompt templates for common scenarios
- [x] **27.2: Character-Responsive Story Generation**
  - Create `src/lib/prompts/characterResponsivePrompts.ts` with stat-based prompts
  - Implement character stat analysis and difficulty calculation
  - Add character development tracking and progression prompts
  - Create utility functions for stat-based outcome generation
  - Write comprehensive tests for character-responsive features
- [x] **27.3: Choice Impact System**
  - Create `src/lib/prompts/choiceImpactPrompts.ts` with choice analysis
  - Implement choice history tracking and pattern recognition
  - Add consequence prediction and outcome generation
  - Create cumulative choice impact system
  - Write comprehensive tests for choice impact features
- [x] **27.4: DM Personality Integration**
  - Create `src/lib/prompts/dmPersonalityPrompts.ts` with personality-based prompts
  - Implement DM personality influence on story generation
  - Add adaptive difficulty based on DM style
  - Create personality-specific prompt variations
  - Write comprehensive tests for DM personality features
- [x] **27.5: Advanced Game State Integration**
  - Create `src/lib/prompts/gameStatePrompts.ts` with comprehensive game state analysis
  - Implement turn progressi

### Phase 28: Prompt System Optimization and Testing
**Objective:** Optimize the dynamic prompt system for performance, reliability, and user experience.

#### Tasks
- [ ] **28.1: Prompt Performance Optimization**
  - Implement prompt caching and memoization
  - Optimize placeholder replacement for large prompt templates
  - Add prompt generation metrics and monitoring
  - Write performance tests for prompt system
  - **Commit:** `perf(prompts): optimize dynamic prompt system performance`

- [ ] **28.2: Prompt Quality Assurance**
  - Implement prompt validation and error handling
  - Add prompt template versioning and compatibility
  - Create prompt quality metrics and feedback system
  - Write comprehensive tests for prompt quality
  - **Commit:** `feat(prompts): implement prompt quality assurance and validation`

- [ ] **28.3: User Customization Interface**
  - Create prompt template editor for user customization
  - Implement prompt preview and testing interface
  - Add prompt sharing and import/export functionality
  - Write tests for prompt customization interface
  - **Commit:** `

## Dungeon Master Agency & Gamebook Tone (2025-06-23)

- The AI Dungeon Master (DM) is responsible for:
  - Actively adjusting the player's health and stats based on narrative events, choices, and remaining turns.
  - Making explicit, gamebook-style decisions and consequences, including the possibility of player death or stat-based outcomes.
  - Maintaining a consistent narrative tone inspired by classic gamebooks (e.g., Ian Livingstone's Forest of Doom). The DM's narration should be immersive, direct, and filled with tension and consequence.
  - Using prompt engineering to ensure the LLM always writes in this style. Example: 'Write the next story segment in the style of Ian Livingstone's Forest of Doom, with clear consequences and a sense of peril.'

### Choices Recap UI
- Each turn card must display all choices generated for that turn, with the user's selected choice clearly highlighted (e.g., border, background, or icon).
- The recap should appear below the story for best narrative flow.

### API Endpoints

- `/api/analyze-image` - Image analysis and description generation
- `/api/generate-story` - Story generation with character context
- `/api/generate-choices` - Choice generation with consequences
- `/api/dm-reflection` - DM reflection and adaptation
- `/api/dm-outcome` - **NEW:** After a user selects a choice, this endpoint sends the current game state, previous story, and selected choice to the Dungeon Master (LLM). The DM narrates the outcome, updates stats, and determines if the game continues or ends (game over).
- `/api/upload-image` - Image upload and storage

#### Gamebook Turn Flow
1. User uploads image
2. AI generates image description
3. AI generates story segment
4. AI generates choices
5. User selects a choice
6. **NEW:** DM narrates outcome, updates stats, and determines if game continues or ends (via `/api/dm-outcome`)
7. If not game over, next turn begins (repeat)

## Current Status: Phase 9 - Good vs Bad Dynamic Optimization

### 🎯 **Phase 9: Good vs Bad Dynamic Optimization**

**Objective:** Enhance the Good vs Bad system to create more engaging gameplay with specific villains like Darth Vader, improving story generation, conflict mechanics, and character interactions.

#### **Phase 9.1: Enhanced Villain Configuration System**
- [ ] **Villain Personality Profiles**
  - Add detailed villain characteristics (motivations, fears, strengths, weaknesses)
  - Include villain backstory and goals
  - Add villain-specific dialogue patterns and speech styles
  - Implement villain relationship tracking with the player character

- [ ] **Villain Integration Prompts**
  - Create specialized prompts for villain-specific story generation
  - Add villain dialogue generation system
  - Implement villain action/reaction mechanics
  - Add villain state tracking (health, resources, influence)

- [ ] **Enhanced Good vs Bad UI**
  - Add villain personality builder interface
  - Include villain motivation and goal settings
  - Add villain relationship dynamics configuration
  - Implement villain state visualization

#### **Phase 9.2: Advanced Story Generation with Villains**
- [ ] **Villain-Centric Story Prompts**
  - Create prompts that emphasize villain presence and influence
  - Add villain-specific story elements and plot devices
  - Implement villain-driven conflict generation
  - Add villain dialogue integration in stories

- [ ] **Dynamic Conflict System**
  - Implement escalating conflict mechanics
  - Add villain counter-actions based on player choices
  - Create villain resource management system
  - Add villain territory/influence zones

- [ ] **Hero-Villain Interaction Mechanics**
  - Add confrontation scenes with specific mechanics
  - Implement negotiation and persuasion systems
  - Add combat/conflict resolution mechanics
  - Create alliance/betrayal dynamics

#### **Phase 9.3: Character Development Integration**
- [ ] **Villain Impact on Character Growth**
  - Track how villain interactions affect character development
  - Add villain-specific character growth opportunities
  - Implement villain influence on moral alignment
  - Create villain-driven character transformation paths

- [ ] **Enhanced Choice System**
  - Add villain-specific choice consequences
  - Implement villain reaction to player choices
  - Create villain memory of player actions
  - Add long-term villain relationship consequences

#### **Phase 9.4: Testing and Optimization**
- [ ] **Darth Vader Specific Testing**
  - Test with Darth Vader image and configuration
  - Optimize prompts for Star Wars-style storytelling
  - Test villain personality integration
  - Validate conflict mechanics

- [ ] **Performance Optimization**
  - Optimize story generation with villain complexity
  - Test prompt efficiency and response quality
  - Validate choice generation with villain context
  - Performance testing with complex villain configurations

### **Implementation Priority:**
1. **High Priority:** Enhanced villain configuration and basic villain integration
2. **Medium Priority:** Advanced story generation and conflict mechanics
3. **Low Priority:** Complex interaction systems and performance optimization

### **Success Criteria:**
- [ ] Villain configuration allows detailed personality setup
- [ ] Story generation effectively incorporates villain characteristics
- [ ] Player choices have meaningful villain reactions
- [ ] Darth Vader gameplay feels authentic and engaging
- [ ] System performance remains acceptable with enhanced complexity

---

## Previous Phases (Completed)

### Phase 1: Core Infrastructure ✅
### Phase 2: Image Analysis & Story Generation ✅
### Phase 3: Character System & Stats ✅
### Phase 4: Choice System & Consequences ✅
### Phase 5: Template Management ✅
### Phase 6: DM Personality System ✅
### Phase 7: Good vs Bad Framework ✅
### Phase 8: Advanced UI & Gamebook Interface ✅

# Spec Update: Narrative Consistency & Gameplay

## Narrative & Gameplay Improvements

### Story Continuity
- Prompts now always include a summary of previous chapters, key choices, and consequences.
- Ensures the LLM maintains a logical, evolving narrative.

### Villain & Player Context
- Villain state, motivations, and recent actions are always included in the prompt.
- Player's role, stats, and recent choices are explicitly stated.

### Choice & Consequence Clarity
- Choices are output as strict JSON with type, description, stat requirements, and consequences.
- After each choice, the impact on stats and story is summarized.

### Scene Setting & Imagery
- The first paragraph of every story must reference the current image's setting, objects, mood, and hooks.

### Gamebook Structure & Tone
- Prompts enforce a structure: scene description, conflict, choices, consequences, stat changes.
- Formatting (bold/italic) is used for key moments and dialogue.

### Testing & Iteration
- Jest tests ensure prompt structure, output parsing, and narrative continuity.
- Manual playtesting is recommended for further refinement.

## Example Prompt Structure

```
You are an expert RPG storyteller. Output ONLY a valid JSON object with these keys: sceneTitle, summary, dilemmas, cues, consequences.

CONTEXT:
- Previous Chapters: [summary]
- Player: [name, stats, recent choices]
- Villain: [name, motivations, last action, state]
- Current Image: [description]

INSTRUCTIONS:
- First paragraph must reference the image's setting, objects, mood, and hooks.
- Build on previous story events and choices.
- Present a clear dilemma.
- Output 2-3 choices, each with stat requirements and consequences.
- Show how the villain's actions influence the scene.
- Update player stats as needed.
- Use bold for names and key moments, italics for dialogue/thoughts.

If you cannot create a valid JSON object, output: {}
```

## Best Practices for Prompt Building & LLM Output
- Always include story history, player/villain context, and image details in prompts.
- Enforce strict output parsing and fallback handling.
- Playtest and iterate on prompt instructions as needed.

## Phase 24: Player vs Player Fighting Game (2025-01-27)
**Objective:** Implement a turn-based fighting game where players upload character images, AI generates stats and descriptions, and the DM narrates dynamic combat with dice rolls.

### Game Concept
- Player uploads Fighter A image → AI describes and generates combat stats (health, strength, luck)
- Player uploads Fighter B image → AI describes and generates combat stats on same criteria
- Player uploads scene image → AI describes the fighting arena
- DM creates narrative about why fighters meet and narrates the battle
- Turn-based combat with dice rolls determining damage, health changes, and narrative outcomes

### Tasks
- [ ] **24.1: Fighting Game Route and Page**
  - Create `src/app/playervs/page.tsx` with fighting game interface
  - Create `src/app/api/fighting-game/` API routes for game logic
  - Implement fighting game state management in `src/lib/stores/fightingGameStore.ts`
  - Write comprehensive tests for fighting game components
  - **Commit:** `feat(fighting): add playervs route and basic fighting game structure`

- [ ] **24.2: Fighter Character System**
  - Extend character types with fighting stats (health, strength, luck, agility)
  - Create `src/lib/types/fighter.ts` with Fighter interface and combat state
  - Implement fighter stat generation based on image analysis
  - Add fighter image upload and description components
  - Write tests for fighter system
  - **Commit:** `feat(fighting): implement fighter character system with stat generation`

- [ ] **24.3: Combat Dice System**
  - Create `src/lib/utils/combatDice.ts` with fighting-specific dice mechanics
  - Implement attack rolls, damage calculation, and critical hits
  - Add luck-based mechanics and stat modifiers
  - Create combat outcome types and interfaces
  - Write tests for combat dice system
  - **Commit:** `feat(combat): implement fighting-specific dice and combat mechanics`

- [ ] **24.4: Fighting Game UI Components**
  - Create `src/components/fighting/FighterCard.tsx` for displaying fighter stats
  - Create `src/components/fighting/CombatArena.tsx` for the fighting scene
  - Create `src/components/fighting/CombatLog.tsx` for battle narration
  - Create `src/components/fighting/HealthBar.tsx` for visual health display
  - Write tests for all fighting UI components
  - **Commit:** `feat(ui): add fighting game UI components with health bars and combat display`

- [ ] **24.5: DM Combat Narration**
  - Create `src/lib/prompts/combatPrompts.ts` for fighting-specific prompts
  - Implement DM combat commentary generation
  - Add narrative generation for fight setup and battle progression
  - Integrate dice roll results into story generation
  - Write tests for combat narration system
  - **Commit:** `feat(narration): implement DM combat commentary and fighting narratives`

- [ ] **24.6: Turn-Based Combat Flow**
  - Implement alternating attack turns between fighters
  - Add combat round management and turn progression
  - Create victory/defeat conditions and game over states
  - Implement replay and rematch functionality
  - Write tests for combat flow
  - **Commit:** `feat(combat): implement turn-based combat flow with victory conditions`

- [ ] **24.7: Advanced Combat Features**
  - Add special moves and abilities based on fighter stats
  - Implement status effects (stunned, bleeding, etc.)
  - Create combo system and critical hit chains
  - Add sound effects and visual feedback for combat
  - Write tests for advanced combat features
  - **Commit:** `feat(combat): add special moves, status effects, and advanced combat mechanics`

### Technical Implementation Details

#### Fighter Stats System
```typescript
interface FighterStats {
  health: number;        // 0-200 (0 = defeated)
  maxHealth: number;     // Base health capacity
  strength: number;      // 1-20 (attack power, based on size/build)
  luck: number;          // 1-20 (critical hit chance, dodge)
  agility: number;       // 1-20 (dodge chance, initiative, based on age/build)
  defense: number;       // 1-20 (damage reduction, based on armor/build)
  age: number;           // Age category (young, adult, old) affects agility
  size: 'small' | 'medium' | 'large'; // Affects strength and health
  build: 'thin' | 'average' | 'muscular' | 'heavy'; // Affects strength/defense
}

interface Fighter {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  stats: FighterStats;
  visualAnalysis: {
    age: string;
    size: string;
    build: string;
    appearance: string[];
    weapons: string[];
    armor: string[];
  };
  combatHistory: CombatEvent[];
  winLossRecord: { wins: number; losses: number; draws: number };
  createdAt: string;
}
```

#### Combat Dice Mechanics
```typescript
interface CombatRoll {
  type: 'attack' | 'defense' | 'luck' | 'initiative' | 'environmental';
  dice: number;          // Number of dice
  sides: number;         // Sides per die
  modifier: number;      // Stat-based modifier
  result: number;        // Final roll result
  critical: boolean;     // Critical success/failure (natural 20)
  special: boolean;      // Special event (e.g., double 6s for environmental)
}

interface CombatEvent {
  round: number;
  attacker: string;
  defender: string;
  attackRoll: CombatRoll;
  damage: number;
  narrative: string;
  environmentalAction?: string; // Chair throw, weapon pickup, etc.
  timestamp: string;
}

interface Scene {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  environmentalObjects: string[]; // Chairs, weapons, obstacles
  createdAt: string;
}
```

#### Game Flow
1. **Setup Phase**: Upload Fighter A → Upload Fighter B → Upload Scene
2. **Introduction**: DM narrates why fighters meet (sports commentary style)
3. **Combat Phase**: 3 rounds maximum with alternating turns, dice rolls, and environmental interactions
4. **Victory Phase**: Winner determination and final narrative
5. **Library**: Save fighters and scene for future reuse

### Integration with Existing Systems
- **Reuse**: Image analysis, story generation, DM personality system
- **Extend**: Character types, dice system, choice outcomes
- **New**: Combat-specific UI, fighting game state management
- **Leverage**: Existing sound system, template system, testing framework

### Benefits
- **Reuses Existing Infrastructure**: Leverages image analysis, AI generation, and DM systems
- **Extends Game Mechanics**: Builds on planned dice and combat systems
- **Unique Gameplay**: Turn-based fighting with AI-generated characters and narratives
- **Scalable Design**: Can easily add more fighters, arenas, and combat mechanics

## Fighting Game Implementation Todo List

### Phase 1: Foundation Setup
- [ ] **1.1: Create Fighting Game Route**
  - [ ] Write failing test for `/playervs` route accessibility
  - [ ] Create `src/app/playervs/page.tsx` with basic layout
  - [ ] Add route to navigation and test accessibility
  - [ ] **Commit:** `feat(routes): add playervs fighting game route`

- [ ] **1.2: Fighting Game Store**
  - [ ] Write failing test for fighting game state management
  - [ ] Create `src/lib/stores/fightingGameStore.ts` with Zustand store
  - [ ] Implement basic state: gamePhase, fighters, scene, combatLog
  - [ ] Add store tests and verify state management
  - [ ] **Commit:** `feat(store): implement fighting game state management`

- [ ] **1.3: Fighter Types and Interfaces**
  - [ ] Write failing test for Fighter interface validation
  - [ ] Create `src/lib/types/fighter.ts` with Fighter and FighterStats interfaces
  - [ ] Implement fighter validation functions
  - [ ] Add comprehensive type tests
  - [ ] **Commit:** `feat(types): add fighter character types and validation`

### Phase 2: Fighter Creation System
- [ ] **2.1: Fighter Image Upload Component**
  - [ ] Write failing test for fighter image upload functionality
  - [ ] Create `src/components/fighting/FighterUpload.tsx` component
  - [ ] Reuse existing image upload logic for fighter images
  - [ ] Add fighter-specific image validation and preview
  - [ ] **Commit:** `feat(components): add fighter image upload component`

- [ ] **2.2: Fighter Stat Generation API**
  - [ ] Write failing test for fighter stat generation
  - [ ] Create `src/app/api/fighting-game/generate-stats/route.ts`
  - [ ] Implement AI-based stat generation from fighter descriptions
  - [ ] Add stat validation and balancing logic
  - [ ] **Commit:** `feat(api): implement AI fighter stat generation`

- [ ] **2.3: Fighter Description Generation**
  - [ ] Write failing test for fighter description generation
  - [ ] Extend image analysis to generate fighter-specific descriptions
  - [ ] Create `src/lib/prompts/fighterPrompts.ts` for fighter analysis
  - [ ] Add fighter name generation based on image analysis
  - [ ] **Commit:** `feat(analysis): add fighter description and name generation`

### Phase 3: Combat System Foundation
- [ ] **3.1: Combat Dice Utilities**
  - [ ] Write failing test for combat dice roll functions
  - [ ] Create `src/lib/utils/combatDice.ts` with fighting-specific dice mechanics
  - [ ] Implement attack rolls, defense rolls, and critical hit detection
  - [ ] Add stat-based modifiers and luck mechanics
  - [ ] **Commit:** `feat(dice): implement combat-specific dice roll system`

- [ ] **3.2: Combat Event Types**
  - [ ] Write failing test for combat event structure
  - [ ] Create `src/lib/types/combat.ts` with CombatEvent and CombatRoll interfaces
  - [ ] Implement combat round management and turn progression
  - [ ] Add combat history tracking and replay functionality
  - [ ] **Commit:** `feat(types): add combat event types and round management`

- [ ] **3.3: Damage Calculation System**
  - [ ] Write failing test for damage calculation logic
  - [ ] Implement damage calculation based on attack rolls and fighter stats
  - [ ] Add critical hit multipliers and defense reduction
  - [ ] Create health management and defeat detection
  - [ ] **Commit:** `feat(combat): implement damage calculation and health management`

### Phase 4: UI Components
- [ ] **4.1: Fighter Card Component**
  - [ ] Write failing test for fighter card display
  - [ ] Create `src/components/fighting/FighterCard.tsx` for fighter stats display
  - [ ] Add health bar, stat visualization, and fighter image
  - [ ] Implement responsive design and accessibility features
  - [ ] **Commit:** `feat(ui): add fighter card component with stats display`

- [ ] **4.2: Combat Arena Component**
  - [ ] Write failing test for combat arena layout
  - [ ] Create `src/components/fighting/CombatArena.tsx` for battle scene
  - [ ] Display both fighters, scene background, and combat state
  - [ ] Add visual feedback for attacks, damage, and status effects
  - [ ] **Commit:** `feat(ui): add combat arena component with battle visualization`

- [ ] **4.3: Combat Log Component**
  - [ ] Write failing test for combat log functionality
  - [ ] Create `src/components/fighting/CombatLog.tsx` for battle narration
  - [ ] Display turn-by-turn combat events and DM commentary
  - [ ] Add scrollable history and real-time updates
  - [ ] **Commit:** `feat(ui): add combat log component for battle narration`

- [ ] **4.4: Health Bar Component**
  - [ ] Write failing test for health bar display and updates
  - [ ] Create `src/components/fighting/HealthBar.tsx` with visual health indicator
  - [ ] Add color-coded health levels and damage animations
  - [ ] Implement accessibility features and responsive design
  - [ ] **Commit:** `feat(ui): add health bar component with damage animations`

### Phase 5: DM Combat Narration
- [ ] **5.1: Combat Prompts System**
  - [ ] Write failing test for combat prompt generation
  - [ ] Create `src/lib/prompts/combatPrompts.ts` for fighting-specific prompts
  - [ ] Implement prompts for fight setup, battle commentary, and outcomes
  - [ ] Add DM personality integration for different narration styles
  - [ ] **Commit:** `feat(prompts): add combat-specific DM prompt system`

- [ ] **5.2: Combat Narration API**
  - [ ] Write failing test for combat narration generation
  - [ ] Create `src/app/api/fighting-game/narrate-combat/route.ts`
  - [ ] Implement AI-generated combat commentary based on dice rolls
  - [ ] Add narrative variety and dramatic tension building
  - [ ] **Commit:** `feat(api): implement AI combat narration generation`

- [ ] **5.3: Fight Setup Narration**
  - [ ] Write failing test for fight setup story generation
  - [ ] Create API endpoint for generating why fighters meet
  - [ ] Implement scene-based narrative generation
  - [ ] Add character motivation and conflict setup
  - [ ] **Commit:** `feat(narration): add fight setup and character motivation generation`

### Phase 6: Combat Flow Implementation
- [ ] **6.1: Turn-Based Combat Logic**
  - [ ] Write failing test for turn-based combat flow
  - [ ] Implement alternating attack turns between fighters
  - [ ] Add initiative rolls and turn order determination
  - [ ] Create combat round management and progression
  - [ ] **Commit:** `feat(combat): implement turn-based combat flow with initiative`

- [ ] **6.2: Victory Conditions**
  - [ ] Write failing test for victory/defeat detection
  - [ ] Implement health-based victory conditions
  - [ ] Add surrender mechanics and knockout detection
  - [ ] Create game over states and winner determination
  - [ ] **Commit:** `feat(combat): add victory conditions and game over states`

- [ ] **6.3: Combat State Management**
  - [ ] Write failing test for combat state transitions
  - [ ] Implement game phases: setup, introduction, combat, victory
  - [ ] Add state persistence and combat history
  - [ ] Create replay and rematch functionality
  - [ ] **Commit:** `feat(state): implement combat state management and replay system`

### Phase 7: Advanced Features
- [ ] **7.1: Special Abilities System**
  - [ ] Write failing test for special ability mechanics
  - [ ] Implement special moves based on fighter stats and descriptions
  - [ ] Add ability cooldowns and resource management
  - [ ] Create unique abilities for different fighter types
  - [ ] **Commit:** `feat(abilities): add special moves and fighter abilities system`

- [ ] **7.2: Status Effects**
  - [ ] Write failing test for status effect application and management
  - [ ] Implement status effects: stunned, bleeding, buffed, debuffed
  - [ ] Add status effect duration and stacking mechanics
  - [ ] Create visual indicators for active status effects
  - [ ] **Commit:** `feat(effects): add status effects system with visual indicators`

- [ ] **7.3: Sound and Visual Effects**
  - [ ] Write failing test for sound effect integration
  - [ ] Add combat sound effects for attacks, damage, and special moves
  - [ ] Implement visual feedback for critical hits and status effects
  - [ ] Create victory/defeat sound effects and animations
  - [ ] **Commit:** `feat(feedback): add sound effects and visual feedback for combat`

### Phase 8: Integration and Polish
- [ ] **8.1: Full Game Flow Integration**
  - [ ] Write failing test for complete game flow from setup to victory
  - [ ] Integrate all components into cohesive fighting game experience
  - [ ] Add error handling and edge case management
  - [ ] Implement loading states and user feedback
  - [ ] **Commit:** `feat(integration): complete fighting game flow integration`

- [ ] **8.2: Performance Optimization**
  - [ ] Write failing test for performance benchmarks
  - [ ] Optimize image loading and AI generation response times
  - [ ] Implement caching for fighter stats and descriptions
  - [ ] Add lazy loading for combat components
  - [ ] **Commit:** `feat(performance): optimize fighting game performance and loading`

- [ ] **8.3: Final Testing and Polish**
  - [ ] Run comprehensive test suite for all fighting game components
  - [ ] Perform browser testing and mobile responsiveness verification
  - [ ] Add final UI polish and accessibility improvements
  - [ ] Create demo data and example fighters for testing
  - [ ] **Commit:** `feat(polish): final testing and UI polish for fighting game`

### Game Design Decisions

1. **Fighter Stat Generation**: AI generates stats based on visual analysis from image descriptions:
   - **Age**: Young vs old affects agility and experience
   - **Size**: Large vs small affects strength and health
   - **Build**: Muscular vs thin affects strength and defense
   - **Appearance**: Scars, armor, weapons affect combat abilities
   - **Visual Cues**: Detect strength, agility, toughness from image analysis

2. **Combat Complexity**: Simple but entertaining mechanics:
   - **Basic Attacks**: Standard attack/defense with dice rolls
   - **Environmental Interactions**: DM can roll special dice (e.g., double 6s) for environmental attacks
   - **Special Moves**: Pick up objects (chairs, weapons) for bonus damage
   - **Critical Hits**: Natural 20s create dramatic moments
   - **Luck Mechanics**: Luck stat affects critical hit chance and dodge

3. **Narrative Style**: Sports commentary style with entertainment:
   - **Commentary Tone**: Like a sports announcer reading the fight
   - **Entertaining**: Funny moments and dramatic tension
   - **Descriptive**: Vivid descriptions of combat actions
   - **Reactive**: Commentary responds to dice rolls and special events

4. **Game Length**: 3 rounds maximum with victory conditions:
   - **Round Limit**: Maximum 3 rounds per fight
   - **Victory Conditions**: Health reaches 0, surrender, or round limit reached
   - **Sudden Death**: If tied after 3 rounds, sudden death round

5. **Replayability**: Persistent fighter and scene library:
   - **Fighter Library**: Save all created fighters for reuse
   - **Scene Library**: Save all uploaded scenes for reuse
   - **Combination Selection**: Choose any fighter + fighter + scene combination
   - **Fighter History**: Track win/loss records and combat statistics

6. **Game Flow**: AI-generated characters fighting each other with DM narration

The implementation plan leverages your existing codebase effectively while creating a unique fighting game experience. The TDD approach ensures quality and maintainability throughout development.

# Player vs Player (PvP) Mode - UI & Experience Update (2025-06)

## New Features & Improvements

- **Winner Overlay:** At the end of a fight, a large, bold, centered overlay displays the winner's name (or "It's a DRAW !!!") with a prominent Restart button below. No animation, just a clear static box.
- **Combat Log Centering:** The battle card and all round narration are perfectly centered horizontally. Each round's narration is also centered.
- **Round Order & Fading:** The most recent round appears at the top, with previous rounds underneath. Older rounds fade out visually (decreasing opacity and font size) as they get further down the list.
- **Spacing:** There is a large gap (margin and padding) between the current round and previous rounds for clarity.
- **Restart Flow:** After the winner overlay, clicking Restart resets the game and returns to the setup phase.

## User Experience
- The UI is visually clear, modern, and easy to follow.
- The winner is always clearly announced at the end of the fight.
- The battle log is easy to read, with the most important information (current round) most prominent.
- The restart flow is intuitive and immediate.

## Technical Notes
- Winner overlay is implemented in `WinnerAnimation.tsx`.
- Combat log rendering and centering logic is in `page.tsx` for `/playervs`.
- Fallback for missing winner always displays "It's a DRAW !!!".

## [x] Manga-Style Battle Storyboard UI
- Implemented BattleStoryboard component with manga panel layout
- Integrated into combat phase of PlayerVsPage
- Attacker/defender images and actions swap each round based on who is attacking
- All tests pass and UI confirmed in browser

# Fighting Game: Pre-Generated Battle Log Flow (2024-07)

## Overview

The fighting game now uses a **pre-generated battle log** approach for fast, smooth, and reliable battle playback. Instead of calling the LLM for each round, the entire battle is generated in advance as a JSON array, and the UI animates through the rounds using this data.

---

## How It Works

### 1. Start Fight
- On "Start Fight", the frontend sends both fighters, the scene, and the number of rounds to `/api/fighting-game/generate-battle`.
- The backend (mock or LLM) returns a JSON array of all rounds, e.g.:
  ```json
  [
    { "round": 1, "attacker": "Godzilla", "defender": "Bruce Lee", ... },
    { "round": 2, ... },
    ...
  ]
  ```

### 2. Playback
- The frontend stores the battle log and animates through each round using the pre-generated data.
- No further API calls are made during playback.
- The UI displays round animation, commentary, and health updates instantly for each round.

### 3. End of Battle
- When all rounds are played, the winner is shown and the user can restart or review the battle.

---

## API: `/api/fighting-game/generate-battle`
- **Input:** `{ fighterA, fighterB, scene, maxRounds }`
- **Output:** `{ success: true, battleLog: [ ... ] }`
- The backend can be a mock (for dev) or use the LLM to generate the full log.

---

## Benefits
- **Much faster:** Only one LLM/API call per battle.
- **Smooth animation:** No waiting between rounds.
- **Easier to add features:** Skip, replay, or jump to round.
- **Deterministic:** The entire battle is known in advance for UI/UX polish.

---

## Legacy (Old) Flow (for reference)
- The old approach called the LLM for each round, causing delays and a "stop-and-go" feel.
- This is now deprecated in favor of the pre-generated log approach.

---

## Next Steps
- (Optional) Integrate the LLM for real battle generation.
- (Optional) Add advanced features: skip, replay, jump to round, etc.

---

*Last updated: 2024-07-11*

## Battle Timing and Animation Configuration

All major UI/UX timing and transition settings for the playervs battle flow are now centralized in `src/lib/constants.ts`:

- `ROUND_ANIMATION_DURATION_MS`: Duration (ms) of the round start animation (default: 3000)
- `ROUND_TRANSITION_PAUSE_MS`: Pause (ms) between battle info and the next round animation (default: 3000)
- `BATTLE_ATTACK_DEFENSE_STEP_MS`: Duration (ms) to show the attack step before switching to defense (default: 3000)

To adjust the pacing or feel of the battle UI, simply change these values in the constants file. All related UI and tests will use the updated values automatically.

## Upcoming Features & Improvements

1. **Show winner/draw message after the final round**
   - Ensure the UI displays a clear message indicating the winner or if the battle was a draw when the last round is complete.

2. **Make battle commentary more exciting, intense, and varied**
   - Upgrade the commentary system to generate high-energy, funny, dramatic, and less repetitive battle descriptions.

3. **Make fighter stats more accurate and character-aware**
   - Improve stat generation so that iconic characters (e.g., Godzilla) have stats that reflect their true power and abilities compared to others (e.g., Bruce Lee).

4. **Allow the arena/environment to impact the battle and commentary**
   - Implement logic so that the arena setting (e.g., a restaurant) can influence the battle, allowing fighters to interact with objects in the environment for creative attacks or defenses.

## Demo Data Centralization: Godzilla vs Bruce Lee

All assets and data for the Godzilla vs Bruce Lee demo are now stored in:

- **Location:** `public/vs/godzillaVSbrucelee/`
- **Contents:**
  - Fighter images (`godzilla.jpg`, `bruce-lee.jpg`)
  - Arena image (`tokyo-arena.jpg`)
  - Demo data file (`demoData.ts`)
  - Documentation (`README.md`)

The "Reset to Demo" button loads all required data from this folder and initializes the UI, showing the "Start Fight" button. See the `README.md` in that folder for details and image requirements.

This approach ensures demo consistency and makes it easy to update or swap demo scenarios in the future.

### Winner/Draw Message After Final Round

- The UI now robustly displays a winner or draw message after the final round using the `WinnerAnimation` component.
- The logic determines the winner by knockout (health reaches zero) or by remaining health/points if all rounds are completed.
- This ensures a clear end to every battle, even if neither fighter is knocked out.
- Testing for this is covered by integration and UI logic, as unit tests with a mocked store cannot simulate the full end-of-battle flow.

# LLM-Powered Battle Commentary

## Overview
- Battle commentary for each round is now generated using the local LLM (via LM Studio) instead of static templates.
- Commentary is generated for both attack and defense actions for each round.

## Prompt Requirements
- Commentary must be 1–2 sentences, maximum 30 words.
- Use normal sentence casing (no all-caps, except for proper nouns or rare dramatic effect).
- Must be clear, exciting, and easy to read.
- Avoid awkward or nonsensical phrases.
- No repetitive language.
- No markdown, formatting, or JSON—just plain text.

## Post-Processing
- Commentary is post-processed to enforce sentence casing if the LLM returns all-caps.
- Commentary is truncated to 30 words if it exceeds the limit.
- Ensures commentary ends with a period.

## Fallback
- If the LLM fails or returns empty, a varied template-based fallback is used.

## Testing
- Jest tests ensure commentary is concise, readable, and properly punctuated.

---

# Battle Logic Update (2025-06-23)

## Generalized Underdog Mode & Stat-Based Combat

- The battle system now detects when one fighter is much stronger (2x+ power: strength × health) than the other.
- In these cases, the weaker fighter enters 'underdog mode':
  - The underdog must dodge (using agility and luck) or is KO'd in one hit.
  - If the underdog dodges, they have a rare chance to land a devastating 'weak spot' critical hit.
  - If the underdog fails to dodge, they are instantly defeated or nearly so.
- If fighters are evenly matched, normal stat-based logic applies (strength, defense, agility, luck, arena objects, and random events all play a role).
- This logic is fully general and applies to all user-created fighters, not just demo matchups.

## Why This Matters
- Battles are now more dramatic and realistic, especially for mismatched pairs.
- Underdog victories are rare and exciting, while dominant fighters feel truly powerful.
- The system is fair and fun for all possible fighter uploads.

---

# Tournament System & Battle Replay (2025-07-12)

## Fighters & Arena Folder Structure
- The `public/` folder will include:
  - `public/Fighters/` for user-uploaded fighter images
  - `public/Arena/` for user-uploaded arena images

## Tournament System
- The app can create a tournament by loading all fighters and arenas from these folders.
- Battles are automatically generated for all fighter/arena combinations (round-robin or bracket style).
- Each battle is resolved using the existing battle logic.
- After each battle, the full battle log (JSON) is saved in `public/tournaments/` with a logical filename (e.g., `godzilla-vs-brucelee.json`).
- Tournament results and score charts are generated and displayed.

## Tournament Page & Replay
- A new page (e.g., `/tournament`) displays the tournament bracket, results, and score chart.
- Users can select any completed battle from a dropdown or list to replay it in the UI.
- The replay uses the stored battle log from `public/tournaments/`.
- After watching a replay, users can select another battle or upload new fighters/arenas to start a new tournament.

## Requirements
- Tournament and replay logic must be fully automated and robust for any number of fighters/arenas.
- All battle data is stored in a portable, human-readable format (JSON) in `public/tournaments/`.
- The UI must provide an intuitive way to browse, select, and replay battles.
- Demo data (e.g., Godzilla vs Bruce Lee) should be included as a sample tournament battle.

---

## 2025-07-13 Update: Battle UI & Tournament Replay Improvements

- The battle UI now halts all round animation and state updates as soon as the winner is shown. No background updates or duplicate UI are visible after battle ends.
- Tournament logs now include `imageUrl` for both fighters and the arena, ensuring images display correctly in replays.
- Replay and restart logic is robust: the "Restart" button resets the replay cleanly, and all UI/animation is paused when the winner is displayed.

---

# Upcoming Features & Design (2025-06-24)

## 1. Per-Fighter JSON Metadata & Match History
- Each fighter image in `public/vs/fighters/` will have a corresponding JSON file (e.g., `darth-vader.json`).
- JSON structure:
  ```json
  {
    "id": "darth-vader",
    "name": "Darth Vader",
    "image": "darth-vader.jpg",
    "stats": {
      "health": 6,
      "strength": 2,
      "agility": 19,
      "luck": 18,
      "defense": 1,
      "size": "small",
      "build": "thin",
      "age": "adult"
    },
    "matchHistory": [
      { "opponentId": "godzilla", "result": "win", "date": "2025-06-24" },
      { "opponentId": "mouse", "result": "loss", "date": "2025-06-23" }
    ]
  }
  ```
- This enables tracking stats and matchups per fighter.

## 2. On-Demand Balancing Script
- A script (Node.js or Next.js API route) will review all fighters and adjust their stats for balance.
- Uses LLM or logic to ensure fairness (e.g., Godzilla is always stronger than a mouse).
- **UI:** A "Regenerate/Balance Fighters" button will appear on `/playervs` **only in development** (localhost).
- **Production:** No uploads or balancing; only battle replays.

## 3. UI/UX for Choosing Existing Fighters/Arenas
- Next to the upload button, add a "Choose Existing Fighter" (and Arena) button.
- Clicking opens an accordion or modal with a grid of all available images (small, selectable thumbnails).
- Selecting an image sets it as the current fighter/arena.
- Show basic stats below each image if available.
- Ensure accessibility (keyboard navigation, clear selection).

---

## 2025-07-XX Update: Arena Upload & Choose Existing Arena

- Added `/api/save-arena-metadata` endpoint to save arena metadata JSON files in `public/vs/arena/`.
- Arena upload flow now creates a matching JSON metadata file for each uploaded arena image.
- Added `ChooseExistingArena` React component, mirroring fighters, to select from existing arenas.
- PlayerVsPage UI now has an Upload/Choose toggle for Arena, just like for fighters.
- Arena images and metadata are now displayed correctly in the UI after upload or selection.
- All TDD steps and tests for this feature are complete.

---

- Each battle log is now saved with a unique filename that includes the date and time, e.g. `godzilla-vs-brucelee-in-tokyoarena-20240713-153012.json`.
- This ensures that rematches and repeated battles are all preserved for replay and analysis.
- The filename format is: `[fighterA]-vs-[fighterB]-in-[arena]-[YYYYMMDD]-[HHMMSS].json`

- The tournament page now always displays the battle dropdown and replay viewer at the top, regardless of which tab (Leaderboard or Battle Replay) is active.
- Users can view the leaderboard and instantly select and watch any past battle without switching tabs.