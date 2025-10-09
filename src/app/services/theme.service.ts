import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  themeChanged = new Subject<boolean>();
  private currentTheme: Theme = 'light';

  constructor() {
    // Vérifier le thème stocké dans le localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Utiliser le thème du système par défaut
      this.setTheme('dark');
    }
  }

  setTheme(theme: Theme | boolean): void {
    const themeValue = typeof theme === 'boolean' ? (theme ? 'dark' : 'light') : theme;
    this.currentTheme = themeValue as Theme;
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    this.themeChanged.next(this.currentTheme === 'dark');
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }
}
