import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DestinationService, Destination, ApiResponse } from '../services/list-destina';

@Component({
  selector: 'app-list-destina',
  templateUrl: './list-destina.html',
  styleUrls: ['./list-destina.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ListDestina implements OnInit {
  destinations: Destination[] = [];
  chargement = false;
  erreur: string | null = null;

  page = 1;
  pageSize = 4;
  totalPages = 0;
  totalDestinations = 0;

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
        
        this.destinations = data.donnees.destinations || [];
        this.totalDestinations = data.totalResults || 0;
        this.totalPages = data.totalPages || 0;

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

  bookDestination(dest: Destination) {
    const destinationData = {
      id: dest._id,
      nom: dest.nom,
      code: dest.code,
      prix: dest.prix,
      dureeVol: dest.dureeVol,
      image: dest.image
    };

    this.router.navigate(['/reservation'], { 
      state: { destination: destinationData } 
    });
  }

  getSafeImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return 'https://via.placeholder.com/300x200?text=Destination';
    }
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    const formattedUrl = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
    return `http://localhost:3000${formattedUrl}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/300x200?text=Image+Non+Disponible';
  }
}
