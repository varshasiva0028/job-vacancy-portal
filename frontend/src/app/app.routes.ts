import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ApplyComponent } from './pages/apply/apply';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    
  path: ':dashboard',
  component: DashboardComponent

  },
  {
    path:':apply',
    component:ApplyComponent
  }
];