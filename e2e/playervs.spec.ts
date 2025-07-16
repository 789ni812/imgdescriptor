import { test, expect } from '@playwright/test';

test.describe('PlayerVs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playervs');
  });

  test('should display the main page layout and navigation', async ({ page }) => {
    // Check main page elements
    await expect(page.getByRole('heading', { name: 'Player vs Player' })).toBeVisible();
    await expect(page.getByText('Select two fighters to battle')).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: 'Tournament' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leaderboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Battle Arena' })).toBeVisible();
  });

  test('should display fighter selection interface', async ({ page }) => {
    // Check fighter selection areas
    await expect(page.getByTestId('fighter-a-selection')).toBeVisible();
    await expect(page.getByTestId('fighter-b-selection')).toBeVisible();
    
    // Check upload buttons
    await expect(page.getByTestId('upload-fighter-a')).toBeVisible();
    await expect(page.getByTestId('upload-fighter-b')).toBeVisible();
    
    // Check that battle button is disabled initially
    await expect(page.getByTestId('start-battle-btn')).toBeDisabled();
  });

  test('should allow fighter upload and display fighter info', async ({ page }) => {
    // Upload a fighter image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    // Wait for fighter to be processed and displayed
    await expect(page.getByTestId('fighter-a-info')).toBeVisible();
    await expect(page.getByTestId('fighter-a-name')).toBeVisible();
    await expect(page.getByTestId('fighter-a-image')).toBeVisible();
    
    // Check that stats are displayed
    await expect(page.getByTestId('fighter-a-stats')).toBeVisible();
  });

  test('should enable battle button when both fighters are selected', async ({ page }) => {
    // Upload first fighter
    const fileChooserPromise1 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser1 = await fileChooserPromise1;
    await fileChooser1.setFiles('public/imgRepository/test-fighter.jpg');
    
    // Upload second fighter
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-b').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles('public/imgRepository/test-fighter-2.jpg');
    
    // Wait for both fighters to be processed
    await expect(page.getByTestId('fighter-a-info')).toBeVisible();
    await expect(page.getByTestId('fighter-b-info')).toBeVisible();
    
    // Check that battle button is now enabled
    await expect(page.getByTestId('start-battle-btn')).toBeEnabled();
  });

  test('should start battle and show battle progress', async ({ page }) => {
    // Setup: Upload both fighters
    const fileChooserPromise1 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser1 = await fileChooserPromise1;
    await fileChooser1.setFiles('public/imgRepository/test-fighter.jpg');
    
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-b').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles('public/imgRepository/test-fighter-2.jpg');
    
    // Wait for fighters to be ready
    await expect(page.getByTestId('start-battle-btn')).toBeEnabled();
    
    // Start battle
    await page.getByTestId('start-battle-btn').click();
    
    // Check that battle is in progress
    await expect(page.getByTestId('battle-in-progress')).toBeVisible();
    await expect(page.getByText('Battle in progress...')).toBeVisible();
  });

  test('should show battle results modal after battle completion', async ({ page }) => {
    // Setup: Upload both fighters and start battle
    const fileChooserPromise1 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser1 = await fileChooserPromise1;
    await fileChooser1.setFiles('public/imgRepository/test-fighter.jpg');
    
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-b').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles('public/imgRepository/test-fighter-2.jpg');
    
    await expect(page.getByTestId('start-battle-btn')).toBeEnabled();
    await page.getByTestId('start-battle-btn').click();
    
    // Wait for battle to complete and modal to appear
    await expect(page.getByTestId('winner-animation-modal')).toBeVisible();
    
    // Check modal content
    await expect(page.getByTestId('winner-announcement')).toBeVisible();
    await expect(page.getByTestId('fighter-a-stats-card')).toBeVisible();
    await expect(page.getByTestId('fighter-b-stats-card')).toBeVisible();
    await expect(page.getByTestId('battle-overview')).toBeVisible();
    await expect(page.getByTestId('round-details')).toBeVisible();
  });

  test('should allow removing fighters', async ({ page }) => {
    // Upload a fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-a-info')).toBeVisible();
    
    // Remove the fighter
    await page.getByTestId('remove-fighter-a').click();
    
    // Check that fighter is removed
    await expect(page.getByTestId('fighter-a-info')).not.toBeVisible();
    await expect(page.getByTestId('upload-fighter-a')).toBeVisible();
  });

  test('should display fighter stats correctly', async ({ page }) => {
    // Upload a fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    // Check that all stats are displayed
    await expect(page.getByTestId('fighter-a-stats')).toBeVisible();
    await expect(page.getByText(/Health:/)).toBeVisible();
    await expect(page.getByText(/Strength:/)).toBeVisible();
    await expect(page.getByText(/Agility:/)).toBeVisible();
    await expect(page.getByText(/Defense:/)).toBeVisible();
    await expect(page.getByText(/Luck:/)).toBeVisible();
    await expect(page.getByText(/Magic:/)).toBeVisible();
    await expect(page.getByText(/Ranged:/)).toBeVisible();
    await expect(page.getByText(/Intelligence:/)).toBeVisible();
  });

  test('should handle battle replay functionality', async ({ page }) => {
    // Setup: Complete a battle first
    const fileChooserPromise1 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser1 = await fileChooserPromise1;
    await fileChooser1.setFiles('public/imgRepository/test-fighter.jpg');
    
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-b').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles('public/imgRepository/test-fighter-2.jpg');
    
    await page.getByTestId('start-battle-btn').click();
    
    // Wait for battle to complete
    await expect(page.getByTestId('winner-animation-modal')).toBeVisible();
    
    // Close the modal
    await page.getByTestId('close-modal-btn').click();
    
    // Check that replay button is available
    await expect(page.getByTestId('replay-battle-btn')).toBeVisible();
    
    // Click replay
    await page.getByTestId('replay-battle-btn').click();
    
    // Check that modal appears again
    await expect(page.getByTestId('winner-animation-modal')).toBeVisible();
  });

  test('should maintain page state after navigation', async ({ page }) => {
    // Upload a fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-a-info')).toBeVisible();
    
    // Navigate away and back
    await page.goto('/tournament');
    await page.goto('/playervs');
    
    // Check that fighter is still there
    await expect(page.getByTestId('fighter-a-info')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Try to upload an invalid file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('package.json'); // Invalid file
    
    // Check that error message is displayed
    await expect(page.getByTestId('upload-error')).toBeVisible();
  });

  test('visual regression - empty state', async ({ page }) => {
    await expect(page).toHaveScreenshot('playervs-empty-state.png');
  });

  test('visual regression - with fighters selected', async ({ page }) => {
    // Upload both fighters
    const fileChooserPromise1 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-a').click();
    const fileChooser1 = await fileChooserPromise1;
    await fileChooser1.setFiles('public/imgRepository/test-fighter.jpg');
    
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-fighter-b').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles('public/imgRepository/test-fighter-2.jpg');
    
    // Wait for both fighters to be processed
    await expect(page.getByTestId('fighter-a-info')).toBeVisible();
    await expect(page.getByTestId('fighter-b-info')).toBeVisible();
    
    await expect(page).toHaveScreenshot('playervs-with-fighters.png');
  });
}); 