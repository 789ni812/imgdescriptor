import { test, expect } from '@playwright/test';

test.describe('Battle Arena E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playervs');
    await page.waitForLoadState('networkidle');
  });

  test('loads battle arena page with correct setup phase', async ({ page }) => {
    // Check main page elements
    await expect(page.getByRole('heading', { name: /AI Image Describer/i })).toBeVisible();
    await expect(page.getByText(/Upload Your Fighters/i)).toBeVisible();
    await expect(page.getByText(/Upload images of two fighters and a battle arena/i)).toBeVisible();
    
    // Check fighter upload sections
    await expect(page.getByText(/Upload image for Fighter A/i)).toBeVisible();
    await expect(page.getByText(/Upload image for Fighter B/i)).toBeVisible();
    
    // Check arena upload section
    await expect(page.getByRole('heading', { name: /Battle Arena/i })).toBeVisible();
    await expect(page.getByText(/Upload image of the fighting scene/i)).toBeVisible();
    
    // Check Start Fight button is disabled initially
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    await expect(startFightButton).toBeDisabled();
  });

  test('fighter selection modes work correctly', async ({ page }) => {
    // Test Fighter A selection modes
    const fighterASection = page.locator('div').filter({ hasText: /Fighter A/i }).first();
    
    // Check for mode selection buttons
    await expect(fighterASection.getByRole('button', { name: /Upload New/i })).toBeVisible();
    await expect(fighterASection.getByRole('button', { name: /Choose Existing/i })).toBeVisible();
    
    // Test switching to Choose Existing mode
    await fighterASection.getByRole('button', { name: /Choose Existing/i }).click();
    await page.waitForTimeout(1000);
    
    // Should show fighter selection interface
    await expect(page.getByText(/Choose a Fighter/i)).toBeVisible();
  });

  test('existing fighter selection works correctly', async ({ page }) => {
    // Mock fighter list API
    await page.route('**/api/fighting-game/list-fighters-metadata', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fighters: [
            {
              id: 'fighter-1',
              name: 'Bruce Lee',
              image: 'bruce-lee.jpg',
              stats: {
                health: 680,
                strength: 75,
                agility: 90,
                defense: 60,
                luck: 30,
                age: 32,
                size: 'medium',
                build: 'muscular'
              }
            },
            {
              id: 'fighter-2',
              name: 'Victor Moreau',
              image: 'victor-moreau.jpg',
              stats: {
                health: 750,
                strength: 85,
                agility: 40,
                defense: 65,
                luck: 30,
                age: 62,
                size: 'large',
                build: 'heavy'
              }
            }
          ]
        })
      });
    });

    // Switch to Choose Existing mode for Fighter A
    const fighterASection = page.locator('div').filter({ hasText: /Fighter A/i }).first();
    await fighterASection.getByRole('button', { name: /Choose Existing/i }).click();
    await page.waitForTimeout(2000);
    
    // Select a fighter
    const fighterCard = page.locator('[data-testid="fighter-card"]').first();
    if (await fighterCard.isVisible()) {
      await fighterCard.click();
      await page.waitForTimeout(1000);
      
      // Check that fighter is selected
      await expect(page.getByText(/Bruce Lee/i)).toBeVisible();
      await expect(page.getByText(/Health: 680/i)).toBeVisible();
    }
  });

  test('arena selection works correctly', async ({ page }) => {
    // Mock arena list API
    await page.route('**/api/fighting-game/list-arenas', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          arenas: [
            {
              id: 'arena-1',
              name: 'Goth Restaurant',
              image: 'goth-restaurant.jpg',
              description: 'A dark and atmospheric restaurant'
            },
            {
              id: 'arena-2',
              name: 'Tokyo Streets',
              image: 'tokyo-streets.jpg',
              description: 'Rain-slicked streets of Tokyo'
            }
          ]
        })
      });
    });

    // Switch to Choose Existing mode for Arena
    const arenaSection = page.locator('div').filter({ hasText: /Battle Arena/i }).first();
    await arenaSection.getByRole('button', { name: /Choose Existing/i }).click();
    await page.waitForTimeout(2000);
    
    // Select an arena
    const arenaCard = page.locator('[data-testid="arena-card"]').first();
    if (await arenaCard.isVisible()) {
      await arenaCard.click();
      await page.waitForTimeout(1000);
      
      // Check that arena is selected
      await expect(page.getByText(/Goth Restaurant/i)).toBeVisible();
    }
  });

  test('complete battle setup and execution flow', async ({ page }) => {
    // Mock all necessary APIs
    await page.route('**/api/fighting-game/list-fighters-metadata', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fighters: [
            {
              id: 'fighter-1',
              name: 'Bruce Lee',
              image: 'bruce-lee.jpg',
              stats: { health: 680, strength: 75, agility: 90, defense: 60, luck: 30, age: 32, size: 'medium', build: 'muscular' }
            },
            {
              id: 'fighter-2',
              name: 'Victor Moreau',
              image: 'victor-moreau.jpg',
              stats: { health: 750, strength: 85, agility: 40, defense: 65, luck: 30, age: 62, size: 'large', build: 'heavy' }
            }
          ]
        })
      });
    });

    await page.route('**/api/fighting-game/list-arenas', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          arenas: [
            {
              id: 'arena-1',
              name: 'Goth Restaurant',
              image: 'goth-restaurant.jpg',
              description: 'A dark and atmospheric restaurant'
            }
          ]
        })
      });
    });

    await page.route('**/api/fighting-game/generate-battle', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          battleLog: [
            {
              round: 1,
              attacker: 'Bruce Lee',
              defender: 'Victor Moreau',
              attackCommentary: 'Bruce Lee launches a lightning-fast kick!',
              defenseCommentary: 'Victor Moreau blocks with his massive frame!',
              attackerDamage: 20,
              defenderDamage: 0,
              randomEvent: null,
              arenaObjectsUsed: null,
              healthAfter: { attacker: 680, defender: 730 }
            },
            {
              round: 2,
              attacker: 'Victor Moreau',
              defender: 'Bruce Lee',
              attackCommentary: 'Victor Moreau counters with a powerful strike!',
              defenseCommentary: 'Bruce Lee dodges with incredible agility!',
              attackerDamage: 15,
              defenderDamage: 0,
              randomEvent: null,
              arenaObjectsUsed: null,
              healthAfter: { attacker: 665, defender: 680 }
            }
          ]
        })
      });
    });

    // Set up fighters
    const fighterASection = page.locator('div').filter({ hasText: /Fighter A/i }).first();
    await fighterASection.getByRole('button', { name: /Choose Existing/i }).click();
    await page.waitForTimeout(2000);
    
    const fighterCards = page.locator('[data-testid="fighter-card"]');
    if (await fighterCards.count() >= 2) {
      await fighterCards.nth(0).click(); // Select Bruce Lee for Fighter A
      await page.waitForTimeout(1000);
      
      const fighterBSection = page.locator('div').filter({ hasText: /Fighter B/i }).first();
      await fighterBSection.getByRole('button', { name: /Choose Existing/i }).click();
      await page.waitForTimeout(2000);
      await fighterCards.nth(1).click(); // Select Victor Moreau for Fighter B
      await page.waitForTimeout(1000);
    }
    
    // Set up arena
    const arenaSection = page.locator('div').filter({ hasText: /Battle Arena/i }).first();
    await arenaSection.getByRole('button', { name: /Choose Existing/i }).click();
    await page.waitForTimeout(2000);
    
    const arenaCards = page.locator('[data-testid="arena-card"]');
    if (await arenaCards.count() > 0) {
      await arenaCards.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Start the fight
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    await expect(startFightButton).toBeEnabled();
    await startFightButton.click();
    
    // Wait for battle to start
    await page.waitForTimeout(3000);
    
    // Check for battle elements
    await expect(page.getByText(/Bruce Lee launches a lightning-fast kick!/i)).toBeVisible();
    await expect(page.getByText(/Victor Moreau counters with a powerful strike!/i)).toBeVisible();
  });

  test('rebalance fighters functionality works', async ({ page }) => {
    // Mock rebalance API
    await page.route('**/api/fighting-game/balance-fighters', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Successfully rebalanced fighters',
          fighters: [
            { name: 'Bruce Lee', health: 700, strength: 80 },
            { name: 'Victor Moreau', health: 800, strength: 90 }
          ]
        })
      });
    });

    // Click rebalance button
    const rebalanceButton = page.getByRole('button', { name: /Rebalance Fighters/i });
    await rebalanceButton.click();
    
    // Wait for loading state
    await expect(page.getByRole('button', { name: /Rebalancing Fighters\.\.\./i })).toBeVisible();
    
    // Wait for completion
    await page.waitForTimeout(3000);
    
    // Check for success message
    await expect(page.getByText(/Successfully rebalanced/i)).toBeVisible();
  });

  test('fighter removal works correctly', async ({ page }) => {
    // Mock fighter data
    await page.route('**/api/fighting-game/list-fighters-metadata', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          fighters: [
            {
              id: 'fighter-1',
              name: 'Bruce Lee',
              image: 'bruce-lee.jpg',
              stats: { health: 680, strength: 75, agility: 90, defense: 60, luck: 30, age: 32, size: 'medium', build: 'muscular' }
            }
          ]
        })
      });
    });

    // Select a fighter
    const fighterASection = page.locator('div').filter({ hasText: /Fighter A/i }).first();
    await fighterASection.getByRole('button', { name: /Choose Existing/i }).click();
    await page.waitForTimeout(2000);
    
    const fighterCard = page.locator('[data-testid="fighter-card"]').first();
    if (await fighterCard.isVisible()) {
      await fighterCard.click();
      await page.waitForTimeout(1000);
      
      // Check fighter is selected
      await expect(page.getByText(/Bruce Lee/i)).toBeVisible();
      
      // Remove fighter
      const removeButton = page.getByRole('button', { name: /Remove Fighter/i });
      await removeButton.click();
      
      // Check fighter is removed
      await expect(page.getByText(/Bruce Lee/i)).not.toBeVisible();
      await expect(page.getByText(/Upload image for Fighter A/i)).toBeVisible();
    }
  });

  test('demo mode works correctly', async ({ page }) => {
    // Check for demo fighters
    await expect(page.getByText(/Godzilla/i)).toBeVisible();
    await expect(page.getByText(/Bruce Lee/i)).toBeVisible();
    await expect(page.getByText(/Tokyo City Streets/i)).toBeVisible();
    
    // Check Start Fight button is enabled with demo data
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    await expect(startFightButton).toBeEnabled();
  });

  test('error handling works correctly', async ({ page }) => {
    // Mock API error
    await page.route('**/api/fighting-game/generate-battle', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to generate battle'
        })
      });
    });

    // Try to start a fight (should fail)
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    if (await startFightButton.isEnabled()) {
      await startFightButton.click();
      await page.waitForTimeout(3000);
      
      // Check for error message
      await expect(page.getByText(/Failed to generate battle/i)).toBeVisible();
    }
  });

  test('health bars and battle UI elements work correctly', async ({ page }) => {
    // Mock battle generation
    await page.route('**/api/fighting-game/generate-battle', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          battleLog: [
            {
              round: 1,
              attacker: 'Bruce Lee',
              defender: 'Victor Moreau',
              attackCommentary: 'Bruce Lee attacks!',
              defenseCommentary: 'Victor Moreau defends!',
              attackerDamage: 25,
              defenderDamage: 0,
              randomEvent: null,
              arenaObjectsUsed: null,
              healthAfter: { attacker: 680, defender: 725 }
            }
          ]
        })
      });
    });

    // Start a battle
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    if (await startFightButton.isEnabled()) {
      await startFightButton.click();
      await page.waitForTimeout(3000);
      
      // Check for health bars
      const healthBars = page.locator('[data-testid="health-bar"]');
      await expect(healthBars.first()).toBeVisible();
      
      // Check for round information
      await expect(page.getByText(/Round 1/i)).toBeVisible();
      
      // Check for battle commentary
      await expect(page.getByText(/Bruce Lee attacks!/i)).toBeVisible();
    }
  });
}); 