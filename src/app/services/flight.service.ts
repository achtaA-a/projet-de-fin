import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Flight {
  id: string;
  flightNumber: string;
  departure: string;
  departureCode: string;
  destination: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatsAvailable: number;
  travelClass: 'economy' | 'business' | 'first';
  airline: string;
  stops: number;
}

export interface Booking {
  id: string;
  flight: Flight;
  passengers: number;
  travelClass: 'economy' | 'business' | 'first';
  totalPrice: number;
  bookingDate: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private flights: Flight[] = [
    {
      id: 'FL001',
      flightNumber: 'TC-001',
      departure: 'N\'Djamena',
      departureCode: 'NDJ',
      destination: 'Paris',
      destinationCode: 'CDG',
      departureTime: '08:30',
      arrivalTime: '14:45',
      duration: '6h 15m',
      price: 850,
      seatsAvailable: 120,
      travelClass: 'economy',
      airline: 'Tchad Airlines',
      stops: 0
    },
    // Ajoutez plus de vols ici
  ];

  private bookings: Booking[] = [];
  private recentSearches: any[] = [];
  private bookingSubject = new BehaviorSubject<Booking[]>([]);

  constructor() {}

  // Récupérer tous les vols disponibles
  getFlights(): Observable<Flight[]> {
    return of(this.flights);
  }

  // Rechercher des vols selon les critères
  searchFlights(criteria: {
    departure: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    travelClass: string;
  }): Observable<Flight[]> {
    // Sauvegarder la recherche récente
    this.saveRecentSearch(criteria);
    
    // Ici, vous pourriez faire un appel API réel
    const results = this.flights.filter(flight => {
      return (
        flight.departureCode === criteria.departure.split('(')[1].replace(')', '') &&
        flight.destinationCode === criteria.destination.split('(')[1].replace(')', '') &&
        flight.seatsAvailable >= criteria.passengers
      );
    });

    return of(results);
  }

  // Réserver un vol
  bookFlight(flight: Flight, passengers: number, travelClass: 'economy' | 'business' | 'first'): Observable<Booking> {
    const booking: Booking = {
      id: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      flight,
      passengers,
      travelClass,
      totalPrice: flight.price * passengers,
      bookingDate: new Date(),
      status: 'confirmed'
    };

    this.bookings.push(booking);
    this.bookingSubject.next([...this.bookings]);
    
    // Mettre à jour les sièges disponibles
    const flightIndex = this.flights.findIndex(f => f.id === flight.id);
    if (flightIndex > -1) {
      this.flights[flightIndex].seatsAvailable -= passengers;
    }

    return of(booking);
  }

  // Obtenir les réservations
  getBookings(): Observable<Booking[]> {
    return this.bookingSubject.asObservable();
  }

  // Annuler une réservation
  cancelBooking(bookingId: string): Observable<boolean> {
    const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex > -1) {
      // Rembourser les sièges
      const booking = this.bookings[bookingIndex];
      const flightIndex = this.flights.findIndex(f => f.id === booking.flight.id);
      if (flightIndex > -1) {
        this.flights[flightIndex].seatsAvailable += booking.passengers;
      }
      
      // Marquer comme annulé
      this.bookings[bookingIndex].status = 'cancelled';
      this.bookingSubject.next([...this.bookings]);
      return of(true);
    }
    return of(false);
  }

  // Sauvegarder une recherche récente
  private saveRecentSearch(search: any) {
    this.recentSearches.unshift({
      ...search,
      timestamp: new Date().getTime()
    });
    
    // Garder seulement les 5 recherches les plus récentes
    this.recentSearches = this.recentSearches.slice(0, 5);
    
    // Ici, vous pourriez sauvegarder dans le stockage local
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  // Récupérer les recherches récentes
  getRecentSearches(): any[] {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      this.recentSearches = JSON.parse(savedSearches);
    }
    return [...this.recentSearches];
  }
}
