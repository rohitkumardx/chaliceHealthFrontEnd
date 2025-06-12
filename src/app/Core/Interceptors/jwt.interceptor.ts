// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
// import { Observable, catchError, throwError } from 'rxjs';
// import { AuthService } from 'src/app/Services/auth.service';
// import * as _ from 'lodash';
// import { Router } from '@angular/router';


// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {

//   constructor(private authService: AuthService,private router: Router) { }

//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const userInfo = this.authService;
//     if (_.get(userInfo,'invitationHash')) {
//       request = request.clone({
//         headers: new HttpHeaders({
//           'Access-Control-Allow-Origin':'*',
//           'Access-Control-Allow-Headers': 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization',
//           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
//           'Api-Version': 'test-version',
//           'x-company':1
//         })
//       });
//     } else if(_.get(userInfo,'token')) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Bearer ${_.get(userInfo,'token')}`,
//         },
//         headers: new HttpHeaders({
//           'Access-Control-Allow-Origin':'*',
//           'Access-Control-Allow-Headers': 'X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization',
//           'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
//           'Api-Version': 'test-version',
//           'x-company':1
//         })
//       });
//     }
//     return next.handle(request).pipe(
//       catchError((error: HttpErrorResponse) => {
//         if (error.status === 401) {
//           // this.authService.logOut();
//           this.router.navigate(['/login']);
//         }

//         return throwError(error);
//       })
//     );
//   }
// }
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  
    const excludedRoutes = ['/home-page']; // Add more if needed
    const isExcluded = excludedRoutes.some(route => request.url.includes(route));

    if (!isExcluded) {
      const token = this.authService.getToken();
      if (token) {
         
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Api-Version': 'test-version',
            'x-company': '1',
          },
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isExcluded) {
          this.authService.logOut();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
