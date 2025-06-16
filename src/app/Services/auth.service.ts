import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras, Router } from '@angular/router';
import * as _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

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
isLoggedIn(): boolean {
  return !!localStorage.getItem('userToken'); // or whatever you use to track authentication
}

  logOut() {
    // sessionStorage.clear();
        localStorage.removeItem('userInfo'); 
         localStorage.removeItem('appointmentInfo'); 
       
    localStorage.removeItem('userToken'); // Remove token
    localStorage.removeItem('userData');  // Remove any stored data
    this.router.navigate(['/login']); // Redirect to login page
  }
  getUserInfo() {
    return JSON.parse(localStorage.getItem("userInfo"));
  }
  // setUserInfo(userInfo: any) {
  //   localStorage.setItem("userInfo", JSON.stringify(userInfo));
  // }
  setUserInfo(userInfo: any) {
    localStorage.setItem("userInfo", userInfo);
  }
  setAppointmentInfo(obj :any){
    localStorage.setItem("appointmentInfo",JSON.stringify(obj));
  }
  getAppointmentInfo(){
    return JSON.parse(localStorage.getItem("appointmentInfo"));
  }
  validateUserCreds(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/auth/signin`, { "email": email, "password": password });
  }
  
  otpVerification(obj) {
      return this.http.post(`${environment.apiUrl}/auth/otp-verification`, { "userId": obj.userId, "Otp": obj.otp });
    }

    resendOtp(userId) {
       return this.http.post(`${environment.apiUrl}/auth/resend-otp-verification`, { "userId": userId });
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

  sendResetLink(email, accountType) {
    return this.http.post(`${environment.apiUrl}/auth/otp-forgot-password`, { email: email, accountType: accountType  });
  }

  otpVerificationForForgotPassword(obj: any) {
    return this.http.post(`${environment.apiUrl}/auth/verification-forgot-password`, obj);
  }

  signWithGoogle(token : any){
    return this.http.post(`${environment.apiUrl}/auth/google-signin`, token);
  }

  checkEmail(obj){
    return this.http.post(`${environment.apiUrl}/users/check-email`, obj);
  }

  getTopDoctors(date,time){
    return this.http.get(`${environment.apiUrl}/provider/top-provider?Date=${date}&Time=${time}` );
  }

  postBlogcomment(obj: any) {
    return this.http.post(`${environment.apiUrl}/blog/create-post-comment`, obj)
  }

  getBlogcommentId(blogPostId: number) {   
    return this.http.get(`${environment.apiUrl}/blog/get-blog-by-id?Id=${blogPostId}`);
  }


  serviceFilter(serviceCategories:any,pageNumber: number, pageSize: number = 10){  
       const requestBody = {
      ...serviceCategories,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };
    return this.http.post(`${environment.apiUrl}/patient/provider-by-filter-services`,requestBody );
  }
  private serviceSource = new BehaviorSubject<any>(this.getServiceFromStorage());
  selectedService = this.serviceSource.asObservable(); // Observable to subscribe in the child

  serviceForDefault(){
    return this.http.post(`${environment.apiUrl}/patient/provider-by-filter-services`,{} );
  }
  getServicesById(id:any){
    return this.http.get(`${environment.apiUrl}/specialty/service-by-id?serviceId=${id}`);
  }
  updateService(service: any) {
    this.serviceSource.next(service); // Update observable
    localStorage.setItem('selectedService', JSON.stringify(service)); // Store in localStorage
  }

  private getServiceFromStorage(): any {
    const storedService = localStorage.getItem('selectedService');
    return storedService ? JSON.parse(storedService) : null;
  }
  getServices(){
    return this.http.get(`${environment.apiUrl}/specialty/specialty-count` );
  }

  postJoinOurCommunity(obj: any) {
    return this.http.post(`${environment.apiUrl}/adminportal/join-our-community`, obj);
  }
  getMedication(medicinName:any){
    return this.http.get(`${environment.apiUrl}/address/medication-search?name=${medicinName}` );
  }

  postContactUs(obj: any) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-contact-us`, obj);
  }
}





