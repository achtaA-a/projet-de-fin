import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Passenger {
  type: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  email: string;
  phone: string;
}

export interface EmailData {
  to: string;
  subject: string;
  bookingReference: string;
  customerName: string;
  passengers: Passenger[];
  flightDetails: {
    departure: string;
    destination: string;
    date: string;
    airline?: string;
    flightNumber?: string;
  };
  paymentMethod?: string;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // URL de votre API backend (à configurer)
  private apiUrl = 'https://votre-api.com/api/send-email';
  
  // Alternative : utiliser un service comme EmailJS, SendGrid, etc.
  private emailJsServiceId = 'YOUR_SERVICE_ID';
  private emailJsTemplateId = 'YOUR_TEMPLATE_ID';
  private emailJsPublicKey = 'YOUR_PUBLIC_KEY';

  constructor(private http: HttpClient) {}

  /**
   * Envoie un email de confirmation de réservation
   */
  sendConfirmationEmail(emailData: EmailData): Observable<any> {
    // Option 1: Utiliser votre propre API backend
    return this.sendViaBackend(emailData);
    
    // Option 2: Utiliser EmailJS (service gratuit)
    // return this.sendViaEmailJS(emailData);
  }

  /**
   * Méthode 1: Envoyer via votre API backend
   */
  private sendViaBackend(emailData: EmailData): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const emailBody = {
      to: emailData.to,
      subject: emailData.subject,
      html: this.generateEmailHTML(emailData)
    };

