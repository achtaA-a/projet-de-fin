import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.html',
  styleUrls: ['./confirmation.css']
})
export class ConfirmationComponent implements OnInit {
  bookingReference: string = '';
  customerName: string = '';
  totalAmount: number = 0;
  flightDetails: any = {};
  currentStep: number = 5;

  // Propriétés utilisées dans le template
  passengers: any[] = [];
  selectedFlight: any = {};
  flightSearch: any = {};
  selectedSeats: any[] = [];
  selectedMeals: any[] = [];

  ngOnInit(): void {
    // Récupérer les données de réservation depuis le service ou localStorage
    this.loadBookingData();
  }

  private loadBookingData(): void {
    // Logique pour charger les données de réservation
    try {
      const savedBooking = localStorage.getItem('currentBooking');
      if (savedBooking) {
        const booking = JSON.parse(savedBooking);
        this.bookingReference = booking.reference || 'BK-' + Date.now();
        this.customerName = booking.customerName || 'Client';
        this.totalAmount = booking.totalAmount || 0;
        this.flightDetails = booking.flightDetails || {};
      } else {
        // Données par défaut pour la démonstration
        this.bookingReference = 'BK-' + Date.now();
        this.customerName = 'Jean Dupont';
        this.totalAmount = 565000;
        this.flightDetails = {
          departure: 'N\'Djamena (NDJ)',
          destination: 'Dubai (DXB)',
          date: '15 juin 2023',
          returnDate: '18 juin 2023'
        };
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de réservation:', error);
      // Fallback avec des données par défaut
      this.setDefaultData();
    }
  }

  private setDefaultData(): void {
    this.bookingReference = 'BK-' + Date.now();
    this.customerName = 'Jean Dupont';
    this.totalAmount = 565000;
    this.flightDetails = {
      departure: 'N\'Djamena (NDJ)',
      destination: 'Dubai (DXB)',
      date: '15 juin 2023',
      returnDate: '18 juin 2023'
    };
  }

  printConfirmation(): void {
    window.print();
  }

  downloadConfirmation(): void {
    // Logique pour télécharger le PDF de confirmation
    console.log('Téléchargement de la confirmation...');
  }

  getSeatForPassenger(passenger: any): string {
    return passenger.seat || 'Non attribué';
  }

  getMealForPassenger(passenger: any): string {
    return passenger.meal || 'Standard';
  }

  calculateTotal(): number {
    return this.totalAmount || 0;
  }

  calculateGrandTotal(): number {
    return this.totalAmount || 0;
  }

  downloadTicket(): void {
    // Logique pour télécharger le billet
    console.log('Téléchargement du billet...');
  }

  goToHomepage(): void {
    // Logique pour retourner à l'accueil
    window.location.href = '/';
  }
}
