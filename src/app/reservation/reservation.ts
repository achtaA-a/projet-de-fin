import { Component, OnInit, PipeTransform } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FlightService, Flight } from '../services/flight.service';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { DurationPipe } from '../shared/pipes/duration.pipe';

interface RecentSearch {
  departure: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: 'economy' | 'business' | 'first';
  timestamp: number;
}

interface FlightSearch {
  departure: string;
  departureCode: string;
  destination: string;
  destinationCode: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  travelClass: 'economy' | 'business' | 'first';
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule, 
    DatePipe,
    CurrencyPipe,
    DurationPipe
  ],
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
  bookingReference = '';
  today = new Date().toISOString().split('T')[0];
  searchForm: NgForm | null = null;
  
  // Propriétés pour le formulaire de paiement
  paymentMethod = 'visa';
  cardNumber = '';
  cardExpiry = '';
  cardCvv = '';
  cardHolderName = '';
  saveCard = false;
  termsAccepted = false;
  isProcessingPayment = false;
  
  // Propriétés pour les passagers
  passengers: any[] = [];
  countries = [
    { code: 'TD', name: 'Tchad' },
    { code: 'FR', name: 'France' },
    { code: 'US', name: 'États-Unis' }
  ];
  
  // Propriétés pour l'adresse de facturation
  sameAsPassenger = true;
  billingAddress = {
    country: 'TD',
    city: "N'Djamena",
    address1: '',
    address2: '',
    postalCode: '',
    phone: ''
  };
  
  // Propriétés pour les sièges et repas
  selectedSeats: any[] = [];
  selectedMeals: any[] = [];

  // Propriétés pour la gestion des sièges et des repas
  availableSeats: string[] = [];
  availableMeals: any[] = [];
  
  flightSearch: FlightSearch = {
    departure: "N'Djamena (NDJ)",
    departureCode: 'NDJ',
    destination: '',
    destinationCode: '',
    departureDate: this.today,
    passengers: 1,
    travelClass: 'economy' as const
  };

  // Instance du pipe pour le formatage de la durée
  private durationPipe = new DurationPipe();

  constructor(
    private flightService: FlightService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecentSearches();
    this.initializeForm();
  }

  /**
   * Initialise le formulaire avec des valeurs par défaut
   */
  private initializeForm(): void {
    // Initialisation des valeurs par défaut
    this.flightSearch = {
      departure: "N'Djamena (NDJ)",
      departureCode: 'NDJ',
      destination: '',
      destinationCode: '',
      departureDate: this.today,
      passengers: 1,
      travelClass: 'economy'
    };
  }

  /**
   * Recherche des vols en fonction des critères de recherche
   * @param form Le formulaire de recherche de vols
   */
  searchFlights(form: NgForm): void {
    // Réinitialiser les messages d'erreur
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifier la validité du formulaire
    if (form.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      this.scrollToFirstInvalidControl();
      return;
    }

    // Validation des dates
    const departureDate = new Date(this.flightSearch.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (departureDate < today) {
      this.errorMessage = 'La date de départ ne peut pas être dans le passé.';
      return;
    }

    if (this.flightSearch.returnDate) {
      const returnDate = new Date(this.flightSearch.returnDate);
      if (returnDate < departureDate) {
        this.errorMessage = 'La date de retour doit être postérieure à la date de départ.';
        return;
      }
    }

    // Validation du nombre de passagers
    if (this.flightSearch.passengers < 1 || this.flightSearch.passengers > 9) {
      this.errorMessage = 'Le nombre de passagers doit être compris entre 1 et 9.';
      return;
    }

    this.isLoading = true;
    
    // Appel au service de recherche de vols
    this.flightService.searchFlights(this.flightSearch).subscribe({
      next: (flights) => {
        this.availableFlights = flights;
        this.isLoading = false;
        
        if (flights.length > 0) {
          this.nextStep();
        } else {
          this.errorMessage = 'Aucun vol disponible pour les critères sélectionnés.';
        }
      },
      error: (error) => {
        console.error('Erreur lors de la recherche de vols:', error);
        this.isLoading = false;
        this.errorMessage = 'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
      }
    });
  }

  /**
   * Sélectionne un vol et passe à l'étape suivante
   * @param flight Le vol sélectionné
   */
  selectFlight(flight: Flight): void {
    if (!flight) {
      this.errorMessage = 'Aucun vol sélectionné';
      return;
    }
    this.selectedFlight = flight;
    this.nextStep();
  }

  /**
   * Confirme la réservation du vol sélectionné
   */
  confirmBooking(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    // Validation du vol sélectionné
    if (!this.selectedFlight) {
      this.errorMessage = 'Veuillez sélectionner un vol avant de continuer.';
      return;
    }

    // Validation des informations de paiement
    if (!this.isPaymentValid()) {
      this.errorMessage = 'Veuillez vérifier les informations de paiement.';
      return;
    }

    this.isProcessingPayment = true;

    // Simuler un délai de traitement du paiement
    setTimeout(() => {
      try {
        // Générer une référence de réservation
        this.bookingReference = `TC-${Date.now().toString().slice(-8)}`;
        this.isProcessingPayment = false;
        this.nextStep();
      } catch (error) {
        console.error('Erreur lors de la confirmation de la réservation:', error);
        this.errorMessage = 'Une erreur est survenue lors de la confirmation de votre réservation.';
        this.isProcessingPayment = false;
      }
    }, 1500);
  }

  /**
   * Vérifie la validité des informations de paiement
   * @returns true si le paiement est valide, false sinon
   */
  isPaymentValid(): boolean {
    // Vérification basique des champs de paiement
    if (!this.cardNumber || this.cardNumber.replace(/\s/g, '').length !== 16) {
      this.errorMessage = 'Numéro de carte invalide';
      return false;
    }

    if (!this.cardExpiry || !/^\d{2}\/\d{2}$/.test(this.cardExpiry)) {
      this.errorMessage = 'Date d\'expiration invalide (format MM/AA attendu)';
      return false;
    }

    if (!this.cardCvv || !/^\d{3,4}$/.test(this.cardCvv)) {
      this.errorMessage = 'Code de sécurité invalide';
      return false;
    }

    if (!this.cardHolderName || this.cardHolderName.trim().length < 3) {
      this.errorMessage = 'Nom du titulaire de la carte invalide';
      return false;
    }

    if (!this.termsAccepted) {
      this.errorMessage = 'Veuvez accepter les conditions générales pour continuer';
      return false;
    }

    return true;
  }

  /**
   * Fait défiler la page jusqu'au premier champ invalide
   */
  scrollToFirstInvalidControl(): void {
    const firstInvalidControl = document.querySelector('.ng-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const inputElement = firstInvalidControl.querySelector('input, select, textarea');
      if (inputElement) {
        (inputElement as HTMLElement).focus();
      }
    }
  }

  /**
   * Passe à l'étape suivante du processus de réservation
   */
  nextStep(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
      this.updateProgressBar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Reviens à l'étape précédente du processus de réservation
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateProgressBar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  updateProgressBar(): void {
    this.progressPercentage = (this.currentStep / 5) * 100;
  }

  // Liste des destinations disponibles
  destinations = [
    { code: 'NDJ', name: "N'Djamena (NDJ)" },
    { code: 'NIM', name: 'Niamey (NIM)' },
    { code: 'ABJ', name: 'Abidjan (ABJ)' },
    { code: 'DLA', name: 'Douala (DLA)' },
    { code: 'YAO', name: 'Yaoundé (YAO)' },
    { code: 'CDG', name: 'Paris Charles de Gaulle (CDG)' },
    { code: 'JFK', name: 'New York (JFK)' },
    { code: 'DXB', name: 'Dubaï (DXB)' }
  ];

  loadRecentSearches(): void {
    try {
      const savedSearches = localStorage.getItem('recentFlightSearches');
      if (savedSearches) {
        this.recentSearches = JSON.parse(savedSearches);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recherches récentes:', error);
      this.recentSearches = [];
    }
  }

  // Utilise une recherche récente
  useRecentSearch(search: RecentSearch): void {
    // On suppose que le code de l'aéroport est la dernière partie entre parenthèses
    const getAirportCode = (location: string): string => {
      const match = location.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
    };
    
    this.flightSearch = {
      departure: search.departure,
      departureCode: getAirportCode(search.departure),
      destination: search.destination,
      destinationCode: getAirportCode(search.destination),
      departureDate: search.departureDate,
      returnDate: search.returnDate,
      passengers: search.passengers,
      travelClass: search.travelClass
    };
  }

  // Obtient le nom d'une destination à partir de son code
  getDestinationName(code: string): string {
    const dest = this.destinations.find(d => d.code === code);
    return dest ? dest.name : code;
  }

  // Calcule le total des billets
  calculateTotal(): number {
    if (!this.selectedFlight) return 0;
    return this.selectedFlight.price * (this.flightSearch?.passengers || 1);
  }

  // Calcule le grand total (avec frais)
  calculateGrandTotal(): number {
    const total = this.calculateTotal();
    const fees = total * 0.1; // 10% de frais
    return total + fees;
  }

  // Traite le paiement
  processPayment(): void {
    this.isProcessingPayment = true;
    // Simulation de traitement de paiement
    setTimeout(() => {
      this.isProcessingPayment = false;
      this.nextStep();
    }, 2000);
  }

  // Télécharge le billet
  downloadTicket(): void {
    // Logique de téléchargement du billet
    console.log('Téléchargement du billet...');
    // Ici, vous pourriez appeler un service pour générer et télécharger le billet
  }

  // Redirige vers la page d'accueil
  goToHomepage(): void {
    this.router.navigate(['/']);
  }

  // Obtient le siège d'un passager
  getSeatForPassenger(passenger: any): string | null {
    const seat = this.selectedSeats.find(s => s.passengerId === passenger.id);
    return seat ? seat.seatNumber : null;
  }

  // Obtient le repas d'un passager
  getMealForPassenger(passenger: any): string | null {
    const meal = this.selectedMeals.find(m => m.passengerId === passenger.id);
    return meal ? meal.mealType : null;
  }

  // Affiche les détails d'un vol
  viewFlightDetails(flight: Flight, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Empêche la propagation de l'événement
    }
    
    // Formatage de la durée
    let duration = flight.duration;
    try {
      duration = this.durationPipe.transform(flight.duration);
    } catch (e) {
      console.error('Erreur lors du formatage de la durée:', e);
    }
    
    // Création du contenu de l'alerte
    let alertContent = `
Détails du vol ${flight.flightNumber}

`;
    alertContent += `Compagnie: ${flight.airline || 'Non spécifié'}
`;
    alertContent += `Départ: ${flight.departure} (${flight.departureCode || 'N/A'}) à ${flight.departureTime}
`;
    alertContent += `Arrivée: ${flight.destination} (${flight.destinationCode || 'N/A'}) à ${flight.arrivalTime}
`;
    alertContent += `Durée: ${duration}
`;
    alertContent += `Avion: ${flight.aircraft || 'Non spécifié'}
`;
    alertContent += `Classe: ${this.translateTravelClass(flight.travelClass)}
`;
    alertContent += `Prix: ${flight.price ? flight.price.toLocaleString() + ' XAF' : 'Non spécifié'}
`;
    
    if (flight.wifi) alertContent += '\n✓ WiFi disponible\n';
    if (flight.powerOutlets) alertContent += '✓ Prises électriques disponibles\n';
    
    // Affichage de l'alerte
    alert(alertContent);
  }

  // Traduit la classe de voyage en français
  private translateTravelClass(travelClass: string): string {
    const translations: {[key: string]: string} = {
      'economy': 'Économique',
      'business': 'Affaires',
      'first': 'Première classe'
    };
    return travelClass ? (translations[travelClass] || travelClass) : 'Non spécifiée';
  }

  // Valide les informations des passagers
  validatePassengers(): void {
    if (this.passengers.length !== this.flightSearch.passengers) {
      this.errorMessage = 'Veuillez remplir les informations pour tous les passagers';
      return;
    }
    this.nextStep();
  }

  // Met à jour l'adresse de facturation
  updateBillingAddress(): void {
    if (this.sameAsPassenger && this.passengers.length > 0) {
      const mainPassenger = this.passengers[0];
      this.billingAddress = {
        ...this.billingAddress,
        address1: mainPassenger.address || '',
        city: mainPassenger.city || '',
        postalCode: mainPassenger.postalCode || '',
        phone: mainPassenger.phone || ''
      };
    }
  }

  /**
   * Formate une date au format français court (ex: "lun. 12 déc. 2023")
   * @param dateString La date à formater (au format ISO ou compatible)
   * @returns La date formatée en chaîne de caractères
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: '2-digit'
      };
      return date.toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return dateString;
    }
  }

  /**
   * Détermine si un vol est recommandé
   * @param flight Le vol à évaluer
   * @returns true si le vol est recommandé, false sinon
   */
  isRecommended(flight: Flight): boolean {
    if (!flight) return false;
    return flight.stops === 0 && (flight.availableSeats ?? 0) < 10;
  }
}