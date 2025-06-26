import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  theme = signal<Theme>('system');

  effectiveTheme = computed(() =>
    this.theme() === 'system'
      ? this.prefersDark.matches
        ? 'dark'
        : 'light'
      : this.theme()
  );

  constructor() {
    this.initializeTheme();

    effect(() => {
      const actualTheme = this.effectiveTheme();
      this.document.documentElement.setAttribute('data-theme', actualTheme);
      localStorage.setItem('theme', this.theme());
    });

    this.prefersDark.addEventListener('change', (e) => {
      if (this.theme() === 'system') {
        this.document.documentElement.setAttribute(
          'data-theme',
          e.matches ? 'dark' : 'light'
        );
      }
    });
  }

  private initializeTheme(): void {
    const storedTheme = localStorage.getItem('theme') as Theme;
    if (storedTheme) {
      this.theme.set(storedTheme);
      return;
    }

    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      this.theme.set('dark');
    }

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.theme.set(e.matches ? 'dark' : 'light');
        }
      });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
