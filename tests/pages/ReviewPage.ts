import { expect, type Locator, type Page } from '@playwright/test';
import { env } from '../fixtures';

export class ReviewPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly transferDetails: Locator;
  readonly confirmTransferButton: Locator;
  readonly confirmPaymentDialog: Locator;
  readonly submittedHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: 'Review transfer' });
    this.transferDetails = page.getByRole('table', { name: 'Transfer details' });
    this.confirmTransferButton = page.getByRole('button', { name: 'Confirm transfer' });
    this.confirmPaymentDialog = page.getByRole('dialog', { name: 'Confirm payment' });
    this.submittedHeading = page.getByRole('heading', { level: 1, name: 'Transfer submitted' });
  }

  detailRow(label: string, value: string): Locator {
    return this.transferDetails.getByRole('row', { name: `${label} ${value}` });
  }

  confirmationText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  /** Enter the Transaction PIN inside the closed shadow tree, then confirm and approve. */
  async confirmTransferWithPin(): Promise<void> {
    await this.confirmTransferButton.focus();
    await this.page.keyboard.press('Shift+Tab');
    await this.page.keyboard.type(env('GREMLIN_PIN'));
    await this.confirmTransferButton.click();

    await expect(this.confirmPaymentDialog).toBeVisible();
    await this.confirmPaymentDialog
      .getByTitle('Gremlin Secure')
      .contentFrame()
      .getByRole('button', { name: 'Approve payment' })
      .click();
  }
}
