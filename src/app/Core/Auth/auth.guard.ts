import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
      debugger
        const userInfo = this.authService.getUserInfo();
        const requiredRole = route.data['role']; // Get required role from route data

        if (userInfo && userInfo.accountType == requiredRole) {
            return true; // Allow access if user has the correct role
        } else {
            this.router.navigate(['/home-page']); // Redirect to login if role doesn't match
            return false;
        }
    }
}
