import { expect, test } from '@playwright/test';

test('homescreen matches visual baseline', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByTestId("button-login").click();
  await page.getByTestId("link-group-personal").waitFor();

  await expect(page).toHaveScreenshot('homescreen.png', {
    maxDiffPixelRatio: 0.01,
  });
});
