import { expect, type Locator, type Page } from '@playwright/test';
import { KISS_PETER } from './constants';

export class TransferPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly fromAccount: Locator;
  readonly beneficiaryName: Locator;
  readonly iban: Locator;
  readonly checkIbanButton: Locator;
  readonly ibanStatus: Locator;
  readonly amount: Locator;
  readonly reference: Locator;
  readonly continueButton: Locator;
  readonly beneficiaryError: Locator;
  readonly amountError: Locator;
  readonly checkIbanFirstError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: 'New transfer' });
    this.fromAccount = page.getByRole('combobox', { name: 'From account' });
    // Release 2+: Payee name / Payment reference / Review transfer (were Beneficiary / Reference / Continue).
    this.beneficiaryName = page.getByRole('textbox', { name: 'Payee name' });
    this.iban = page.getByRole('textbox', { name: 'IBAN' });
    this.checkIbanButton = page.getByRole('button', { name: 'Check IBAN' });
    this.ibanStatus = page.getByRole('status');
    this.amount = page.getByRole('textbox', { name: 'Amount (HUF)' });
    this.reference = page.getByRole('textbox', { name: 'Payment reference' });
    this.continueButton = page.getByRole('button', { name: 'Review transfer' });
    this.beneficiaryError = page.getByText('Enter a payee name.');
    this.amountError = page.getByText('Enter an amount greater than 0.');
    this.checkIbanFirstError = page.getByText('Check the IBAN first.');
  }

  async goto(): Promise<void> {
    await this.page.goto('/transfer');
  }

  usePayeeButton(name: string): Locator {
    return this.page.getByRole('button', { name: `Use ${name}` });
  }

  async selectFromAccount(label: 'Everyday Account' | 'Savings Account'): Promise<void> {
    await this.fromAccount.selectOption({ label });
  }

  async useSavedPayee(name: string): Promise<void> {
    await this.usePayeeButton(name).click();
  }

  async checkIban(): Promise<void> {
    await this.checkIbanButton.click();
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /** Open New transfer, select account, use Kiss Péter, check IBAN, set amount. */
  async prepareKissPeterTransfer(options: {
    from: 'Everyday Account' | 'Savings Account';
    amount: string;
    reference?: string;
  }): Promise<void> {
    await this.goto();
    await expect(this.heading).toBeVisible();
    await this.selectFromAccount(options.from);
    await this.useSavedPayee(KISS_PETER.name);
    await this.checkIban();
    await expect(this.ibanStatus).toContainText('IBAN verified');
    await this.amount.fill(options.amount);
    if (options.reference !== undefined) {
      await this.reference.fill(options.reference);
    }
  }
}
