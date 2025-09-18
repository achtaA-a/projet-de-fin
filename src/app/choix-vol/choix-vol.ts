import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Flight {
  id: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  route: string;
  stops: string;
  airline: string;
  aircraft: string;
  price: number;
  selected?: boolean;
  favorite?: boolean;
}

@Component({
  selector: 'app-choix-vol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choix-vol.html',
  styleUrls: ['./choix-vol.css']
})
export class ChoixVolComponent implements OnInit {
  comparedFlights: Flight[] = [];
  cabinBaggageCost: number = 0;
  checkedBaggageCost: number = 0;
  selectedDestination: string = 'Dubai (DXB)';
  departureDate: string = 'jeu. 15 juin 2023';
  returnDate: string = 'dim. 18 juin 2023';
  
  // Exemple de données de vols
  departureFlights: Flight[] = [
    {
      id: 'flight-1',
      departureTime: '08:30',
      arrivalTime: '14:45',
      duration: '6h 15m',
      route: 'NDJ - DXB',
      stops: 'Direct',
      airline: 'Ethiopian Airlines',
      aircraft: 'Airbus A320',
      price: 245000,
      selected: true,
      favorite: false
    },
    {
      id: 'flight-2',
      departureTime: '12:15',
      arrivalTime: '19:05',
      duration: '6h 50m',
      route: 'NDJ - DXB',
      stops: 'Direct',
      airline: 'Turkish Airlines',
      aircraft: 'Boeing 737',
      price: 275000,
      selected: false,
      favorite: false
    }
  ];

  returnFlights: Flight[] = [
    {
      id: 'flight-3',
      departureTime: '10:20',
      arrivalTime: '16:35',
      duration: '6h 15m',
      route: 'DXB - NDJ',
      stops: 'Direct',
      airline: 'Ethiopian Airlines',
      aircraft: 'Airbus A320',
      price: 245000,
      selected: false,
      favorite: false
    }
  ];

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  updateBaggageTotal(cabinValue: string, checkedValue: string): void {
    this.cabinBaggageCost = parseInt(cabinValue);
    this.checkedBaggageCost = parseInt(checkedValue);
  }

  get baggageTotal(): number {
    return this.cabinBaggageCost + this.checkedBaggageCost;
  }

  selectFlight(flightId: string, flightType: 'departure' | 'return'): void {
    if (flightType === 'departure') {
      this.departureFlights.forEach(flight => {
        flight.selected = flight.id === flightId;
      });
    } else {
      this.returnFlights.forEach(flight => {
        flight.selected = flight.id === flightId;
      });
    }
  }

  toggleFavorite(flightId: string, flightType: 'departure' | 'return'): void {
    const flights = flightType === 'departure' ? this.departureFlights : this.returnFlights;
    const flight = flights.find(f => f.id === flightId);
    if (flight) {
      flight.favorite = !flight.favorite;
    }
  }

  addToComparison(flightData: Flight): void {
    const existingIndex = this.comparedFlights.findIndex(f => 
      f.departureTime === flightData.departureTime && 
      f.arrivalTime === flightData.arrivalTime && 
      f.airline === flightData.airline
    );

    if (existingIndex === -1) {
      this.comparedFlights.push({...flightData});
    }
  }

  removeFromComparison(flightId: string): void {
    this.comparedFlights = this.comparedFlights.filter(flight => flight.id !== flightId);
  }

  clearComparison(): void {
    this.comparedFlights = [];
  }

  prevStep(step: number): void {
    console.log(`Naviguer vers l'étape précédente depuis l'étape ${step}`);
    // Implémentez votre logique de navigation ici
  }

  nextStep(step: number): void {
    console.log(`Naviguer vers l'étape suivante depuis l'étape ${step}`);
    // Implémentez votre logique de navigation ici
  }
}