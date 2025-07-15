# End-to-End (E2E) Test Suite

This directory contains comprehensive E2E tests for the AI Image Describer application using Playwright.

## Test Coverage

### 🏆 Tournament System (`tournament.spec.ts`)
- **Tournament Creation**: Complete flow from fighter selection to tournament creation
- **Tournament Execution**: Battle execution with LLM commentary and winner determination
- **Bracket Visualization**: Tournament bracket display and navigation
- **Tournament Completion**: Champion announcement and final results
- **Navigation**: Tab switching and state management

### 📊 Leaderboard System (`leaderboard.spec.ts`)
- **Leaderboard Display**: Fighter statistics, win rates, and rankings
- **Sorting Functionality**: Sort by win rate, damage dealt, rounds survived
- **Battle Replays**: Loading and displaying saved battle replays
- **Replay Playback**: Full battle replay with commentary and animations
- **Empty States**: Handling when no data is available
- **Refresh Functionality**: Manual data refresh

### ⚔️ Battle Arena (`battle-arena.spec.ts`)
- **Fighter Selection**: Upload new vs choose existing fighters
- **Arena Selection**: Arena upload and selection
- **Battle Execution**: Complete battle flow with health tracking
- **Rebalance System**: Fighter stat rebalancing
- **Demo Mode**: Pre-loaded demo fighters and arenas
- **Error Handling**: API failures and edge cases
- **Health Bars**: Battle UI elements and health tracking

### 🎮 Player vs Player (`playervs.spec.ts`)
- **Setup Phase**: Initial page load and fighter/arena selection
- **Battle Flow**: Complete battle execution with animations
- **Round History**: Battle commentary and round-by-round display
- **Winner Determination**: Health-based winner calculation

## Running Tests

### Prerequisites
```bash
# Install Playwright browsers
npm run test:e2e:install
```

### Test Commands
```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run all tests (unit + E2E)
npm run test:all
```

### Running Specific Test Files
```bash
# Run only tournament tests
npx playwright test tournament.spec.ts

# Run only leaderboard tests
npx playwright test leaderboard.spec.ts

# Run only battle arena tests
npx playwright test battle-arena.spec.ts

# Run only playervs tests
npx playwright test playervs.spec.ts
```

### Running Specific Test Cases
```bash
# Run a specific test by name
npx playwright test -g "tournament execution works correctly"

# Run tests matching a pattern
npx playwright test -g "tournament"
```

## Test Configuration

### Playwright Config (`playwright.config.ts`)
- **Browsers**: Chrome, Firefox, Safari
- **Timeout**: 30 seconds per test
- **Base URL**: http://localhost:3000
- **Headless**: Enabled by default
- **Trace**: Enabled on first retry

### Test Structure
Each test file follows this pattern:
1. **Setup**: Mock APIs and navigate to page
2. **Action**: Perform user interactions
3. **Assertion**: Verify expected outcomes
4. **Cleanup**: Reset state if needed

## Mocking Strategy

### API Mocking
Tests use Playwright's route interception to mock API responses:
```typescript
await page.route('**/api/tournaments/list', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData)
  });
});
```

### Mock Data
- **Fighters**: Bruce Lee, Victor Moreau, Godzilla
- **Arenas**: Goth Restaurant, Tokyo Streets
- **Battles**: Pre-generated battle logs with commentary
- **Tournaments**: Sample tournament data with brackets

## Test Data Management

### Test Isolation
- Each test is independent
- No shared state between tests
- Clean page navigation for each test
- Mocked APIs prevent external dependencies

### Data Validation
- Verify fighter statistics display correctly
- Check battle commentary appears
- Validate tournament brackets render
- Confirm leaderboard sorting works

## Debugging Tests

### Visual Debugging
```bash
# Run with UI for step-by-step debugging
npm run test:e2e:ui

# Run in headed mode to see browser
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug
```

### Console Logging
Tests include console logging for debugging:
```typescript
page.on('console', msg => {
  console.log('BROWSER LOG:', msg.type(), msg.text());
});
```

### Screenshots
Tests automatically capture screenshots on failure:
- Stored in `test-results/` directory
- Named with test name and timestamp
- Helpful for debugging visual issues

## Best Practices

### Test Reliability
- Use `waitForLoadState('networkidle')` for page loads
- Add appropriate timeouts for async operations
- Mock external APIs to ensure consistent results
- Use data-testid attributes for reliable element selection

### Test Maintainability
- Keep tests focused on single functionality
- Use descriptive test names
- Group related tests in describe blocks
- Reuse common setup code

### Performance
- Tests run in parallel across browsers
- Mock heavy operations (LLM calls, file uploads)
- Use efficient selectors (data-testid preferred)
- Minimize unnecessary waits

## Continuous Integration

### GitHub Actions
Tests can be integrated into CI/CD:
```yaml
- name: Run E2E Tests
  run: npm run test:e2e
```

### Pre-commit Hooks
Consider running E2E tests before deployment:
```bash
npm run test:all
```

## Troubleshooting

### Common Issues
1. **Timeout Errors**: Increase timeout or add explicit waits
2. **Element Not Found**: Check data-testid attributes
3. **API Errors**: Verify mock data structure
4. **Browser Issues**: Update Playwright browsers

### Debug Commands
```bash
# Show test results
npx playwright show-report

# Install specific browser
npx playwright install chromium

# Update Playwright
npm update @playwright/test
```

## Test Coverage Summary

| Feature | Test Coverage | Status |
|---------|---------------|--------|
| Tournament Creation | ✅ Complete | Ready |
| Tournament Execution | ✅ Complete | Ready |
| Leaderboard Display | ✅ Complete | Ready |
| Battle Replays | ✅ Complete | Ready |
| Fighter Selection | ✅ Complete | Ready |
| Arena Selection | ✅ Complete | Ready |
| Battle Execution | ✅ Complete | Ready |
| Error Handling | ✅ Complete | Ready |
| Navigation | ✅ Complete | Ready |

All major user flows are covered with comprehensive E2E tests ensuring the application works correctly across different browsers and scenarios. 