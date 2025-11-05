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

  inscription(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inscription`, data).pipe(
      tap((res: any) => {
        if (res.token) this.enregistrerSession(res.token, res.donnees.utilisateur);
      })
    );
  }

  connexion(data: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/connexion`, data).pipe(
      tap((res: any) => {
        if (res.token) this.enregistrerSession(res.token, res.donnees.utilisateur);
      })
    );
  }

  motDePasseOublie(data: { email: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/motdepasse-oublie`, data);
  }

  private enregistrerSession(token: string, utilisateur: any): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(utilisateur));
    this._isLoggedIn.next(true);
  }

  deconnexion(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this._isLoggedIn.next(false);
  }

  getUtilisateurConnecte(): any {
    const data = localStorage.getItem(this.userKey);
    return data ? JSON.parse(data) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }
}
