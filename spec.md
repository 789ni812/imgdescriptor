# Project Specification: Image Analysis with LM Studio

## Current Status: Complete ✅
- **Phase 1: Setup & Basic Structure** - ✅ **Complete**
- **Phase 2: Core Components** - ✅ **Complete**
- **Phase 3: LM Studio Integration** - ✅ **Complete**
- **Phase 4: Polish & Testing** - ✅ **Complete**
- **Phase 5: Enhanced Description Display** - ✅ **Complete**
- **Phase 6: AI Story Generation** - ✅ **Complete**
- **Phase 7: UI/UX Overhaul** - ⚪ Not Started

---

## Project Overview
A Next.js application that allows users to upload images and get AI-generated descriptions using the LM Studio SDK with the `google/gemma-3-12b` model, plus AI-generated stories based on those descriptions.

## Technical Stack
- **Framework**: Next.js 14 with TypeScript
- **AI Integration**: LM Studio SDK for TypeScript
- **Model**: `google/gemma-3-12b`
- **Styling**: Tailwind CSS for modern minimal design
- **Image Handling**: Client-side upload with preview
- **Backend**: Next.js API routes

## Core Features

### 1. Image Upload Interface
- **Drag & Drop Zone**: Visual drop area with dashed border
- **File Picker Button**: Traditional file selection
- **Supported Formats**: JPG, PNG, WebP
- **File Size Limit**: 10MB (configurable)
- **Preview**: Show uploaded image immediately

### 2. Image Analysis
- **Model**: `google/gemma-3-12b` (fixed)
- **Prompt**: Your existing image description prompt
- **Processing**: Show loading state during analysis
- **Error Handling**: Display user-friendly error messages

### 3. Layout & Design
- **Modern Minimal**: Clean, uncluttered interface
- **Two-Column Layout**: 
  - Left: Upload area and image preview
  - Right: Generated description
- **Responsive**: Mobile-friendly design
- **Loading States**: Skeleton loaders and spinners

## File Structure
```
/app
  /api
    /analyze-image/route.ts          # API endpoint for image analysis
  /components
    /ui
      Button.tsx                     # Reusable button component
      LoadingSpinner.tsx             # Loading indicator
      ErrorMessage.tsx               # Error display component
    ImageUpload.tsx                  # Main upload component
    ImagePreview.tsx                 # Image display component
    DescriptionDisplay.tsx           # Description output component
  /lib
    lmstudio-client.ts              # LM Studio client configuration
    types.ts                        # TypeScript type definitions
  /styles
    globals.css                     # Global styles
  layout.tsx                        # Root layout
  page.tsx                          # Main page component
```

## API Design

### POST /api/analyze-image
**Request:**
```typescript
{
  image: File (base64 encoded),
  prompt: string (your existing prompt)
}
```

**Response:**
```typescript
{
  success: boolean,
  description?: string,
  error?: string
}
```

## Component Specifications

### ImageUpload Component
- Drag & drop functionality
- File validation
- Preview generation
- Upload button
- Error handling for invalid files

### ImagePreview Component
- Display uploaded image
- Responsive sizing
- Loading state while processing

### DescriptionDisplay Component
- Show generated description
- Loading state during analysis
- Error message display
- Copy-to-clipboard functionality

## Error Handling
- **Network Errors**: "Unable to connect to LM Studio"
- **Model Errors**: "Model not available or loaded"
- **File Errors**: "Invalid file format or size"
- **General Errors**: "Something went wrong. Please try again."

## Development Phases

### Phase 1: Setup & Basic Structure - ✅ **Complete**
1.  ✅ Create Next.js project with TypeScript
2.  ✅ Install dependencies (LM Studio SDK, Tailwind CSS)
3.  ✅ Set up basic layout and routing
4.  ✅ Configure and verify Jest TDD environment
5.  ✅ Push initial setup to GitHub

### Phase 2: Core Components - ✅ **Complete**
1.  ✅ Implement image upload functionality
2.  ✅ Create image preview component
3.  ✅ Build description display component

### Phase 3: LM Studio Integration - ✅ **Complete**
1.  ✅ Set up LM Studio client
2.  ✅ Implement API route for image analysis
3.  ✅ Connect frontend to backend

### Phase 4: Polish & Testing - ✅ **Complete**
1.  ✅ Add error handling
2.  ✅ Implement loading states
3.  ✅ Test with various image types
4.  ✅ Responsive design testing

