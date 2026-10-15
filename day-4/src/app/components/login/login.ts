import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  onLogin(): void {
    this.authService.login();
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }
}
