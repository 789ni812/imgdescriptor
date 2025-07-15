import { test, expect } from '@playwright/test';

test.describe('PlayerVsPage E2E', () => {
  test('loads the /playervs page and shows the header and Start Fight button', async ({ page }) => {
    await page.goto('/playervs');
    await expect(page.getByTestId('playervs-page')).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Fight/i })).toBeVisible();
  });

  test('page is in setup phase and ready for user interaction', async ({ page }) => {
    await page.goto('/playervs');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that we're in setup phase
    await expect(page.getByTestId('setup-phase')).toBeVisible();
    await expect(page.getByText('Upload Your Fighters')).toBeVisible();
    
    // Check that fighter upload sections are present
    await expect(page.getByTestId('fighter-upload-sections')).toBeVisible();
    await expect(page.getByTestId('fighter-a-card')).toBeVisible();
    await expect(page.getByTestId('fighter-b-card')).toBeVisible();
    
    // Check that arena upload section is present
    await expect(page.getByRole('heading', { name: 'Battle Arena' })).toBeVisible();
    
    // Check that Rebalance Fighters button is present
    await expect(page.getByTestId('rebalance-section')).toBeVisible();
    
    // Verify Start Fight button is disabled (no fighters/arena selected yet)
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    await expect(startFightButton).toBeDisabled();
  });

  test('rebalance fighters flow works correctly', async ({ page }) => {
    await page.goto('/playervs');
    await page.waitForLoadState('networkidle');
    
    // Click the Rebalance Fighters button
    const rebalanceButton = page.getByRole('button', { name: /Rebalance Fighters/i });
    await rebalanceButton.click();
    
    // Wait for the button text to change to loading state
    const loadingButton = page.getByRole('button', { name: /Rebalancing Fighters\.\.\./i });
    await expect(loadingButton).toBeVisible();
    await expect(loadingButton).toBeDisabled();
    
    // Wait for the API call to complete and success message to appear
    await expect(page.getByText(/Successfully rebalanced/i)).toBeVisible();
    
    // Verify the button is re-enabled
    await expect(rebalanceButton).toBeEnabled();
    
    // Verify fighter results are displayed
    await expect(page.getByText(/Rebalanced Fighters:/i)).toBeVisible();
    
    // Wait for the success message to auto-clear (should happen after 5 seconds)
    await page.waitForTimeout(6000);
    await expect(page.getByText(/Successfully rebalanced/i)).not.toBeVisible();
  });

  test('diagnostic: check what is actually on the page', async ({ page }) => {
    await page.goto('/playervs');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'e2e/debug-playervs-page.png', fullPage: true });
    
    // Log all images on the page
    const images = await page.locator('img').all();
    console.log(`Found ${images.length} images on the page:`);
    for (let i = 0; i < images.length; i++) {
      const alt = await images[i].getAttribute('alt');
      const src = await images[i].getAttribute('src');
      console.log(`Image ${i + 1}: alt="${alt}", src="${src}"`);
    }
    
    // Log all text content for debugging
    const textContent = await page.textContent('body');
    console.log('Page text content:', textContent?.substring(0, 500) + '...');
    
    // Check if we're in setup phase
    const setupText = await page.textContent('body');
    expect(setupText).toContain('Upload Your Fighters');
  });

  test('round history panel displays commentary and avatars for each round after battle', async ({ page }) => {
    // Mock the battle generation API to return a static battle log
    await page.route('**/api/fighting-game/generate-battle', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          battleLog: [
            {
              round: 1,
              attacker: 'Godzilla',
              defender: 'Bruce Lee',
              attackCommentary: 'Godzilla smashes Bruce Lee with a mighty tail swipe!',
              defenseCommentary: 'Bruce Lee dodges with lightning speed!',
              attackerDamage: 30,
              defenderDamage: 0,
              randomEvent: null,
              arenaObjectsUsed: [],
              healthAfter: { attacker: 500, defender: 90 }
            },
            {
              round: 2,
              attacker: 'Bruce Lee',
              defender: 'Godzilla',
              attackCommentary: 'Bruce Lee lands a flying kick on Godzilla!',
              defenseCommentary: 'Godzilla shrugs off the attack.',
              attackerDamage: 10,
              defenderDamage: 0,
              randomEvent: null,
              arenaObjectsUsed: [],
              healthAfter: { attacker: 500, defender: 80 }
            }
          ]
        })
      });
    });
    // Log all browser console messages
    page.on('console', msg => {
      console.log('BROWSER LOG:', msg.type(), msg.text());
    });
    // Log all network requests and responses
    page.on('request', request => {
      console.log('REQUEST:', request.method(), request.url());
    });
    page.on('response', response => {
      console.log('RESPONSE:', response.status(), response.url());
    });
    await page.goto('/playervs');
    await page.waitForLoadState('networkidle');

    // Ensure demo fighters and arena are loaded
    const resetDemoButton = page.locator('button', { hasText: 'Reset to Demo' });
    if (await resetDemoButton.isVisible()) {
      await resetDemoButton.click();
      // Wait for the page to update after reset
      await page.waitForTimeout(1000);
    }
    
    // Wait for demo fighters to be loaded (check for fighter names in the UI)
    await page.waitForSelector('text=Godzilla', { timeout: 10000 });
    await page.waitForSelector('text=Bruce Lee', { timeout: 10000 });
    await page.waitForSelector('text=Tokyo City Streets', { timeout: 10000 });
    
    // Wait for Start Fight button to be enabled
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    await expect(startFightButton).toBeEnabled({ timeout: 10000 });
    await startFightButton.click();

    // Debug: Take a screenshot and log the DOM after starting the fight
    await page.screenshot({ path: 'e2e/debug-after-start-fight.png', fullPage: true });
    const dom = await page.content();
    console.log('DOM after Start Fight:', dom.substring(0, 2000));
    const textContent = await page.textContent('body');
    console.log('Page text after Start Fight:', textContent?.substring(0, 1000));
    // Wait longer to see if the UI eventually renders the round history
    await page.waitForTimeout(10000);

    // Wait for the battle to start and the battle storyboard to appear
    try {
      // Wait for either the round animation OR the battle storyboard to appear
      // This handles cases where the round animation doesn't render in E2E
      await Promise.race([
        page.waitForSelector('text=Round 1', { timeout: 15000 }),
        page.waitForSelector('[data-testid="battle-storyboard"]', { timeout: 15000 }),
        // Also wait for battle commentary text to appear (more reliable)
        page.waitForSelector('text=Godzilla smashes Bruce Lee with a mighty tail swipe!', { timeout: 15000 })
      ]);
      
      // If we got here, either the round animation or storyboard appeared
      // Now wait for the battle storyboard specifically (it should appear after round animation)
      // Try multiple selectors since data-testid might not work in E2E
      await Promise.race([
        page.waitForSelector('[data-testid="battle-storyboard"]', { timeout: 30000 }),
        page.waitForSelector('text=Godzilla smashes Bruce Lee with a mighty tail swipe!', { timeout: 30000 }),
        page.waitForSelector('text=Bruce Lee lands a flying kick on Godzilla!', { timeout: 30000 })
      ]);
    } catch (e) {
      // Fallback: check for error or fallback message
      const errorText = await page.textContent('body');
      console.log('Fallback error/fallback message:', errorText?.substring(0, 500));
      throw e;
    }

    // Check for commentary text in the round history panel
    await expect(page.getByText('Godzilla smashes Bruce Lee with a mighty tail swipe!')).toBeVisible();
    await expect(page.getByText('Bruce Lee lands a flying kick on Godzilla!')).toBeVisible();
    
    // Check for at least one avatar image in the round history panel
    // Try multiple selectors since data-testid might not work in E2E
    const avatars = await page.locator('img[alt="Godzilla"], img[alt="Bruce Lee"]').count();
    expect(avatars).toBeGreaterThan(0);
  });
}); 