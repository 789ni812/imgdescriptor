# Skipped Tests Analysis & TODO List

This document lists all currently skipped tests in the codebase with analysis and recommendations.

---

## Analysis Summary

**Total Skipped Tests:** 11 tests across 2 files

---

## src/lib/stores/characterStore.test.ts

### 1. **should persist character state in localStorage**
- **File:** `src/lib/stores/characterStore.test.ts`, line 420
- **Status:** ✅ **KEEP SKIPPED** - Recommended
- **Reasoning:** 
  - The characterStore **does use Zustand persist** with localStorage (confirmed in code)
  - The test is correctly skipped due to known limitations with zustand persist and jsdom/localStorage in test environments
  - The comment in the test explains this: "Skipping persist/localStorage test due to known limitation with zustand persist in test environment"
  - This is a common issue and the skip is justified
- **Action:** Keep skipped - this is the correct approach

---

## src/components/ui/MarkdownRenderer.test.tsx

### 2-11. **All Markdown Rendering Tests** (10 tests)
- **File:** `src/components/ui/MarkdownRenderer.test.tsx`, lines 21, 30, 39, 53, 65, 77, 86, 95, 104, 132
- **Status:** ⚠️ **NEEDS INVESTIGATION** - Consider fixing
- **Tests:**
  - should render bold text correctly
  - should render italic text correctly  
  - should render headings correctly
  - should render lists correctly
  - should render numbered lists correctly
  - should render code blocks correctly
  - should render inline code correctly
  - should render links correctly
  - should render blockquotes correctly
  - should render complex markdown combinations

- **Reasoning:**
  - The tests are skipped due to "ESM/Jest limitations with react-markdown"
  - The component uses `react-markdown` which is an ESM module
  - The mock in the test file shows: `jest.mock('react-markdown', () => ({ __esModule: true, default: ({ children }) => <div>{children}</div> }))`
  - This mock renders children as plain text, so the markdown-specific tests can't work
  - **However:** These are important functionality tests for a markdown renderer

- **Recommendations:**
  1. **Option A (Recommended):** Fix the Jest configuration to properly handle ESM modules
  2. **Option B:** Create integration tests that run in a real browser environment
  3. **Option C:** Remove the tests if markdown rendering is not critical
  4. **Option D:** Keep skipped if the functionality works in the browser

---

## Recommendations

### High Priority
1. **Investigate MarkdownRenderer tests** - These test important functionality and should be fixed if possible

### Low Priority  
1. **Keep localStorage test skipped** - This is correctly skipped due to technical limitations

### Next Steps
1. Research Jest ESM module handling for react-markdown
2. Consider using `@testing-library/jest-dom` matchers for markdown testing
3. Test markdown functionality manually in browser to ensure it works
4. If markdown rendering is critical, prioritize fixing the Jest configuration

---

**Decision Matrix:**
- ✅ **Keep Skipped:** 1 test (localStorage - technical limitation)
- ⚠️ **Needs Investigation:** 10 tests (MarkdownRenderer - ESM/Jest issue)
- ❌ **Remove:** 0 tests 