import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {
userInfo : any
  constructor(private http: HttpClient, private router: Router , private authService: AuthService ) { 
   
  }

  getLanguages() {
    return this.http.get(`${environment.apiUrl}/language/language-list`)
  }
  postProviderGeneralInfo(obj){
    return this.http.post(`${environment.apiUrl}/provider/add-update-doctor-general-information`,obj)
  }
  postContactDetails(obj: any) {
    return this.http.post(`${environment.apiUrl}/provider/add-update-contact-detail`, obj);
  }
  getQualifications(){
    return this.http.get(`${environment.apiUrl}/qualification/qualification-list`)
  }
  getSpeciality(){
    return this.http.get(`${environment.apiUrl}/specialty/specialty-dropdown-list`)
  }
  getProvdierProfileData(userId : any){
    return this.http.get(`${environment.apiUrl}/provider/doctor-general-information?userId=${userId}`)
  }
  getCredetialCompletedSteps(userId : any){
    return this.http.get(`${environment.apiUrl}/provider/credentialstatussteps?userId=${userId}`)
  }
  getContactDetailsById(){
    const userInfo  = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/doctor-contact?userId=${userInfo.userId}`)
  }
  postServiceAndPriceData(obj : any){
    const userInfo = this.authService.getUserInfo()
    return this.http.post(`${environment.apiUrl}/provider/specialty-service?userId=${userInfo.userId}`,obj)
  }
  getServiceAndPriceData(){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/doctor-general-information?userId=${userInfo.userId}`)
  }
  deleteProfilePicture(){
    const userInfo = this.authService.getUserInfo()
    return this.http.delete(`${environment.apiUrl}/provider/delete-provider-profile?userId=${userInfo.userId}`)
  }
  getSpecialSpeciality(){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/specialty/specialty-service`)
  }
  getServiceDataById(){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/specialty-service-list?userId=${userInfo.userId}`)
  }
  postMedicalLicenseInfo(obj : any){
    const userInfo = this.authService.getUserInfo()
    obj.userId = userInfo.userId
    return this.http.post(`${environment.apiUrl}/provider/add-update-qualification`,obj)
  }
  postDocuments(obj: any){
    return this.http.post(`${environment.apiUrl}/provider/add-update-document`, obj);
  }
  getMedicalDataById(){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/provider-qualification?userId=${userInfo.userId}`)
  }
  getDocumentsList(id){   
    return this.http.get(`${environment.apiUrl}/provider/provider-document?userId=${id}`)
   }
   deleteDocument(id){
     return this.http.delete(`${environment.apiUrl}/provider/provider-documents?id=${id}`)
   }
   PostAvailability(obj: any){
    return this.http.post(`${environment.apiUrl}/provider/add-update-availability`, obj);
  }
  getWeekData(date : any){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/provider-availability-slot?userId=${userInfo.userId}&date=${date}`)
  }
  getMonthlyData(date : any){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/monthly-provider-availability-slot?userId=${userInfo.userId}&date=${date}`)
  }
  deleteAvailability(date : any){
    const userInfo = this.authService.getUserInfo()
    return this.http.delete(`${environment.apiUrl}/provider/provider-availabilities?date=${date}&userId=${userInfo.userId}`)
  }
  getAppointmentDetails(obj : any){
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment?userId=${userInfo.userId}&Date=${obj.date}&StartTime=${obj.startTime}`)
  }
 
  getProviderTodayAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    debugger
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
  
    return this.http.get(`${environment.apiUrl}/bookingappointment/today-booking-appointment${query}`)
  }
  
  getProviderUpcomingAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/upcoming-booking-appointment${query}`)
  }

  getProviderPastAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/past-booking-appointment${query}`)
  }

  postPrescription(obj){
    return this.http.post(`${environment.apiUrl}/prescription/add-update-prescription`,obj)
  }
  getReportList(){
    return this.http.get(`${environment.apiUrl}/reportappointment/report-type-list`)
  }
  getBookingDetails(id : any){
    return this.http.get(`${environment.apiUrl}/reportappointment/book-appointment-by-id?bookAppointmentId=${id}`) 
  }
  submitReport(obj : any){
    return this.http.post(`${environment.apiUrl}/reportappointment/add-report-appointment`,obj)
  }
  getProviderCancelledAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/cancel-booking-appointment${query}`)
  }
  getJoinDetails(bookingId : any){
    return this.http.get(`${environment.apiUrl}/token/getagoratoken?bookingId=${bookingId}`)
  }
  sendMessage(obj : any){
    const userInfo = this.authService.getUserInfo()
    obj.senderId = userInfo.userId
    return this.http.post(`${environment.apiUrl}/message/add-messages`,obj)
  }
  getMessageList(id : any){
    return this.http.get(`${environment.apiUrl}/message/messages?bookAppointmentId=${id}`)
  }
  replyMessage(obj : any){
    return this.http.post(`${environment.apiUrl}/message/reply-messages`,obj)
  }
  getProvidersForShareDocument(){
    const userInfo  = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/patientmanagedocument/provider-list?userId=${userInfo.userId}`)
  }
  addSoapNotes(obj : any){
    return this.http.post(`${environment.apiUrl}/appointmentsoapnote/add-appointment`,obj)
  }
  getMessageCount(){
    const userInfo  = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/message/unread-message?userId=${userInfo.userId}`)
  }
  getMessageListByUserId(){
    const userInfo  = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/message/message-list?userId=${userInfo.userId}`)
  }
  appointmentCancellationStatus(id: number, reason: any) {
    return this.http.put(`${environment.apiUrl}/bookingappointment/${id}/cancel-appointment`, reason);
  }
  endMeetAppointment(data : any){
    return this.http.put(`${environment.apiUrl}/appointmentsoapnote/change-status`, data);
  }
  markMessagesUnread(obj : any){
    return this.http.post(`${environment.apiUrl}/message/add-messageread-unread`,obj)
  }


  private messageUpdate = new Subject<void>();
  messageCountUpdate$ = this.messageUpdate.asObservable();

  notifyMessageUpdate() {
    this.messageUpdate.next();
  }

  getMessageReceiverData(bookingId : any){
    const userInfo  = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/message/profile-by-accounttype?bookingId=${bookingId}&accountType=${userInfo.accountType}`)
  }
}
