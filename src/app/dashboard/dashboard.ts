import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Destination {
  id: number;
  name: string;
  image: string;
  price: string;
  flightTime: string;
  flightsPerWeek: string;
  aircraft: string;
  code: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule, FormsModule, TranslateModule]
})
export class DashboardComponent implements OnInit {
  // Données des destinations
  destinations: Destination[] = [
    {
      id: 1,
      name: "Paris, France",
      image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop",
      price: "450,000 FCFA",
      flightTime: "6h30",
      flightsPerWeek: "3 vols/semaine",
      aircraft: "Airbus A320",
      code: "CDG"
    },
    {
      id: 2,
      name: "Dubai, EAU",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      price: "380,000 FCFA",
      flightTime: "5h15",
      flightsPerWeek: "5 vols/semaine",
      aircraft: "Boeing 737",
      code: "DXB"
    },
    {
      id: 3,
      name: "Addis-Abeba, Éthiopie",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      price: "280,000 FCFA",
      flightTime: "3h45",
      flightsPerWeek: "4 vols/semaine",
      aircraft: "Airbus A320",
      code: "ADD"
    },
    {
      id: 4,
      name: "Le Caire, Égypte",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop",
      price: "320,000 FCFA",
      flightTime: "4h20",
      flightsPerWeek: "3 vols/semaine",
      aircraft: "Boeing 737",
      code: "CAI"
    }
  ];

  // États de l'application
  currentLanguage = 'FR';
  currentLanguageName = 'Français';
  isDarkTheme = false;
  showLoginModal = false;
  showForgotPasswordModal = false;

  // Données de formulaire
  loginData = { email: '', password: '' };
  forgotPasswordData = { email: '' };

  constructor(
    private router: Router,
    private translate: TranslateService
  ) {
    // Configurer les langues disponibles
    this.translate.addLangs(['fr', 'en', 'ar']);
    this.translate.setDefaultLang('fr');
  }

  ngOnInit(): void {
    this.checkThemePreference();
    this.checkLanguagePreference();
  }

  // Navigation
  showDestinations(): void {
    const destinationsSection = document.getElementById('destinations');
    if (destinationsSection) {
      destinationsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showPromotions(): void {
    alert('Section promotions à venir!');
  }

  showContact(): void {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToBooking(): void {
    this.router.navigate(['/reservation']);
  }

  // Changer la langue
  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'FR' ? 'AR' : 'FR';
    this.saveLanguagePreference();
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    
    // Mettre à jour le nom de la langue
    switch(lang) {
      case 'FR':
        this.currentLanguageName = 'Français';
        this.translate.use('fr');
        break;
      case 'AR':
        this.currentLanguageName = 'العربية';
        this.translate.use('ar');
        // Appliquer la direction RTL pour l'arabe
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        break;
      case 'EN':
        this.currentLanguageName = 'English';
        this.translate.use('en');
        break;
      default:
        this.currentLanguageName = 'Français';
        this.translate.use('fr');
    }
    
    // Réinitialiser la direction pour les langues non-RTL
    if (lang !== 'AR') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', lang.toLowerCase());
    }
    
    this.saveLanguagePreference();
    console.log('Langue changée en:', lang);
  }

  private saveLanguagePreference(): void {
    localStorage.setItem('language', this.currentLanguage);
  }

  private checkLanguagePreference(): void {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
      // Mettre à jour le nom de la langue
      this.changeLanguage(savedLanguage);
    }
  }

  // Changer le thème
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    this.saveThemePreference();
  }

  private applyTheme(): void {
    if (this.isDarkTheme) {
      document.body.setAttribute('data-bs-theme', 'dark');
    } else {
      document.body.removeAttribute('data-bs-theme');
    }
  }

  private checkThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    this.applyTheme();
  }

  private saveThemePreference(): void {
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  // Gestion des modals
  openLoginModal(): void {
    this.showLoginModal = true;
    this.showForgotPasswordModal = false;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  openForgotPasswordModal(): void {
    this.showLoginModal = false;
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal(): void {
    this.showForgotPasswordModal = false;
  }

  // Soumission des formulaires
  submitLogin(): void {
    if (this.loginData.email && this.loginData.password) {
      console.log('Connexion réussie:', this.loginData);
      alert('Connexion réussie!');
      this.closeLoginModal();
    } else {
      alert('Veuillez remplir tous les champs');
    }
  }

  submitForgotPassword(): void {
    if (this.forgotPasswordData.email) {
      console.log('Récupération envoyée:', this.forgotPasswordData);
      alert('Lien de réinitialisation envoyé!');
      this.closeForgotPasswordModal();
    } else {
      alert('Veuillez entrer votre email');
    }
  }


  // Réserver une destination
  bookDestination(destination: Destination): void {
    console.log('Réservation pour:', destination);
    this.router.navigate(['/reservation'], { 
      state: { selectedDestination: destination }
    });
  }

  // Navigation sociale
  navigateToSocial(platform: string): void {
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
      youtube: 'https://youtube.com'
    };
    
    window.open(urls[platform] || '#', '_blank');
  }
}