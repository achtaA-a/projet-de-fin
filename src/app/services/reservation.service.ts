import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) {}

  /** 🔹 Obtenir toutes les réservations avec pagination */
  getReservations(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<any>(this.apiUrl, { params });
  }

  /** 🔹 Obtenir une réservation par ID MongoDB */
  getReservation(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Obtenir une réservation par référence */
  getReservationByReference(reference: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reference/${reference}`);
  }

  /** 🔹 Créer une nouvelle réservation */
  createReservation(reservationData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, reservationData);
  }

  /** 🔹 Mettre à jour une réservation (changement de statut, etc.) */
  updateReservation(id: string, reservationData: any): Observable<any> {
    if (!id || id.length < 10) {
      console.error('❌ ID de réservation invalide :', id);
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, reservationData);
  }

  /** 🔹 Supprimer une réservation */
  deleteReservation(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Récupérer les statistiques de réservation */
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }

  /** 🔹 Annuler une réservation (raccourci pratique) */
  cancelReservation(id: string): Observable<any> {
    return this.updateReservation(id, { statut: 'annulee' });
  }
}
