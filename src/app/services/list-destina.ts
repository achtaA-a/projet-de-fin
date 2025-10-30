import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Destination {
  _id?: string;
  nom: string;
  code: string;
  image: string;
  prix: string;
  dureeVol: string;
  volsParSemaine: string;
  avion: string;
  estActif: boolean;
  coordonnees?: {
    latitude: number;
    longitude: number;
  };
}

export interface ApiResponse {
  statut: string;
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  donnees: {
    destinations: Destination[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private apiUrl = 'http://localhost:3000/api/destinations';

  constructor(private http: HttpClient) {}

  getDestinations(page: number, limit: number): Observable<ApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse>(this.apiUrl, { params });
  }

  // NOUVELLE MÉTHODE : Créer une destination
  creerDestination(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // NOUVELLE MÉTHODE : Obtenir une destination par ID
  obtenirDestination(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}