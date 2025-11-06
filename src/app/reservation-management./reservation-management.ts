import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../services/reservation.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation-management',
  templateUrl: './reservation-management.html',
  styleUrls: ['./reservation-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ReservationManagement implements OnInit {
  reservations: any[] = [];
  loading = false;
  stats: any;
  
  // Variables pour la recherche et pagination
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  apiPage = 1;
  apiTotalPages = 1;

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
    this.loadStats();
  }

  loadReservations() {
    this.loading = true;
    this.reservationService.getReservations(this.apiPage).subscribe({
      next: (res) => {
        this.reservations = (res.donnees?.reservations || res.reservations || []).map((r: any) => ({
          ...r,
          saving: false
        }));
        this.apiTotalPages = res.pages || res.totalPages || 1;
        this.loading = false;
        this.showToast('✅ Réservations chargées avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.loading = false;
        this.showToast('❌ Erreur lors du chargement des réservations', 'error');
      }
    });
  }

  loadStats() {
    this.reservationService.getStats().subscribe({
      next: (res) => {
        this.stats = res.donnees || res;
        if (this.stats && this.stats.totalReservations > 0) {
          this.stats.moyenneParReservation = this.stats.chiffreAffaire / this.stats.totalReservations;
        }
      },
      error: (err) => {
        console.error('Erreur stats:', err);
        this.showToast('❌ Erreur lors du chargement des statistiques', 'error');
      }
    });
  }

  // Mettre à jour le statut d'une réservation
  updateReservationStatus(reservationId: string, newStatus: string) {
    const reservation = this.reservations.find(r => r._id === reservationId);
    if (!reservation) {
      this.showToast('❌ Réservation non trouvée', 'error');
      return;
    }

    const oldStatus = reservation.statut;
    
    // Vérifier si le statut a vraiment changé
    if (oldStatus === newStatus) {
      return;
    }

    reservation.saving = true;

    this.reservationService.updateReservation(reservationId, { statut: newStatus }).subscribe({
      next: (res) => {
        reservation.saving = false;
        reservation.statut = newStatus;
        
        this.showStatusUpdateMessage(reservation.referenceReservation, newStatus);
        this.loadStats(); // Recharger les statistiques
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
        reservation.saving = false;
        reservation.statut = oldStatus; // Revenir à l'ancien statut
        
        let errorMessage = 'Erreur lors de la mise à jour du statut';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 404) {
          errorMessage = 'Réservation non trouvée sur le serveur';
        } else if (err.status === 400) {
          errorMessage = 'Données de mise à jour invalides';
        }
        
        this.showErrorMessage(errorMessage);
      }
    });
  }

  // Supprimer une réservation
  deleteReservation(id: string) {
    if (!id) {
      this.showToast('❌ ID de réservation invalide', 'error');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      const reservation = this.reservations.find(r => r._id === id);
      if (reservation) {
        reservation.saving = true;
      }

      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          this.showToast('🗑️ Réservation supprimée avec succès', 'success');
          this.loadReservations(); // Recharger la liste
          this.loadStats(); // Recharger les statistiques
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          if (reservation) {
            reservation.saving = false;
          }
          
          let errorMessage = 'Erreur lors de la suppression';
          if (err.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 404) {
            errorMessage = 'Réservation non trouvée';
          }
          
          this.showToast(`❌ ${errorMessage}`, 'error');
        }
      });
    }
  }

  // Éditer une réservation
  editReservation(id: string) {
    if (!id) {
      this.showToast('❌ ID de réservation invalide', 'error');
      return;
    }

    // Charger les détails de la réservation
    this.reservationService.getReservation(id).subscribe({
      next: (reservation) => {
        console.log('Réservation à modifier:', reservation);
        this.openEditModal(reservation);
      },
      error: (err) => {
        console.error('Erreur chargement réservation:', err);
        this.showToast('❌ Erreur lors du chargement de la réservation', 'error');
      }
    });
  }

  // Ouvrir un modal d'édition
  openEditModal(reservation: any) {
    // Implémentez votre logique de modal ici
    const message = `
      Édition de la réservation: ${reservation.referenceReservation}
      Départ: ${reservation.depart}
      Destination: ${reservation.destinationId?.nom}
      Passagers: ${reservation.passagers?.length || 0}
      Prix: ${reservation.prixTotal} FCFA
    `;
    alert(message);
  }

  // Afficher un message de confirmation
  showStatusUpdateMessage(reference: string, status: string) {
    const statusMessages: { [key: string]: string } = {
      'en_attente': 'mise en attente',
      'confirmée': 'confirmée',
      'annulée': 'annulée'
    };
    
    const message = `✅ Réservation ${reference} ${statusMessages[status] || 'mise à jour'} avec succès`;
    this.showToast(message, 'success');
  }

  // Afficher un message d'erreur
  showErrorMessage(message: string) {
    this.showToast(`❌ ${message}`, 'error');
  }

  // Système de notification toast avec type 'warning' inclus
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    // Créer un élément toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    // Styles selon le type
    const styles = {
      success: 'background: #28a745;',
      error: 'background: #dc3545;',
      info: 'background: #17a2b8;',
      warning: 'background: #ffc107; color: #000;'
    };
    toast.style.cssText += styles[type];

    // Ajouter les animations CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Ajouter au DOM
    document.body.appendChild(toast);

    // Supprimer après 3 secondes
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      }, 300);
    }, 3000);
  }

  // Filtrage et pagination
  get filteredReservations() {
    let filtered = this.reservations;
    
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.referenceReservation?.toLowerCase().includes(searchLower) ||
        r.destinationId?.nom?.toLowerCase().includes(searchLower) ||
        r.depart?.toLowerCase().includes(searchLower) ||
        r.vol?.destination?.toLowerCase().includes(searchLower) ||
        r.passagers?.some((p: any) => 
          p.prenom?.toLowerCase().includes(searchLower) || 
          p.nom?.toLowerCase().includes(searchLower) ||
          `${p.prenom} ${p.nom}`.toLowerCase().includes(searchLower)
        ) ||
        this.getStatusText(r.statut).toLowerCase().includes(searchLower)
      );
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReservations.length / this.itemsPerPage);
  }

  // Méthodes utilitaires pour la pagination
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredReservations.length);
  }

  // Navigation des pages
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextApiPage() {
    if (this.apiPage < this.apiTotalPages) {
      this.apiPage++;
      this.loadReservations();
    }
  }

  previousApiPage() {
    if (this.apiPage > 1) {
      this.apiPage--;
      this.loadReservations();
    }
  }

  // Gestion des statuts
  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmée': 'confirmed',
      'en_attente': 'pending', 
      'annulée': 'cancelled'
    };
    return statusMap[statut] || 'pending';
  }

  getStatusText(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmée': 'Confirmée',
      'en_attente': 'En attente',
      'annulée': 'Annulée'
    };
    return statusMap[statut] || statut;
  }

  // Voir les détails d'une réservation
  viewReservation(id: string) {
    if (!id) {
      this.showToast('❌ ID de réservation invalide', 'error');
      return;
    }
    
    this.reservationService.getReservation(id).subscribe({
      next: (reservation) => {
        const message = `
          Détails de la réservation:
          Référence: ${reservation.referenceReservation}
          Départ: ${reservation.depart}
          Destination: ${reservation.destinationId?.nom}
          Passagers: ${reservation.passagers?.length || 0}
          Prix Total: ${reservation.prixTotal} FCFA
          Statut: ${this.getStatusText(reservation.statut)}
          Date: ${new Date(reservation.createdAt).toLocaleDateString('fr-FR')}
        `;
        alert(message);
      },
      error: (err) => {
        console.error('Erreur chargement détails:', err);
        this.showToast('❌ Erreur lors du chargement des détails', 'error');
      }
    });
  }

  // Réinitialiser la recherche
  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
  }

  // Exporter les données
  exportToCSV() {
    if (this.reservations.length === 0) {
      this.showToast('❌ Aucune donnée à exporter', 'warning');
      return;
    }

    const headers = ['Référence', 'Départ', 'Destination', 'Passagers', 'Noms des Passagers', 'Prix Total', 'Date', 'Statut'];
    
    const csvData = this.reservations.map(r => [
      `"${r.referenceReservation}"`,
      `"${r.depart}"`,
      `"${r.destinationId?.nom || r.vol?.destination || 'N/A'}"`,
      r.passagers?.length || 0,
      `"${r.passagers?.map((p: any) => `${p.prenom} ${p.nom}`).join('; ') || 'Aucun'}"`,
      r.prixTotal,
      `"${new Date(r.createdAt).toLocaleDateString('fr-FR')}"`,
      `"${this.getStatusText(r.statut)}"`
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    this.showToast('📊 Données exportées en CSV avec succès', 'success');
  }
}