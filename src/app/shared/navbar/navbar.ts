import { Component, HostListener, OnInit, OnDestroy, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { NgbCollapse, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// ------------------- Interface -------------------
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ------------------- Service -------------------
@Injectable({ providedIn: 'root' })
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/contact'; // ✅ URL du backend

  constructor(private http: HttpClient) {}

  sendContactForm(data: ContactFormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}

// ------------------- Composant -------------------
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NgbCollapse,
    NgbModule,
    FormsModule,
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // État global
  isMenuCollapsed = true;
  isNavbarScrolled = false;
  isDarkTheme = false;
  isSubmitting = false;
  currentRoute = '';

  // Langue
  currentLanguage = 'FR';
  currentLanguageName = 'Français';

  // Modales
  showLoginModal = false;
  showForgotPasswordModal = false;
  showContactModal = false;

  // Messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Données des formulaires
  contactFormData: ContactFormData = { name: '', email: '', subject: '', message: '' };
  loginFormData = { email: '', password: '' };
  forgotPasswordFormData = { email: '' };

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private contactService: ContactService
  ) {}

  // ------------------- Cycle de vie -------------------
  ngOnInit(): void {
    this.checkTheme();
    this.checkLanguagePreference();

    // Fermer menu sur navigation
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.isMenuCollapsed = true;
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  // ------------------- Contact Modal -------------------
  openContactModal() {
    this.showContactModal = true;
    document.body.classList.add('modal-open');
  }

  closeContactModal() {
    this.showContactModal = false;
    document.body.classList.remove('modal-open');
    this.successMessage = null;
    this.errorMessage = null;
  }

  // ✅ Envoi réel du formulaire de contact
  onSubmitContactForm(form: NgForm) {
    if (!form.valid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.contactService.sendContactForm(this.contactFormData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res?.message || 'Message envoyé avec succès !';
        console.log('✅ Réponse backend :', res);

        form.resetForm();
        this.contactFormData = { name: '', email: '', subject: '', message: '' };

        // Fermer après 2s
        setTimeout(() => {
          this.closeContactModal();
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Erreur envoi message :', err);
        this.isSubmitting = false;
        this.errorMessage = err?.error?.error || 'Erreur lors de l’envoi du message.';
      }
    });
  }

  // ------------------- Scroll & Navbar -------------------
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isNavbarScrolled = window.pageYOffset > 20;
  }

  scrollTo(section: string) {
    if (this.router.url === '/') {
      const element = document.getElementById(section);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment: section });
    }
    this.isMenuCollapsed = true;
  }

  // ------------------- Thème -------------------
  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  private checkTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }

  // ------------------- Langue -------------------
  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'FR' ? 'AR' : 'FR';
    this.updateLanguageName();
    this.saveLanguagePreference();
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.updateLanguageName();
    this.saveLanguagePreference();
  }

  private updateLanguageName() {
    switch (this.currentLanguage) {
      case 'FR': this.currentLanguageName = 'Français'; break;
      case 'AR': this.currentLanguageName = 'العربية'; break;
      case 'EN': this.currentLanguageName = 'English'; break;
      default: this.currentLanguageName = 'Français';
    }
  }

  private saveLanguagePreference() {
    localStorage.setItem('language', this.currentLanguage);
  }

  private checkLanguagePreference() {
    const saved = localStorage.getItem('language');
    if (saved) {
      this.currentLanguage = saved;
      this.updateLanguageName();
    }
  }

  // ------------------- Login & Password -------------------
  openLoginModal() {
    this.showLoginModal = true;
    document.body.classList.add('modal-open');
  }

  closeLoginModal() {
    this.showLoginModal = false;
    document.body.classList.remove('modal-open');
  }

  openForgotPasswordModal() {
    this.showLoginModal = false;
    this.showForgotPasswordModal = true;
  }

  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }

  // Si tu veux connecter ton backend, tu pourras implémenter ici :
  onSubmitLoginForm(form: NgForm) {
    if (!form.valid) return;
    console.log('Tentative de connexion :', this.loginFormData);
    // TODO : Appel API login
  }

  onSubmitForgotPasswordForm(form: NgForm) {
    if (!form.valid) return;
    console.log('Demande de réinitialisation pour :', this.forgotPasswordFormData.email);
    // TODO : Appel API mot de passe oublié
  }
}
