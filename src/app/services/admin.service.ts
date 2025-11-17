import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from '../services/authService'; // ✅ liaison directe

export interface DashboardStats {
  totalReservations: number;
  totalVols: number;
  totalUtilisateurs: number;
  chiffreAffaire: number;
  reservationsEnAttente: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: string;
  user: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /** 🔹 Génère les headers avec le token JWT */
  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // ✅ cohérent avec AuthService
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  /** 📊 Statistiques du tableau de bord */
  getDashboardStats(): Observable<any[]> {
    return this.http.get<{ statut: string; donnees: DashboardStats }>(
      `${this.apiUrl}/dashboard/stats`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => this.transformStats(response.donnees)),
      catchError(this.handleError)
    );
  }

  /** 🕒 Activités récentes */
  getRecentActivities(): Observable<RecentActivity[]> {
    return this.http.get<{ statut: string; donnees: RecentActivity[] }>(
      `${this.apiUrl}/dashboard/activities`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response.donnees),
      catchError(this.handleError)
    );
  }

  /** 👥 Gestion des utilisateurs */
  getUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/users?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/users`,
      userData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/users/${userId}`,
      userData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/users/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /** ✈️ Gestion des vols */
  getVols(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/vols?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  createVol(volData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/vols`,
      volData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  updateVol(volId: string, volData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/vols/${volId}`,
      volData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  deleteVol(volId: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/vols/${volId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /** 📈 Statistiques avancées */
  getAdvancedStats(periode: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/stats/advanced?periode=${periode}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /** 🚪 Déconnexion côté API (si disponible) */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError));
  }

  /** 🔹 Transformation des statistiques */
  private transformStats(stats: DashboardStats): any[] {
    return [
      {
        title: 'Réservations Totales',
        value: stats.totalReservations,
        icon: '📋',
        color: 'primary',
        change: 12,
        route: '/admin/reservations'
      },
      {
        title: 'Vols Actifs',
        value: stats.totalVols,
        icon: '✈️',
        color: 'success',
        change: 5,
        route: '/admin/vols'
      },
      {
        title: 'Utilisateurs',
        value: stats.totalUtilisateurs,
        icon: '👥',
        color: 'info',
        change: 8,
        route: '/admin/utilisateurs'
      },
      {
        title: 'Chiffre d’Affaire',
        value: stats.chiffreAffaire,
        icon: '💰',
        color: 'warning',
        change: 15,
        route: '/admin/statistiques'
      }
    ];
  }

  /** 🔹 Gestion centralisée des erreurs */
  private handleError(error: any): Observable<never> {
    console.error('Erreur API Admin:', error);

    let message = 'Une erreur est survenue';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Session expirée, veuillez vous reconnecter';
      localStorage.removeItem('auth_token');
      localStorage.removeItem('utilisateur');
      window.location.reload();
    } else if (error.status === 403) {
      message = 'Accès non autorisé';
    }

    return throwError(() => new Error(message));
  }
}
