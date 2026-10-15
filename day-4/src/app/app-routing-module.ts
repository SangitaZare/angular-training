import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Admin } from './components/admin/admin';
import { Login } from './components/login/login';
import { PageNotFound } from './components/page-not-found/page-not-found';
import { authGuard } from './guards/auth-guard';

const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },

  // Lazy loading: the students feature's code (StudentsModule and
  // everything it declares) is only downloaded the first time someone
  // navigates to /students, not as part of the initial app bundle.
  {
    path: 'students',
    loadChildren: () => import('./students/students-module').then((m) => m.StudentsModule),
  },

  // Route guard: authGuard runs before this route activates and redirects
  // to /login (unless already authenticated).
  { path: 'admin', component: Admin, canActivate: [authGuard] },

  { path: 'login', component: Login },

  // Wildcard: catches any URL that didn't match a route above.
  { path: '**', component: PageNotFound },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
