import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  getClinicProvidersList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/clinic/provider-list${query}`)
  }

  deleteClinicProvider(id:any){
    return this.http.delete(`${environment.apiUrl}/adminportal/delete-provider?userId=${id}`)
  }

  deleteClinicProfilePicture(userId: any) {
    // const userInfo = this.authService.getUserInfo()
    return this.http.delete(`${environment.apiUrl}/clinic/delete-clinic-profile?userId=${userId}`)
  }
  
  updateClinicProfileStatus(id: any, isVerified: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/${id}/verify-status`, isVerified)
  }

}
