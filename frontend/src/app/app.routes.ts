import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ApplyComponent } from './pages/apply/apply';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { adminGuard } from './pages/admin/admin.guard';
import { AdminComponent } from './pages/admin/admin';
export const routes: Routes = [

  {
    path: '',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'apply',
    component: ApplyComponent,
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },

  {
    path: '**',
    redirectTo: ''
  },
  {
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard, adminGuard]
}

];