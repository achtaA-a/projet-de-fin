import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

interface FlightSearch {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  travelClass: string;
}

interface RecentSearch {
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: string;
}

interface Destination {
  name: string;
  code: string;
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTooltipModule],
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.css']
})
export class ReservationComponent implements OnInit {
  currentStep = 1;
  today = new Date().toISOString().split('T')[0];
  isLoading = false;

  flightSearch: FlightSearch = {
    departure: 'NDJ',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 0,
    travelClass: ''
  };

  recentSearches: RecentSearch[] = [
    {
      destination: 'Paris (CDG)',
      departureDate: '2024-02-15',
      returnDate: '2024-02-20',
      passengers: 2,
      travelClass: 'economy'
    },
    {
      destination: 'Dubai (DXB)',
      departureDate: '2024-03-01',
      passengers: 1,
      travelClass: 'business'
    }
  ];

  destinations: Destination[] = [
    { name: 'Paris (CDG)', code: 'CDG' },
    { name: 'Dubai (DXB)', code: 'DXB' },
    { name: 'Istanbul (IST)', code: 'IST' },
    { name: 'Addis Ababa (ADD)', code: 'ADD' },
    { name: 'Cairo (CAI)', code: 'CAI' }
  ];

  selectedFlight: any = null;
  availableFlights: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  useRecentSearch(search: RecentSearch): void {
    this.flightSearch.destination = search.destination;
    this.flightSearch.departureDate = search.departureDate;
    this.flightSearch.returnDate = search.returnDate || '';
    this.flightSearch.passengers = search.passengers;
    this.flightSearch.travelClass = search.travelClass;
  }

  getDestinationName(destination: string): string {
    const dest = this.destinations.find(d => d.name === destination);
    return dest ? dest.name : destination;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  searchFlights(form: NgForm): void {
    if (form.invalid || this.flightSearch.passengers === 0) {
      form.control.markAllAsTouched();
      return;
    }

    this.saveRecentSearch();
    this.currentStep = 2;

    // Sauvegarder les critères de recherche pour la page choix-vol
    try {
      localStorage.setItem('flightSearch', JSON.stringify(this.flightSearch));
    } catch {}

    // Simuler la recherche de vols
    this.availableFlights = [
      {
        id: 1,
        airline: 'Air France',
        flightNumber: 'AF123',
        departure: 'NDJ',
        destination: this.flightSearch.destination,
        departureTime: '08:00',
        arrivalTime: '14:30',
        duration: '6h30',
        price: 450,
        seatsAvailable: 12
      },
      {
        id: 2,
        airline: 'Turkish Airlines',
        flightNumber: 'TK456',
        departure: 'NDJ',
        destination: this.flightSearch.destination,
        departureTime: '12:00',
        arrivalTime: '17:45',
        duration: '5h45',
        price: 380,
        seatsAvailable: 8
      }
    ];

    // Naviguer vers la page de choix des vols
    this.router.navigate(['/choix-vol']);
  }

  updateDestinationCode(): void {
    const selectedDest = this.destinations.find(d =>
      d.name === this.flightSearch.destination
    );
    if (selectedDest) {
      console.log('Code destination:', selectedDest.code);
    }
  }

  nextStep(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  selectFlight(flight: any): void {
    this.selectedFlight = flight;
    console.log('Vol sélectionné:', flight);

    // Rediriger automatiquement vers la page choix-vol après sélection du vol
    setTimeout(() => {
      this.router.navigate(['/choix-vol']);
    }, 500); // Petit délai pour laisser voir la sélection
  }

  isRecommended(flight: any): boolean {
    return flight && flight.price < 400;
  }

  getAirlineLogo(airline: string): string {
    const logos: {[key: string]: string} = {
      'Air France': 'air-france.png',
      'Turkish Airlines': 'turkish-airlines.png',
      'Emirates': 'emirates.png',
      'Ethiopian Airlines': 'ethiopian-airlines.png'
    };
    return logos[airline] || 'default-logo.png';
  }

  viewFlightDetails(flight: any): void {
    console.log('Détails du vol:', flight);
  }

  private saveRecentSearch(): void {
    const newSearch: RecentSearch = {
      destination: this.flightSearch.destination,
      departureDate: this.flightSearch.departureDate,
      returnDate: this.flightSearch.returnDate,
      passengers: this.flightSearch.passengers,
      travelClass: this.flightSearch.travelClass
    };

    const existingIndex = this.recentSearches.findIndex(search =>
      search.destination === newSearch.destination &&
      search.departureDate === newSearch.departureDate
    );

    if (existingIndex > -1) {
      this.recentSearches.splice(existingIndex, 1);
    }

    this.recentSearches.unshift(newSearch);

    if (this.recentSearches.length > 5) {
      this.recentSearches.pop();
    }
  }
}
