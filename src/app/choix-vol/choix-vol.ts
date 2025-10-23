import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { FlightService, Flight as ServiceFlight, FlightSearchCriteria } from '../services/flight.service';

export interface FlightViewModel {
  id: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  route: string;
  stops: number;
  airline: string;
  aircraft: string;
  price: number;
  currency: string;
  selected?: boolean;
  favorite?: boolean;
  seatsAvailable?: number;
  mealIncluded?: boolean;
  wifi?: boolean;
  entertainment?: boolean;
  baggageAllowance?: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  departureDate: string;
  arrivalDate: string;
  // Nouvelles propriétés pour les services
  services?: {
    meal: boolean;
    wifi: boolean;
    entertainment: boolean;
    priorityBoarding: boolean;
    extraLegroom: boolean;
    loungeAccess: boolean;
  };
  // Propriétés pour la comparaison
  comparisonId?: string;
  isReturnFlight?: boolean;
}

@Component({
  selector: 'app-choix-vol',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './choix-vol.html',
  styleUrls: ['./choix-vol.css']
})
export class ChoixVolComponent implements OnInit {
  // États de chargement et erreurs
  isLoading = false;
  error: string | null = null;

  // Propriétés pour la recherche et les filtres
  searchCriteria: FlightSearchCriteria = {
    departure: 'N\'Djamena (NDJ)',
    destination: 'Dubai (DXB)',
    date: new Date().toISOString().split('T')[0],
    passengers: 1,
    travelClass: 'economy',
    isRoundTrip: true
  };

  // Vols récupérés depuis le service
  departureFlights: ServiceFlight[] = [];
  returnFlights: ServiceFlight[] = [];
  availableFlights: FlightViewModel[] = [];
  selectedFlight: FlightViewModel | null = null;
  selectedReturnFlight: FlightViewModel | null = null;

  // Options de sélection
  tripType: 'oneway' | 'roundtrip' = 'oneway';
  selectedServices: string[] = [];
  comparisonFlights: FlightViewModel[] = [];
  showComparison: boolean = false;

  // Destinations disponibles
  destinations = [
    { code: 'DXB', city: 'Dubai' },
    { code: 'CDG', city: 'Paris' },
    { code: 'IST', city: 'Istanbul' },
    { code: 'ADD', city: 'Addis Abeba' },
    { code: 'NBO', city: 'Nairobi' },
    { code: 'JNB', city: 'Johannesburg' }
  ];

  // Services disponibles
  availableServices = [
    { id: 'meal', name: 'Repas', icon: 'fas fa-utensils', price: 15000 },
    { id: 'wifi', name: 'WiFi', icon: 'fas fa-wifi', price: 10000 },
    { id: 'entertainment', name: 'Divertissement', icon: 'fas fa-tv', price: 5000 },
    { id: 'priorityBoarding', name: 'Embarquement prioritaire', icon: 'fas fa-fast-forward', price: 20000 },
    { id: 'extraLegroom', name: 'Espace supplémentaire', icon: 'fas fa-chair', price: 25000 },
    { id: 'loungeAccess', name: 'Accès salon', icon: 'fas fa-couch', price: 30000 }
  ];

  constructor(
    private location: Location,
    private flightService: FlightService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFlights();
  }

  loadFlights(): void {
    this.isLoading = true;
    this.error = null;

    // Recherche des vols de départ
    this.flightService.searchFlights({
      departure: this.searchCriteria.departure,
      destination: this.searchCriteria.destination,
      date: this.searchCriteria.date,
      passengers: this.searchCriteria.passengers,
      travelClass: this.searchCriteria.travelClass
    }).subscribe({
      next: (result: any) => {
        this.departureFlights = result.flights;
        this.availableFlights = this.mapFlightsToViewModel(result.flights);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = error.message || 'Erreur lors du chargement des vols';
        this.isLoading = false;
        console.error('Erreur lors du chargement des vols:', error);
      }
    });
  }

  // Convertir les vols du service vers le modèle de vue
  private mapFlightsToViewModel(flights: ServiceFlight[]): FlightViewModel[] {
    return flights.map(flight => ({
      id: flight.id,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      route: `${flight.departureCode} - ${flight.destinationCode}`,
      stops: flight.stops,
      airline: flight.airline,
      aircraft: flight.aircraft,
      price: flight.price,
      currency: 'XAF',
      selected: false,
      favorite: false,
      seatsAvailable: flight.seatsAvailable,
      mealIncluded: flight.mealIncluded,
      wifi: flight.wifi,
      entertainment: flight.entertainment,
      baggageAllowance: flight.baggageAllowance,
      flightNumber: flight.flightNumber,
      departure: flight.departure,
      arrival: flight.destination,
      departureDate: flight.departureDate,
      arrivalDate: flight.arrivalDate,
      // Nouvelles propriétés
      services: {
        meal: flight.mealIncluded || false,
        wifi: flight.wifi || false,
        entertainment: flight.entertainment || false,
        priorityBoarding: Math.random() > 0.5,
        extraLegroom: Math.random() > 0.7,
        loungeAccess: Math.random() > 0.8
      },
      comparisonId: `comp_${flight.id}`,
      isReturnFlight: false
    }));
  }

