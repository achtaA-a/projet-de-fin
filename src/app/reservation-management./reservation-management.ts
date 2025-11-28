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
  apiPage: number = 1;
  apiTotalPages: number = 1;
  apiTotalResults: number = 0;

  // CORRECTION: Stocker les statuts originaux pour annulation en cas d'erreur
  private originalStatuses: Map<string, string> = new Map();

  // Variables pour le modal de modification
  showEditModal: boolean = false;
  editReservationData: any = {};
  destinations: any[] = [];
  saving: boolean = false;

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
    this.loadStats();
    this.loadDestinations();
  }

  loadReservations() {
    this.loading = true;
    this.reservationService.getReservations(this.apiPage, this.itemsPerPage).subscribe({
      next: (res) => {
        if (res.statut === 'succes') {
          this.reservations = (res.donnees?.reservations || []).map((r: any) => ({
            ...r,
            saving: false,
            // CORRECTION: Normaliser les statuts avec accents vers sans accents
            statut: this.normalizeStatus(r.statut) || 'en_attente'
          }));
          
          // CORRECTION: Sauvegarder les statuts originaux
          this.saveOriginalStatuses();
          
          // CORRECTION: Utiliser les données de pagination du backend
          if (res.donnees?.pagination) {
            this.apiTotalPages = res.donnees.pagination.pages;
            this.apiTotalResults = res.donnees.pagination.total;
          } else {
            // Fallback si pas de pagination
            this.apiTotalPages = res.pages || 1;
            this.apiTotalResults = res.total || 0;
          }
        } else {
          this.reservations = [];
        }
        this.loading = false;
        this.showToast('✅ Réservations chargées avec succès', 'success');
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.reservations = [];
        this.loading = false;
        this.showToast('❌ Erreur lors du chargement des réservations', 'error');
      }
    });
  }

  // CORRECTION: Normaliser les statuts pour gérer les anciennes données
  private normalizeStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmée': 'confirmee',
      'annulée': 'annulee',
      'en_attente': 'en_attente',
      'confirmee': 'confirmee',
      'annulee': 'annulee'
    };
    return statusMap[status] || status || 'en_attente';
  }

  // CORRECTION: Sauvegarder les statuts originaux
  private saveOriginalStatuses() {
    this.originalStatuses.clear();
    this.reservations.forEach(reservation => {
      if (reservation._id) {
        this.originalStatuses.set(reservation._id, reservation.statut);
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

  // Charger les destinations pour le formulaire de modification
  loadDestinations() {
    this.reservationService.getDestinations().subscribe({
      next: (res) => {
        this.destinations = res.donnees?.destinations || res.destinations || [];
      },
      error: (err) => {
        console.error('Erreur chargement destinations:', err);
        this.showToast('❌ Erreur lors du chargement des destinations', 'error');
      }
    });
  }

  // CORRECTION: Méthodes de pagination améliorées
  get filteredReservations(): any[] {
    if (!this.searchTerm) return this.reservations;
  
    const searchLower = this.searchTerm.toLowerCase();
    return this.reservations.filter(r =>
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
  
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredReservations.length / this.itemsPerPage));
  }
  
  get paginatedReservations(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReservations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getStartIndex(): number {
    if (this.filteredReservations.length === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredReservations.length);
  }

  // CORRECTION: Navigation entre pages côté client
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

  // CORRECTION: Navigation entre pages côté API
  nextApiPage() {
    if (this.apiPage < this.apiTotalPages) {
      this.apiPage++;
      this.currentPage = 1; // Reset à la première page côté client
      this.loadReservations();
    }
  }

  previousApiPage() {
    if (this.apiPage > 1) {
      this.apiPage--;
      this.currentPage = 1; // Reset à la première page côté client
      this.loadReservations();
    }
  }

  // CORRECTION: Changement du nombre d'éléments par page
  onItemsPerPageChange() {
    this.apiPage = 1;
    this.currentPage = 1;
    this.loadReservations();
  }

  // CORRECTION: Mettre à jour le statut d'une réservation avec gestion d'état améliorée
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

    // CORRECTION: Sauvegarder l'ancien statut pour annulation en cas d'erreur
    if (!this.originalStatuses.has(reservationId)) {
      this.originalStatuses.set(reservationId, oldStatus);
    }

    reservation.saving = true;

    this.reservationService.updateReservation(reservationId, { statut: newStatus }).subscribe({
      next: (res) => {
        reservation.saving = false;
        reservation.statut = newStatus;
        
        // CORRECTION: Mettre à jour le statut original après succès
        this.originalStatuses.set(reservationId, newStatus);
        
        // CORRECTION: Recharger la liste complète pour s'assurer la cohérence
        setTimeout(() => {
          this.loadReservations();
        }, 500);
        
        this.showStatusUpdateMessage(reservation.referenceReservation, newStatus);
        this.loadStats(); // Recharger les statistiques
      },
      error: (err) => {
        console.error('Erreur mise à jour statut:', err);
        reservation.saving = false;
        
        // CORRECTION: Revenir au statut original sauvegardé au lieu de l'ancien statut immédiat
        const originalStatus = this.originalStatuses.get(reservationId);
        if (originalStatus) {
          reservation.statut = originalStatus;
        } else {
          reservation.statut = oldStatus;
        }
        
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

  // Éditer une réservation - ouvrir le modal de modification
  editReservation(id: string) {
    if (!id) {
      this.showToast('❌ ID de réservation invalide', 'error');
      return;
    }

    // Charger les détails de la réservation
    this.reservationService.getReservation(id).subscribe({
      next: (reservation) => {
        console.log('Réservation à modifier:', reservation);
        this.openEditModal(reservation.donnees?.reservation || reservation);
      },
      error: (err) => {
        console.error('Erreur chargement réservation:', err);
        this.showToast('❌ Erreur lors du chargement de la réservation', 'error');
      }
    });
  }

  // Ouvrir le modal d'édition avec les données de la réservation
  openEditModal(reservation: any) {
    this.editReservationData = {
      _id: reservation._id,
      depart: reservation.depart,
      destinationId: reservation.destinationId?._id || reservation.destinationId,
      vol: {
        ...reservation.vol,
        dateDepart: this.formatDateTimeLocal(reservation.vol?.dateDepart),
        dateRetour: this.formatDateTimeLocal(reservation.vol?.dateRetour)
      },
      passagers: reservation.passagers || [],
      prixTotal: reservation.prixTotal,
      statut: this.normalizeStatus(reservation.statut)
    };
    
    this.showEditModal = true;
  }

  // Fermer le modal d'édition
  closeEditModal() {
    this.showEditModal = false;
    this.editReservationData = {};
    this.saving = false;
  }

  // Sauvegarder les modifications de la réservation
  saveReservation() {
    if (!this.editReservationData._id) {
      this.showToast('❌ ID de réservation manquant', 'error');
      return;
    }

    this.saving = true;

    // Préparer les données pour l'API
    const updateData = {
      depart: this.editReservationData.depart,
      destinationId: this.editReservationData.destinationId,
      vol: {
        ...this.editReservationData.vol,
        dateDepart: this.editReservationData.vol.dateDepart ? new Date(this.editReservationData.vol.dateDepart).toISOString() : undefined,
        dateRetour: this.editReservationData.vol.dateRetour ? new Date(this.editReservationData.vol.dateRetour).toISOString() : undefined
      },
      passagers: this.editReservationData.passagers,
      prixTotal: this.editReservationData.prixTotal,
      statut: this.editReservationData.statut
    };

    this.reservationService.updateReservation(this.editReservationData._id, updateData).subscribe({
      next: (res) => {
        this.saving = false;
        this.closeEditModal();
        this.showToast('✅ Réservation modifiée avec succès', 'success');
        this.loadReservations(); // Recharger la liste
        this.loadStats(); // Recharger les statistiques
      },
      error: (err) => {
        this.saving = false;
        console.error('Erreur modification réservation:', err);
        
        let errorMessage = 'Erreur lors de la modification';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 404) {
          errorMessage = 'Réservation non trouvée';
        } else if (err.status === 400) {
          errorMessage = 'Données invalides';
        }
        
        this.showToast(`❌ ${errorMessage}`, 'error');
      }
    });
  }

  // Utilitaire pour formater la date pour le input datetime-local
  private formatDateTimeLocal(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  // CORRECTION: Afficher un message de confirmation amélioré
  showStatusUpdateMessage(reference: string, status: string) {
    const statusMessages: { [key: string]: string } = {
      'en_attente': 'laissée en attente',
      'confirmee': 'confirmée',
      'annulee': 'annulée'
    };
    
    const message = `✅ Réservation ${reference} ${statusMessages[status] || 'mise à jour'} avec succès`;
    this.showToast(message, 'success');
  }

  // Afficher un message d'erreur
  showErrorMessage(message: string) {
    this.showToast(`❌ ${message}`, 'error');
  }

  // Système de notification toast
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    // Implémentation du toast...
    console.log(`${type}: ${message}`);
    // Votre implémentation toast existante
  }

  // CORRECTION: Gestion des statuts améliorée
  getStatusClass(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmee': 'confirmed',
      'en_attente': 'pending', 
      'annulee': 'cancelled'
    };
    return statusMap[statut] || 'pending'; // CORRECTION: "pending" par défaut
  }

  getStatusText(statut: string): string {
    const statusMap: { [key: string]: string } = {
      'confirmee': 'Confirmée',
      'en_attente': 'En attente',
      'annulee': 'Annulée'
    };
    return statusMap[statut] || 'En attente'; // CORRECTION: "En attente" par défaut
  }

  // Réinitialiser la recherche
  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
  }

  // Navigation vers une page spécifique
  goToPage(page: number | string) {
    if (typeof page !== 'number') return;
    
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
    // this.currentPage = page;
  }
  

  // Générer les numéros de page à afficher
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si peu de pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher les premières pages, pages autour de la page actuelle, et dernières pages
      pages.push(1);
      
      if (this.currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(this.totalPages);
    }
    
    return pages;
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