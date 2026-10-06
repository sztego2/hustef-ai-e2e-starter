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
    // Release 2+: Send money / Payment approval / Money sent / Approve (were Confirm transfer / Confirm payment / Transfer submitted / Approve payment).
    this.confirmTransferButton = page.getByRole('button', { name: 'Send money' });
    this.confirmPaymentDialog = page.getByRole('dialog', { name: 'Payment approval' });
    this.submittedHeading = page.getByRole('heading', { level: 1, name: 'Money sent' });
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
      .getByTitle('Payment approval')
      .contentFrame()
      .getByRole('button', { name: 'Approve' })
      .click();
  }
}
