import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard';
import { ChoixVolComponent } from './choix-vol/choix-vol';
import { InfoVoyageurComponent } from './info-voyageur/info-voyageur';
import { PaiementComponent } from './paiement/paiement';
import { ConfirmationComponent } from './confirmation/confirmation';
import { ReservationComponent } from './reservation/reservation.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'reservation', component: ReservationComponent },
      { path: 'choix-vol', component: ChoixVolComponent },
      { path: 'info-voyageur', component: InfoVoyageurComponent },
      { path: 'paiement', component: PaiementComponent },
      { path: 'confirmation', component: ConfirmationComponent },
    ]
  }
];
