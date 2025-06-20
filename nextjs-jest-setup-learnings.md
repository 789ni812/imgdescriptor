# Next.js + Jest Setup Learnings (Windows + Git Bash)

This document summarizes the key steps, pitfalls, and solutions for setting up a Next.js project with Jest and Testing Library in a Windows environment using Git Bash. Use this as a checklist and troubleshooting guide for future projects.

---

## 1. Project Initialization
- Use Git Bash for all commands (not PowerShell or CMD).
- Create your Next.js app with TypeScript:
  ```bash
  npx create-next-app@latest . --typescript --eslint --src-dir --app --no-tailwind --import-alias "@/*"
  ```
- Or create in a subfolder and `cd` into it before running further commands.

## 2. Install Tailwind CSS (if needed)
- Install dependencies:
  ```bash
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```
- Update `tailwind.config.ts` content paths for `src` structure.
- Add Tailwind directives to `src/app/globals.css`.

## 3. Install Jest and Testing Libraries
- Install all required dev dependencies:
  ```bash
  npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-node
  ```

## 4. Jest Configuration
- Use a JavaScript config file (`jest.config.js`) for maximum compatibility:
  ```js
  const nextJest = require('next/jest.js');
  const createJestConfig = nextJest({ dir: './' });
  const config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };
  module.exports = createJestConfig(config);
  ```
- Do **not** use the `ts-jest` preset; Next.js handles TypeScript.

## 5. Jest Setup File
- Create `jest.setup.ts`:
  ```ts
  import '@testing-library/jest-dom';
  ```

## 6. npm Scripts
- In `package.json`, use the following scripts for robust local resolution:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "npx --no jest",
    "test:watch": "npx --no jest --watch"
  }
  ```
- The `--no` flag for `npx` forces it to use the local `jest` package.

## 7. Running Tests
- Always run tests from the project root (where `package.json` is):
  ```bash
  npm test -- src/components/ui/Button.test.tsx
  ```
- If you see module not found errors, ensure all dependencies are installed and you are in the correct directory.

## 8. Troubleshooting
- If Jest or dependencies are not found, run:
  ```bash
  rm -rf node_modules package-lock.json
  npm cache clean --force
  npm install
  ```
- If you see PowerShell execution policy errors, always use Git Bash for npm commands.
- If you see `jest-environment-jsdom` errors, install it as a dev dependency.
- If you see `@testing-library/jest-dom` or `@testing-library/react` errors, install them as dev dependencies.

## 9. General Advice
- Always check your current directory before running npm scripts.
- Use only one terminal type (preferably Git Bash) for all commands in a project.
- Document any additional quirks or fixes in this file for future reference.

---

**With this checklist, you can quickly and reliably set up a Next.js + Jest project on Windows using Git Bash, and avoid the most common pitfalls.** 