### Phase 5: Enhanced Description Display - ✅ **Complete**
1.  ✅ **Parse and Structure Description**: Instead of a single text block, parse the description string based on the `**Category:**` markers.
2.  ✅ **Implement Markdown Rendering**: Use a library like `react-markdown` to render the parsed sections, turning `**...**` into bold text.
3.  ✅ **Refine Component Layout**: Display the categories and their corresponding text in a clean, readable, structured format (e.g., labeled sections or cards).
4.  ✅ **Add "Copy to Clipboard" Feature**: Implement a button to allow the user to copy the raw description text.

### Phase 6: AI Story Generation - ✅ **Complete**
1.  **Backend Story Generation:**
    *   ✅ Create a new API route at `/api/generate-story`.
    *   ✅ This route will accept an `{ description: string }` payload.
    *   ✅ It will call the second LM Studio model with a specific story-generation prompt.
2.  **Frontend UI Components:**
    *   ✅ Create a new `StoryDisplay.tsx` component to show the generated story, including its own distinct loading and error states.
    *   ✅ Create a "Generate Story" button component that is only visible after a description is successfully loaded.
    *   ✅ Write Jest tests for the new components following our TDD workflow.
3.  **Frontend Integration:**
    *   ✅ Add new state variables in `page.tsx` for the story content, loading status, and any potential errors (`story`, `isStoryLoading`, `storyError`).
    *   ✅ Update `page.tsx` to call the `/api/generate-story` endpoint when the new button is clicked.
    *   ✅ Modify the page layout to display the `StoryDisplay` component on the right-hand side, below the image description.
4.  **Final Testing:**
    *   ✅ Perform end-to-end testing of the full image-to-description-to-story workflow.
    *   ✅ Commit the completed feature to GitHub.

### Phase 7: UI/UX Overhaul - ⚪ Not Started

#### Vision
Transform the application from a functional prototype into a polished, professional, and intuitive tool. The design should be clean, modern, and engaging, making the powerful AI capabilities feel accessible and delightful. Focus on clarity, visual hierarchy, and providing clear user feedback at every step.

#### Plan & Tasks

**Part 1: Foundational Styling & Layout**
- [x] Define a professional color palette and modern typography (e.g., Inter from Google Fonts)
- [x] Integrate the new font and color palette into Tailwind config and global styles
- [x] Create a consistent App Shell with Header and Footer components
- [x] Refine the main layout using card components for clear separation

**Part 2: Redesigning the Core User Journey**
- [x] **Task 7.3: Overhaul `ImageUpload` Component:**
  - [x] Rewrite test `ImageUpload.test.tsx` for a custom dropzone UI.
  - [x] Implement a custom dropzone with an icon and styled button using `react-dropzone`.
  - [x] Ensure all file handling logic (validation, selection) still passes.
- [ ] **Task 7.4: Refine `ImagePreview` Component:**
  - [ ] Redesign the component to have a cleaner, more modern look.
  - [ ] Add a "Remove Image" button.
- [ ] **Task 7.5: Refine `DescriptionDisplay` and `StoryDisplay` Components:**
  - [ ] Style these components to look like distinct "cards".
  - [ ] Improve loading and error state visuals.

**Part 3: Mobile Responsiveness & Polish**
- [ ] Make the layout fully responsive, stacking columns on mobile
- [ ] Adjust padding, font sizes, and spacing for mobile screens
- [ ] Ensure all interactive elements have clear hover, focus, and disabled states

#### Best Practices
- Use Tailwind CSS for all styling and responsive design
- Keep components small, focused, and reusable
- Use semantic HTML and accessible ARIA attributes where appropriate
- Write minimal, clean code for each task, avoiding over-engineering
- Use TDD: Write a failing Jest test for each new UI feature or state before implementation
- Refactor after tests pass, ensuring code remains simple and maintainable

## Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@lmstudio/sdk": "^1.0.0",
    "tailwindcss": "^3.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "jest": "...",
    "@testing-library/react": "...",
    "@testing-library/jest-dom": "...",
    "jest-environment-jsdom": "..."
  }
}
```

## Prerequisites
- Node.js installed
- LM Studio running with `google/gemma-3-12b` model loaded
- Git Bash terminal (as per your preference)

## Requirements Clarified
1. **Image Upload**: Drag & drop + file picker button
2. **LM Studio Model**: `google/gemma-3-12b` (fixed)
3. **Prompt**: User's existing image description prompt
4. **Design**: Modern minimal, image left, description right
5. **Error Handling**: Basic error messages displayed on screen
6. **Additional Features**: None at this stage 