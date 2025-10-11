import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AppError {
  id: string;
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorsSubject = new BehaviorSubject<AppError[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  constructor() {}

  /**
   * Ajouter une erreur
   */
  addError(error: Omit<AppError, 'id' | 'timestamp'>): void {
    const appError: AppError = {
      ...error,
      id: this.generateErrorId(),
      timestamp: new Date()
    };

    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, appError]);

    // Log dans la console pour le développement
    console.error('Erreur application:', appError);
  }

  /**
   * Supprimer une erreur
   */
  removeError(errorId: string): void {
    const currentErrors = this.errorsSubject.value;
    const filteredErrors = currentErrors.filter(error => error.id !== errorId);
    this.errorsSubject.next(filteredErrors);
  }

  /**
   * Vider toutes les erreurs
   */
  clearErrors(): void {
    this.errorsSubject.next([]);
  }

  /**
   * Obtenir les erreurs actuelles
   */
  getErrors(): AppError[] {
    return this.errorsSubject.value;
  }

  /**
   * Obtenir les erreurs par sévérité
   */
  getErrorsBySeverity(severity: AppError['severity']): AppError[] {
    return this.errorsSubject.value.filter(error => error.severity === severity);
  }

  /**
   * Gérer les erreurs de service
   */
  handleServiceError(error: any, context?: string): void {
    let message = 'Une erreur inattendue s\'est produite';
    let code = 'UNKNOWN_ERROR';

    if (error?.code && error?.message) {
      code = error.code;
      message = error.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    this.addError({
      code,
      message: context ? `${context}: ${message}` : message,
      details: error,
      severity: 'error'
    });
  }

  /**
   * Gérer les erreurs de validation
   */
  handleValidationError(field: string, message: string): void {
    this.addError({
      code: 'VALIDATION_ERROR',
      message: `${field}: ${message}`,
      severity: 'warning'
    });
  }

  /**
   * Gérer les erreurs réseau
   */
  handleNetworkError(error: any): void {
    this.addError({
      code: 'NETWORK_ERROR',
      message: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
      details: error,
      severity: 'error'
    });
  }

  /**
   * Générer un ID unique pour l'erreur
   */
  private generateErrorId(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
