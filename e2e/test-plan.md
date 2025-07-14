# E2E Test Plan for PlayerVs and Tournament Pages

## Overview
This document outlines the end-to-end (E2E) test scenarios for the fighting game app, focusing on critical user flows, error handling, and regression prevention using Playwright.

## Test Strategy
- **TDD Approach**: Write failing E2E tests first, then implement/fix features, then refactor
- **User-Centric**: Focus on real user interactions and visible behaviors
- **Cross-Browser**: Test on Chromium, Firefox, and WebKit
- **CI Integration**: Run tests on every PR/merge to catch regressions

---

## PlayerVs Page (`/playervs`) Tests

### 1. Basic Page Load & Setup
**Priority: High**
- [x] Page loads and shows header
- [x] Start Fight button is visible
- [ ] Demo fighters (Godzilla, Bruce Lee) are pre-loaded
- [ ] Demo arena is pre-loaded
- [ ] Rebalance Fighters button is visible

### 2. Fighter Upload Flow
**Priority: High**
- [ ] Upload new fighter image for Fighter A
- [ ] Upload new fighter image for Fighter B
- [ ] Verify fighter stats are generated and displayed
- [ ] Verify fighter metadata JSON is saved
- [ ] Handle upload errors gracefully

### 3. Choose Existing Fighter Flow
**Priority: High**
- [ ] Switch to "Choose Existing" mode for Fighter A
- [ ] Select existing fighter from grid
- [ ] Verify fighter stats are loaded correctly
- [ ] Switch back to "Upload New" mode
- [ ] Repeat for Fighter B

### 4. Arena Upload & Selection
**Priority: High**
- [ ] Upload new arena image
- [ ] Verify arena metadata is saved
- [ ] Choose existing arena from grid
- [ ] Handle arena upload errors

### 5. Rebalance Fighters Flow
**Priority: Medium**
- [ ] Click "Rebalance Fighters" button
- [ ] Verify loading state is shown
- [ ] Verify success message with fighter count
- [ ] Verify fighter results are displayed
- [ ] Verify error handling for API failures
- [ ] Verify message auto-clears after timeout

### 6. Battle Generation & Combat Flow
**Priority: High**
- [ ] Start fight with valid fighters and arena
- [ ] Verify battle generation loading state
- [ ] Verify battle commentary appears
- [ ] Verify health bars update during combat
- [ ] Verify winner animation shows
- [ ] Verify return to setup phase after battle

### 7. Error Handling
**Priority: High**
- [ ] Start fight without fighters (should show error)
- [ ] Start fight without arena (should show error)
- [ ] Handle battle generation API failures
- [ ] Verify error messages are user-friendly
- [ ] Verify error messages auto-clear

### 8. Reset & Demo Data
**Priority: Medium**
- [ ] Click "Reset to Demo" button
- [ ] Verify demo fighters and arena are loaded
- [ ] Verify page returns to setup phase

---

## Tournament Page (`/tournament`) Tests

### 1. Basic Page Load
**Priority: High**
- [ ] Page loads and shows tournament interface
- [ ] Leaderboard is visible
- [ ] Battle replay section is visible
- [ ] Tournament hub controls are functional

### 2. Leaderboard Functionality
**Priority: High**
- [ ] Leaderboard displays fighter statistics
- [ ] Sort by different columns (wins, losses, win rate, etc.)
- [ ] Filter by fighter name
- [ ] Pagination works correctly
- [ ] Empty state when no battles exist

### 3. Battle Replay System
**Priority: High**
- [ ] Select battle from leaderboard
- [ ] Battle replay loads and plays
- [ ] Commentary is displayed during replay
- [ ] Fighter stats are shown correctly
- [ ] Replay controls work (play, pause, restart)
- [ ] Multiple battles can be replayed

### 4. Tournament Hub Controls
**Priority: Medium**
- [ ] Generate new tournament
- [ ] Select tournament from dropdown
- [ ] Tournament metadata is displayed
- [ ] Hub controls are responsive

### 5. Responsive Layout
**Priority: Medium**
- [ ] Layout adapts to different screen sizes
- [ ] Leaderboard columns don't clip on wide screens
- [ ] Mobile layout is usable
- [ ] No horizontal scrolling on desktop

---

## Cross-Page Integration Tests

### 1. Data Consistency
**Priority: High**
- [ ] Fighter stats match between playervs and tournament
- [ ] Battle results are consistent across pages
- [ ] Rebalanced fighters appear correctly in tournament

### 2. Navigation & State
**Priority: Medium**
- [ ] Navigation between pages preserves state
- [ ] Browser refresh maintains current view
- [ ] Back/forward buttons work correctly

---

## Performance & Reliability Tests

### 1. Loading Performance
**Priority: Medium**
- [ ] Page loads within acceptable time (< 3 seconds)
- [ ] Battle generation completes within timeout
- [ ] Large leaderboards load efficiently

### 2. Error Recovery
**Priority: High**
- [ ] App recovers from network errors
- [ ] Partial data loads gracefully
- [ ] Retry mechanisms work for failed operations

---

## Test Implementation Order

### Phase 1: Core Functionality (Week 1)
1. Basic page loads
2. Fighter upload/selection
3. Arena upload/selection
4. Battle generation and combat

### Phase 2: Error Handling (Week 2)
1. Error scenarios for all flows
2. User-friendly error messages
3. Recovery mechanisms

### Phase 3: Advanced Features (Week 3)
1. Rebalance fighters flow
2. Tournament leaderboard
3. Battle replay system

### Phase 4: Polish & Integration (Week 4)
1. Cross-page integration
2. Performance tests
3. Responsive design tests

---

## Test File Structure
```
e2e/
├── playervs.spec.ts          # PlayerVs page tests
├── tournament.spec.ts        # Tournament page tests
├── integration.spec.ts       # Cross-page tests
├── performance.spec.ts       # Performance tests
└── test-plan.md             # This file
```

---

## Success Criteria
- All critical user flows work across browsers
- Error handling is robust and user-friendly
- Performance meets acceptable thresholds
- No regressions introduced during development
- CI pipeline catches issues before merge

---

## Notes
- Use Playwright's built-in waits and selectors for robust tests
- Focus on user-visible behavior, not implementation details
- Maintain both Jest (unit/component) and Playwright (E2E) test suites
- Update tests when UI/UX changes
- Document any test-specific setup requirements 