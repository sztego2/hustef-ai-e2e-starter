// spec: specs/gremlin-bank.md
// seed: seed.spec.ts

import { test, expect } from './fixtures';
import { FRESH } from './pages/constants';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    await login.signInAsGremlinUser();
    await expect(dashboard.accountsHeading).toBeVisible();
    await expect(dashboard.loadingAccounts).toHaveCount(0);
  });

  test('Everyday and Savings accounts show IBANs and fresh balances', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // 1. Read the Everyday Account and Savings Account regions.
    await expect(dashboard.everydayAccount.getByText(FRESH.everydayIban)).toBeVisible();
    await expect(dashboard.everydayAccount.getByText(FRESH.everydayBalance)).toBeVisible();

    await expect(dashboard.savingsAccount.getByText(FRESH.savingsIban)).toBeVisible();
    await expect(dashboard.savingsAccount.getByText(FRESH.savingsBalance)).toBeVisible();

    await expect(dashboard.newTransferLink).toHaveAttribute('href', '/transfer');
  });

  test('Recent transactions table lists the seed activity', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    // 1. Open the Recent transactions table (columns Date, Description, Amount).
    await expect(dashboard.columnHeader('Date')).toBeVisible();
    await expect(dashboard.columnHeader('Description')).toBeVisible();
    await expect(dashboard.columnHeader('Amount')).toBeVisible();

    await expect(dashboard.transactionRow('2026-09-30 Grocery store, Budapest -18,450 HUF')).toBeVisible();
    await expect(dashboard.transactionRow('2026-09-29 Salary, Gremlin Works Ltd. +685,000 HUF')).toBeVisible();
    await expect(dashboard.transactionRow('2026-09-27 Mobile phone bill -7,990 HUF')).toBeVisible();
    await expect(dashboard.transactionRow('2026-09-25 Card payment, bookshop -12,300 HUF')).toBeVisible();
    await expect(dashboard.transactionRow('2026-09-24 Transfer from Savings Account +50,000 HUF')).toBeVisible();
  });
});
