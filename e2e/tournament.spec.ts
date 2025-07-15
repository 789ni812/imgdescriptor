import { test, expect } from '@playwright/test';

test.describe('Tournament System E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tournament');
    await page.waitForLoadState('networkidle');
  });

  test('loads tournament page with correct navigation and sections', async ({ page }) => {
    // Check main navigation
    await expect(page.getByRole('heading', { name: /Tournament System/i })).toBeVisible();
    await expect(page.getByText(/Create and manage automated single-elimination tournaments/i)).toBeVisible();
    
    // Check navigation buttons using data-testid
    await expect(page.getByTestId('tournament-list-btn')).toBeVisible();
    await expect(page.getByTestId('create-tournament-btn')).toBeVisible();
  });

  test('tournament list shows existing tournaments', async ({ page }) => {
    // Click on Tournament List button
    await page.getByTestId('tournament-list-btn').click();
    
    // Wait for tournaments to load
    await page.waitForTimeout(2000);
    
    // Check if any tournaments are displayed (might be empty initially)
    const tournamentCards = page.locator('[data-testid="tournament-card"]');
    const count = await tournamentCards.count();
    
    if (count > 0) {
      // If tournaments exist, verify they have expected content
      await expect(tournamentCards.first()).toBeVisible();
      await expect(page.getByText(/fighters/i)).toBeVisible();
    } else {
      // If no tournaments, check for empty state message
      await expect(page.getByText(/No tournaments found/i)).toBeVisible();
      await expect(page.getByText(/Create your first tournament to get started!/i)).toBeVisible();
    }
  });

  test('create tournament flow works correctly', async ({ page }) => {
    // Click on Create Tournament button
    await page.getByTestId('create-tournament-btn').click();
    
    // Check tournament creation form
    await expect(page.getByTestId('tournament-creator')).toBeVisible();
    await expect(page.getByTestId('fighter-selection')).toBeVisible();
    
    // Wait for fighters to load
    await page.waitForTimeout(2000);
    
    // Select fighters (if available)
    const fighterCards = page.locator('[data-testid^="fighter-card-"]');
    const fighterCount = await fighterCards.count();
    
    if (fighterCount >= 2) {
      // Select first two fighters
      await fighterCards.nth(0).click();
      await fighterCards.nth(1).click();
      
      // Check that fighters are selected
      await expect(page.getByText(/2\/8/)).toBeVisible();
      
      // Create tournament
      const createButton = page.getByTestId('create-tournament-submit-btn');
      await expect(createButton).toBeEnabled();
      await createButton.click();
      
      // Wait for tournament creation
      await page.waitForTimeout(3000);
      
      // Should be redirected to current tournament view
      await expect(page.getByTestId('tournament-detail-view')).toBeVisible();
      await expect(page.getByTestId('tournament-controls')).toBeVisible();
    }
  });

  test('tournament execution works correctly', async ({ page }) => {
    // Mock the tournament execution API to return a successful battle
    await page.route('**/api/tournaments/execute', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          match: {
            id: 'match-1-1',
            fighterA: { name: 'Bruce Lee', health: 680 },
            fighterB: { name: 'Victor Moreau', health: 750 },
            winner: { name: 'Victor Moreau' },
            status: 'completed',
            battleLog: [
              {
                round: 1,
                attacker: 'Victor Moreau',
                defender: 'Bruce Lee',
                attackCommentary: 'Victor Moreau opens with a powerful strike!',
                defenseCommentary: 'Bruce Lee dodges with incredible agility!',
                attackerDamage: 25,
                defenderDamage: 0,
                healthAfter: { attacker: 750, defender: 655 }
              }
            ]
          },
          tournament: {
            status: 'completed',
            winner: { name: 'Victor Moreau' }
          },
          message: 'Battle completed: Victor Moreau wins!'
        })
      });
    });

    // Navigate to a tournament (create one if needed)
    await page.getByTestId('create-tournament-btn').click();
    await page.waitForTimeout(2000);
    
    // Create a simple tournament for testing
    const fighterCards = page.locator('[data-testid^="fighter-card-"]');
    const fighterCount = await fighterCards.count();
    
    if (fighterCount >= 2) {
      await fighterCards.nth(0).click();
      await fighterCards.nth(1).click();
      
      await page.getByTestId('create-tournament-submit-btn').click();
      await page.waitForTimeout(3000);
    }
    
    // Execute next match
    const executeButton = page.getByTestId('execute-next-match-btn');
    if (await executeButton.isEnabled()) {
      await executeButton.click();
      
      // Wait for execution to complete
      await page.waitForTimeout(5000);
      
      // Check for success message
      await expect(page.getByText(/Battle completed/i)).toBeVisible();
      
      // Check that match is marked as completed
      await expect(page.getByText(/completed/i)).toBeVisible();
    }
  });

  test('tournament bracket visualization works correctly', async ({ page }) => {
    // First create a tournament to have something to view
    await page.getByTestId('create-tournament-btn').click();
    await page.waitForTimeout(2000);
    
    // Select some fighters if available
    const fighterCards = page.locator('[data-testid^="fighter-card-"]');
    const fighterCount = await fighterCards.count();
    
    if (fighterCount >= 2) {
      await fighterCards.nth(0).click();
      await fighterCards.nth(1).click();
      
      // Create the tournament
      await page.getByTestId('create-tournament-submit-btn').click();
      await page.waitForTimeout(3000);
      
      // Now check bracket section
      await expect(page.getByTestId('tournament-bracket')).toBeVisible();
      
      // Check for bracket visualization elements
      const bracketMatches = page.locator('[data-testid="bracket-match"]');
      const matchCount = await bracketMatches.count();
      
      if (matchCount > 0) {
        // Verify bracket structure
        await expect(bracketMatches.first()).toBeVisible();
      }
    }
  });

  test('tournament completion shows champion correctly', async ({ page }) => {
    // Mock a completed tournament
    await page.route('**/api/tournaments/list', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          tournaments: [{
            id: 'test-tournament',
            name: 'Test Tournament',
            status: 'completed',
            winner: { name: 'Victor Moreau' },
            fighters: [
              { name: 'Bruce Lee' },
              { name: 'Victor Moreau' }
            ],
            brackets: []
          }]
        })
      });
    });

    // Navigate to tournament list
    await page.getByTestId('tournament-list-btn').click();
    await page.waitForTimeout(2000);
    
    // Click on completed tournament
    const tournamentCard = page.locator('[data-testid="tournament-card"]').first();
    if (await tournamentCard.isVisible()) {
      await tournamentCard.click();
      await page.waitForTimeout(2000);
      
      // Check for champion announcement
      await expect(page.getByText(/Tournament Champion/i)).toBeVisible();
      await expect(page.getByText(/Victor Moreau/i)).toBeVisible();
    }
  });

  test('tournament navigation and state management works', async ({ page }) => {
    // Test navigation between tabs
    await page.getByRole('tab', { name: /Tournament List/i }).click();
    await expect(page.getByText(/Tournament List/i)).toBeVisible();
    
    await page.getByTestId('create-tournament-btn').click();
    await expect(page.getByText(/Select Fighters/i)).toBeVisible();
    
    await page.getByRole('tab', { name: /Current Tournament/i }).click();
    await expect(page.getByText(/Tournament Controls/i)).toBeVisible();
  });
}); 