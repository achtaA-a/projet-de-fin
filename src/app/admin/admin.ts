// admin.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  badge: string | null;
  permission?: string;
}

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  change?: number;
  route?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    FormsModule
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit, OnDestroy {
  sidebarOpen = true;
  currentUser: any = null;
  stats: StatCard[] = [];
  recentActivities: any[] = [];
  isLoading = false;

  menuItems: MenuItem[] = [
    { 
      path: '/admin/dashboard', 
      icon: '📊', 
      label: 'Dashboard', 
      badge: null,
      permission: 'view_dashboard'
    },
    { 
      path: '/admin/vols', 
      icon: '✈️', 
      label: 'Gestion des Vols', 
      badge: null,
      permission: 'manage_flights'
    },
    { 
      path: '/admin/reservations', 
      icon: '📋', 
      label: 'Réservations', 
      badge: '12',
      permission: 'manage_reservations'
    },
    { 
      path: '/admin/destinations', 
      icon: '📍', 
      label: 'Destinations', 
      badge: null,
      permission: 'manage_destinations'
    },
    { 
      path: '/admin/utilisateurs', 
      icon: '👥', 
      label: 'Utilisateurs', 
      badge: '3',
      permission: 'manage_users'
    },
    { 
      path: '/admin/statistiques', 
      icon: '📈', 
      label: 'Statistiques', 
      badge: null,
      permission: 'view_stats'
    },
    { 
      path: '/admin/parametres', 
      icon: '⚙️', 
      label: 'Paramètres', 
      badge: null,
      permission: 'manage_settings'
    }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadDashboardStats();
    this.loadRecentActivities();
  }

  loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  loadDashboardStats() {
    this.isLoading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement stats:', error);
        this.isLoading = false;
      }
    });
  }

  loadRecentActivities() {
    this.adminService.getRecentActivities().subscribe({
      next: (activities) => {
        this.recentActivities = activities;
      },
      error: (error) => {
        console.error('Erreur chargement activités:', error);
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.adminService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur déconnexion:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    });
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions?.includes(permission) || false;
  }

  ngOnDestroy() {
    // Nettoyage si nécessaire
  }
}