import { Component, OnInit } from '@angular/core';
import { DestinationService, Destination, ApiResponse } from '../services/list-destina';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // AJOUT: Importer Router

@Component({
  selector: 'app-list-destina',
  templateUrl: './list-destina.html',
  styleUrls: ['./list-destina.css'],
  imports: [CommonModule],
  standalone: true
})
export class ListDestina implements OnInit {
  destinations: Destination[] = [];
  chargement = false;
  erreur: string | null = null;

  page = 1;
  pageSize = 4;
  totalPages = 0;
  totalDestinations = 0;

  // AJOUT: Injection du Router
  constructor(
    private destinationService: DestinationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDestinations();
  }

  loadDestinations() {
    this.chargement = true;
    this.erreur = null;
    
    this.destinationService.getDestinations(this.page, this.pageSize).subscribe({
      next: (data: ApiResponse) => {
        console.log('✅ Réponse API:', data);
        
        this.destinations = data.donnees.destinations;
        this.totalDestinations = data.totalResults;
        this.totalPages = data.totalPages;
        
        console.log('📊 Pagination:', {
          page: this.page,
          totalPages: this.totalPages,
          totalDestinations: this.totalDestinations,
          affichage: this.destinations.length
        });
        
        this.chargement = false;
      },
      error: (err) => {
        console.error('❌ Erreur API:', err);
        this.erreur = 'Erreur lors du chargement des destinations';
        this.chargement = false;
      }
    });
  }

  suivant() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadDestinations();
    }
  }

  precedent() {
    if (this.page > 1) {
      this.page--;
      this.loadDestinations();
    }
  }

  // MODIFICATION: Redirection vers la page de réservation avec l'ID
  bookDestination(dest: Destination) {
    console.log('🎫 Réservation destination:', dest);
    
    // Stocker les données de la destination pour la réservation
    const destinationData = {
      id: dest._id,
      nom: dest.nom,
      code: dest.code,
      prix: dest.prix,
      dureeVol: dest.dureeVol,
      image: dest.image
    };

    // Option 1: Navigation vers la page réservation avec les données
    this.router.navigate(['/reservation'], { 
      state: { destination: destinationData } 
    });

    // Option 2: Navigation avec query params
    // this.router.navigate(['/reservation'], {
    //   queryParams: { 
    //     destinationId: dest._id,
    //     destinationName: dest.nom 
    //   }
    // });

    // Option 3: Stockage dans le localStorage
    // localStorage.setItem('selectedDestination', JSON.stringify(destinationData));
    // this.router.navigate(['/reservation']);
  }

  getSafeImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl.includes('examplecom')) {
      return 'https://via.placeholder.com/300x200?text=Destination';
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    } else {
      // Assurer que l'URL commence par un slash
      const formattedUrl = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
      return `http://localhost:3000${formattedUrl}`;
    }
  }

  handleImageError(event: any) {
    console.warn('Image non chargée:', event.target.src);
    event.target.src = 'https://via.placeholder.com/300x200?text=Image+Non+Disponible';
  }
}