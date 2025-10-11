import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface ValidationRule {
  name: string;
  message: string;
  validator: ValidatorFn;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  constructor() {}

  /**
   * Valide un email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un numéro de téléphone (format international)
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Valide un numéro de carte de crédit (algorithme de Luhn)
   */
  validateCreditCard(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Valide une date d'expiration de carte (format MM/YY)
   */
  validateCardExpiry(expiry: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiry)) {
      return false;
    }

    const [month, year] = expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();

    return expiryDate > now;
  }

  /**
   * Valide un code CVV
   */
  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Valide un nom complet
   */
  validateFullName(name: string): boolean {
    const trimmed = name.trim();
    return trimmed.length >= 2 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(trimmed);
  }

  /**
   * Valide une date de naissance (doit être dans le passé et raisonnable)
   */
  validateBirthDate(birthDate: string): boolean {
    const date = new Date(birthDate);
    const now = new Date();
    const minAge = new Date();
    minAge.setFullYear(now.getFullYear() - 120); // Maximum 120 ans

    return date < now && date > minAge;
  }

  /**
   * Valide un numéro de passeport
   */
  validatePassportNumber(passportNumber: string): boolean {
    const cleaned = passportNumber.replace(/\s/g, '').toUpperCase();
    return /^[A-Z0-9]{6,12}$/.test(cleaned);
  }

  /**
   * Valide une adresse
   */
  validateAddress(address: string): boolean {
    const trimmed = address.trim();
    return trimmed.length >= 5 && trimmed.length <= 100;
  }

  /**
   * Valide un code postal
   */
  validatePostalCode(postalCode: string, country: string = 'TD'): boolean {
    const cleaned = postalCode.replace(/\s/g, '');
    
    switch (country) {
      case 'TD': // Tchad
        return /^\d{5}$/.test(cleaned);
      case 'FR': // France
        return /^\d{5}$/.test(cleaned);
      case 'US': // États-Unis
        return /^\d{5}(-\d{4})?$/.test(cleaned);
      default:
        return cleaned.length >= 3 && cleaned.length <= 10;
    }
  }

  /**
   * Valide les informations de vol
   */
  validateFlightSearch(search: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation du départ
    if (!search.departure || search.departure.trim().length === 0) {
      errors.push({
        field: 'departure',
        message: 'L\'aéroport de départ est requis',
        code: 'REQUIRED'
      });
    }

    // Validation de la destination
    if (!search.destination || search.destination.trim().length === 0) {
      errors.push({
        field: 'destination',
        message: 'L\'aéroport de destination est requis',
        code: 'REQUIRED'
      });
    }

    // Validation de la date de départ
    if (!search.departureDate) {
      errors.push({
        field: 'departureDate',
        message: 'La date de départ est requise',
        code: 'REQUIRED'
      });
    } else {
      const departureDate = new Date(search.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (departureDate < today) {
        errors.push({
          field: 'departureDate',
          message: 'La date de départ ne peut pas être dans le passé',
          code: 'INVALID_DATE'
        });
      }
    }

    // Validation de la date de retour (si fournie)
    if (search.returnDate) {
      const returnDate = new Date(search.returnDate);
      const departureDate = new Date(search.departureDate);

      if (returnDate <= departureDate) {
        errors.push({
          field: 'returnDate',
          message: 'La date de retour doit être postérieure à la date de départ',
          code: 'INVALID_DATE'
        });
      }
    }

    // Validation du nombre de passagers
    if (!search.passengers || search.passengers < 1 || search.passengers > 9) {
      errors.push({
        field: 'passengers',
        message: 'Le nombre de passagers doit être entre 1 et 9',
        code: 'INVALID_RANGE'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide les informations de paiement
   */
  validatePayment(payment: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation du numéro de carte
    if (!payment.cardNumber) {
      errors.push({
        field: 'cardNumber',
        message: 'Le numéro de carte est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validateCreditCard(payment.cardNumber)) {
      errors.push({
        field: 'cardNumber',
        message: 'Le numéro de carte n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation de la date d'expiration
    if (!payment.cardExpiry) {
      errors.push({
        field: 'cardExpiry',
        message: 'La date d\'expiration est requise',
        code: 'REQUIRED'
      });
    } else if (!this.validateCardExpiry(payment.cardExpiry)) {
      errors.push({
        field: 'cardExpiry',
        message: 'La date d\'expiration n\'est pas valide ou a expiré',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation du CVV
    if (!payment.cardCvv) {
      errors.push({
        field: 'cardCvv',
        message: 'Le code de sécurité est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validateCVV(payment.cardCvv)) {
      errors.push({
        field: 'cardCvv',
        message: 'Le code de sécurité doit contenir 3 ou 4 chiffres',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation du nom du titulaire
    if (!payment.cardHolderName) {
      errors.push({
        field: 'cardHolderName',
        message: 'Le nom du titulaire est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validateFullName(payment.cardHolderName)) {
      errors.push({
        field: 'cardHolderName',
        message: 'Le nom du titulaire n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valide les informations d'un passager
   */
  validatePassenger(passenger: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Validation du prénom
    if (!passenger.firstName) {
      errors.push({
        field: 'firstName',
        message: 'Le prénom est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validateFullName(passenger.firstName)) {
      errors.push({
        field: 'firstName',
        message: 'Le prénom n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation du nom
    if (!passenger.lastName) {
      errors.push({
        field: 'lastName',
        message: 'Le nom est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validateFullName(passenger.lastName)) {
      errors.push({
        field: 'lastName',
        message: 'Le nom n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation de l'email
    if (!passenger.email) {
      errors.push({
        field: 'email',
        message: 'L\'email est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validateEmail(passenger.email)) {
      errors.push({
        field: 'email',
        message: 'L\'email n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation du téléphone
    if (!passenger.phone) {
      errors.push({
        field: 'phone',
        message: 'Le numéro de téléphone est requis',
        code: 'REQUIRED'
      });
    } else if (!this.validatePhone(passenger.phone)) {
      errors.push({
        field: 'phone',
        message: 'Le numéro de téléphone n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation de la date de naissance
    if (!passenger.birthDate) {
      errors.push({
        field: 'birthDate',
        message: 'La date de naissance est requise',
        code: 'REQUIRED'
      });
    } else if (!this.validateBirthDate(passenger.birthDate)) {
      errors.push({
        field: 'birthDate',
        message: 'La date de naissance n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    // Validation du numéro de passeport (si fourni)
    if (passenger.passportNumber && !this.validatePassportNumber(passenger.passportNumber)) {
      errors.push({
        field: 'passportNumber',
        message: 'Le numéro de passeport n\'est pas valide',
        code: 'INVALID_FORMAT'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Crée un validateur personnalisé pour Angular Forms
   */
  createCustomValidator(validatorFn: (value: any) => boolean, errorMessage: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && !validatorFn(control.value)) {
        return { custom: { message: errorMessage } };
      }
      return null;
    };
  }
}
