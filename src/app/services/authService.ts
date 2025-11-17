import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userKey = 'utilisateur';

  private _isLoggedIn = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  public isLoggedIn$ = this._isLoggedIn.asObservable();

  constructor(private http: HttpClient) {}

  /** 🔹 Inscription utilisateur */
  inscription(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, data).pipe(
      tap((res: any) => {
        if (res?.token && res?.donnees?.utilisateur) {
          this.enregistrerSession(res.token, res.donnees.utilisateur);
        }
      })
    );
  }

  /** 🔹 Connexion utilisateur */
  connexion(data: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/connexion`, data).pipe(
      tap((res: any) => {
        if (res?.token && res?.donnees?.utilisateur) {
          this.enregistrerSession(res.token, res.donnees.utilisateur);
        }
      })
    );
  }

  /** 🔹 Mot de passe oublié */
  motDePasseOublie(data: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/motdepasse-oublie`, data);
  }

  /** 🔹 Sauvegarde du token et utilisateur dans le stockage local */
  private enregistrerSession(token: string, utilisateur: any): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(utilisateur));
    this._isLoggedIn.next(true);
  }

  /** 🔹 Déconnexion complète */
  deconnexion(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._isLoggedIn.next(false);
  }

  /** 🔹 Récupère l’utilisateur connecté */
  getUtilisateurConnecte(): any {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  /** 🔹 Récupère le token JWT stocké */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** 🔹 Crée les en-têtes avec le token */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
  setToken(token: string): void {
    if (token) {
      localStorage.setItem(this.tokenKey, token);
      this._isLoggedIn.next(true);
    }
  }
  

  /** 🔹 Vérifie si l’utilisateur est connecté */
  estConnecte(): boolean {
    return !!this.getToken();
  }
}
