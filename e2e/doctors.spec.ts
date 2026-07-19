import { test, expect } from '@playwright/test';

test.describe('Doctor Directory', () => {
  test('should view doctors page', async ({ page }) => {
    // Navigate directly to doctors page
    await page.goto('/doctors');
    
    // Check if the page title or a known element is present
    await expect(page.getByRole('heading', { name: 'Find a Doctor', exact: false }).first()).toBeVisible();
    
    // Check if filters or search bar is visible
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });
});
