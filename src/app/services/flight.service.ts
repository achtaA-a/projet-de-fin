import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
  baggageAllowance: string;
  cabinBaggage: string;
  checkedBaggage?: string;
  meal: boolean | string;
  mealIncluded: boolean;
  wifi: boolean;
  entertainment: boolean;
  isOvernight: boolean;
  aircraft: string;
  terminal: string;
  gate: string;
  status: 'onTime' | 'delayed' | 'cancelled';
  delay?: number;
  availableSeats: number;
  flightDuration: string;
  departureDate: string;
  arrivalDate: string;
  isFlexible?: boolean;
  remainingSeats?: number;
  previousPrice?: number;
  daysDifference?: number;
  layover?: string;
  fareBasis?: string;
  fareOptions?: string[];
  
  // Propriétés pour les vols aller-retour
  returnFlightNumber?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;
  returnPrice?: number;
  
  // Propriétés supplémentaires
  powerOutlets?: boolean;
  wifiAvailable?: boolean;
  powerOutletsAvailable?: boolean;
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

export interface FlightSearchCriteria {
  departure?: string;
  destination?: string;
  date?: string;
  passengers?: number;
  travelClass?: 'economy' | 'business' | 'first';
  returnDate?: string;
  isRoundTrip?: boolean;
}

export interface FlightSearchResult {
  flights: Flight[];
  totalResults: number;
  searchCriteria: FlightSearchCriteria;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private flights: Flight[] = [];
  private bookings: Booking[] = [];
  private recentSearches: any[] = [];
  private bookingSubject = new BehaviorSubject<Booking[]>([]);

  constructor() {
    this.initializeFlights();
  }

