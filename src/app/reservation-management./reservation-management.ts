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
        this.reservations = (res.donnees?.reservations || []).map((r: any) => ({
          ...r,
          saving: false // Ajouter l'état de sauvegarde
        }));
        this.apiTotalPages = res.pages || 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.reservationService.getStats().subscribe({
      next: (res) => {
        this.stats = res.donnees;
        if (this.stats && this.stats.totalReservations > 0) {
          this.stats.moyenneParReservation = this.stats.chiffreAffaire / this.stats.totalReservations;
        }
      },
      error: (err) => console.error('Erreur stats:', err)
    });
  }

  // Mettre à jour le statut d'une réservation
  updateReservationStatus(reservationId: string, newStatus: string) {
    const reservation = this.reservations.find(r => r._id === reservationId);
    if (!reservation) return;

    const oldStatus = reservation.statut;
    reservation.saving = true;

    this.reservationService.updateReservation(reservationId, { statut: newStatus }).subscribe({
      next: (res) => {
        reservation.saving = false;
        reservation.statut = newStatus;
        
        // Afficher un message de confirmation
        this.showStatusUpdateMessage(reservation.referenceReservation, newStatus);
        
        // Recharger les statistiques
        this.loadStats();
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
        reservation.saving = false;
        reservation.statut = oldStatus; // Revenir à l'ancien statut
        
        // Afficher un message d'erreur
        this.showErrorMessage('Erreur lors de la mise à jour du statut');
      }
    });
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

  // Système de notification toast
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
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
    `;

    // Styles selon le type
    const styles = {
      success: 'background: #28a745;',
      error: 'background: #dc3545;',
      info: 'background: #17a2b8;'
    };
    toast.style.cssText += styles[type];

    // Ajouter au DOM
    document.body.appendChild(toast);

    // Supprimer après 3 secondes
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
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
        // Recherche par statut
        this.getStatusText(r.statut).toLowerCase().includes(searchLower)
      );
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReservations.length / this.itemsPerPage);
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

  // Méthodes d'action
  viewReservation(id: string) {
    console.log('Voir réservation:', id);
    alert(`Voir les détails de la réservation ${id}`);
  }

  editReservation(id: string) {
    console.log('Modifier réservation:', id);
    alert(`Modifier la réservation ${id}`);
  }

  deleteReservation(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      this.reservationService.deleteReservation(id).subscribe({
        next: () => {
          this.showToast('🗑️ Réservation supprimée avec succès', 'success');
          this.loadReservations();
          this.loadStats();
        },
        error: (err) => {
          console.error('Erreur suppression:', err);
          this.showToast('❌ Erreur lors de la suppression de la réservation', 'error');
        }
      });
    }
  }

  // Réinitialiser la recherche
  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
  }

  // Exporter les données
  exportToCSV() {
    const headers = ['Référence', 'Départ', 'Destination', 'Passagers', 'Noms des Passagers', 'Prix Total', 'Date', 'Statut'];
    
    const csvData = this.reservations.map(r => [
      r.referenceReservation,
      r.depart,
      r.destinationId?.nom,
      r.passagers?.length,
      r.passagers?.map((p: any) => `${p.prenom} ${p.nom}`).join('; ') || 'Aucun',
      r.prixTotal,
      new Date(r.createdAt).toLocaleDateString('fr-FR'),
      this.getStatusText(r.statut)
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.showToast('📊 Données exportées en CSV', 'success');
  }
}