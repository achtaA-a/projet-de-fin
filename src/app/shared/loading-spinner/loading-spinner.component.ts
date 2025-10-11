import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container" [ngClass]="containerClass">
      <div class="spinner" [ngClass]="spinnerClass">
        <div class="spinner-inner"></div>
      </div>
      <div class="loading-text" *ngIf="message">{{ message }}</div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      position: relative;
      margin-bottom: 1rem;
    }

    .spinner-inner {
      width: 100%;
      height: 100%;
      border: 3px solid #f3f3f3;
      border-top: 3px solid var(--primary, #002664);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      color: var(--dark, #333);
      font-size: 0.9rem;
      text-align: center;
      margin-top: 0.5rem;
    }

    /* Variantes de taille */
    .spinner-small {
      width: 20px;
      height: 20px;
    }

    .spinner-small .spinner-inner {
      border-width: 2px;
    }

    .spinner-large {
      width: 60px;
      height: 60px;
    }

    .spinner-large .spinner-inner {
      border-width: 4px;
    }

    /* Variantes de couleur */
    .spinner-primary .spinner-inner {
      border-top-color: var(--primary, #002664);
    }

    .spinner-secondary .spinner-inner {
      border-top-color: var(--secondary, #FECB00);
    }

    .spinner-white .spinner-inner {
      border-color: rgba(255, 255, 255, 0.3);
      border-top-color: white;
    }

    /* Variantes de conteneur */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      backdrop-filter: blur(2px);
    }

    .loading-inline {
      padding: 1rem;
    }

    .loading-compact {
      padding: 0.5rem;
    }

    .loading-compact .spinner {
      margin-bottom: 0.5rem;
    }

    .loading-compact .loading-text {
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Thème sombre */
    :host-context(body.dark-theme) .loading-container {
      color: #e0e0e0;
    }

    :host-context(body.dark-theme) .spinner-inner {
      border-color: rgba(255, 255, 255, 0.1);
    }

    :host-context(body.dark-theme) .loading-overlay {
      background-color: rgba(0, 0, 0, 0.8);
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() type: 'inline' | 'overlay' | 'compact' = 'inline';

  get containerClass(): string {
    return `loading-${this.type}`;
  }

  get spinnerClass(): string {
    return `spinner-${this.size} spinner-${this.color}`;
  }
}
