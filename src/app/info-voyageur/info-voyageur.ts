import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export interface Passenger {
  type: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  email: string;
  phone: string;
  frequentFlyer?: boolean;
  ffAirline?: string;
  ffNumber?: string;
}

interface Country {
  code: string;
  name: string;
}

@Component({
  selector: 'app-info-voyageur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './info-voyageur.html',
  styleUrls: ['./info-voyageur.css']
})
export class InfoVoyageurComponent {
  today: string = new Date().toISOString().split('T')[0];

  passengers: Passenger[] = [{
    type: 'M.',
    firstName: 'Jean',
    lastName: 'Dupont',
    dateOfBirth: '1990-01-15',
    nationality: 'FR',
    passportNumber: '123456789',
    email: 'jean.dupont@example.com',
    phone: '+33123456789',
    frequentFlyer: false
  }];

  countries: Country[] = [
    { code: 'FR', name: 'France' },
    { code: 'TD', name: 'Tchad' },
    { code: 'CM', name: 'Cameroun' },
    { code: 'GA', name: 'Gabon' },
    { code: 'CG', name: 'Congo' },
    { code: 'US', name: 'États-Unis' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'DE', name: 'Allemagne' }
  ];

  constructor(private router: Router) {}

  addPassenger(): void {
    this.passengers.push({
      type: 'M.',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      nationality: '',
      passportNumber: '',
      email: '',
      phone: '',
      frequentFlyer: false
    });
  }

  removePassenger(index: number): void {
    if (this.passengers.length <= 1) {
      alert('Vous devez garder au moins un passager.');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce passager ?')) {
      this.passengers.splice(index, 1);
    }
  }

  getPassengerTypeLabel(type: string): string {
    switch (type) {
      case 'M.': return 'Adulte';
      case 'Mme': return 'Adulte';
      case 'Mlle': return 'Adulte';
      default: return 'Adulte';
    }
  }

  isFormValid(): boolean {
    return this.passengers.every(passenger =>
      passenger.type &&
      passenger.firstName?.trim() &&
      passenger.lastName?.trim() &&
      passenger.dateOfBirth &&
      passenger.nationality &&
      passenger.passportNumber?.trim() &&
      passenger.email?.trim() &&
      passenger.phone?.trim() &&
      this.isValidEmail(passenger.email) &&
      this.isValidPhone(passenger.phone)
    );
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    // Validation simple pour les numéros de téléphone (au moins 10 chiffres)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    this.passengers.forEach((passenger, index) => {
      if (!passenger.firstName?.trim()) {
        errors.push(`Passager ${index + 1} : Prénom requis`);
      }
      if (!passenger.lastName?.trim()) {
        errors.push(`Passager ${index + 1} : Nom requis`);
      }
      if (!passenger.dateOfBirth) {
        errors.push(`Passager ${index + 1} : Date de naissance requise`);
      }
      if (!passenger.nationality) {
        errors.push(`Passager ${index + 1} : Nationalité requise`);
      }
      if (!passenger.passportNumber?.trim()) {
        errors.push(`Passager ${index + 1} : Numéro de passeport/CNI requis`);
      }
      if (!passenger.email?.trim()) {
        errors.push(`Passager ${index + 1} : Email requis`);
      } else if (!this.isValidEmail(passenger.email)) {
        errors.push(`Passager ${index + 1} : Email invalide`);
      }
      if (!passenger.phone?.trim()) {
        errors.push(`Passager ${index + 1} : Téléphone requis`);
      } else if (!this.isValidPhone(passenger.phone)) {
        errors.push(`Passager ${index + 1} : Téléphone invalide`);
      }
    });

    return errors;
  }

  validatePassengers(): void {
    if (this.isFormValid()) {
      // Ajouter la classe form-ready pour l'animation
      const button = document.querySelector('.btn-next');
      if (button) {
        button.classList.add('form-ready');
        setTimeout(() => button.classList.remove('form-ready'), 4000);
      }

      console.log('Navigation vers la page de paiement...');
      this.router.navigate(['/paiement']).then(success => {
        if (!success) {
          console.error('Erreur de navigation vers la page de paiement');
          alert('Erreur lors de la navigation vers la page de paiement.');
        }
      }).catch(error => {
        console.error('Erreur de navigation:', error);
        alert('Erreur lors de la navigation vers la page de paiement.');
      });
    } else {
      const errors = this.getValidationErrors();
      const errorMessage = 'Veuillez corriger les erreurs suivantes:\n\n' + errors.join('\n');
      alert(errorMessage);
    }
  }

  previousStep(): void {
    this.router.navigate(['/choix-vol']);
  }
}
