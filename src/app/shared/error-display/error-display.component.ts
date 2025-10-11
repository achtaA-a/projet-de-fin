import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ErrorService, AppError } from '../../services/error.service';

@Component({
  selector: 'app-error-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-container" *ngIf="errors.length > 0">
      <div 
        *ngFor="let error of errors" 
        class="error-item"
        [ngClass]="'error-' + error.severity"
      >
        <div class="error-content">
          <div class="error-icon">
            <i [ngClass]="getErrorIcon(error.severity)"></i>
          </div>
          <div class="error-text">
            <div class="error-message">{{ error.message }}</div>
            <div class="error-time">{{ formatTime(error.timestamp) }}</div>
          </div>
          <button 
            class="error-close" 
            (click)="removeError(error.id)"
            aria-label="Fermer l'erreur"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      width: 100%;
    }

    .error-item {
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .error-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .error-text {
      flex: 1;
      min-width: 0;
    }

    .error-message {
      font-weight: 500;
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .error-time {
      font-size: 0.8rem;
      opacity: 0.7;
    }

    .error-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .error-close:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    /* Styles par sévérité */
    .error-error {
      background-color: #fff5f5;
      border-left: 4px solid #e53e3e;
      color: #c53030;
    }

    .error-error .error-icon {
      background-color: #fed7d7;
      color: #e53e3e;
    }

    .error-warning {
      background-color: #fffaf0;
      border-left: 4px solid #dd6b20;
      color: #c05621;
    }

    .error-warning .error-icon {
      background-color: #feebc8;
      color: #dd6b20;
    }

    .error-info {
      background-color: #ebf8ff;
      border-left: 4px solid #3182ce;
      color: #2c5282;
    }

    .error-info .error-icon {
      background-color: #bee3f8;
      color: #3182ce;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .error-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
  `]
})
export class ErrorDisplayComponent implements OnInit, OnDestroy {
  errors: AppError[] = [];
  private subscription: Subscription | undefined;

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.subscription = this.errorService.errors$.subscribe(errors => {
      this.errors = errors;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeError(errorId: string): void {
    this.errorService.removeError(errorId);
  }

  getErrorIcon(severity: AppError['severity']): string {
    switch (severity) {
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-info-circle';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) {
      return 'À l\'instant';
    } else if (minutes < 60) {
      return `Il y a ${minutes} min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else {
      return timestamp.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
