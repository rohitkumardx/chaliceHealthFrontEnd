import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {



  private tokenKey = 'your_token_key';
  paymentamount: any;
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }


  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.clear();
  }
  constructor(private http: HttpClient, private router: Router) {

  }

  Token(): Observable<any> {
    const userInfo = this.getUserInfo();
    return this.http.post(`${environment.apiUrl}/auth/token`, {
      "userId": userInfo.userId,
      "hash": userInfo.hash,
      "Role": userInfo.Role
    });
  }

  logOut() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
  getUserInfo() {
    return JSON.parse(localStorage.getItem("userInfo"));
  }
  setUserInfo(userInfo: any) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }
  validateUserCreds(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/auth/signin`, { "email": email, "password": password });
  }

  otpVerification(otpCode: any) {
    let userInfo = this.getUserInfo()
    return this.http.post(`${environment.apiUrl}/auth/otp-verification`, { "userId": userInfo.userId, "otp": otpCode });
  }

  resendOtp() {
    let userInfo = this.getUserInfo()
    return this.http.post(`${environment.apiUrl}/auth/resend-otp-verification`, { "userId": userInfo.userId });
  }
  forgotPassword(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { "email": email });
  }
  passwordReset(obj: any) {
    return this.http.put(`${environment.apiUrl}/auth/reset-password`, obj);
  }
  postUser(obj: any) {
    return this.http.post(`${environment.apiUrl}/users/add-update-user`, obj);
  }

  sendResetLink(email) {
    return this.http.post(`${environment.apiUrl}/auth/otp-forgot-password`, { "email": email });
  }
  otpVerificationForForgotPassword(obj: any) {
    return this.http.post(`${environment.apiUrl}/auth/verification-forgot-password`, obj);
  }
  signWithGoogle(token : any){
    return this.http.post(`${environment.apiUrl}/auth/google-signin`, token);
  }


}





