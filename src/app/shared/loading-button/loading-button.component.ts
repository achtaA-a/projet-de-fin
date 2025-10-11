import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  template: `
    <button 
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClass"
      (click)="onClick()"
      [attr.aria-label]="ariaLabel"
    >
      <app-loading-spinner 
        *ngIf="loading" 
        size="small" 
        color="white"
        type="inline"
        [message]="loadingMessage"
        class="button-spinner"
      ></app-loading-spinner>
      
      <i *ngIf="icon && !loading" [class]="icon" class="button-icon"></i>
      
      <span *ngIf="!loading" class="button-text">{{ text }}</span>
      <span *ngIf="loading && loadingText" class="button-text">{{ loadingText }}</span>
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--border-radius, 4px);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      text-align: center;
      font-size: 0.9rem;
      white-space: nowrap;
      min-height: 44px; /* Accessibilité */
      position: relative;
      overflow: hidden;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    button:not(:disabled):hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    button:not(:disabled):active {
      transform: translateY(0);
    }

    .button-spinner {
      margin: 0;
      padding: 0;
    }

    .button-icon {
      font-size: 1rem;
    }

    .button-text {
      font-weight: inherit;
    }

    /* Variantes de style */
    .btn-primary {
      background-color: var(--primary, #002664);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #001a4d;
    }

    .btn-secondary {
      background-color: var(--secondary, #FECB00);
      color: var(--dark, #333);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e6b800;
    }

    .btn-danger {
      background-color: var(--accent, #C60C30);
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #b00a2a;
    }

    .btn-outline {
      background-color: transparent;
      border: 2px solid var(--primary, #002664);
      color: var(--primary, #002664);
    }

    .btn-outline:hover:not(:disabled) {
      background-color: rgba(0, 38, 100, 0.1);
    }

    .btn-ghost {
      background-color: transparent;
      color: var(--primary, #002664);
    }

    .btn-ghost:hover:not(:disabled) {
      background-color: rgba(0, 38, 100, 0.1);
    }

    /* Variantes de taille */
    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      min-height: 36px;
    }

    .btn-large {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      min-height: 52px;
    }

    .btn-block {
      width: 100%;
    }

    /* Animation de chargement */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Thème sombre */
    :host-context(body.dark-theme) .btn-outline {
      border-color: #e0e0e0;
      color: #e0e0e0;
    }

    :host-context(body.dark-theme) .btn-outline:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }

    :host-context(body.dark-theme) .btn-ghost {
      color: #e0e0e0;
    }

    :host-context(body.dark-theme) .btn-ghost:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})
export class LoadingButtonComponent {
  @Input() text: string = 'Cliquer';
  @Input() loadingText: string = '';
  @Input() loadingMessage: string = '';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() block: boolean = false;
  @Input() icon: string = '';
  @Input() ariaLabel: string = '';

  @Output() clicked = new EventEmitter<void>();

  get buttonClass(): string {
    const classes = ['btn', `btn-${this.variant}`];
    
    if (this.size !== 'medium') {
      classes.push(`btn-${this.size}`);
    }
    
    if (this.block) {
      classes.push('btn-block');
    }
    
    return classes.join(' ');
  }

  onClick(): void {
    if (!this.loading && !this.disabled) {
      this.clicked.emit();
    }
  }
}
