import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginForm } from './components/login-form/login-form';
import { Dashboard } from './components/dashboard/dashboard';
import { AdminPanel } from './components/admin-panel/admin-panel';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { guestGuard } from './auth/guest.guard';

const routes: Routes = [
  { path: 'login', component: LoginForm, canActivate: [guestGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  {
    path: 'admin',
    component: AdminPanel,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
