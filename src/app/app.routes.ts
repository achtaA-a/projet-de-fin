import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

// Pages utilisateur
import { DashboardComponent } from './dashboard/dashboard';
import { ReservationComponent } from './reservation/reservation.component';
import { ListDestina } from './list-destina/list-destina';
import { Creatdestina } from './creatdestina/creatdestina';

// Layout Admin
import { Admin } from './admin/admin';

export const routes: Routes = [

  // SECTION UTILISATEUR
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'reservation', component: ReservationComponent },
      { path: 'destinations', component: ListDestina },
      { path: 'creer', component: Creatdestina },
    ],
  },

  // SECTION ADMIN
  {
    path: 'admin',
    component: Admin, // Layout admin
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'destinations', component: ListDestina },
      { path: 'creer-destination', component: Creatdestina },

      // Redirection par défaut
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ROUTE INCONNUE
  { path: '**', redirectTo: '' }
];
