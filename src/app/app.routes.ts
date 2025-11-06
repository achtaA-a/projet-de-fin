import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard'; // Correction: .component
import { ReservationComponent } from './reservation/reservation.component';
import { ListDestina } from './list-destina/list-destina'; // Correction: nom et extension
import { Creatdestina } from './creatdestina/creatdestina'; // Correction: nom et extension
import { ReservationManagement } from './reservation-management./reservation-management'; // Correction: nom et extension
import { Admin } from './admin/admin'; // Correction: nom et extension



export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'reservation', component: ReservationComponent },
      { path: 'destinations', component: ListDestina }, // Correction: nom
      { path: 'creer', component: Creatdestina }, // Correction: nom
      { path: 'Liste', component: ReservationManagement }, // Doit maintenant fonctionner
      { path: 'admin', component: Admin }, // Doit maintenant fonctionner
    
    ],
  
  },
  // Route de fallback
  { path: '**', redirectTo: '' }
];