import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { SettingsComponent } from './pages/settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/history.component').then((m) => m.HistoryComponent),
  },
  { path: '**', redirectTo: '' }
];
