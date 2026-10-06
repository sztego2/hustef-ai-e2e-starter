import type { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly accountsHeading: Locator;
  readonly banner: Locator;
  readonly signedInAs: Locator;
  readonly signOutButton: Locator;
  readonly everydayAccount: Locator;
  readonly savingsAccount: Locator;
  readonly newTransferLink: Locator;
  readonly recentTransactions: Locator;
  readonly loadingAccounts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountsHeading = page.getByRole('heading', { level: 1, name: 'Accounts' });
    this.banner = page.getByRole('banner');
    this.signedInAs = page.getByRole('banner').getByRole('strong');
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
    this.everydayAccount = page.getByRole('region', { name: 'Everyday Account' });
    this.savingsAccount = page.getByRole('region', { name: 'Savings Account' });
    this.newTransferLink = page.getByRole('link', { name: 'New transfer' });
    this.recentTransactions = page.getByRole('table', { name: 'Recent transactions' });
    this.loadingAccounts = page.getByText('Loading accounts…');
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  transactionRow(name: string): Locator {
    return this.recentTransactions.getByRole('row', { name });
  }

  columnHeader(name: string): Locator {
    return this.recentTransactions.getByRole('columnheader', { name });
  }
}
