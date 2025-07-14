import { test, expect } from '@playwright/test';

test.describe('PlayerVsPage E2E', () => {
  test('loads the /playervs page and shows the header and Start Fight button', async ({ page }) => {
    await page.goto('/playervs');
    await expect(page.getByRole('heading', { name: /AI Image Describer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Start Fight/i })).toBeVisible();
  });

  test('page is in setup phase and ready for user interaction', async ({ page }) => {
    await page.goto('/playervs');
    
    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check that we're in setup phase
    await expect(page.getByText('Upload Your Fighters')).toBeVisible();
    
    // Check that fighter upload sections are present (using first() to avoid strict mode)
    await expect(page.getByText('Upload image for Fighter A').first()).toBeVisible();
    await expect(page.getByText('Upload image for Fighter B').first()).toBeVisible();
    
    // Check that arena upload section is present (using role for heading)
    await expect(page.getByRole('heading', { name: 'Battle Arena' })).toBeVisible();
    await expect(page.getByText('Upload image of the fighting scene')).toBeVisible();
    
    // Check that Rebalance Fighters button is present
    await expect(page.getByRole('button', { name: /Rebalance Fighters/i })).toBeVisible();
    
    // Verify Start Fight button is disabled (no fighters/arena selected yet)
    const startFightButton = page.getByRole('button', { name: /Start Fight/i });
    await expect(startFightButton).toBeDisabled();
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
}); 