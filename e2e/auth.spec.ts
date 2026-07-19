import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should navigate to login page from navbar', async ({ page }) => {
    await page.goto('/');
    
    // Click the Sign In button
    const signInButton = page.getByRole('link', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Expect to be on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });
  
  test('should navigate to register page from navbar', async ({ page }) => {
    await page.goto('/');
    
    // Click the Get Started button
    const getStartedButton = page.getByRole('link', { name: 'Get Started' });
    await expect(getStartedButton).toBeVisible();
    await getStartedButton.click();
    
    // Expect to be on register page
    await expect(page).toHaveURL(/.*\/auth\/register/);
  });
});
