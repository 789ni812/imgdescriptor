# Project Specification: Image Analysis with LM Studio

## Current Status: In Progress (Phase 2)
- **Phase 1: Setup & Basic Structure** - ✅ **Complete**
- **Next Step:** Start building core components using TDD, beginning with `ImageUpload`.

---

## Project Overview
A Next.js application that allows users to upload images and get AI-generated descriptions using the LM Studio SDK with the `google/gemma-3-12b` model.

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

### Phase 3: LM Studio Integration - ⚪ **Not Started**
1.  ⚪ Set up LM Studio client
2.  ⚪ Implement API route for image analysis
3.  ⚪ Connect frontend to backend

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

### Phase 6: AI Story Generation - ⚪ **Not Started**
1.  **Backend Story Generation:**
    *   ⚪ Create a new API route at `/api/generate-story`.
    *   ⚪ This route will accept an `{ description: string }` payload.
    *   ⚪ It will call the second LM Studio model with a specific story-generation prompt.
2.  **Frontend UI Components:**
    *   ⚪ Create a new `StoryDisplay.tsx` component to show the generated story, including its own distinct loading and error states.
    *   ⚪ Create a "Generate Story" button component that is only visible after a description is successfully loaded.
    *   ⚪ Write Jest tests for the new components following our TDD workflow.
3.  **Frontend Integration:**
    *   ⚪ Add new state variables in `page.tsx` for the story content, loading status, and any potential errors (`story`, `isStoryLoading`, `storyError`).
    *   ⚪ Update `page.tsx` to call the `/api/generate-story` endpoint when the new button is clicked.
    *   ⚪ Modify the page layout to display the `StoryDisplay` component on the right-hand side, below the image description.
4.  **Final Testing:**
    *   ⚪ Perform end-to-end testing of the full image-to-description-to-story workflow.
    *   ⚪ Commit the completed feature to GitHub.

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