    return this.http.post(this.apiUrl, emailBody, { headers }).pipe(
      map(response => {
        console.log('Email envoyé avec succès:', response);
        return { success: true, message: 'Email envoyé' };
      }),
      catchError(error => {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        // En cas d'erreur, on simule quand même le succès pour ne pas bloquer l'utilisateur
        return of({ success: false, message: 'Erreur d\'envoi', error });
      })
    );
  }

  /**
   * Méthode 2: Envoyer via EmailJS (service gratuit)
   * Documentation: https://www.emailjs.com/
   */
  private sendViaEmailJS(emailData: EmailData): Observable<any> {
    const emailJsUrl = 'https://api.emailjs.com/api/v1.0/email/send';
    
    const templateParams = {
      to_email: emailData.to,
      to_name: emailData.customerName,
      booking_reference: emailData.bookingReference,
      departure: emailData.flightDetails.departure,
      destination: emailData.flightDetails.destination,
      date: emailData.flightDetails.date,
      total_amount: emailData.totalAmount
    };

    const emailJsData = {
      service_id: this.emailJsServiceId,
      template_id: this.emailJsTemplateId,
      user_id: this.emailJsPublicKey,
      template_params: templateParams
    };

    return this.http.post(emailJsUrl, emailJsData).pipe(
      map(response => {
        console.log('Email envoyé via EmailJS:', response);
        return { success: true, message: 'Email envoyé' };
      }),
      catchError(error => {
        console.error('Erreur EmailJS:', error);
        return of({ success: false, message: 'Erreur d\'envoi', error });
      })
    );
  }

  /**
   * Génère le contenu HTML de l'email
   */
  private generateEmailHTML(emailData: EmailData): string {
    // Générer la liste des passagers
    const passengersHTML = emailData.passengers.map((passenger, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: 600;">${index + 1}</td>
        <td style="padding: 12px;">${passenger.type} ${passenger.firstName} ${passenger.lastName}</td>
        <td style="padding: 12px;">${passenger.email}</td>
        <td style="padding: 12px;">${passenger.phone}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 650px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
          }
          .header {
            background: linear-gradient(135deg, #d35400, #e67e22);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border: 1px solid #e2e8f0;
          }
          .booking-ref {
            background: linear-gradient(135deg, rgba(211, 84, 0, 0.1), rgba(230, 126, 34, 0.05));
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #d35400;
            border-radius: 5px;
          }
          .section {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .section-title {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #d35400;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th {
            background: #2c3e50;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          .total {
            font-size: 28px;
            font-weight: bold;
            color: #d35400;
            text-align: center;
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, rgba(211, 84, 0, 0.05), rgba(230, 126, 34, 0.02));
            border-radius: 8px;
          }
          .footer {
            background: #2c3e50;
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #d35400;
            color: white !important;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: 600;
          }
          .alert-box {
            background: #fff3cd;
            padding: 18px;
            border-left: 4px solid #ffc107;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">✈️ Confirmation de réservation</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Votre vol est confirmé !</p>
        </div>
        
        <div class="content">
          <p>Bonjour <strong>${emailData.customerName}</strong>,</p>
          
          <p>Nous avons le plaisir de confirmer votre réservation. Voici les détails complets de votre voyage :</p>
          
          <div class="booking-ref">
            <h3 style="margin: 0; color: #d35400; font-size: 14px; text-transform: uppercase;">Numéro de réservation</h3>
            <h2 style="margin: 10px 0 5px 0; font-family: 'Courier New', monospace; font-size: 28px; color: #2c3e50;">${emailData.bookingReference}</h2>
            <p style="margin: 0; font-size: 13px; color: #7f8c8d;">Conservez ce numéro précieusement</p>
          </div>
          
          <div class="section">
            <div class="section-title">📍 Détails du vol</div>
            <div class="detail-row">
              <span><strong>Départ :</strong></span>
              <span>${emailData.flightDetails.departure}</span>
            </div>
            <div class="detail-row">
              <span><strong>Destination :</strong></span>
              <span>${emailData.flightDetails.destination}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date :</strong></span>
              <span>${emailData.flightDetails.date}</span>
            </div>
            ${emailData.flightDetails.airline ? `
            <div class="detail-row">
              <span><strong>Compagnie :</strong></span>
              <span>${emailData.flightDetails.airline} ${emailData.flightDetails.flightNumber || ''}</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <div class="section-title">👥 Passagers (${emailData.passengers.length})</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">#</th>
                  <th>Nom complet</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                </tr>
              </thead>
              <tbody>
                ${passengersHTML}
              </tbody>
            </table>
          </div>
          
          ${emailData.paymentMethod ? `
          <div class="section">
            <div class="section-title">💳 Paiement</div>
            <div class="detail-row">
              <span><strong>Méthode :</strong></span>
              <span>${emailData.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span><strong>Statut :</strong></span>
              <span style="color: #27ae60; font-weight: 600;">✓ Payé</span>
            </div>
          </div>
          ` : ''}
          
          <div class="total">
            Montant total payé : ${emailData.totalAmount.toLocaleString()} XAF
          </div>
          
          <div style="text-align: center;">
            <a href="#" class="button">📱 Voir ma réservation</a>
          </div>
          
          <div class="alert-box">
            <strong>⚠️ Informations importantes :</strong>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Présentez-vous à l'aéroport <strong>2 heures avant le départ</strong></li>
              <li>Munissez-vous d'une <strong>pièce d'identité valide</strong> (passeport ou CNI)</li>
              <li>Imprimez ou téléchargez votre <strong>billet électronique</strong></li>
              <li>Vérifiez les <strong>restrictions de bagages</strong> de votre compagnie</li>
            </ul>
          </div>
          
          <p style="margin-top: 25px; font-size: 14px; color: #7f8c8d; text-align: center;">
            Bon voyage avec <strong style="color: #d35400;">Tchad Voyage</strong> ! ✈️
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0;"><strong style="font-size: 18px;">Tchad Voyage</strong></p>
          <p style="margin: 5px 0;">Pour toute question, contactez-nous :</p>
          <p style="margin: 10px 0;">
            📧 <a href="mailto:contact@tchadvoyage.com" style="color: white;">contact@tchadvoyage.com</a><br>
            📞 +235 XX XX XX XX
          </p>
          <p style="font-size: 12px; margin-top: 20px; color: #95a5a6;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Méthode de simulation pour le développement
   */
  simulateEmailSending(emailData: EmailData): Observable<any> {
    console.log('=== SIMULATION ENVOI EMAIL ===');
    console.log('À:', emailData.to);
    console.log('Sujet:', emailData.subject);
    console.log('Réservation:', emailData.bookingReference);
    console.log('HTML généré:', this.generateEmailHTML(emailData));
    console.log('==============================');
    
    // Simuler un délai réseau
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Email simulé envoyé' });
        observer.complete();
      }, 1500);
    });
  }
}
