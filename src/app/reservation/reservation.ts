import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface RecentSearch {
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
  timestamp: number;
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
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // ← Ajoutez ces imports
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.css']
})
export class ReservationComponent implements OnInit {
  currentStep: number = 1;
  recentSearches: RecentSearch[] = [];
  flightSearch: FlightSearch = {
    departure: "N'Djamena (NDJ)",
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    travelClass: 'economy'
  };

  // Données des destinations
  destinations = [
    { code: 'DLA', name: 'Douala (DLA)' },
    { code: 'JNB', name: 'Johannesburg (JNB)' },
    { code: 'NBO', name: 'Nairobi (NBO)' },
    { code: 'ADD', name: 'Addis-Abeba (ADD)' },
    { code: 'DXB', name: 'Dubai (DXB)' },
    { code: 'CDG', name: 'Paris (CDG)' },
    { code: 'BRU', name: 'Bruxelles (BRU)' },
    { code: 'ABE', name: 'Abéché (ABE)' }
  ];

  ngOnInit(): void {
    this.loadRecentSearches();
    this.setDefaultDates();
  }

  private setDefaultDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.flightSearch.departureDate = today.toISOString().split('T')[0];
    this.flightSearch.returnDate = tomorrow.toISOString().split('T')[0];
  }

  private loadRecentSearches(): void {
    const savedSearches = localStorage.getItem('recentFlightSearches');
    if (savedSearches) {
      this.recentSearches = JSON.parse(savedSearches);
    }
  }

  private saveRecentSearch(): void {
    const search: RecentSearch = {
      destination: this.flightSearch.destination,
      departureDate: this.flightSearch.departureDate,
      returnDate: this.flightSearch.returnDate,
      passengers: this.flightSearch.passengers,
      travelClass: this.flightSearch.travelClass,
      timestamp: Date.now()
    };

    this.recentSearches.unshift(search);
    this.recentSearches = this.recentSearches.slice(0, 5);
    localStorage.setItem('recentFlightSearches', JSON.stringify(this.recentSearches));
  }

  nextStep(step: number): void {
    if (step === 1 && !this.validateStep1()) {
      return;
    }

    this.currentStep = step;
    this.updateProgressBar();

    if (step === 2) {
      this.saveRecentSearch();
    }
  }

  private validateStep1(): boolean {
    if (!this.flightSearch.destination) {
      this.showNotification('error', 'Veuillez sélectionner une destination');
      return false;
    }

    if (!this.flightSearch.departureDate) {
      this.showNotification('error', 'Veuillez sélectionner une date de départ');
      return false;
    }

    if (this.flightSearch.returnDate && 
        new Date(this.flightSearch.returnDate) < new Date(this.flightSearch.departureDate)) {
      this.showNotification('error', 'La date de retour doit être après la date de départ');
      return false;
    }

    return true;
  }

  private updateProgressBar(): void {
    const progressPercentage = (this.currentStep / 5) * 100;
    const progressBar = document.querySelector('.progress-bar-inner') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }

    document.querySelectorAll('.step').forEach((step, index) => {
      if (index + 1 <= this.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  useRecentSearch(search: RecentSearch): void {
    this.flightSearch.destination = search.destination;
    this.flightSearch.departureDate = search.departureDate;
    this.flightSearch.returnDate = search.returnDate;
    this.flightSearch.passengers = search.passengers;
    this.flightSearch.travelClass = search.travelClass;
  }

  searchFlights(): void {
    if (this.validateStep1()) {
      this.showNotification('info', 'Recherche des vols en cours...');
      setTimeout(() => {
        this.nextStep(2);
      }, 1500);
    }
  }

  private showNotification(type: 'success' | 'error' | 'info' | 'warning', message: string): void {
    console.log(`${type}: ${message}`);
  }

  getDestinationName(code: string): string {
    const destination = this.destinations.find(dest => dest.code === code);
    return destination ? destination.name : code;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}