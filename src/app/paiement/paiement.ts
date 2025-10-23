import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiement.html',
  styleUrls: ['./paiement.css']
})
export class PaiementComponent implements OnInit, AfterViewInit {
  @ViewChild('cardNumber') cardNumberInput!: ElementRef;
  @ViewChild('expiryDate') expiryDateInput!: ElementRef;
  @ViewChild('cvv') cvvInput!: ElementRef;

  cardType: string = '';
  isProcessing: boolean = false;
  isProcessingPayment: boolean = false;
  paymentSuccess: boolean = false;
  termsAccepted: boolean = false;
  selectedMeals: any[] = [];
  selectedSeats: any[] = [];
  passengers: any[] = [
    { name: 'Jean Dupont', passportNumber: '123456789' },
    { name: 'Marie Martin', passportNumber: '987654321' }
  ];
  selectedFlight: any = {
    airline: 'Tchad Airlines',
    flightNumber: 'TC-001',
    returnFlightNumber: 'TC-002',
    departure: 'N\'Djamena (NDJ)',
    destination: 'Dubai (DXB)',
    departureTime: '2024-01-15T08:00:00',
    arrivalTime: '2024-01-15T14:30:00',
    price: 450000
  };
  flightSearch: any = {
    departure: 'N\'Djamena (NDJ)',
    destination: 'Dubai (DXB)',
    departureDate: '2024-01-15',
    returnDate: '2024-01-18'
  };
  billingAddress: any = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+235 66 12 34 56',
    address: '123 Rue de la Paix',
    city: 'N\'Djamena',
    country: 'Tchad',
    zipCode: '12345'
  };
  countries: any[] = [
    { code: 'td', name: 'Tchad' },
    { code: 'cm', name: 'Cameroun' },
    { code: 'ng', name: 'Nigeria' }
  ];
  sameAsPassenger: boolean = false;
  saveCard: boolean = false;
  cardHolderName: string = 'Jean Dupont';
  cardCvv: string = '';
  cardExpiry: string = '';
  cardNumber: string = '';
  paymentMethod: string = 'card';

  // Récapitulatif des prix
  flightPrice: number = 450000;
  taxes: number = 75000;

  // Calculer le total général
  calculateGrandTotal(): number {
    return this.flightPrice + this.taxes;
  }

  // Calculer le total avec les suppléments
  calculateTotal(): number {
    const mealsCost = this.selectedMeals.length * 2500;
    const seatsCost = this.selectedSeats.length * 3000;
    return this.flightPrice + this.taxes + mealsCost + seatsCost;
  }

  // Mettre à jour l'adresse de facturation
  updateBillingAddress(): void {
    // Logique de mise à jour de l'adresse de facturation
    console.log('Adresse de facturation mise à jour');
  }

  // Traiter le paiement (méthode appelée depuis le template)
  processPayment(): void {
    this.processPaymentAndContinue();
  }

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Initialisation
  }

  ngAfterViewInit(): void {
    // Ajouter les écouteurs d'événements pour le formatage
    if (this.cardNumberInput) {
      this.cardNumberInput.nativeElement.addEventListener('input', this.formatCardNumber.bind(this));
      this.cardNumberInput.nativeElement.addEventListener('keydown', this.restrictCardNumberInput.bind(this));
    }

    if (this.expiryDateInput) {
      this.expiryDateInput.nativeElement.addEventListener('input', this.formatExpiryDate.bind(this));
      this.expiryDateInput.nativeElement.addEventListener('keydown', this.restrictExpiryDateInput.bind(this));
    }

    if (this.cvvInput) {
      this.cvvInput.nativeElement.addEventListener('keydown', this.restrictCvvInput.bind(this));
    }
  }

  // Formater le numéro de carte
  formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    input = input.substring(0, 16);

    // Détecter le type de carte
    this.detectCardType(input);

    // Formater avec des espaces tous les 4 chiffres
    let formattedInput = '';
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedInput += ' ';
      }
      formattedInput += input[i];
    }

    event.target.value = formattedInput;
  }

  // Restreindre l'entrée du numéro de carte
  restrictCardNumberInput(event: any): void {
    // Autoriser uniquement les chiffres, backspace, tab, etc.
    if (!/[\d\b\t]/.test(event.key) &&
        !(event.ctrlKey || event.metaKey) &&
        !['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Détecter le type de carte
  detectCardType(cardNumber: string): void {
    const cardTypeIcon = document.getElementById('card-type-icon');

    // Visa: commence par 4
    if (/^4/.test(cardNumber)) {
      this.cardType = 'visa';
      if (cardTypeIcon) {
        cardTypeIcon.className = 'fab fa-cc-visa card-icon visa';
      }
    }
    // MasterCard: commence par 5
    else if (/^5[1-5]/.test(cardNumber)) {
      this.cardType = 'mastercard';
      if (cardTypeIcon) {
        cardTypeIcon.className = 'fab fa-cc-mastercard card-icon mastercard';
      }
    }
    // American Express: commence par 34 ou 37
    else if (/^3[47]/.test(cardNumber)) {
      this.cardType = 'amex';
      if (cardTypeIcon) {
        cardTypeIcon.className = 'fab fa-cc-amex card-icon amex';
      }
    }
    // Type inconnu
    else {
      this.cardType = '';
      if (cardTypeIcon) {
        cardTypeIcon.className = 'fas fa-credit-card';
      }
    }
  }

  // Formater la date d'expiration
  formatExpiryDate(event: any): void {
    let input = event.target.value.replace(/\D/g, '');
    input = input.substring(0, 4);

    if (input.length > 2) {
      event.target.value = input.substring(0, 2) + '/' + input.substring(2);
    } else {
      event.target.value = input;
    }
  }

  // Restreindre l'entrée de la date d'expiration
  restrictExpiryDateInput(event: any): void {
    // Autoriser uniquement les chiffres, backspace, tab, etc.
    if (!/[\d\b\t\/]/.test(event.key) &&
        !(event.ctrlKey || event.metaKey) &&
        !['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Restreindre l'entrée du CVV
  restrictCvvInput(event: any): void {
    // Autoriser uniquement les chiffres, backspace, tab, etc.
    if (!/[\d\b\t]/.test(event.key) &&
        !(event.ctrlKey || event.metaKey) &&
        !['ArrowLeft', 'ArrowRight', 'Delete', 'Backspace'].includes(event.key)) {
      event.preventDefault();
    }
  }

  // Traiter le paiement
  processPaymentAndContinue(): void {
    // Valider le formulaire
    if (!this.validateForm()) {
      return;
    }

    // Simuler le traitement du paiement
    this.isProcessing = true;

    // Changer le texte et l'icône du bouton
    const paymentBtnText = document.getElementById('payment-btn-text');
    const paymentBtnIcon = document.getElementById('payment-btn-icon');

    if (paymentBtnText && paymentBtnIcon) {
      paymentBtnText.textContent = 'Traitement en cours...';
      paymentBtnIcon.className = 'fas fa-spinner';
    }

    // Simuler un délai de traitement
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentSuccess = true;

      if (paymentBtnText && paymentBtnIcon) {
        paymentBtnText.textContent = 'Paiement réussi!';
        paymentBtnIcon.className = 'fas fa-check';
      }

      // Passer à l'étape suivante après un délai
      setTimeout(() => {
        this.nextStep();
      }, 1500);
    }, 3000);
  }

  // Valider le formulaire
  validateForm(): boolean {
    // Implémenter la validation complète du formulaire
    const cardNumber = this.cardNumberInput.nativeElement.value.replace(/\s/g, '');
    const expiryDate = this.expiryDateInput.nativeElement.value;
    const cvv = this.cvvInput.nativeElement.value;

    // Validation basique
    if (cardNumber.length < 16) {
      alert('Veuillez entrer un numéro de carte valide');
      return false;
    }

    if (!this.isValidExpiryDate(expiryDate)) {
      alert('Veuillez entrer une date d\'expiration valide');
      return false;
    }

    if (cvv.length < 3) {
      alert('Veuillez entrer un CVV valide');
      return false;
    }

    return true;
  }

  // Valider la date d'expiration
  isValidExpiryDate(expiryDate: string): boolean {
    const parts = expiryDate.split('/');
    if (parts.length !== 2) return false;

    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      return false;
    }

    // Vérifier si la date n'est pas expirée
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  }

  // Aller à l'étape précédente (méthode appelée depuis le template)
  previousStep(): void {
    this.router.navigate(['/info-voyageur']);
  }

  // Aller à l'étape suivante
  nextStep(): void {
    // Naviguer vers la page de confirmation
    this.router.navigate(['/confirmation']);
  }
}
