import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    
  path: ':id/dashboard',
  component: DashboardComponent

  }
];