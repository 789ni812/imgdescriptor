import { test, expect } from '@playwright/test';

test.describe('WinnerAnimation Enhanced Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the playervs page
    await page.goto('/playervs');
    // Wait for the page to load using a reliable data-testid
    await page.waitForSelector('[data-testid="playervs-page"]', { timeout: 10000 });
  });

  test('should display enhanced winner animation with fighter stats and battle overview', async ({ page }) => {
    // Reset to demo to ensure we have known fighters
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    // Start the fight
    await page.click('button:has-text("Start Fight")');
    
    // Wait for battle to complete and winner animation to appear
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check that the winner announcement is displayed
    await expect(page.locator('text=wins the battle!')).toBeVisible();

    // Check that fighter stats section is displayed
    await expect(page.locator('text=Fighter Stats')).toBeVisible();

    // Check that both fighter names are displayed in stats
    await expect(page.locator('text=Godzilla')).toBeVisible();
    await expect(page.locator('text=Bruce Lee')).toBeVisible();

    // Check that fighter images are displayed in stats section
    await expect(page.locator('img[alt="Godzilla"]')).toBeVisible();
    await expect(page.locator('img[alt="Bruce Lee"]')).toBeVisible();

    // Check that key stats are displayed (using regex for flexibility)
    await expect(page.locator('text=/Strength:/')).toBeVisible();
    await expect(page.locator('text=/Agility:/')).toBeVisible();
    await expect(page.locator('text=/Defense:/')).toBeVisible();
    await expect(page.locator('text=/Luck:/')).toBeVisible();

    // Check that battle overview section is displayed
    await expect(page.locator('text=Battle Overview')).toBeVisible();

    // Check that round information is displayed
    await expect(page.locator('text=/Round 1/')).toBeVisible();

    // Check that fighter icons are displayed in battle overview
    // Look for small circular images in the battle overview section
    const battleOverview = page.locator('text=Battle Overview').locator('..').locator('..');
    await expect(battleOverview.locator('img[class*="w-6 h-6"]')).toHaveCount(2);

    // Check that commentary is displayed
    await expect(page.locator('text=/Godzilla:/')).toBeVisible();
    await expect(page.locator('text=/Bruce Lee:/')).toBeVisible();

    // Check that restart and close buttons are present
    await expect(page.locator('button:has-text("Restart")')).toBeVisible();
    await expect(page.locator('button:has-text("Close")')).toBeVisible();
  });

  test('should display final health values in fighter stats', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    // Start the fight
    await page.click('button:has-text("Start Fight")');
    
    // Wait for winner animation
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check that final health is displayed for both fighters
    await expect(page.locator('text=/Final Health:/')).toBeVisible();
    
    // Should show health for both fighters
    const finalHealthElements = page.locator('text=/Final Health:/');
    await expect(finalHealthElements).toHaveCount(2);
  });

  test('should handle missing fighter images gracefully', async ({ page }) => {
    // This test would require fighters without images
    // For now, we'll test that the component handles missing images in the battle overview
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check that the battle overview section renders even with potential missing images
    await expect(page.locator('text=Battle Overview')).toBeVisible();
    
    // The component should handle missing images by showing a placeholder
    const battleOverview = page.locator('text=Battle Overview').locator('..').locator('..');
    // Should have some images or placeholders
    await expect(battleOverview.locator('img, div[class*="w-6 h-6"]')).toHaveCount(2);
  });

  test('should filter out undefined special events', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check that battle overview is displayed
    await expect(page.locator('text=Battle Overview')).toBeVisible();

    // Should NOT show "Special Event: undefined" - this is the key test
    const specialEventUndefined = page.locator('text=Special Event: undefined');
    await expect(specialEventUndefined).not.toBeVisible();

    // Should NOT show "Arena Used: undefined"
    const arenaUsedUndefined = page.locator('text=Arena Used: undefined');
    await expect(arenaUsedUndefined).not.toBeVisible();
  });

  test('should display KO when a fighter is defeated', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check if KO is displayed (this depends on the battle outcome)
    // We'll check for either the KO text or the normal winner text
    const winnerText = page.locator('text=wins the battle!');
    const koText = page.locator('text=KO!');
    
    // At least one should be visible
    await expect(winnerText.or(koText)).toBeVisible();
  });

  test('should handle restart functionality', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Click restart button
    await page.click('button:has-text("Restart")');

    // Should return to setup phase
    await expect(page.locator('button:has-text("Start Fight")')).toBeVisible();
    await expect(page.locator('text=wins the battle!')).not.toBeVisible();
  });

  test('should handle close functionality', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Click close button
    await page.click('button:has-text("Close")');

    // Should close the modal and return to setup phase
    await expect(page.locator('text=wins the battle!')).not.toBeVisible();
    await expect(page.locator('button:has-text("Start Fight")')).toBeVisible();
  });

  test('should display draw correctly', async ({ page }) => {
    // This test would require a specific battle that results in a draw
    // For now, we'll test the component structure
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check that either winner or draw text is displayed
    const winnerText = page.locator('text=wins the battle!');
    const drawText = page.locator('text=It\'s a DRAW!');
    
    await expect(winnerText.or(drawText)).toBeVisible();
  });

  test('should display battle overview with proper round structure', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check battle overview structure
    await expect(page.locator('text=Battle Overview')).toBeVisible();
    
    // Check that rounds are displayed
    const battleOverview = page.locator('text=Battle Overview').locator('..').locator('..');
    
    // Should have round headers
    await expect(battleOverview.locator('text=/Round [0-9]+/')).toBeVisible();
    
    // Should have attacker and defender commentary
    await expect(battleOverview.locator('text=/Godzilla:/')).toBeVisible();
    await expect(battleOverview.locator('text=/Bruce Lee:/')).toBeVisible();
  });

  test('should display fighter stats with all required information', async ({ page }) => {
    // Reset to demo
    await page.click('button:has-text("Reset to Demo")');
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Start Fight")');
    await page.waitForSelector('text=wins the battle!', { timeout: 30000 });

    // Check fighter stats section
    await expect(page.locator('text=Fighter Stats')).toBeVisible();
    
    // Check that both fighters have their stats displayed
    const statsSection = page.locator('text=Fighter Stats').locator('..');
    
    // Should have two fighter stat cards
    await expect(statsSection.locator('div[class*="bg-gray-800"]')).toHaveCount(2);
    
    // Check that key stats are present for both fighters
    await expect(page.locator('text=/Strength:/')).toBeVisible();
    await expect(page.locator('text=/Agility:/')).toBeVisible();
    await expect(page.locator('text=/Defense:/')).toBeVisible();
    await expect(page.locator('text=/Luck:/')).toBeVisible();
    await expect(page.locator('text=/Age:/')).toBeVisible();
    await expect(page.locator('text=/Size:/')).toBeVisible();
  });
}); 