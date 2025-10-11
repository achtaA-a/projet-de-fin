import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar';
import { FooterComponent } from '../../shared/footer/footer';
import { ErrorDisplayComponent } from '../../shared/error-display/error-display.component';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ErrorDisplayComponent],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-error-display></app-error-display>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .page-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
    }
    
    .main-content {
      flex: 1;
      padding-top: 76px; /* Hauteur de la navbar */
      background-color: #f8f9fa;
      transition: all 0.3s ease;
    }

    /* Styles pour le thème sombre */
    :host-context(body.dark-theme) .main-content {
      background-color: #121212;
      color: #e0e0e0;
    }

    /* Ajustements pour les écrans mobiles */
    @media (max-width: 991.98px) {
      .main-content {
        padding-top: 65px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private themeSubscription: Subscription | undefined;
  isDarkTheme = false;

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    // S'abonner aux changements de thème
    this.themeSubscription = this.themeService.themeChanged.subscribe((isDark: boolean) => {
      this.isDarkTheme = isDark;
      this.updateThemeClass(isDark);
    });

    // Vérifier le thème initial
    this.checkInitialTheme();
  }

  ngOnDestroy() {
    // Nettoyer l'abonnement
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private checkInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Utiliser le thème sauvegardé ou les préférences système
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.themeService.setTheme(isDark);
  }

  private updateThemeClass(isDark: boolean) {
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}
