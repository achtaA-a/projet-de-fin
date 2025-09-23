import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Traveler {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
  passportExpiry?: string;
}

interface FlightSearch {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
}

@Component({
  selector: 'app-voyageur',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './voyageur.html',
  styleUrls: ['./voyageur.css']
})
export class VoyageurComponent implements OnInit {
  currentStep: number = 2; // Étape fixe pour ce composant
  flightSearch: FlightSearch = {
    departure: "N'Djamena (NDJ)",
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    travelClass: 'economy'
  };
  currentTravelers: Traveler[] = [];
  currentTraveler: Traveler = this.createEmptyTraveler();
  currentTravelerIndex: number = 0;

  constructor(private location: Location) { }

  ngOnInit(): void {
    this.loadFlightSearch();
    this.initializeTravelers();
  }

  private loadFlightSearch(): void {
    const savedSearch = localStorage.getItem('flightSearch');
    if (savedSearch) {
      this.flightSearch = JSON.parse(savedSearch);
    }
  }

  private createEmptyTraveler(): Traveler {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: 'td'
    };
  }

  private initializeTravelers(): void {
    this.currentTravelers = [];
    for (let i = 0; i < this.flightSearch.passengers; i++) {
      this.currentTravelers.push(this.createEmptyTraveler());
    }
    this.currentTravelerIndex = 0;
    this.currentTraveler = this.currentTravelers[0];
  }

  validateTravelerForm(): boolean {
    let isValid = true;
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
    
    requiredFields.forEach(field => {
      if (!this.currentTraveler[field as keyof Traveler]) {
        this.showFieldError(field);
        isValid = false;
      } else {
        this.clearFieldError(field);
      }
    });

    if (this.currentTraveler.email && !this.isValidEmail(this.currentTraveler.email)) {
      this.showFieldError('email', 'Format d\'email invalide');
      isValid = false;
    }

    if (!isValid) {
      this.showNotification('error', 'Veuillez corriger les erreurs dans le formulaire');
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showFieldError(fieldName: string, message?: string): void {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.add('is-invalid');
      
      let feedbackElement = field.nextElementSibling as HTMLElement;
      if (!feedbackElement || !feedbackElement.classList.contains('invalid-feedback')) {
        feedbackElement = document.createElement('div');
        feedbackElement.className = 'invalid-feedback';
        field.parentNode?.insertBefore(feedbackElement, field.nextSibling);
      }
      
      feedbackElement.textContent = message || 'Ce champ est requis';
    }
  }

  private clearFieldError(fieldName: string): void {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (field) {
      field.classList.remove('is-invalid');
      
      const feedbackElement = field.nextElementSibling as HTMLElement;
      if (feedbackElement && feedbackElement.classList.contains('invalid-feedback')) {
        feedbackElement.remove();
      }
    }
  }

  updateTravelerField(field: keyof Traveler, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    (this.currentTraveler[field] as string) = value;
    
    if (value) {
      this.clearFieldError(field);
      
      if (field === 'email' && !this.isValidEmail(value)) {
        this.showFieldError('email', 'Format d\'email invalide');
      }
    }
  }

  saveTravelerInfo(): void {
    const bookingData = {
      flightSearch: this.flightSearch,
      travelers: this.currentTravelers,
      timestamp: Date.now()
    };

    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    this.showNotification('success', 'Informations des voyageurs sauvegardées');
  }

  nextStep(): void {
    if (this.validateTravelerForm()) {
      this.saveTravelerInfo();
      // Émettre un événement ou naviguer vers l'étape suivante
      console.log('Passage à l\'étape suivante');
    }
  }

  prevStep(): void {
    this.location.back();
    // Émettre un événement ou naviguer vers l'étape précédente
    console.log('Retour à l\'étape précédente');
  }

  private showNotification(type: string, message: string): void {
    // Implémentez votre système de notifications
    console.log(`${type}: ${message}`);
  }
}