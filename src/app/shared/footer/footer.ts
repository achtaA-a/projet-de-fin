import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();
  newsletterEmail: string = '';
  showScrollButton: boolean = false;
  isDarkTheme: boolean = false;

  ngOnInit(): void {
    this.checkScrollPosition();
    this.checkTheme();
    
    // Écouter les changements de thème
    document.addEventListener('themeChanged', (event: any) => {
      this.isDarkTheme = event.detail.isDark;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  private checkScrollPosition() {
    this.showScrollButton = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  scrollTo(section: string) {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  subscribeNewsletter() {
    if (this.newsletterEmail) {
      // Ici, vous pouvez ajouter la logique pour s'abonner à la newsletter
      console.log('Inscription à la newsletter avec:', this.newsletterEmail);
      
      // Réinitialiser le formulaire
      this.newsletterEmail = '';
      
      // Afficher un message de succès (vous pouvez utiliser un service de notification)
      alert('Merci de vous être abonné à notre newsletter !');
    }
  }

  private checkTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkTheme = true;
    }
  }
}
