// spec: specs/gremlin-bank.md
// seed: seed.spec.ts

import { test, expect, env } from './fixtures';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Sign in and sign out', () => {
  test('Valid credentials open the accounts dashboard', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // 1. Fill Username with GREMLIN_USER and Password with GREMLIN_PASSWORD.
    await login.goto();
    await login.fillCredentials(env('GREMLIN_USER'), env('GREMLIN_PASSWORD'));

    // 2. Click Sign in.
    await login.signIn();

    // Expected: dashboard URL, Accounts heading, Signed in as username, Sign out available.
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(dashboard.accountsHeading).toBeVisible();
    await expect(dashboard.banner).toContainText('Signed in as');
    await expect(dashboard.signedInAs).toHaveText(env('GREMLIN_USER'));
    await expect(dashboard.signOutButton).toBeVisible();
    await expect(login.heading).toHaveCount(0);
  });

  test('Wrong password is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // 1–2. Fill Username with GREMLIN_USER and a password that is not GREMLIN_PASSWORD.
    await login.goto();
    await login.fillCredentials(env('GREMLIN_USER'), 'not-the-gremlin-password');

    // 3. Click Sign in.
    await login.signIn();

    // Expected: stay on /login with alert; Accounts heading is not shown.
    await expect(page).toHaveURL(/\/login$/);
    await expect(login.alert).toHaveText('Wrong username or password.');
    await expect(dashboard.accountsHeading).toHaveCount(0);
  });

  test('Sign out returns to the sign-in page', async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    // Starting point: fresh signed-in dashboard.
    await login.signInAsGremlinUser();
    await expect(dashboard.accountsHeading).toBeVisible();

    // 1. Click Sign out.
    await dashboard.signOut();

    // Expected: /login with Sign in heading and credentials fields; Accounts gone.
    await expect(page).toHaveURL(/\/login$/);
    await expect(login.heading).toBeVisible();
    await expect(login.username).toBeVisible();
    await expect(login.password).toBeVisible();
    await expect(dashboard.accountsHeading).toHaveCount(0);
  });
});