  selectFlight(flight: FlightViewModel): void {
    this.selectedFlight = flight;
    // Désélectionner tous les autres vols
    this.availableFlights.forEach(f => f.selected = false);
    // Sélectionner le vol choisi
    flight.selected = true;
  }

  selectReturnFlight(flight: FlightViewModel): void {
    this.selectedReturnFlight = flight;
    // Désélectionner tous les autres vols de retour
    this.availableFlights.filter(f => f.isReturnFlight).forEach(f => f.selected = false);
    // Sélectionner le vol de retour choisi
    flight.selected = true;
  }

  toggleFavorite(flight: FlightViewModel): void {
    flight.favorite = !flight.favorite;
  }

  // Gestion du type de voyage
  setTripType(type: 'oneway' | 'roundtrip'): void {
    this.tripType = type;
    this.searchCriteria.isRoundTrip = type === 'roundtrip';
    if (type === 'roundtrip') {
      this.loadReturnFlights();
    }
  }

  // Charger les vols de retour
  loadReturnFlights(): void {
    if (this.searchCriteria.isRoundTrip && this.searchCriteria.returnDate) {
      this.flightService.searchFlights({
        departure: this.searchCriteria.destination,
        destination: this.searchCriteria.departure,
        date: this.searchCriteria.returnDate,
        passengers: this.searchCriteria.passengers,
        travelClass: this.searchCriteria.travelClass
      }).subscribe({
        next: (result: any) => {
          this.returnFlights = result.flights;
          this.availableFlights = [...this.availableFlights, ...this.mapFlightsToViewModel(result.flights).map(f => ({...f, isReturnFlight: true}))];
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des vols de retour:', error);
        }
      });
    }
  }

  // Gestion des services
  toggleService(serviceId: string): void {
    const index = this.selectedServices.indexOf(serviceId);
    if (index > -1) {
      this.selectedServices.splice(index, 1);
    } else {
      this.selectedServices.push(serviceId);
    }
  }

  isServiceSelected(serviceId: string): boolean {
    return this.selectedServices.includes(serviceId);
  }

  getServicePrice(serviceId: string): number {
    const service = this.availableServices.find(s => s.id === serviceId);
    return service ? service.price : 0;
  }

  getTotalServicesPrice(): number {
    return this.selectedServices.reduce((total, serviceId) => {
      return total + this.getServicePrice(serviceId);
    }, 0);
  }

  // Gestion de la comparaison
  toggleComparison(): void {
    this.showComparison = !this.showComparison;
  }

  addToComparison(flight: FlightViewModel): void {
    if (this.comparisonFlights.length < 3 && !this.comparisonFlights.find(f => f.id === flight.id)) {
      this.comparisonFlights.push(flight);
    }
  }

  removeFromComparison(flight: FlightViewModel): void {
    this.comparisonFlights = this.comparisonFlights.filter(f => f.id !== flight.id);
  }

  clearComparison(): void {
    this.comparisonFlights = [];
  }

  isInComparison(flight: FlightViewModel): boolean {
    return this.comparisonFlights.some(f => f.id === flight.id);
  }

  prevStep(): void {
    this.router.navigate(['/reservation']);
  }

  nextStep(): void {
    if (this.selectedFlight) {
      // Sauvegarder la sélection complète
      const selectionData = {
        selectedFlight: this.selectedFlight,
        selectedReturnFlight: this.selectedReturnFlight,
        selectedServices: this.selectedServices,
        tripType: this.tripType,
        totalServicesPrice: this.getTotalServicesPrice()
      };
      localStorage.setItem('flightSelection', JSON.stringify(selectionData));
      this.router.navigate(['/info-voyageur']);
    }
  }

  // Obtient le nom du fichier logo pour une compagnie aérienne
  getAirlineLogo(airlineName: string): string {
    const airlineMap: { [key: string]: string } = {
      'Tchad Airlines': 'tchad-airlines.png',
      'Air France': 'air-france.png',
      'Turkish Airlines': 'turkish-airlines.png',
      'Emirates': 'emirates.png',
      'Ethiopian Airlines': 'ethiopian-airlines.png',
      'Air Côte d\'Ivoire': 'air-cote-divoire.png',
      'Camair-Co': 'camair-co.png',
      'South African Airways': 'south-african.png',
      'Kenya Airways': 'kenya-airways.png',
      'EgyptAir': 'egyptair.png'
    };

    return airlineMap[airlineName] || 'default.png';
  }

  // Obtient le nom de la ville de destination
  getDestinationCity(): string {
    const destination = this.destinations.find(d => d.code === this.searchCriteria.destination);
    return destination ? destination.city : 'Destination inconnue';
  }

  // Méthodes pour filtrer les vols
  getDepartureFlights(): FlightViewModel[] {
    return this.availableFlights.filter(f => !f.isReturnFlight);
  }

  getReturnFlights(): FlightViewModel[] {
    return this.availableFlights.filter(f => f.isReturnFlight);
  }

  hasDepartureFlights(): boolean {
    return this.getDepartureFlights().length > 0;
  }

  hasReturnFlights(): boolean {
    return this.tripType === 'roundtrip' && this.getReturnFlights().length > 0;
  }
}