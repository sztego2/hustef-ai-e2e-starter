import type { Locator, Page } from '@playwright/test';
import { env } from '../fixtures';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: 'Sign in to Gremlin Bank' });
    this.username = page.getByRole('textbox', { name: 'Username' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.alert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
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
