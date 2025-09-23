import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FlightService, Flight } from '../services/flight.service';

interface RecentSearch {
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: 'economy' | 'business' | 'first';
  timestamp: number;
}

interface FlightSearch {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: 'economy' | 'business' | 'first';
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.css']
})
export class ReservationComponent implements OnInit {
  currentStep = 1;
  recentSearches: RecentSearch[] = [];
  availableFlights: Flight[] = [];
  selectedFlight: Flight | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  progressPercentage = 0;

  flightSearch: FlightSearch = {
    departure: "N'Djamena (NDJ)",
    destination: '',
    departureDate: '',
    passengers: 1,
    travelClass: 'economy'
  };

  destinations = [
    { code: 'NDJ', name: "N'Djamena (NDJ)" },
    { code: 'DLA', name: 'Douala (DLA)' },
    { code: 'JNB', name: 'Johannesburg (JNB)' },
    { code: 'CDG', name: 'Paris (CDG)' },
    { code: 'NBO', name: 'Nairobi (NBO)' },
    { code: 'ADD', name: 'Addis-Abeba (ADD)' },
    { code: 'DXB', name: 'Dubai (DXB)' },
    { code: 'BRU', name: 'Bruxelles (BRU)' },
    { code: 'ABE', name: 'Abéché (ABE)' }
  ];

  constructor(
    private router: Router,
    private flightService: FlightService
  ) {}

  ngOnInit(): void {
    this.loadRecentSearches();
    this.setDefaultDates();
    this.updateProgressBar();
  }

  private setDefaultDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Formater les dates au format YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    this.flightSearch.departureDate = formatDate(today);
    this.flightSearch.returnDate = formatDate(tomorrow);
  }

  private loadRecentSearches(): void {
    const savedSearches = localStorage.getItem('recentFlightSearches');
    if (savedSearches) {
      try {
        this.recentSearches = JSON.parse(savedSearches);
      } catch (e) {
        console.error('Erreur lors du chargement des recherches récentes', e);
        this.recentSearches = [];
      }
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

    // Ajouter la nouvelle recherche au début du tableau
    this.recentSearches = [search, ...this.recentSearches]
      .slice(0, 5); // Garder uniquement les 5 dernières recherches

    // Sauvegarder dans le localStorage
    localStorage.setItem('recentFlightSearches', JSON.stringify(this.recentSearches));
  }

  searchFlights(): void {
    if (!this.validateSearchForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.availableFlights = [];

    this.flightService.searchFlights(this.flightSearch).subscribe({
      next: (flights) => {
        this.availableFlights = flights;
        this.saveRecentSearch();
        this.nextStep();
      },
      error: (error) => {
        console.error('Erreur lors de la recherche de vols', error);
        this.errorMessage = 'Une erreur est survenue lors de la recherche de vols. Veuillez réessayer.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  selectFlight(flight: Flight): void {
    this.selectedFlight = flight;
    this.nextStep();
  }

  confirmBooking(): void {
    if (!this.selectedFlight) {
      this.errorMessage = 'Aucun vol sélectionné';
      return;
    }

    this.isLoading = true;
    this.flightService.bookFlight(
      this.selectedFlight,
      this.flightSearch.passengers,
      this.flightSearch.travelClass
    ).subscribe({
      next: (booking) => {
        this.router.navigate(['/confirmation', booking.id]);
      },
      error: (error) => {
        console.error('Erreur lors de la réservation', error);
        this.errorMessage = 'Une erreur est survenue lors de la réservation. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  private validateSearchForm(): boolean {
    if (!this.flightSearch.destination) {
      this.errorMessage = 'Veuillez sélectionner une destination';
      return false;
    }

    if (!this.flightSearch.departureDate) {
      this.errorMessage = 'Veuillez sélectionner une date de départ';
      return false;
    }

    if (this.flightSearch.passengers < 1) {
      this.errorMessage = 'Le nombre de passagers doit être d\'au moins 1';
      return false;
    }

    return true;
  }

  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
      this.updateProgressBar();
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgressBar();
    }
  }

  private updateProgressBar(): void {
    this.progressPercentage = (this.currentStep - 1) * 33.33;
  }

  useRecentSearch(search: RecentSearch): void {
    this.flightSearch.destination = search.destination;
    this.flightSearch.departureDate = search.departureDate;
    this.flightSearch.returnDate = search.returnDate;
    this.flightSearch.passengers = search.passengers;
    this.flightSearch.travelClass = search.travelClass;
    this.searchFlights();
  }

  getDestinationName(code: string): string {
    const destination = this.destinations.find(d => d.code === code);
    return destination ? destination.name : code;
  }

  // Méthode pour formater la date en français avec un format court
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

  // Méthode pour formater la date en français avec un format long
  formatDateLong(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}