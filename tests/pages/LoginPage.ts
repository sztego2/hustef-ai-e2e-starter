import type { Locator, Page } from '@playwright/test';
import { env } from '../fixtures';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  readonly alert: Locator;
  readonly cookieDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    // Release 2+: "Welcome back" / "User ID" / "Log in" (was "Sign in to Gremlin Bank" / "Username" / "Sign in").
    this.heading = page.getByRole('heading', { level: 1, name: 'Welcome back' });
    this.username = page.getByRole('textbox', { name: 'User ID' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Log in' });
    this.alert = page.getByRole('alert');
    this.cookieDialog = page.getByRole('dialog', { name: 'Cookies' });
  }

  /** Release 2+ shows a cookie consent dialog on first visit; dismiss it so the form is usable. */
  async dismissCookiesIfShown(): Promise<void> {
    if (await this.cookieDialog.isVisible()) {
      await this.cookieDialog.getByRole('button', { name: 'Only necessary' }).click();
    }
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.dismissCookiesIfShown();
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
  }

  async signIn(): Promise<void> {
    await this.signInButton.click();
  }

  /** Sign in with env credentials (seed setup). Does not assert business values. */
  async signInAsGremlinUser(): Promise<void> {
    await this.goto();
    await this.fillCredentials(env('GREMLIN_USER'), env('GREMLIN_PASSWORD'));
    await this.signIn();
  }
}
