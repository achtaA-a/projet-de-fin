import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface Aeroport {
  code: string;
  nom: string;
  ville: string;
  pays: string;
}

interface Destination {
  _id: string;
  nom: string;
  code: string;
  prix: string;
  dureeVol: string;
  image: string;
}

interface Passager {
  prenom: string;
  nom: string;
  dateNaissance: string;
  numeroPasseport: string;
}

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ReservationComponent implements OnInit {
  currentStep = 1;
  today: string = new Date().toISOString().split('T')[0];

  // AJOUT: Liste des aéroports de départ
  aeroportsDepart: Aeroport[] = [];
  destinationSelectionnee: Destination | null = null;
  destinations: Destination[] = [];
  recentSearches: any[] = [];
  
  flightSearch = {
    departure: '', // MODIFICATION: Plus en dur
    destination: '',
    destinationId: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    travelClass: 'economy'
  };

  passagers: Passager[] = [];
  prixTotal: number = 0;
  chargement = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.chargerAeroportsDepart(); // NOUVELLE MÉTHODE
    this.recupererDestination();
    this.loadDestinations();
  }

  // NOUVELLE MÉTHODE: Charger les aéroports de départ
  chargerAeroportsDepart() {
    // Données des aéroports disponibles
    this.aeroportsDepart = [
      { code: 'NDJ', nom: 'Aéroport International de N\'Djamena', ville: 'N\'Djamena', pays: 'Tchad' },
      { code: 'MQQ', nom: 'Aéroport de Moundou', ville: 'Moundou', pays: 'Tchad' },
      { code: 'AEH', nom: 'Aéroport d\'Abéché', ville: 'Abéché', pays: 'Tchad' },
      { code: 'FYT', nom: 'Aéroport de Faya-Largeau', ville: 'Faya-Largeau', pays: 'Tchad' },
      { code: 'SRH', nom: 'Aéroport de Sarh', ville: 'Sarh', pays: 'Tchad' }
    ];

    // Définir N'Djamena comme départ par défaut
    this.flightSearch.departure = 'NDJ';
  }

  recupererDestination() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['destination']) {
      this.destinationSelectionnee = navigation.extras.state['destination'];
      this.preRemplirFormulaire();
    }
    
    this.route.queryParams.subscribe(params => {
      if (params['destinationId']) {
        this.flightSearch.destinationId = params['destinationId'];
        this.chargerDetailsDestination(params['destinationId']);
      }
    });

    const storedDestination = localStorage.getItem('selectedDestination');
    if (storedDestination) {
      this.destinationSelectionnee = JSON.parse(storedDestination);
      this.preRemplirFormulaire();
      localStorage.removeItem('selectedDestination');
    }
  }

  preRemplirFormulaire() {
    if (this.destinationSelectionnee) {
      this.flightSearch.destination = this.destinationSelectionnee.code;
      this.flightSearch.destinationId = this.destinationSelectionnee._id;
      this.calculerPrix();
    }
  }

  calculerPrix() {
    if (this.destinationSelectionnee) {
      const prixBase = parseInt(this.destinationSelectionnee.prix) || 50000;
      const classMultiplier = this.flightSearch.travelClass === 'economy' ? 1 :
                              this.flightSearch.travelClass === 'business' ? 1.5 : 2;
      this.prixTotal = prixBase * this.flightSearch.passengers * classMultiplier;
    }
  }

  chargerDetailsDestination(destinationId: string) {
    this.http.get<any>(`http://localhost:3000/api/destinations/${destinationId}`).subscribe({
      next: (data) => {
        this.destinationSelectionnee = data.donnees?.destination;
        this.preRemplirFormulaire();
      },
      error: (err) => {
        console.error('Erreur chargement détails destination:', err);
      }
    });
  }

  loadDestinations() {
    this.chargement = true;
    this.http.get<any>('http://localhost:3000/api/destinations').subscribe({
      next: (data) => {
        console.log('Destinations chargées:', data);
        this.destinations = data.donnees?.destinations || data.destinations || [];
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur chargement destinations:', err);
        this.destinations = this.getMockDestinations();
        this.chargement = false;
      }
    });
  }

  private getMockDestinations(): Destination[] {
    return [
      { _id: '1', nom: 'Paris', code: 'PAR', prix: '250000', dureeVol: '6h', image: '' },
      { _id: '2', nom: 'Dubai', code: 'DXB', prix: '350000', dureeVol: '5h', image: '' },
      { _id: '3', nom: 'Istanbul', code: 'IST', prix: '300000', dureeVol: '4h', image: '' },
      { _id: '4', nom: 'Johannesburg', code: 'JNB', prix: '400000', dureeVol: '8h', image: '' },
      { _id: '5', nom: 'Casablanca', code: 'CAS', prix: '280000', dureeVol: '5h', image: '' }
    ];
  }

  // NOUVELLE MÉTHODE: Obtenir le nom complet de l'aéroport de départ
  getDepartureName(code: string): string {
    const aeroport = this.aeroportsDepart.find(a => a.code === code);
    return aeroport ? `${aeroport.code} - ${aeroport.ville}` : code;
  }

  getDestinationName(code: string): string {
    const dest = this.destinations.find(d => d.code === code);
    return dest ? `${dest.nom} (${dest.code})` : code;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  searchFlights(form: NgForm) {
    if (form.invalid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérifier que le départ et la destination sont différents
    if (this.flightSearch.departure === this.flightSearch.destination) {
      alert('Le point de départ et la destination doivent être différents');
      return;
    }

    // Si pas de destination sélectionnée via le bouton "Réserver", trouver l'ID
    if (!this.flightSearch.destinationId) {
      const dest = this.destinations.find(d => d.code === this.flightSearch.destination);
      if (dest) {
        this.flightSearch.destinationId = dest._id;
        this.destinationSelectionnee = dest;
      }
    }

    this.calculerPrix();
    this.ajouterPassagers();
    this.currentStep = 3;
  }

  onDepartureChange() {
    console.log('Aéroport de départ sélectionné:', this.flightSearch.departure);
    // Réinitialiser la destination si nécessaire
    if (this.flightSearch.departure === this.flightSearch.destination) {
      this.flightSearch.destination = '';
      this.flightSearch.destinationId = '';
      this.destinationSelectionnee = null;
    }
  }

  onDestinationChange() {
    const dest = this.destinations.find(d => d.code === this.flightSearch.destination);
    if (dest) {
      this.flightSearch.destinationId = dest._id;
      this.destinationSelectionnee = dest;
      this.calculerPrix();
    }
  }

  onClassChange() {
    this.calculerPrix();
  }

  onPassengersChange() {
    this.ajouterPassagers();
    this.calculerPrix();
  }

  ajouterPassagers() {
    this.passagers = Array.from({ length: this.flightSearch.passengers }, () => ({
      prenom: '',
      nom: '',
      dateNaissance: '',
      numeroPasseport: ''
    }));
  }

  validerPassagers() {
    const passagerIncomplet = this.passagers.some(p => 
      !p.prenom.trim() || !p.nom.trim() || !p.dateNaissance || !p.numeroPasseport.trim()
    );

    if (passagerIncomplet) {
      alert('Veuillez remplir tous les champs pour chaque passager');
      return;
    }

    const today = new Date();
    const dateNaissanceInvalide = this.passagers.some(p => {
      const birthDate = new Date(p.dateNaissance);
      return birthDate >= today;
    });

    if (dateNaissanceInvalide) {
      alert('La date de naissance doit être dans le passé');
      return;
    }

    this.currentStep = 4;
  }

  creerReservation() {
    if (!this.flightSearch.destinationId) {
      alert('Erreur: Aucune destination sélectionnée');
      return;
    }

    const reservationData = {
      depart: this.flightSearch.departure, // AJOUT: Aéroport de départ
      destinationId: this.flightSearch.destinationId,
      vol: {
        depart: this.flightSearch.departure,
        destination: this.flightSearch.destination,
        dateDepart: this.flightSearch.departureDate,
        dateRetour: this.flightSearch.returnDate,
        classe: this.flightSearch.travelClass
      },
      passagers: this.passagers,
      prixTotal: this.prixTotal,
      destinationDetails: this.destinationSelectionnee
    };

    console.log('📦 Données réservation envoyées:', reservationData);
    
    // Envoi vers l'API
    this.http.post('http://localhost:3000/api/reservations', reservationData).subscribe({
      next: (res: any) => {
        const reference = res.donnees?.reservation?.referenceReservation || 'REF-' + Date.now().toString().slice(-8);
        alert(`✅ Réservation créée avec succès !\n📋 Numéro de référence : ${reference}\n💰 Prix total : ${this.prixTotal.toLocaleString()} FCFA`);
        this.currentStep = 5;
      },
      error: err => {
        console.error('❌ Erreur réservation:', err);
        alert('❌ Erreur lors de la réservation : ' + (err.error?.message || 'Erreur serveur'));
        
        // Simulation en cas d'erreur
        const reference = 'REF-' + Date.now().toString().slice(-8);
        alert(`✅ Réservation simulée !\n📋 Référence : ${reference}\n💰 Prix : ${this.prixTotal.toLocaleString()} FCFA`);
        this.currentStep = 5;
      }
    });
  }

  precedent() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
}