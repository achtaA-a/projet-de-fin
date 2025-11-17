import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  Injectable
} from '@angular/core';
import {
  CommonModule
} from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';
import {
  NgbCollapse,
  NgbModule
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormsModule,
  NgForm
} from '@angular/forms';
import {
  Subscription,
  Observable
} from 'rxjs';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import {
  AuthService
} from '../../services/authService'; // ✅ adapte le chemin si besoin

// ------------------- Interface -------------------
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// ------------------- Service de contact -------------------
@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:3000/api/contact'; // ✅ URL backend

  constructor(private http: HttpClient) {}

  sendContactForm(data: ContactFormData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}

// ------------------- Composant principal -------------------
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
  // ------------------- États globaux -------------------
  isMenuCollapsed = true;
  isNavbarScrolled = false;
  isDarkTheme = false;
  isSubmitting = false;
  currentRoute = '';

  // ------------------- Langue -------------------
  currentLanguage = 'FR';
  currentLanguageName = 'Français';

  // ------------------- Modales -------------------
  showLoginModal = false;
  showForgotPasswordModal = false;
  showContactModal = false;

  // ------------------- Messages -------------------
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // ------------------- Formulaires -------------------
  contactFormData: ContactFormData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  loginFormData = {
    email: '',
    password: ''
  };
  forgotPasswordFormData = {
    email: ''
  };

  // ------------------- Auth -------------------
  isLoggedIn = false;
  utilisateurConnecte: any = null;

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private contactService: ContactService,
    private authService: AuthService
  ) {}

  // ------------------- Cycle de vie -------------------
  ngOnInit(): void {
    this.checkTheme();
    this.checkLanguagePreference();

    // ✅ Gestion du menu sur navigation
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) this.isMenuCollapsed = true;
    });

    // ✅ État de connexion
    this.authService.isLoggedIn$.subscribe((loggedIn) => {
      this.isLoggedIn = loggedIn;
      this.utilisateurConnecte = this.authService.getUtilisateurConnecte();
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  // ------------------- Scroll vers Destination -------------------
  scrollToDestination() {
    this.isMenuCollapsed = true;
    this.showContactModal = false;
    this.showLoginModal = false;
    this.showForgotPasswordModal = false;
    document.body.classList.remove('modal-open');

    if (this.router.url === '/') {
      this.scrollTo('destinations');
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          this.scrollTo('destinations');
        }, 300);
      });
    }
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

  onSubmitContactForm(form: NgForm) {
    if (!form.valid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.contactService.sendContactForm(this.contactFormData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res?.message || 'Message envoyé avec succès !';
        form.resetForm();
        this.contactFormData = { name: '', email: '', subject: '', message: '' };

        setTimeout(() => this.closeContactModal(), 2000);
      },
      error: (err) => {
        console.error('❌ Erreur envoi message :', err);
        this.isSubmitting = false;
        this.errorMessage = err?.error?.error || 'Erreur lors de l\'envoi du message.';
      }
    });
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

  // ------------------- Auth: Connexion -------------------
  onSubmitLoginForm(form: NgForm) {
    if (!form.valid) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.connexion({
      email: this.loginFormData.email,
      motDePasse: this.loginFormData.password
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.closeLoginModal();
        this.loginFormData = { email: '', password: '' };

        // ✅ Stocker le token
        if (res?.token) {
          localStorage.setItem('token', res.token);
          this.authService.setToken(res.token);
        }

        this.utilisateurConnecte = this.authService.getUtilisateurConnecte();
        this.isLoggedIn = true;
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Échec de la connexion.';
      }
    });
  }

  // ------------------- Auth: Déconnexion -------------------
  logout() {
    this.authService.deconnexion();
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.utilisateurConnecte = null;
    this.router.navigate(['/']);
  }

  // ------------------- Auth: Mot de passe oublié -------------------
  onSubmitForgotPasswordForm(form: NgForm) {
    if (!form.valid) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    this.authService.motDePasseOublie({ email: this.forgotPasswordFormData.email }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res?.message || 'Email de réinitialisation envoyé !';
        setTimeout(() => this.closeForgotPasswordModal(), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l\'envoi du lien.';
      }
    });
  }

  // ------------------- Gestion des modales -------------------
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
}
