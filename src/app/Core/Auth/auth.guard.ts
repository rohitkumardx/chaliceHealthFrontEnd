import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const userInfo = this.authService.getUserInfo();
        const requiredRole = route.data['role']; 

        if (userInfo && requiredRole.includes(userInfo.accountType) ) {
            return true; 
        } else {
            this.router.navigate(['/home-page']); // Redirect to login if role doesn't match
            return false;
        }
    }
}
