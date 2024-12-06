import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { NavigationExtras, Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient, private router: Router , private authService: AuthService ) { }
  getState(){
    return this.http.get(`${environment.apiUrl}/state/states-list`)
  }

  getLanguage(){
    return this.http.get(`${environment.apiUrl}/language/language-list`)
  }
  getEmergencyContactById(id){
    return this.http.get(`${environment.apiUrl}/patient/patient-emergency-contact?userId=${id}`)
  }
  getPatientInformationById(id){
    return this.http.get(`${environment.apiUrl}/patient/patient-information?userId=${id}`)
  }
  deleteFamilyMember(id){
    return this.http.delete(`${environment.apiUrl}/patient/patient-family-member?id=${id}`)
  }
  getFamilyMember(id){
    return this.http.get(`${environment.apiUrl}/patient/patient-family-member?userId=${id}`)
  }
  postPatientGeneralInformation(obj: any) {
    // let userInfo = this.authService.getUserInfo();
    return this.http.post(`${environment.apiUrl}/patient/add-update-patient-information`, obj);
  }
  postEmergencyContact(obj: any) {
    // let userInfo = this.authService.getUserInfo();
    return this.http.post(`${environment.apiUrl}/patient/add-update-emergency-information`, obj);
  }

  postFamilyMember(obj: any) {
    // let userInfo = this.authService.getUserInfo();
    return this.http.post(`${environment.apiUrl}/patient/add-update-patient-family-member`, obj);
  }
  getPatientUniqueCode(){
    return this.http.get(`${environment.apiUrl}/patient/unique-code`)
  }

  getFamilyUniqueCode(){
    return this.http.get(`${environment.apiUrl}/patient/family-unique-code`)
  }

  getEmergencyContactUniqueId(){
    return this.http.get(`${environment.apiUrl}/patient/emergency-unique-code`)
  }

  deletePatientProfle(id) {
    return this.http.delete(`${environment.apiUrl}/patient/delete-patient-profile?userId=${id}`);
  }
  postPatientDocument(obj: any) {
    return this.http.post(`${environment.apiUrl}/patientmanagedocument/add-update-patient-document`, obj);
  }

  getPatientDocumentsList(id){
    return this.http.get(`${environment.apiUrl}/patientmanagedocument/patient-document?userId=${id}`)
  }

  deletePatientDocument(id) {
    return this.http.delete(`${environment.apiUrl}/patientmanagedocument/patient-documents?id=${id}`);
  }

  postAllergyData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-allergy`, obj);
  }
  
  getPatientAllergyDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/allergy?userId=${id}`)
  }

  deletePatientAllergyData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/allergy`);
  }

  postVitalData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-vital-information`, obj);
  }

  getPatientVitalDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/patient-vital-information?userId=${id}`)
  }

  deletePatienVitalData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/vital-information`);
  }

  postSocialData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-social-history`, obj);
  }

  getPatientSocialDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/patient-social-history?userId=${id}`)
  }

  deletePatientSocialData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/social-history`);
  }

  postMedicalData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-medical-history`, obj);
  }
  getPatientMedicalHistoryDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/medical--history?userId=${id}`)
  }

  deletePatientMedicalHistoryData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/medical-history`);
  }

  postScreeningData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-patient-screening-test`, obj);
  }

  getPatientScreeningDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/patient-screening-test?userId=${id}`)
  }

  deletePatientScreeningData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/patient-screening-test`);
  }

  postImmunisationData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-patient-immunization`, obj);
  }

  getPatientImmunisationDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/patient-immunization?userId=${id}`)
  }

  deletePatientImmunisationData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/patient-immunization-test`);
  }
 
  postChronicConditionData(obj: any){
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-chronic-condition`, obj);
  }
  getChronicConditionDataList(id){
    return this.http.get(`${environment.apiUrl}/healthreports/patient-chronic-condition?userId=${id}`)
  }
  deleteChronicConditionData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/patient-chronic-condition`);
  }

  getProviderList(){
    return this.http.get(`${environment.apiUrl}/patient/all-provider-list`)
  }
  getProviderProfileList(id : any){
    return this.http.get(`${environment.apiUrl}/patient/provider-by-userid?userId=${id}`)
  }
  getFilteredProviderList(obj){
    return this.http.post(`${environment.apiUrl}/patient/provider-by-filter`,obj)

  }
  getAvailabilitySlot(id , startDate , endDate){
    return this.http.get(`${environment.apiUrl}/patient/provider-availability-slot?userId=${id}&startDate=${startDate}&endDate=${endDate}`)
  }
  postBookAppointment(obj : any){
    return this.http.post(`${environment.apiUrl}/bookingappointment/add-update-booking-appointment`, obj);
  }

  getBookAppointment(id , relationshipType){
    return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment-id?userId=${id}&relationshipType=${relationshipType}`);
  }

  getBookAppointmentByUserId(id ){
    return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment-userid?userId=${id}`);
  }
  allergyStatus(id : any , status){
    return this.http.put(`${environment.apiUrl}/healthreports/allergy-status?id=${id}`,{status});
  }

  vitalStatus(id : any , status){
    return this.http.put(`${environment.apiUrl}/healthreports/vital-status?id=${id}`,{status});
  }

  socialStatus(id : any , status){
    return this.http.put(`${environment.apiUrl}/healthreports/social-history-status?id=${id}`,{status});
  }

  immunizationStatus(id : any , status){
    return this.http.put(`${environment.apiUrl}/healthreports/immunization-status?id=${id}`,{status});
  }
  getServicePrice(providerId : any){
    return this.http.get(`${environment.apiUrl}/provider/service-prices?userId=${providerId}`);
  }
  paymentGateway(obj : any){
    return this.http.post(`${environment.apiUrl}/payment-gateway/create-checkout-session`, obj);
  }
  getPatientTodayAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    debugger
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/patient-today-booking-appointment${query}`)
  }

  getPatientUpcomingAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/patient-upcoming-appointment${query}`)
  }

  getPatientPastAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/patient-past-appointment${query}`)
  }
  postMedicationData(obj: any){
    return this.http.post(`${environment.apiUrl}/medication/add-medication`, obj);
  }
  getPatientCancelledAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/patient-cancel-appointment${query}`)
  }
  getSOAPNotesByAppointmentId(id : any){
    return this.http.get(`${environment.apiUrl}/appointmentsoapnote/get-appointment-by-bookingid?Id=${id}`)
  }
  getPrescriptionById(id : any){
    return this.http.get(`${environment.apiUrl}/prescription/get-prescription-by-bookingappointmentid?bookingAppointmentId=${id}`)
  }

  postRating(obj: any) {
    return this.http.post(`${environment.apiUrl}/reviewandrating/add-review-rating`, obj);
  }

  addSharedDocuments(obj : any){
    return this.http.post(`${environment.apiUrl}/patientmanagedocument/share-document`,obj)
  }
  getPrescriptionByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=medicationName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/prescription/get-prescription-by-userid?UserId=${userInfo.userId}`)
  }

  getCurrentMedicationByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=drugName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/medication/today-medication-list?userId=${userInfo.userId}`)
  }

  getPastMedicationByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10,sortColumn: any,sortOrder:any){
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=drugName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/medication/past-medication-list?userId=${userInfo.userId}`)
  }
  getPatientDashboardByBookingId(id){
    return this.http.get(`${environment.apiUrl}/patient/patient-profiles?bookAppointmentId=${id}`)
  }

  getPatientDashboardDocumentsByBookingId(id){
    return this.http.get(`${environment.apiUrl}/patientmanagedocument/patient-document-by-id?bookAppointmentId=${id}`)
  }
  getEthnicityList(){
    return this.http.get(`${environment.apiUrl}/patient/ethnicity-list`)
  }
  getSecondaryRaceList(){
    return this.http.get(`${environment.apiUrl}/patient/secondary-race-list`)
  }
  getRaceList(){
    return this.http.get(`${environment.apiUrl}/patient/race-list`)
  }
}

