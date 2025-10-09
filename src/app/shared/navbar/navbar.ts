import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgbCollapse, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    NgbCollapse, 
    NgbModule, 
    FormsModule
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuCollapsed = true;
  isNavbarScrolled = false;
  currentLanguage = 'FR';
  isDarkTheme = false;
  showLoginModal = false;
  currentRoute = '';
  showContactModal = false;
  isSubmitting = false;
  contactFormData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  private routerSubscription: Subscription | undefined;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    console.log('NavbarComponent initialisé');
    // Vérifier le thème au chargement
    this.checkTheme();
    
    // Suivre les changements de route
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.isMenuCollapsed = true; // Fermer le menu mobile lors du changement de route
      }
    });
    
    // Vérifier la position de défilement initiale
    this.onWindowScroll();
  }

  ngOnDestroy(): void {
    // Nettoyer l'abonnement pour éviter les fuites de mémoire
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // Gestion du formulaire de contact
  openContactModal() {
    console.log('=== Méthode openContactModal appelée ===');
    console.log('Avant - showContactModal:', this.showContactModal);
    
    // Forcer la mise à jour de la vue
    this.showContactModal = true;
    console.log('Après - showContactModal:', this.showContactModal);
    
    // Vérifier si la classe est correctement ajoutée
    document.body.classList.add('modal-open');
    console.log('Classe ajoutée au body:', document.body.classList);
    
    // Forcer la détection des changements
    setTimeout(() => {
      console.log('Après setTimeout - showContactModal:', this.showContactModal);
      console.log('Body classes après timeout:', document.body.className);
    }, 0);
  }

  closeContactModal() {
    console.log('Fermeture de la modale');
    this.showContactModal = false;
    document.body.classList.remove('modal-open');
    console.log('showContactModal après fermeture:', this.showContactModal);
  }

  onSubmitContactForm() {
    if (!this.isSubmitting) {
      this.isSubmitting = true;
      
      // Ici, vous pouvez ajouter la logique pour envoyer le formulaire
      // Par exemple, en utilisant un service d'API
      console.log('Form submitted:', this.contactFormData);
      
      // Simulation d'un envoi de formulaire
      setTimeout(() => {
        this.isSubmitting = false;
        this.closeContactModal();
        // Réinitialiser le formulaire
        this.contactFormData = {
          name: '',
          email: '',
          subject: '',
          message: ''
        };
        // Afficher un message de succès (vous pouvez utiliser un service de notification)
        alert('Votre message a été envoyé avec succès !');
      }, 1500);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isNavbarScrolled = window.pageYOffset > 20;
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'FR' ? 'AR' : 'FR';
    // Ici, vous pouvez ajouter la logique pour changer la langue de l'application
    // Par exemple, utiliser un service de traduction
    console.log('Langue changée vers:', this.currentLanguage);
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
    
    // Émettre un événement personnalisé pour informer les autres composants du changement de thème
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark: this.isDarkTheme } }));
  }

  private checkTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }

  scrollTo(section: string) {
    if (this.router.url === '/') {
      // Si nous sommes sur la page d'accueil, faire défiler vers la section
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si nous ne sommes pas sur la page d'accueil, naviguer vers la page d'accueil avec un hash
      this.router.navigate(['/'], { fragment: section });
    }
    // Fermer le menu mobile après la navigation
    this.isMenuCollapsed = true;
  }

  openLoginModal() {
    this.showLoginModal = true;
    document.body.classList.add('modal-open');
    // Empêcher le défilement du corps lorsque la modale est ouverte
    document.body.style.overflow = 'hidden';
  }

  closeLoginModal() {
    this.showLoginModal = false;
    document.body.classList.remove('modal-open');
    // Rétablir le défilement du corps
    document.body.style.overflow = '';
  }
}
