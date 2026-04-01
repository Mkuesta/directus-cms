import { test, expect } from '@playwright/test';

test.describe('A-Propos page visual fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/a-propos');
  });

  test('Philosophy section - Ethical Compliance icon renders without overlap', async ({ page }) => {
    const philosophySection = page.locator('section').filter({ hasText: 'Our Philosophy' });
    await expect(philosophySection).toBeVisible();

    // The third card should have the "Ethical Compliance" heading
    const complianceCard = philosophySection.locator('div').filter({ hasText: 'Ethical Compliance' }).first();
    await expect(complianceCard).toBeVisible();

    // The icon should be verified_user (not the broken "compliance" icon)
    const icon = philosophySection.locator('span.material-symbols-outlined', { hasText: 'verified_user' });
    await expect(icon).toBeVisible();

    // Verify the icon container has proper dimensions (not overflowing)
    const iconContainer = icon.locator('..');
    const box = await iconContainer.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeLessThanOrEqual(80); // w-16 = 64px, some tolerance
    expect(box!.height).toBeLessThanOrEqual(80);
  });

  test('GlobalPresence section - 50+ Countries badge is fully visible', async ({ page }) => {
    const globalSection = page.locator('section').filter({ hasText: 'Global Presence, Local Expertise' });
    await expect(globalSection).toBeVisible();

    // The floating badge with "50+" and "Countries Covered" should be visible
    const badge = globalSection.locator('p').filter({ hasText: '50+' }).first();
    await expect(badge).toBeVisible();

    const countriesText = globalSection.locator('p', { hasText: 'Countries Covered' });
    await expect(countriesText).toBeVisible();

    // The badge container should not be clipped
    const badgeBox = await countriesText.boundingBox();
    expect(badgeBox).toBeTruthy();

    // The badge should have reasonable dimensions (not squished/hidden)
    expect(badgeBox!.height).toBeGreaterThan(10);
    expect(badgeBox!.width).toBeGreaterThan(20);
  });

  test('All about page sections render in correct order', async ({ page }) => {
    const sections = [
      'Empowering Healthcare Connections Since 2014',
      'Our Journey',
      'Our Philosophy',
      'Global Presence, Local Expertise',
      'Meet Our Leadership',
      'Numbers That Speak',
      'Ready to Transform Your Healthcare Outreach?',
    ];

    for (const heading of sections) {
      await expect(page.locator('h1, h2').filter({ hasText: heading }).first()).toBeVisible();
    }
  });
});

test.describe('Solutions page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/solutions');
  });

  test('Solutions page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Solutions/);
  });

  test('Solutions hero section renders', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: 'Precision Data for Every Need' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Book a Demo' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Browse Data' })).toBeVisible();
  });

  test('All 6 solution cards render', async ({ page }) => {
    const solutionTitles = [
      'Email List Solutions',
      'Market Intelligence',
      'Intent Data',
      'Campaign Services',
      'CRM Data Enrichment',
      'Compliance Solutions',
    ];

    for (const title of solutionTitles) {
      await expect(page.locator('h3').filter({ hasText: title })).toBeVisible();
    }
  });

  test('How It Works process steps render', async ({ page }) => {
    const steps = ['Consultation', 'Data Curation', 'Verification', 'Delivery & Support'];
    for (const step of steps) {
      await expect(page.locator('h3').filter({ hasText: step })).toBeVisible();
    }
  });

  test('Why Medlead section renders with stats', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Why Medlead?' })).toBeVisible();
    await expect(page.locator('text=By the Numbers')).toBeVisible();
    await expect(page.getByText('4M+', { exact: true })).toBeVisible();
    await expect(page.getByText('95%', { exact: true }).first()).toBeVisible();
  });

  test('CTA section renders with links', async ({ page }) => {
    await expect(page.locator('h2').filter({ hasText: 'Ready to Find Your Solution?' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Get Started' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Explore Data' })).toBeVisible();
  });

  test('Learn More buttons link correctly', async ({ page }) => {
    // Email List Solutions card should link to /email-lists
    const emailLink = page.locator('a[href="/email-lists"]', { hasText: 'Learn More' });
    await expect(emailLink).toBeVisible();
  });
});

test.describe('Navigation - Solutions link', () => {
  test('Solutions nav link points to /solutions', async ({ page }) => {
    await page.goto('/');
    const solutionsLink = page.locator('nav a', { hasText: 'Solutions' });
    await expect(solutionsLink).toHaveAttribute('href', '/solutions');
  });

  test('Solutions nav link navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('nav a', { hasText: 'Solutions' }).click();
    await expect(page).toHaveURL(/\/solutions/);
    await expect(page.locator('h1').filter({ hasText: 'Precision Data for Every Need' })).toBeVisible();
  });
});
