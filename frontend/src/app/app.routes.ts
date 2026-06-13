import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { ApplyComponent } from './pages/apply/apply';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { adminGuard } from './pages/admin/admin.guard';
import { AdminComponent } from './pages/admin/admin';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard';
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
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
  path: 'user-dashboard',
  component: UserDashboardComponent,
  canActivate: [authGuard]
},

  {
    path: '**',
    redirectTo: ''
  }

];