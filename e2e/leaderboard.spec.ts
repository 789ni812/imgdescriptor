import { test, expect } from '@playwright/test';

test.describe('Leaderboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard');
  });

  test('should display the main page layout and navigation', async ({ page }) => {
    // Check main page elements
    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();
    await expect(page.getByText('Fighter Rankings and Statistics')).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: 'Tournament' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Battle Arena' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Player vs Player' })).toBeVisible();
  });

  test('should display leaderboard table', async ({ page }) => {
    // Check leaderboard table
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    
    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Rank' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Fighter' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Wins' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Losses' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Win Rate' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total Battles' })).toBeVisible();
  });

  test('should display fighter entries in leaderboard', async ({ page }) => {
    // Check that fighter rows are displayed
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    
    // Check for fighter entries (if any exist)
    const fighterRows = page.locator('[data-testid^="fighter-row-"]');
    await expect(fighterRows.first()).toBeVisible();
  });

  test('should display fighter images and names', async ({ page }) => {
    // Check that fighter images and names are displayed
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    
    // Check for fighter images
    const fighterImages = page.locator('[data-testid^="fighter-image-"]');
    await expect(fighterImages.first()).toBeVisible();
    
    // Check for fighter names
    const fighterNames = page.locator('[data-testid^="fighter-name-"]');
    await expect(fighterNames.first()).toBeVisible();
  });

  test('should display fighter statistics', async ({ page }) => {
    // Check that fighter stats are displayed
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    
    // Check for win/loss counts
    await expect(page.getByText(/Wins:/)).toBeVisible();
    await expect(page.getByText(/Losses:/)).toBeVisible();
    await expect(page.getByText(/Win Rate:/)).toBeVisible();
    await expect(page.getByText(/Total Battles:/)).toBeVisible();
  });

  test('should allow sorting by different columns', async ({ page }) => {
    // Check that sortable columns are present
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    
    // Test sorting by wins
    await page.getByRole('columnheader', { name: 'Wins' }).click();
    
    // Test sorting by losses
    await page.getByRole('columnheader', { name: 'Losses' }).click();
    
    // Test sorting by win rate
    await page.getByRole('columnheader', { name: 'Win Rate' }).click();
  });

  test('should display fighter details on row click', async ({ page }) => {
    // Click on a fighter row
    await page.getByTestId('fighter-row-1').click();
    
    // Check that fighter details are displayed
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    await expect(page.getByTestId('fighter-detail-name')).toBeVisible();
    await expect(page.getByTestId('fighter-detail-stats')).toBeVisible();
  });

  test('should show fighter battle history', async ({ page }) => {
    // Click on a fighter row to open details
    await page.getByTestId('fighter-row-1').click();
    
    // Check that battle history is displayed
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    await expect(page.getByTestId('battle-history')).toBeVisible();
    await expect(page.getByText('Battle History')).toBeVisible();
  });

  test('should display battle replays', async ({ page }) => {
    // Click on a fighter row to open details
    await page.getByTestId('fighter-row-1').click();
    
    // Check that battle replays are available
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    await expect(page.getByTestId('battle-replays')).toBeVisible();
    
    // Click on a battle replay
    await page.getByTestId('battle-replay-1').click();
    
    // Check that replay modal opens
    await expect(page.getByTestId('battle-replay-modal')).toBeVisible();
  });

  test('should allow battle replay playback', async ({ page }) => {
    // Open fighter details
    await page.getByTestId('fighter-row-1').click();
    
    // Click on a battle replay
    await page.getByTestId('battle-replay-1').click();
    
    // Check replay controls
    await expect(page.getByTestId('replay-play-btn')).toBeVisible();
    await expect(page.getByTestId('replay-pause-btn')).toBeVisible();
    await expect(page.getByTestId('replay-stop-btn')).toBeVisible();
    
    // Test play functionality
    await page.getByTestId('replay-play-btn').click();
    await expect(page.getByTestId('replay-progress')).toBeVisible();
  });

  test('should display fighter statistics in detail view', async ({ page }) => {
    // Click on a fighter row to open details
    await page.getByTestId('fighter-row-1').click();
    
    // Check that detailed stats are displayed
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    await expect(page.getByTestId('fighter-detail-stats')).toBeVisible();
    
    // Check for all stat categories
    await expect(page.getByText(/Health:/)).toBeVisible();
    await expect(page.getByText(/Strength:/)).toBeVisible();
    await expect(page.getByText(/Agility:/)).toBeVisible();
    await expect(page.getByText(/Defense:/)).toBeVisible();
    await expect(page.getByText(/Luck:/)).toBeVisible();
    await expect(page.getByText(/Magic:/)).toBeVisible();
    await expect(page.getByText(/Ranged:/)).toBeVisible();
    await expect(page.getByText(/Intelligence:/)).toBeVisible();
  });

  test('should show fighter unique abilities', async ({ page }) => {
    // Click on a fighter row to open details
    await page.getByTestId('fighter-row-1').click();
    
    // Check that unique abilities are displayed
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    await expect(page.getByTestId('fighter-unique-abilities')).toBeVisible();
    await expect(page.getByText('Special Abilities:')).toBeVisible();
  });

  test('should allow closing fighter details modal', async ({ page }) => {
    // Open fighter details
    await page.getByTestId('fighter-row-1').click();
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    
    // Close the modal
    await page.getByTestId('close-fighter-details').click();
    
    // Check that modal is closed
    await expect(page.getByTestId('fighter-details-modal')).not.toBeVisible();
  });

  test('should display empty state when no fighters exist', async ({ page }) => {
    // Mock empty leaderboard
    await page.route('**/api/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fighters: []
        })
      });
    });
    
    // Reload page
    await page.reload();
    
    // Check empty state message
    await expect(page.getByText('No fighters found')).toBeVisible();
    await expect(page.getByText('Upload some fighters to see the leaderboard')).toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/leaderboard', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Reload page
    await page.reload();
    
    // Check loading indicator
    await expect(page.getByTestId('loading-indicator')).toBeVisible();
    await expect(page.getByText('Loading leaderboard...')).toBeVisible();
  });

  test('should handle error state', async ({ page }) => {
    // Mock API error
    await page.route('**/api/leaderboard', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to load leaderboard'
        })
      });
    });
    
    // Reload page
    await page.reload();
    
    // Check error message
    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByText('Failed to load leaderboard')).toBeVisible();
  });

  test('should maintain sort state after navigation', async ({ page }) => {
    // Sort by wins
    await page.getByRole('columnheader', { name: 'Wins' }).click();
    
    // Navigate away and back
    await page.goto('/tournament');
    await page.goto('/leaderboard');
    
    // Check that sort state is maintained
    await expect(page.getByRole('columnheader', { name: 'Wins' })).toHaveClass(/sorted/);
  });

  test('should display rank numbers correctly', async ({ page }) => {
    // Check that rank numbers are displayed
    await expect(page.getByTestId('leaderboard-table')).toBeVisible();
    
    // Check for rank numbers
    const rankCells = page.locator('[data-testid^="rank-"]');
    await expect(rankCells.first()).toBeVisible();
    
    // Check that first rank is 1
    await expect(rankCells.first()).toHaveText('1');
  });

  test('visual regression - leaderboard table', async ({ page }) => {
    await expect(page).toHaveScreenshot('leaderboard-table.png');
  });

  test('visual regression - fighter details modal', async ({ page }) => {
    // Open fighter details
    await page.getByTestId('fighter-row-1').click();
    await expect(page.getByTestId('fighter-details-modal')).toBeVisible();
    
    await expect(page).toHaveScreenshot('leaderboard-fighter-details.png');
  });

  test('visual regression - battle replay modal', async ({ page }) => {
    // Open fighter details and battle replay
    await page.getByTestId('fighter-row-1').click();
    await page.getByTestId('battle-replay-1').click();
    await expect(page.getByTestId('battle-replay-modal')).toBeVisible();
    
    await expect(page).toHaveScreenshot('leaderboard-battle-replay.png');
  });

  test('visual regression - empty state', async ({ page }) => {
    // Mock empty leaderboard
    await page.route('**/api/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fighters: []
        })
      });
    });
    
    await page.reload();
    await expect(page).toHaveScreenshot('leaderboard-empty-state.png');
  });
}); 