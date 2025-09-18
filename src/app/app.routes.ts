import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { ReservationComponent } from './reservation/reservation';
import { VoyageurComponent } from './voyageur/voyageur';
import { ChoixVolComponent } from './choix-vol/choix-vol';
import { Paiement } from './paiement/paiement';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'voyageur', component: VoyageurComponent },
  { path: 'choixVol', component: ChoixVolComponent },
  { path: 'paiement', component: Paiement },
];