  // Generate random date around a base date
  private generateRandomDate(baseDate: Date, daysRange: number = 3): Date {
    const randomDays = Math.floor(Math.random() * daysRange * 2) - daysRange;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + randomDays);
    return date;
  }

  // Format date as YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Generate random time in HH:MM format
  private generateRandomTime(): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Generate a unique flight ID
  private generateFlightId(prefix: string = 'FL'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // Add a flight to the flights array
  private addFlight(flightData: Partial<Flight>): void {
    const flight: Flight = {
      id: flightData.id || this.generateFlightId(),
      flightNumber: flightData.flightNumber || '',
      departure: flightData.departure || '',
      departureCode: flightData.departureCode || '',
      destination: flightData.destination || '',
      destinationCode: flightData.destinationCode || '',
      departureTime: flightData.departureTime || '00:00',
      arrivalTime: flightData.arrivalTime || '00:00',
      duration: flightData.duration || '0h 0m',
      price: flightData.price || 0,
      seatsAvailable: flightData.seatsAvailable || 0,
      travelClass: flightData.travelClass || 'economy',
      airline: flightData.airline || 'Tchad Airlines',
      stops: flightData.stops || 0,
      baggageAllowance: flightData.baggageAllowance || '23kg',
      cabinBaggage: flightData.cabinBaggage || '7kg',
      mealIncluded: flightData.mealIncluded || false,
      wifi: flightData.wifi || false,
      entertainment: flightData.entertainment || false,
      isOvernight: flightData.isOvernight || false,
      meal: flightData.meal !== undefined ? flightData.meal : Math.random() > 0.3,
      aircraft: flightData.aircraft || 'Boeing 737',
      terminal: flightData.terminal || '1',
      gate: flightData.gate || 'A1',
      status: flightData.status || 'onTime',
      delay: flightData.delay,
      availableSeats: flightData.availableSeats || 0,
      flightDuration: flightData.flightDuration || '0h 0m',
      checkedBaggage: flightData.checkedBaggage || '1 x 23kg',
      departureDate: flightData.departureDate || this.formatDate(new Date()),
      arrivalDate: flightData.arrivalDate || this.formatDate(new Date()),
      isFlexible: flightData.isFlexible,
      remainingSeats: flightData.remainingSeats,
      previousPrice: flightData.previousPrice
    };
    this.flights.push(flight);
  }

  // Initialize sample flight data
  private initializeFlights(): void {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    // Sample flights from N'Djamena to various destinations
    this.addFlight({
      flightNumber: 'TC-001',
      departure: 'N\'Djamena',
      departureCode: 'NDJ',
      destination: 'Paris',
      destinationCode: 'CDG',
      departureTime: '08:30',
      arrivalTime: '14:45',
      duration: '6h 15m',
      price: 450000,
      seatsAvailable: 120,
      availableSeats: 120,
      travelClass: 'economy',
      airline: 'Tchad Airlines',
      stops: 0,
      baggageAllowance: '23kg',
      cabinBaggage: '7kg',
      mealIncluded: true,
      wifi: true,
      entertainment: true,
      isOvernight: false,
      aircraft: 'Boeing 777',
      terminal: '1',
      gate: 'A12',
      status: 'onTime',
      flightDuration: '6h 15m',
      departureDate: this.formatDate(today),
      arrivalDate: this.formatDate(today),
      isFlexible: true,
      remainingSeats: 45
    });

    // Add more sample flights with different destinations and details
    const destinations = [
      { city: 'Istanbul', code: 'IST', airline: 'Turkish Airlines', price: 380000, duration: '5h 30m' },
      { city: 'Dubai', code: 'DXB', airline: 'Emirates', price: 420000, duration: '4h 45m' },
      { city: 'Johannesburg', code: 'JNB', airline: 'South African Airways', price: 550000, duration: '7h 15m' },
      { city: 'Nairobi', code: 'NBO', airline: 'Kenya Airways', price: 320000, duration: '4h 0m' },
      { city: 'Cairo', code: 'CAI', airline: 'EgyptAir', price: 280000, duration: '3h 30m' }
    ];

    // Generate additional flights
    destinations.forEach(dest => {
      this.addFlight({
        flightNumber: `TC-${Math.floor(Math.random() * 900) + 100}`,
        departure: 'N\'Djamena',
        departureCode: 'NDJ',
        destination: dest.city,
        destinationCode: dest.code,
        departureTime: this.generateRandomTime(),
        arrivalTime: this.generateRandomTime(),
        duration: dest.duration,
        price: dest.price,
        seatsAvailable: Math.floor(Math.random() * 100) + 50,
        availableSeats: Math.floor(Math.random() * 100) + 50,
        travelClass: ['economy', 'business', 'first'][Math.floor(Math.random() * 3)] as 'economy' | 'business' | 'first',
        airline: dest.airline,
        stops: Math.floor(Math.random() * 2),
        baggageAllowance: '23kg',
        cabinBaggage: '7kg',
        mealIncluded: Math.random() > 0.3,
        wifi: Math.random() > 0.5,
        entertainment: Math.random() > 0.5,
        isOvernight: Math.random() > 0.7,
        aircraft: ['Boeing 737', 'Airbus A320', 'Boeing 787', 'Airbus A350'][Math.floor(Math.random() * 4)],
        terminal: String(Math.floor(Math.random() * 3) + 1),
        gate: String.fromCharCode(65 + Math.floor(Math.random() * 10)) + (Math.floor(Math.random() * 20) + 1),
        status: ['onTime', 'delayed', 'cancelled'][Math.floor(Math.random() * 3)] as 'onTime' | 'delayed' | 'cancelled',
        flightDuration: dest.duration,
        departureDate: this.formatDate(this.generateRandomDate(today, 30)),
        arrivalDate: this.formatDate(this.generateRandomDate(today, 30)),
        isFlexible: Math.random() > 0.5,
        remainingSeats: Math.floor(Math.random() * 50) + 10
      });
    });
  }

  // Search flights based on criteria
  searchFlights(criteria: FlightSearchCriteria): Observable<FlightSearchResult> {
    try {
      // Validation des critères de recherche
      if (!criteria.departure && !criteria.destination) {
        return throwError(() => ({
          code: 'INVALID_CRITERIA',
          message: 'Au moins un aéroport de départ ou de destination doit être spécifié'
        } as ServiceError));
      }

      const filteredFlights = this.flights.filter(flight => {
        return this.matchesFlightCriteria(flight, criteria);
      });

      const result: FlightSearchResult = {
        flights: filteredFlights,
        totalResults: filteredFlights.length,
        searchCriteria: criteria
      };

      return of(result).pipe(
        catchError(error => {
          console.error('Erreur lors de la recherche de vols:', error);
          return throwError(() => ({
            code: 'SEARCH_ERROR',
            message: 'Erreur lors de la recherche de vols',
            details: error
          } as ServiceError));
        })
      );
    } catch (error) {
      return throwError(() => ({
        code: 'SEARCH_ERROR',
        message: 'Erreur lors de la recherche de vols',
        details: error
      } as ServiceError));
    }
  }

  // Helper method to check if flight matches criteria
  private matchesFlightCriteria(flight: Flight, criteria: FlightSearchCriteria): boolean {
    // Extraire le code de l'aéroport de la destination (ex: "Paris (CDG)" -> "CDG")
    const extractAirportCode = (str: string) => {
      const match = str.match(/\(([^)]+)\)/);
      return match ? match[1] : str;
    };

    const departureCode = criteria.departure ? extractAirportCode(criteria.departure) : null;
    const destinationCode = criteria.destination ? extractAirportCode(criteria.destination) : null;

    const matchesDeparture = !departureCode || 
      flight.departure.toLowerCase().includes(departureCode.toLowerCase()) ||
      flight.departureCode.toLowerCase() === departureCode.toLowerCase();
    
    const matchesDestination = !destinationCode ||
      flight.destination.toLowerCase().includes(destinationCode.toLowerCase()) ||
      flight.destinationCode.toLowerCase() === destinationCode.toLowerCase();
    
    const matchesDate = !criteria.date || flight.departureDate === criteria.date;
    const matchesClass = !criteria.travelClass || flight.travelClass === criteria.travelClass;
    const hasSeats = !criteria.passengers || flight.availableSeats >= criteria.passengers;

    return matchesDeparture && matchesDestination && matchesDate && 
           matchesClass && hasSeats;
  }

  // Book a flight
  bookFlight(flightId: string | Flight, passengerCount: number, travelClass: 'economy' | 'business' | 'first'): Observable<Booking> {
    try {
      // Validation des paramètres
      if (passengerCount <= 0 || passengerCount > 10) {
        return throwError(() => ({
          code: 'INVALID_PASSENGER_COUNT',
          message: 'Le nombre de passagers doit être entre 1 et 10'
        } as ServiceError));
      }

      // Si on reçoit un objet Flight, on l'utilise directement, sinon on cherche le vol par ID
      const flightToBook = typeof flightId === 'string' 
        ? this.flights.find(f => f.id === flightId)
        : flightId;
        
      if (!flightToBook) {
        return throwError(() => ({
          code: 'FLIGHT_NOT_FOUND',
          message: 'Vol non trouvé'
        } as ServiceError));
      }

      if (flightToBook.availableSeats < passengerCount) {
        return throwError(() => ({
          code: 'INSUFFICIENT_SEATS',
          message: `Seulement ${flightToBook.availableSeats} siège(s) disponible(s)`
        } as ServiceError));
      }

      const booking: Booking = {
        id: `BKG-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        flight: { ...flightToBook },
        passengers: passengerCount,
        travelClass,
        totalPrice: flightToBook.price * passengerCount,
        bookingDate: new Date(),
        status: 'confirmed'
      };

      // Update available seats
      flightToBook.availableSeats -= passengerCount;
      
      // Add to bookings
      this.bookings.push(booking);
      this.bookingSubject.next([...this.bookings]);
      
      // Save to localStorage
      try {
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
      } catch (storageError) {
        console.warn('Impossible de sauvegarder dans localStorage:', storageError);
      }
      
      return of(booking).pipe(
        catchError(error => {
          console.error('Erreur lors de la réservation:', error);
          return throwError(() => ({
            code: 'BOOKING_ERROR',
            message: 'Erreur lors de la réservation',
            details: error
          } as ServiceError));
        })
      );
    } catch (error) {
      return throwError(() => ({
        code: 'BOOKING_ERROR',
        message: 'Erreur lors de la réservation',
        details: error
      } as ServiceError));
    }
  }

  // Get all bookings
  getBookings(): Observable<Booking[]> {
    try {
      const bookings = localStorage.getItem('bookings');
      this.bookings = bookings ? JSON.parse(bookings) : [];
      return of([...this.bookings]);
    } catch (error) {
      console.error('Error parsing bookings from localStorage:', error);
      return of([]);
    }
  }

  // Get booking by ID
  getBookingById(bookingId: string): Observable<Booking | undefined> {
    const booking = this.bookings.find(b => b.id === bookingId);
    return of(booking);
  }

  // Add recent search
  addRecentSearch(searchParams: any): void {
    this.recentSearches.unshift({
      ...searchParams,
      timestamp: new Date().getTime()
    });
    
    // Keep only the 5 most recent searches
    if (this.recentSearches.length > 5) {
      this.recentSearches = this.recentSearches.slice(0, 5);
    }
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }


  // ...

  // Cancel booking
  cancelBooking(bookingId: string): Observable<boolean> {
    const bookingIndex = this.bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex > -1) {
      // Restore seats
      const booking = this.bookings[bookingIndex];
      const flight = this.flights.find(f => f.id === booking.flight.id);
      
      if (flight) {
        flight.availableSeats += booking.passengers;
      }
      
      this.bookings.splice(bookingIndex, 1);
      this.bookingSubject.next([...this.bookings]);
      
      // Update localStorage
      localStorage.setItem('bookings', JSON.stringify(this.bookings));
      
      return of(true);
    }
    return of(false);
  }

  // Save recent search (private method used internally)
  private saveRecentSearch(search: any): void {
    this.addRecentSearch(search);
  }

  // Get recent searches
  getRecentSearches(): Observable<any[]> {
    try {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        this.recentSearches = JSON.parse(savedSearches);
      }
      return of([...this.recentSearches]);
    } catch (error) {
      console.error('Error loading recent searches:', error);
      return of([]);
    }
  }
}
