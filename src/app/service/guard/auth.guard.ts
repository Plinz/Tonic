import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { GoogleAuthService } from './../google-auth-service/google-auth-service';
import { NavController } from '@ionic/angular';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: GoogleAuthService, private router: NavController) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    if(!this.auth.user) {
      this.router.navigateRoot('');
      return false;
    }
    return true;
  }
}