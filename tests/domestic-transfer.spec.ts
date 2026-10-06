// spec: specs/gremlin-bank.md
// seed: seed.spec.ts

import { test, expect } from './fixtures';
import { KISS_PETER } from './pages/constants';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransferPage } from './pages/TransferPage';
import { ReviewPage } from './pages/ReviewPage';

test.describe('Domestic transfer', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);
    await login.signInAsGremlinUser();
    await expect(dashboard.accountsHeading).toBeVisible();
  });

  test('Empty beneficiary is rejected', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // Starting point: New transfer with empty beneficiary.
    await transfer.goto();
    await expect(transfer.heading).toBeVisible();

    // 1–2. Leave Beneficiary name empty and click Continue.
    await transfer.continue();

    // Expected: inline error; review is not shown.
    await expect(transfer.beneficiaryError).toBeVisible();
    await expect(review.heading).toHaveCount(0);
  });

  test('Invalid IBAN is rejected', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // Starting point: New transfer.
    await transfer.goto();
    await expect(transfer.heading).toBeVisible();

    // 1–2. Fill beneficiary and a non-valid IBAN.
    await transfer.beneficiaryName.fill(KISS_PETER.name);
    await transfer.iban.fill('HU00 0000 0000 0000 0000 0000 0000');

    // 3. Click Check IBAN.
    await transfer.checkIban();
    await expect(transfer.ibanStatus).toHaveText('Invalid IBAN');

    // 4. Click Continue.
    await transfer.continue();

    // Expected: still not on review; Check the IBAN first.
    await expect(transfer.checkIbanFirstError).toBeVisible();
    await expect(review.heading).toHaveCount(0);
  });

  test('Zero amount is rejected', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // 1–3. Use Kiss Péter, check IBAN, fill amount 0.
    await transfer.prepareKissPeterTransfer({ from: 'Everyday Account', amount: '0' });

    // 4. Click Continue.
    await transfer.continue();

    // Expected: amount error; review is not shown.
    await expect(transfer.amountError).toBeVisible();
    await expect(review.heading).toHaveCount(0);
  });

  test('Transfer fee for 10,000 HUF is 200 HUF (floor)', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // Amount 10,000 from Everyday → fee floor 200, total 10,200.
    await transfer.prepareKissPeterTransfer({ from: 'Everyday Account', amount: '10000' });
    await transfer.continue();

    await expect(review.heading).toBeVisible();
    await expect(review.detailRow('From', 'Everyday Account')).toBeVisible();
    await expect(review.detailRow('To', KISS_PETER.name)).toBeVisible();
    await expect(review.detailRow('IBAN', KISS_PETER.iban)).toBeVisible();
    await expect(review.detailRow('Amount', '10,000 HUF')).toBeVisible();
    await expect(review.detailRow('Fee', '200 HUF')).toBeVisible();
    await expect(review.detailRow('Total', '10,200 HUF')).toBeVisible();
  });

  test('Transfer fee for 100,000 HUF is 300 HUF', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // Amount 100,000 from Everyday → 0.3% = 300, total 100,300.
    await transfer.prepareKissPeterTransfer({ from: 'Everyday Account', amount: '100000' });
    await transfer.continue();

    await expect(review.heading).toBeVisible();
    await expect(review.detailRow('Amount', '100,000 HUF')).toBeVisible();
    await expect(review.detailRow('Fee', '300 HUF')).toBeVisible();
    await expect(review.detailRow('Total', '100,300 HUF')).toBeVisible();
  });

  test('Transfer fee for 2,000,000 HUF is 6,000 HUF (ceiling)', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // Amount 2,000,000 from Savings → fee ceiling 6,000, total 2,006,000.
    await transfer.prepareKissPeterTransfer({ from: 'Savings Account', amount: '2000000' });
    await transfer.continue();

    await expect(review.heading).toBeVisible();
    await expect(review.detailRow('From', 'Savings Account')).toBeVisible();
    await expect(review.detailRow('Amount', '2,000,000 HUF')).toBeVisible();
    await expect(review.detailRow('Fee', '6,000 HUF')).toBeVisible();
    await expect(review.detailRow('Total', '2,006,000 HUF')).toBeVisible();
  });

  test('Happy path to Kiss Péter: review, PIN, confirmation', async ({ page }) => {
    const transfer = new TransferPage(page);
    const review = new ReviewPage(page);

    // 1–6. New transfer Everyday → Kiss Péter, amount 10,000, Continue.
    await transfer.prepareKissPeterTransfer({
      from: 'Everyday Account',
      amount: '10000',
      reference: 'Workshop happy path',
    });
    await transfer.continue();

    // 7. On Review transfer, check amount, fee, total, payee and IBAN.
    await expect(review.heading).toBeVisible();
    await expect(review.detailRow('To', KISS_PETER.name)).toBeVisible();
    await expect(review.detailRow('IBAN', KISS_PETER.iban)).toBeVisible();
    await expect(review.detailRow('Amount', '10,000 HUF')).toBeVisible();
    await expect(review.detailRow('Fee', '200 HUF')).toBeVisible();
    await expect(review.detailRow('Total', '10,200 HUF')).toBeVisible();

    // 8–9. Enter GREMLIN_PIN, Confirm transfer (and approve payment dialog).
    await review.confirmTransferWithPin();

    // Expected: Transfer submitted with business values and generated reference format.
    // Confirmation uses dt/dd; getByRole('term', { name }) does not match their accessible names.
    await expect(review.submittedHeading).toBeVisible();
    await expect(review.confirmationText('Paid to', { exact: true })).toBeVisible();
    await expect(review.confirmationText(KISS_PETER.name, { exact: true })).toBeVisible();
    await expect(review.confirmationText(KISS_PETER.iban, { exact: true })).toBeVisible();
    await expect(review.confirmationText('10,000 HUF', { exact: true })).toBeVisible();
    await expect(review.confirmationText('200 HUF', { exact: true })).toBeVisible();
    await expect(review.confirmationText('10,200 HUF', { exact: true })).toBeVisible();
    await expect(review.confirmationText('New balance, Everyday Account', { exact: true })).toBeVisible();
    await expect(review.confirmationText('1,239,800 HUF', { exact: true })).toBeVisible();
    await expect(review.confirmationText(/^Reference: GB-[A-Z0-9]+$/)).toBeVisible();
  });
});
