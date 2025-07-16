import { test, expect } from '@playwright/test';

test.describe('Battle Arena Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/battle-arena');
  });

  test('should display the main page layout and navigation', async ({ page }) => {
    // Check main page elements
    await expect(page.getByRole('heading', { name: 'Battle Arena' })).toBeVisible();
    await expect(page.getByText('Upload an image to create a fighter')).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: 'Tournament' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leaderboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Player vs Player' })).toBeVisible();
  });

  test('should display image upload interface', async ({ page }) => {
    // Check upload area
    await expect(page.getByTestId('image-upload-area')).toBeVisible();
    await expect(page.getByTestId('upload-button')).toBeVisible();
    await expect(page.getByText('Drag and drop an image here, or click to select')).toBeVisible();
  });

  test('should allow image upload and display fighter creation', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    // Wait for image to be processed
    await expect(page.getByTestId('image-preview')).toBeVisible();
    await expect(page.getByTestId('analyzing-indicator')).toBeVisible();
    
    // Wait for fighter to be created
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    await expect(page.getByTestId('fighter-name')).toBeVisible();
    await expect(page.getByTestId('fighter-image')).toBeVisible();
  });

  test('should display fighter stats after creation', async ({ page }) => {
    // Upload an image and wait for fighter creation
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    // Check that all stats are displayed
    await expect(page.getByTestId('fighter-stats')).toBeVisible();
    await expect(page.getByText(/Health:/)).toBeVisible();
    await expect(page.getByText(/Strength:/)).toBeVisible();
    await expect(page.getByText(/Agility:/)).toBeVisible();
    await expect(page.getByText(/Defense:/)).toBeVisible();
    await expect(page.getByText(/Luck:/)).toBeVisible();
    await expect(page.getByText(/Magic:/)).toBeVisible();
    await expect(page.getByText(/Ranged:/)).toBeVisible();
    await expect(page.getByText(/Intelligence:/)).toBeVisible();
    await expect(page.getByText(/Unique Abilities:/)).toBeVisible();
  });

  test('should allow removing created fighter', async ({ page }) => {
    // Upload an image and create fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    // Remove the fighter
    await page.getByTestId('remove-fighter-btn').click();
    
    // Check that fighter is removed and upload area is back
    await expect(page.getByTestId('fighter-creation-complete')).not.toBeVisible();
    await expect(page.getByTestId('image-upload-area')).toBeVisible();
  });

  test('should handle drag and drop upload', async ({ page }) => {
    // Create a file input for drag and drop
    await page.setInputFiles('input[type="file"]', 'public/imgRepository/test-fighter.jpg');
    
    // Wait for image to be processed
    await expect(page.getByTestId('image-preview')).toBeVisible();
    await expect(page.getByTestId('analyzing-indicator')).toBeVisible();
    
    // Wait for fighter to be created
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
  });

  test('should display fighter description', async ({ page }) => {
    // Upload an image and create fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    // Check that description is displayed
    await expect(page.getByTestId('fighter-description')).toBeVisible();
    await expect(page.getByText(/Description:/)).toBeVisible();
  });

  test('should handle multiple fighter uploads', async ({ page }) => {
    // Upload first fighter
    const fileChooserPromise1 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser1 = await fileChooserPromise1;
    await fileChooser1.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    // Remove first fighter
    await page.getByTestId('remove-fighter-btn').click();
    
    // Upload second fighter
    const fileChooserPromise2 = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser2 = await fileChooserPromise2;
    await fileChooser2.setFiles('public/imgRepository/test-fighter-2.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Try to upload an invalid file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('package.json'); // Invalid file
    
    // Check that error message is displayed
    await expect(page.getByTestId('upload-error')).toBeVisible();
  });

  test('should show loading state during analysis', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    // Check that loading state is shown
    await expect(page.getByTestId('analyzing-indicator')).toBeVisible();
    await expect(page.getByText(/Analyzing image.../)).toBeVisible();
  });

  test('should maintain page state after navigation', async ({ page }) => {
    // Upload an image and create fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    // Navigate away and back
    await page.goto('/tournament');
    await page.goto('/battle-arena');
    
    // Check that fighter is still there
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
  });

  test('should display unique abilities correctly', async ({ page }) => {
    // Upload an image and create fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    // Check that unique abilities are displayed
    await expect(page.getByTestId('unique-abilities')).toBeVisible();
    await expect(page.getByText(/Special Abilities:/)).toBeVisible();
  });

  test('should handle large image files', async ({ page }) => {
    // Upload a larger image file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/large-test-image.jpg');
    
    // Wait for processing to complete
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
  });

  test('visual regression - empty state', async ({ page }) => {
    await expect(page).toHaveScreenshot('battle-arena-empty-state.png');
  });

  test('visual regression - with fighter created', async ({ page }) => {
    // Upload an image and create fighter
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    await expect(page.getByTestId('fighter-creation-complete')).toBeVisible();
    
    await expect(page).toHaveScreenshot('battle-arena-with-fighter.png');
  });

  test('visual regression - during analysis', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByTestId('upload-button').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('public/imgRepository/test-fighter.jpg');
    
    // Take screenshot during analysis
    await expect(page.getByTestId('analyzing-indicator')).toBeVisible();
    await expect(page).toHaveScreenshot('battle-arena-analyzing.png');
  });
}); 