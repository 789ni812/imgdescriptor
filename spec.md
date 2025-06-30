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

- [ ] **17.4: Character Initialization System**
  - Create character initialization based on first image description
  - Implement character generation from AI analysis
  - Write tests for character initialization logic
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

### Phase 20: Turn-Based Game System
**Objective:** Implement a 3-turn system for continuing the story with new images.

#### Tasks
- [x] **20.1: Implement Turn Management**
  - Turn state management (`currentTurn`, `incrementTurn`, reset) implemented in character store
  - Turn counter and validation logic (max 3 turns, UI disables upload and shows message)
  - Tests for turn management system in `characterStore.test.ts`
  - **Completed 2025-06-24**
  - **Commit:** `feat(game): implement turn-based game system`

- [x] **20.2: Create Turn Display Component**
  - Turn display is implemented in `CharacterStats` (header) and shows current turn in the UI
  - Also shown as `Turn {character.currentTurn}/3` in the header for clarity
  - **Completed 2025-06-24**
  - **Commit:** `feat(ui): add turn counter component`

- [x] **20.3: Update Story Generation for Turns**
  - Story generation prompt now includes turn number, character stats, and previous story context
  - Refactored prompt construction into a pure function for TDD
  - Fully tested with unit and integration tests
  - **Completed 2025-06-24**
  - **Commit:** `feat(story): update story generation for turn-based gameplay`

- [x] **20.3.1: Add 3-Turn Mock Data for Story Evolution**
  - Create 3 sets of mocked image descriptions (one for each turn)
  - Create 3 sets of mocked story generations that build upon each other
  - Update mock system to return different data based on current turn
  - Write tests for turn-based mock data selection
  - **Completed 2025-06-24**
  - **Commit:** `feat(mocks): add 3-turn mock data for story evolution testing`

- [x] **20.4: Implement Turn Validation**
  - Image upload is disabled after 3 turns (turn limit enforced in UI)
  - User sees a clear message when turns are exhausted
  - Tests in page.test.tsx verify upload is disabled and message is shown
  - **Completed 2025-06-24**
  - **Commit:** `feat(game): implement turn validation and game end logic`

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
- [ ] **XX.1: Design TurnCard Component**
  - Create a new `TurnCard` component that encapsulates all per-turn data:
    - Image for the turn
    - Image description (in an accordion section)
    - Story (in an accordion section, with loader/spinner if generating)
    - Choices (only for the current turn, in an accordion section, with loader if generating)
    - Character stats snapshot for that turn (optional, if useful)
    - User's selected choice and outcome (after selection)
  - Ensure the card is visually distinct and clearly labeled with the turn number.

- [ ] **XX.2: Remove Redundant Global Components**
  - Remove or hide the global image description, story, and choice components from the main layout.
  - Ensure all relevant info is only shown within the appropriate `TurnCard`.

- [ ] **XX.3: Contextual Component Visibility**
  - Only show the choices section for the current turn's card.
  - After a choice is made, minimize (not remove) the accordion for that turn's choices, so the information is still accessible but not expanded by default.
  - For previous turns, show only the summary (image, description, story, selected choice/outcome), with all accordions minimized except for the current turn.

- [ ] **XX.4: Improved Loading Feedback**
  - When generating a story or choices, show a loader/spinner only in the relevant card's section (not globally or in previous turns).
  - Prevent old stories from being shown in the new turn's card while loading.

- [ ] **XX.5: Final Story Card**
  - After the last turn, show a single, dedicated card at the end:
    - "Generate Final Story" button
    - Final story output (with markdown rendering)
    - Any relevant summary or stats

- [ ] **XX.6: Responsive and Accessible Design**
  - Ensure the new card-based layout is responsive and works well on all screen sizes.
  - Ensure all interactive elements are accessible (keyboard, screen reader, etc.).

- [ ] **XX.7: Update Tests and Documentation**
  - Update or add tests for the new card-based UI and component visibility logic.
  - Update documentation and screenshots to reflect the new UI/UX.