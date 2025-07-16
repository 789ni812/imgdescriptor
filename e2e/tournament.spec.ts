import { test, expect } from '@playwright/test';

test.describe('Tournament Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tournament');
  });

  test('should display the main page layout and navigation', async ({ page }) => {
    // Check main page elements
    await expect(page.getByRole('heading', { name: '🏆 Tournament System' })).toBeVisible();
    await expect(page.getByText('Create and manage automated single-elimination tournaments with up to 8 fighters.')).toBeVisible();
    
    // Check navigation buttons
    await expect(page.getByTestId('tournament-list-btn')).toBeVisible();
    await expect(page.getByTestId('create-tournament-btn')).toBeVisible();
  });

  test('should show tournament list by default', async ({ page }) => {
    // Check that tournament list view is shown
    await expect(page.getByTestId('tournament-list-view')).toBeVisible();
    await expect(page.getByRole('heading', { name: '📋 Tournaments' })).toBeVisible();
    await expect(page.getByTestId('tournament-list-btn')).toHaveClass(/bg-blue-600/);
  });

  test('should navigate to create tournament view', async ({ page }) => {
    // Click create tournament button
    await page.getByTestId('create-tournament-btn').click();
    
    // Check that create view is shown
    await expect(page.getByTestId('tournament-create-view')).toBeVisible();
    await expect(page.getByRole('heading', { name: '➕ Create Tournament' })).toBeVisible();
    await expect(page.getByTestId('create-tournament-btn')).toHaveClass(/bg-green-600/);
  });

  test('should display fighter selection in create view', async ({ page }) => {
    // Navigate to create view
    await page.getByTestId('create-tournament-btn').click();
    
    // Check fighter selection interface
    await expect(page.getByTestId('fighter-selection')).toBeVisible();
    await expect(page.getByTestId('fighter-selection-title')).toBeVisible();
    await expect(page.getByTestId('fighter-grid')).toBeVisible();
  });

  test('should allow fighter selection for tournament', async ({ page }) => {
    // Navigate to create view
    await page.getByTestId('create-tournament-btn').click();
    
    // Select fighters
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    
    // Check that create button is enabled
    await expect(page.getByTestId('create-tournament-submit-btn')).toBeEnabled();
  });

  test('should create tournament successfully', async ({ page }) => {
    // Navigate to create view
    await page.getByTestId('create-tournament-btn').click();
    
    // Select fighters
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    
    // Create tournament
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Check that tournament detail view is shown
    await expect(page.getByTestId('tournament-detail-view')).toBeVisible();
    await expect(page.getByTestId('current-tournament-btn')).toBeVisible();
  });

  test('should display tournament controls', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Check tournament controls
    await expect(page.getByTestId('tournament-controls')).toBeVisible();
    await expect(page.getByTestId('tournament-controls-title')).toBeVisible();
    await expect(page.getByTestId('execute-next-match-btn')).toBeVisible();
    await expect(page.getByTestId('automate-match-execution-btn')).toBeVisible();
  });

  test('should display tournament bracket', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Check tournament bracket
    await expect(page.getByTestId('tournament-bracket')).toBeVisible();
    await expect(page.getByText('🏆 Tournament Bracket')).toBeVisible();
  });

  test('should execute next match', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Execute next match
    await page.getByTestId('execute-next-match-btn').click();
    
    // Check that match completion notification appears
    await expect(page.getByTestId('match-completed-notification')).toBeVisible();
  });

  test('should automate match execution', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Start automation
    await page.getByTestId('automate-match-execution-btn').click();
    
    // Check that automation is running
    await expect(page.getByTestId('automating-status')).toBeVisible();
    await expect(page.getByTestId('cancel-automation-btn')).toBeVisible();
  });

  test('should show tournament completion', async ({ page }) => {
    // Create and complete a tournament
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Complete all matches
    await page.getByTestId('automate-match-execution-btn').click();
    
    // Wait for tournament completion
    await expect(page.getByTestId('tournament-complete')).toBeVisible();
    await expect(page.getByText('🏆 Tournament Complete! 🏆')).toBeVisible();
  });

  test('should display tournament champion', async ({ page }) => {
    // Create and complete a tournament
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Complete all matches
    await page.getByTestId('automate-match-execution-btn').click();
    
    // Check champion display
    await expect(page.getByTestId('tournament-champion')).toBeVisible();
    await expect(page.getByText('🏆 Tournament Champion 🏆')).toBeVisible();
  });

  test('should navigate back to tournament list', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Go back to list
    await page.getByTestId('back-to-list-btn').click();
    
    // Check that list view is shown
    await expect(page.getByTestId('tournament-list-view')).toBeVisible();
  });

  test('should display existing tournaments in list', async ({ page }) => {
    // Check that tournament list is displayed
    await expect(page.getByTestId('tournament-list-view')).toBeVisible();
    
    // Check for tournament cards (if any exist)
    const tournamentCards = page.locator('[data-testid^="tournament-card-"]');
    await expect(tournamentCards.first()).toBeVisible();
  });

  test('should show tournament status badges', async ({ page }) => {
    // Check that status badges are displayed
    await expect(page.getByText('🏆 Completed')).toBeVisible();
    await expect(page.getByText('⚡ In Progress')).toBeVisible();
    await expect(page.getByText('🟢 Ready to Start')).toBeVisible();
  });

  test('should handle tournament selection from list', async ({ page }) => {
    // Click on a tournament in the list
    await page.getByTestId('tournament-card-1').click();
    
    // Check that tournament detail view is shown
    await expect(page.getByTestId('tournament-detail-view')).toBeVisible();
    await expect(page.getByTestId('current-tournament-btn')).toBeVisible();
  });

  test('should display match progress', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Check progress display
    await expect(page.getByTestId('matches-progress')).toBeVisible();
    await expect(page.getByText(/matches completed/)).toBeVisible();
  });

  test('should show next match information', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Check next match display
    await expect(page.getByText('⚔️ Next Match')).toBeVisible();
  });

  test('visual regression - tournament list view', async ({ page }) => {
    await expect(page).toHaveScreenshot('tournament-list-view.png');
  });

  test('visual regression - create tournament view', async ({ page }) => {
    await page.getByTestId('create-tournament-btn').click();
    await expect(page).toHaveScreenshot('tournament-create-view.png');
  });

  test('visual regression - tournament detail view', async ({ page }) => {
    // Create a tournament first
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    await expect(page).toHaveScreenshot('tournament-detail-view.png');
  });

  test('visual regression - completed tournament', async ({ page }) => {
    // Create and complete a tournament
    await page.getByTestId('create-tournament-btn').click();
    await page.getByTestId('fighter-checkbox-1').click();
    await page.getByTestId('fighter-checkbox-2').click();
    await page.getByTestId('create-tournament-submit-btn').click();
    
    // Complete all matches
    await page.getByTestId('automate-match-execution-btn').click();
    
    // Wait for completion and take screenshot
    await expect(page.getByTestId('tournament-complete')).toBeVisible();
    await expect(page).toHaveScreenshot('tournament-completed.png');
  });
}); 