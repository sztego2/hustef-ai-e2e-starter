import type { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly accountsHeading: Locator;
  readonly banner: Locator;
  readonly signedInAs: Locator;
  readonly signOutButton: Locator;
  readonly accountsTable: Locator;
  readonly everydayAccount: Locator;
  readonly savingsAccount: Locator;
  readonly paymentsButton: Locator;
  readonly newTransferLink: Locator;
  readonly recentTransactions: Locator;
  readonly loadingAccounts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountsHeading = page.getByRole('heading', { level: 1, name: 'Accounts' });
    this.banner = page.getByRole('banner');
    this.signedInAs = page.getByRole('banner').getByRole('strong');
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
    // Release 2+: accounts are rows in "Your accounts" (were named regions).
    this.accountsTable = page.getByRole('table', { name: 'Your accounts' });
    this.everydayAccount = this.accountsTable.getByRole('row', { name: /Everyday Account/ });
    this.savingsAccount = this.accountsTable.getByRole('row', { name: /Savings Account/ });
    // Release 2+: New transfer sits under the Payments menu.
    this.paymentsButton = page.getByRole('button', { name: 'Payments' });
    this.newTransferLink = page.getByRole('menuitem', { name: 'New transfer' });
    this.recentTransactions = page.getByRole('table', { name: 'Recent transactions' });
    this.loadingAccounts = page.getByText('Loading accounts…');
  }

  async signOut(): Promise<void> {
    await this.signOutButton.click();
  }

  async openPaymentsMenu(): Promise<void> {
    await this.paymentsButton.click();
  }

  transactionRow(name: string): Locator {
    return this.recentTransactions.getByRole('row', { name });
  }

  columnHeader(name: string): Locator {
    return this.recentTransactions.getByRole('columnheader', { name });
  }
}
