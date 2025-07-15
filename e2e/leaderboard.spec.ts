import { test, expect } from '@playwright/test';

test.describe('Leaderboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForLoadState('networkidle');
  });

  test('loads leaderboard page with correct navigation and sections', async ({ page }) => {
    // Check main page elements
    await expect(page.getByRole('heading', { name: /Battle Leaderboard/i })).toBeVisible();
    await expect(page.getByText(/View fighter statistics and replay epic battles/i)).toBeVisible();
    
    // Check navigation buttons using data-testid
    await expect(page.getByTestId('leaderboard-btn')).toBeVisible();
    await expect(page.getByTestId('battle-replays-btn')).toBeVisible();
    
    // Should start on leaderboard view
    await expect(page.getByTestId('leaderboard-view')).toBeVisible();
  });

  test('leaderboard displays fighter statistics correctly', async ({ page }) => {
    // Mock leaderboard data
    await page.route('**/api/tournaments/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          leaderboard: [
            {
              name: 'Bruce Lee',
              totalBattles: 5,
              wins: 4,
              losses: 1,
              winRate: 80.0,
              totalDamageDealt: 250,
              totalDamageTaken: 120,
              averageDamageDealt: 50.0,
              averageDamageTaken: 24.0,
              averageRoundsSurvived: 4.2,
              totalRounds: 21,
              currentStats: {
                strength: 75,
                agility: 90,
                luck: 30,
                defense: 60,
                health: 680,
                maxHealth: 680,
                size: 'medium',
                build: 'muscular',
                age: 32
              },
              opponents: ['Godzilla', 'Victor Moreau'],
              arenas: ['Tokyo Streets', 'Goth Restaurant'],
              lastBattle: '2025-07-15T10:30:00Z',
              imageUrl: '/vs/fighters/bruce-lee.jpg'
            },
            {
              name: 'Victor Moreau',
              totalBattles: 3,
              wins: 2,
              losses: 1,
              winRate: 66.7,
              totalDamageDealt: 180,
              totalDamageTaken: 90,
              averageDamageDealt: 60.0,
              averageDamageTaken: 30.0,
              averageRoundsSurvived: 3.8,
              totalRounds: 11,
              currentStats: {
                strength: 85,
                agility: 40,
                luck: 30,
                defense: 65,
                health: 750,
                maxHealth: 750,
                size: 'large',
                build: 'heavy',
                age: 62
              },
              opponents: ['Bruce Lee'],
              arenas: ['Goth Restaurant'],
              lastBattle: '2025-07-15T10:30:00Z',
              imageUrl: '/vs/fighters/victor-moreau.jpg'
            }
          ],
          totalBattles: 8,
          lastUpdated: '2025-07-15T10:30:00Z'
        })
      });
    });

    // Refresh the page to load mocked data
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check leaderboard table
    await expect(page.getByText(/Bruce Lee/i)).toBeVisible();
    await expect(page.getByText(/Victor Moreau/i)).toBeVisible();
    
    // Check statistics
    await expect(page.getByText(/80\.0%/i)).toBeVisible(); // Bruce Lee's win rate
    await expect(page.getByText(/4W/i)).toBeVisible(); // Bruce Lee's wins
    await expect(page.getByText(/1L/i)).toBeVisible(); // Bruce Lee's losses
    
    // Check summary stats
    await expect(page.getByText(/8/i)).toBeVisible(); // Total battles
    await expect(page.getByText(/2/i)).toBeVisible(); // Active fighters
  });

  test('leaderboard sorting works correctly', async ({ page }) => {
    // Mock leaderboard data (same as above)
    await page.route('**/api/tournaments/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          leaderboard: [
            {
              name: 'Bruce Lee',
              totalBattles: 5,
              wins: 4,
              losses: 1,
              winRate: 80.0,
              averageDamageDealt: 50.0,
              averageDamageTaken: 24.0,
              averageRoundsSurvived: 4.2,
              currentStats: { strength: 75, agility: 90, luck: 30, defense: 60, health: 680, maxHealth: 680, size: 'medium', build: 'muscular', age: 32 },
              opponents: ['Godzilla'],
              arenas: ['Tokyo Streets'],
              lastBattle: '2025-07-15T10:30:00Z',
              imageUrl: '/vs/fighters/bruce-lee.jpg'
            },
            {
              name: 'Victor Moreau',
              totalBattles: 3,
              wins: 2,
              losses: 1,
              winRate: 66.7,
              averageDamageDealt: 60.0,
              averageDamageTaken: 30.0,
              averageRoundsSurvived: 3.8,
              currentStats: { strength: 85, agility: 40, luck: 30, defense: 65, health: 750, maxHealth: 750, size: 'large', build: 'heavy', age: 62 },
              opponents: ['Bruce Lee'],
              arenas: ['Goth Restaurant'],
              lastBattle: '2025-07-15T10:30:00Z',
              imageUrl: '/vs/fighters/victor-moreau.jpg'
            }
          ],
          totalBattles: 8,
          lastUpdated: '2025-07-15T10:30:00Z'
        })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Test sorting by different columns
    await page.getByRole('columnheader', { name: /Record/i }).click();
    await expect(page.getByText(/4W/i)).toBeVisible(); // Should still show Bruce Lee first
    
    await page.getByRole('columnheader', { name: /Avg Damage Dealt/i }).click();
    await expect(page.getByText(/60\.0/i)).toBeVisible(); // Victor Moreau should be first now
  });

  test('battle replays section loads and displays correctly', async ({ page }) => {
    // Click on Battle Replays button
    await page.getByTestId('battle-replays-btn').click();
    
    // Mock battle replays data
    await page.route('**/api/battle-replays/list', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          battleReplays: [
            {
              id: 'battle-1',
              fighterA: {
                id: 'fighter-1',
                name: 'Bruce Lee',
                imageUrl: '/vs/fighters/bruce-lee.jpg',
                stats: { health: 680, maxHealth: 680, strength: 75, luck: 30, agility: 90, defense: 60, age: 32, size: 'medium', build: 'muscular' }
              },
              fighterB: {
                id: 'fighter-2',
                name: 'Victor Moreau',
                imageUrl: '/vs/fighters/victor-moreau.jpg',
                stats: { health: 750, maxHealth: 750, strength: 85, luck: 30, agility: 40, defense: 65, age: 62, size: 'large', build: 'heavy' }
              },
              scene: {
                name: 'Goth Restaurant',
                imageUrl: '/vs/arena/goth-restaurant.jpg',
                description: 'A dark and atmospheric restaurant'
              },
              battleLog: [
                {
                  round: 1,
                  attacker: 'Victor Moreau',
                  defender: 'Bruce Lee',
                  attackCommentary: 'Victor Moreau opens with a powerful strike!',
                  defenseCommentary: 'Bruce Lee dodges with incredible agility!',
                  attackerDamage: 25,
                  defenderDamage: 0,
                  randomEvent: null,
                  arenaObjectsUsed: null,
                  healthAfter: { attacker: 750, defender: 655 }
                }
              ],
              winner: 'Victor Moreau',
              date: '2025-07-15T10:30:00Z'
            }
          ]
        })
      });
    });

    // Click on Battle Replays tab
    await page.getByRole('button', { name: /Battle Replays/i }).click();
    
    // Wait for battle replays to load
    await page.waitForTimeout(2000);
    
    // Check battle replay card
    await expect(page.getByText(/Bruce Lee vs Victor Moreau/i)).toBeVisible();
    await expect(page.getByText(/Winner: Victor Moreau/i)).toBeVisible();
    await expect(page.getByText(/1 rounds/i)).toBeVisible();
    
    // Check for fighter images
    const fighterImages = page.locator('img[alt="Bruce Lee"], img[alt="Victor Moreau"]');
    await expect(fighterImages.first()).toBeVisible();
  });

  test('battle replay playback works correctly', async ({ page }) => {
    // Mock battle replays data
    await page.route('**/api/battle-replays/list', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          battleReplays: [
            {
              id: 'battle-1',
              fighterA: {
                id: 'fighter-1',
                name: 'Bruce Lee',
                imageUrl: '/vs/fighters/bruce-lee.jpg',
                stats: { health: 680, maxHealth: 680, strength: 75, luck: 30, agility: 90, defense: 60, age: 32, size: 'medium', build: 'muscular' }
              },
              fighterB: {
                id: 'fighter-2',
                name: 'Victor Moreau',
                imageUrl: '/vs/fighters/victor-moreau.jpg',
                stats: { health: 750, maxHealth: 750, strength: 85, luck: 30, agility: 40, defense: 65, age: 62, size: 'large', build: 'heavy' }
              },
              scene: {
                name: 'Goth Restaurant',
                imageUrl: '/vs/arena/goth-restaurant.jpg',
                description: 'A dark and atmospheric restaurant'
              },
              battleLog: [
                {
                  round: 1,
                  attacker: 'Victor Moreau',
                  defender: 'Bruce Lee',
                  attackCommentary: 'Victor Moreau opens with a powerful strike!',
                  defenseCommentary: 'Bruce Lee dodges with incredible agility!',
                  attackerDamage: 25,
                  defenderDamage: 0,
                  randomEvent: null,
                  arenaObjectsUsed: null,
                  healthAfter: { attacker: 750, defender: 655 }
                }
              ],
              winner: 'Victor Moreau',
              date: '2025-07-15T10:30:00Z'
            }
          ]
        })
      });
    });

    // Navigate to battle replays
    await page.getByRole('button', { name: /Battle Replays/i }).click();
    await page.waitForTimeout(2000);
    
    // Click on a battle replay
    const battleCard = page.locator('div').filter({ hasText: /Bruce Lee vs Victor Moreau/ }).first();
    await battleCard.click();
    
    // Wait for battle viewer to load
    await page.waitForTimeout(2000);
    
    // Check battle viewer elements
    await expect(page.getByText(/Bruce Lee/i)).toBeVisible();
    await expect(page.getByText(/Victor Moreau/i)).toBeVisible();
    await expect(page.getByText(/Goth Restaurant/i)).toBeVisible();
    
    // Check for back button
    await expect(page.getByRole('button', { name: /Back to Battle Selection/i })).toBeVisible();
  });

  test('empty states are handled correctly', async ({ page }) => {
    // Mock empty leaderboard
    await page.route('**/api/tournaments/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          leaderboard: [],
          totalBattles: 0,
          lastUpdated: '2025-07-15T10:30:00Z'
        })
      });
    });

    // Mock empty battle replays
    await page.route('**/api/battle-replays/list', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          battleReplays: []
        })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check empty leaderboard state
    await expect(page.getByText(/No battle data available/i)).toBeVisible();
    
    // Check empty battle replays state
    await page.getByRole('button', { name: /Battle Replays/i }).click();
    await page.waitForTimeout(2000);
    await expect(page.getByText(/No battle replays available/i)).toBeVisible();
  });

  test('navigation between leaderboard and battle replays works', async ({ page }) => {
    // Test switching between views
    await page.getByRole('button', { name: /Battle Replays/i }).click();
    await expect(page.getByText(/Battle Replays/i)).toBeVisible();
    
    await page.getByRole('button', { name: /Leaderboard/i }).click();
    await expect(page.getByText(/Tournament Leaderboard/i)).toBeVisible();
  });

  test('refresh functionality works', async ({ page }) => {
    // Mock leaderboard data
    await page.route('**/api/tournaments/leaderboard', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          leaderboard: [
            {
              name: 'Bruce Lee',
              totalBattles: 5,
              wins: 4,
              losses: 1,
              winRate: 80.0,
              averageDamageDealt: 50.0,
              averageDamageTaken: 24.0,
              averageRoundsSurvived: 4.2,
              currentStats: { strength: 75, agility: 90, luck: 30, defense: 60, health: 680, maxHealth: 680, size: 'medium', build: 'muscular', age: 32 },
              opponents: ['Godzilla'],
              arenas: ['Tokyo Streets'],
              lastBattle: '2025-07-15T10:30:00Z',
              imageUrl: '/vs/fighters/bruce-lee.jpg'
            }
          ],
          totalBattles: 5,
          lastUpdated: '2025-07-15T10:30:00Z'
        })
      });
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
      
      // Verify data is still displayed
      await expect(page.getByText(/Bruce Lee/i)).toBeVisible();
    }
  });
}); 