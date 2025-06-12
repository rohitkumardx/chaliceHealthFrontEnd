import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { NavigationExtras, Router } from '@angular/router';
import * as _ from 'lodash';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }
  getState() {
    return this.http.get(`${environment.apiUrl}/state/states-list`)
  }
  private apiUrl = 'https://geocode.search.hereapi.com/v1/geocode';
  private apiKey = 't58P7DlKUdXX1Wlcn1C9bRO7U9t1tC-Y3M2Q1T2m3Ac';
  getStateByCityAndCountry(city: string, countryCode: string): Observable<any> {
    const params = new HttpParams()
      .set('q', `${city},${countryCode}`)  // City and country code as query parameter
      .set('apiKey', this.apiKey);  // API key for authentication

    return this.http.get(this.apiUrl, { params });
  }
  getStateFromResponse(response: any): string | undefined {
    // Check if response is an array and find the state from the address object
    const state = response.find((location: any) => location.address?.state)?.address.state;

    // Return the state or undefined if no state is found
    return state;
  }

  getLanguage() {
    return this.http.get(`${environment.apiUrl}/language/language-list`)
  }
  getEmergencyContactById(id) {
    return this.http.get(`${environment.apiUrl}/patient/patient-emergency-contact?userId=${id}`)
  }
  getPatientInformationById(id) {
    return this.http.get(`${environment.apiUrl}/patient/patient-information?userId=${id}`)
  }
  deleteFamilyMember(id) {
    return this.http.delete(`${environment.apiUrl}/patient/patient-family-member?id=${id}`)
  }
  getFamilyMember(id) {
    return this.http.get(`${environment.apiUrl}/patient/patient-family-member?userId=${id}`)
  }
  postPatientGeneralInformation(obj: any) {
    return this.http.post(`${environment.apiUrl}/patient/add-update-patient-information`, obj);
  }
  postEmergencyContact(obj: any) {
    return this.http.post(`${environment.apiUrl}/patient/add-update-emergency-information`, obj);
  }

  postFamilyMember(obj: any) {
    return this.http.post(`${environment.apiUrl}/patient/add-update-patient-family-member`, obj);
  }
  getPatientUniqueCode() {
    return this.http.get(`${environment.apiUrl}/patient/unique-code`)
  }

  getFamilyUniqueCode() {
    return this.http.get(`${environment.apiUrl}/patient/family-unique-code`)
  }

  getEmergencyContactUniqueId() {
    return this.http.get(`${environment.apiUrl}/patient/emergency-unique-code`)
  }

  deletePatientProfle(id) {
    return this.http.delete(`${environment.apiUrl}/patient/delete-patient-profile?userId=${id}`);
  }
  postPatientDocument(obj: any) {
    return this.http.post(`${environment.apiUrl}/patientmanagedocument/add-update-patient-document`, obj);
  }

  getPatientDocumentsList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    debugger;
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`

       if (searchTerm) {
      query += `&filter=title.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/patientmanagedocument/patient-document${query}`)
  }

  deletePatientDocument(id) {
    return this.http.delete(`${environment.apiUrl}/patientmanagedocument/patient-documents?id=${id}`);
  }

  postAllergyData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-allergy`, obj);
  }

  getPatientAllergyDataList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
      const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=allergyType.Contains(\"${searchTerm}\")  OR allergen.Contains(\"${searchTerm}\") OR reaction.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/allergy${query}`)
  }

  deletePatientAllergyData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/allergy`);
  }

  postVitalData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-vital-information`, obj);
  }

  getPatientVitalDataList(searchTerm3: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
     const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm3) {
      query += `&filter=height.Contains(\"${searchTerm3}\")  OR weight.Contains(\"${searchTerm3}\") OR bloodPressure.Contains(\"${searchTerm3}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/patient-vital-information${query}`)
  }

  deletePatienVitalData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/vital-information`);
  }

  postSocialData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-social-history`, obj);
  }

  getPatientSocialDataList(searchTerm2: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
         const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm2) {
      query += `&filter=alcohol.Contains(\"${searchTerm2}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/patient-social-history${query}`)
  }

  deletePatientSocialData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/social-history`);
  }

  postMedicalData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-medical-history`, obj);
  }
  getPatientMedicalHistoryDataList(searchTerm4: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
         const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm4) {
      query += `&filter=conditionName.Contains(\"${searchTerm4}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/medical-history${query}`)
  }

  deletePatientMedicalHistoryData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/medical-history`);
  }

  postScreeningData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-patient-screening-test`, obj);
  }

  getPatientScreeningDataList(searchTerm5: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
         const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm5) {
      query += `&filter=screeningTest.Contains(\"${searchTerm5}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/patient-screening-test${query}`)
  }

  deletePatientScreeningData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/patient-screening-test`);
  }

  postImmunisationData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-patient-immunization`, obj);
  }

  getPatientImmunisationDataList(searchTerm1: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
         const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm1) {
            query += `&filter=vaccineName.Contains(\"${searchTerm1}\")`;
 
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/patient-immunization${query}`)
  }

  deletePatientImmunisationData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/patient-immunization-test`);
  }

  postChronicConditionData(obj: any) {
    return this.http.post(`${environment.apiUrl}/healthreports/add-update-chronic-condition`, obj);
  }

  getChronicConditionDataList(searchTerm6: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
         const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm6) {
      query += `&filter=conditionName.Contains(\"${searchTerm6}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/healthreports/patient-chronic-condition${query}`)
  }

  deleteChronicConditionData(id) {
    return this.http.delete(`${environment.apiUrl}/healthreports/${id}/patient-chronic-condition`);
  }

  getProviderList() {
    return this.http.get(`${environment.apiUrl}/patient/all-provider-list`)
  }

  getProviderProfileList(id: any) {
    return this.http.get(`${environment.apiUrl}/patient/provider-by-userid?userId=${id}`)
  }

  getFilteredProviderList(obj, pageNumber: number, pageSize: number = 1) {
    
    return this.http.post(`${environment.apiUrl}/patient/provider-by-filter?PageNumber=${pageNumber}&PageSize=${pageSize}`,obj)
  }

  getAvailabilitySlot(id,startDate,endDate,date,time) {
    return this.http.get(`${environment.apiUrl}/patient/provider-availability-slot?userId=${id}&startDate=${startDate}&endDate=${endDate}&CurrentDate=${date}&CurrentTime=${time}`)
  }

  postBookAppointment(obj: any) {
    return this.http.post(`${environment.apiUrl}/bookingappointment/add-update-booking-appointment`, obj);
  }

  getBookAppointment(id, relationshipType) {
    return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment-id?userId=${id}&relationshipType=${relationshipType}`);
  }

  getBookAppointmentByUserId(id) {
    return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment-userid?userId=${id}`);
  }

  allergyStatus(id: any, status) {
    return this.http.put(`${environment.apiUrl}/healthreports/allergy-status?id=${id}`, { status });
  }

  vitalStatus(id: any, status) {
    return this.http.put(`${environment.apiUrl}/healthreports/vital-status?id=${id}`, { status });
  }

  socialStatus(id: any, status) {
    return this.http.put(`${environment.apiUrl}/healthreports/social-history-status?id=${id}`, { status });
  }

  immunizationStatus(id: any, status) {
    return this.http.put(`${environment.apiUrl}/healthreports/immunization-status?id=${id}`, { status });
  }

  getServicePrice(providerId: any) {
    return this.http.get(`${environment.apiUrl}/provider/service-prices?userId=${providerId}`);
  }

  paymentGateway(obj: any) {
    return this.http.post(`${environment.apiUrl}/payment-gateway/create-checkout-session`, obj);
  }
  getPatientTodayAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any, CurrentDateTime: any) {
    const userInfo = this.authService.getUserInfo();
 
    const requestBody = {
      UserId: userInfo.userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
      Filter: searchTerm ? `providerName.Contains("${searchTerm}")` : undefined,
      OrderBy: (sortColumn && sortOrder) ? `${sortColumn} ${sortOrder}` : undefined,
      CurrentDateTime: CurrentDateTime
    };
 
    return this.http.post(`${environment.apiUrl}/bookingappointment/patient-today-booking-appointment`, requestBody);
  }
  // getPatientTodayAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
  //   const userInfo = this.authService.getUserInfo()

  //   let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  //   if (searchTerm) {
  //     query += `&filter=providerName.Contains(\"${searchTerm}\")`;
  //   }
  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }
  //   return this.http.get(`${environment.apiUrl}/bookingappointment/patient-today-booking-appointment${query}`)
  // }

  getPatientPastAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any, CurrentDateTime: any) {
    const userInfo = this.authService.getUserInfo();
 
    const requestBody = {
      UserId: userInfo.userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
      Filter: searchTerm ? `providerName.Contains("${searchTerm}")` : undefined,
      OrderBy: (sortColumn && sortOrder) ? `${sortColumn} ${sortOrder}` : undefined,
      CurrentDateTime: CurrentDateTime
    };
 
    return this.http.post(`${environment.apiUrl}/bookingappointment/patient-past-appointment`, requestBody);
  }

  // getPatientUpcomingAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
  //   const userInfo = this.authService.getUserInfo();
  //   ;
  //   let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  //   if (searchTerm) {
  //     query += `&filter=providerName.Contains(\"${searchTerm}\")`;
  //   }
  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }
  //   return this.http.get(`${environment.apiUrl}/bookingappointment/patient-upcoming-appointment${query}`)
  // }
  getPatientUpcomingAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any, CurrentDateTime: any) {
    const userInfo = this.authService.getUserInfo();
    const requestBody = {
      UserId: userInfo.userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
      Filter: searchTerm ? `providerName.Contains("${searchTerm}")` : undefined,
      OrderBy: (sortColumn && sortOrder) ? `${sortColumn} ${sortOrder}` : undefined,
      CurrentDateTime: CurrentDateTime
    };
 
    return this.http.post(`${environment.apiUrl}/bookingappointment/patient-upcoming-appointment`, requestBody);
  }
  // getPatientPastAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
  //   const userInfo = this.authService.getUserInfo()
  //   let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  //   if (searchTerm) {
  //     query += `&filter=providerName.Contains(\"${searchTerm}\")`;
  //   }
  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }
  //   return this.http.get(`${environment.apiUrl}/bookingappointment/patient-past-appointment${query}`)
  // }

  postMedicationData(obj: any) {
    return this.http.post(`${environment.apiUrl}/medication/add-medication`, obj);
  }

  getPatientCancelledAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
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

  getSOAPNotesByAppointmentId(id: any) {
    return this.http.get(`${environment.apiUrl}/appointmentsoapnote/get-appointment-by-bookingid?Id=${id}`)
  }

  getPrescriptionById(id: any) {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/prescription/get-prescription-by-bookingappointmentid?bookingAppointmentId=${id}&userId=${userInfo.userId}`)
  }

  postRating(obj: any) {
    return this.http.post(`${environment.apiUrl}/reviewandrating/add-review-rating`, obj);
  }

  addSharedDocuments(obj: any) {
    return this.http.post(`${environment.apiUrl}/patientmanagedocument/share-document`, obj)
  }

  getPrescriptionByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo();
    ;
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=medicationName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/prescription/get-prescription-by-userid${query}`)
  }

  getCurrentMedicationByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=drugName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/medication/today-medication-list${query}`)
  }

  getPastMedicationByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=drugName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/medication/past-medication-list${query}`)
  }

  getPatientDashboardByBookingId(id) {
    return this.http.get(`${environment.apiUrl}/patient/patient-profiles?bookAppointmentId=${id}`)
  }

  getPatientDashboardDocumentsByBookingId(id) {
    return this.http.get(`${environment.apiUrl}/patientmanagedocument/patient-document-by-id?bookAppointmentId=${id}`)
  }

  getEthnicityList() {
    return this.http.get(`${environment.apiUrl}/patient/ethnicity-list`)
  }

  getSecondaryRaceList() {
    return this.http.get(`${environment.apiUrl}/patient/secondary-race-list`)
  }

  getRaceList() {
    return this.http.get(`${environment.apiUrl}/patient/race-list`)
  }

  getOverallRating(providerId) {
    return this.http.get(`${environment.apiUrl}/reviewandrating/${providerId}`)
  }

  getDashboardData(id: any) {
    return this.http.get(`${environment.apiUrl}/patient/patient-dashboard?userId=${id}`)
  }

  getAnnouncementByUserId(id: any) {
    return this.http.get(`${environment.apiUrl}/announcement/announcement-by-userid?UserId=${id}`)
  }

  readAnnouncementByUserId(obj: any) {
    return this.http.post(`${environment.apiUrl}/announcement/announcement-read`, obj)
  }

  getRefundAppointmentDetails(id: any) {
    return this.http.get(`${environment.apiUrl}/bookingappointment/get-cancellation-appointment-by-admin?BookAppointmentId=${id}`)
  }

  acceptOrRejectRefund(obj: any) {
    return this.http.post(`${environment.apiUrl}/payment-gateway/refund-payment`, obj)
  }

  postReasonForCancellation(obj: { appointmentId: string, reason: string }) {
    const url = `${environment.apiUrl}/bookingappointment/approve-reject-appointment`;
    const params = new HttpParams()
      .set('BookAppointmentId', obj.appointmentId)
      .set('Reason', obj.reason);

    return this.http.post(url, null, { params });
  }

  getCancelAppointmentDetails(id: any) {
    return this.http.get(`${environment.apiUrl}/bookingappointment/get-cancel-appointment?BookAppointmentId=${id}`)
  }

  getBookAppointmentById(bookAppointmentId: any) {
    return this.http.get(`${environment.apiUrl}/patient/book-appointment-by-id?BookAppointmentId=${bookAppointmentId}`)
  }

  postComplaintReason(obj: { bookAppointmentId: any, reason: string }) {
    const url = `${environment.apiUrl}/patient/add-complaint-by-patient`;

    const postData = {
      BookAppointmentId: obj.bookAppointmentId,
      Reason: obj.reason
    };

    return this.http.post(url, postData);
  }

  getComplaintListByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/patient/patient-complaint-list${query}`)
  }

  getPatientSettingByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/patient/patient-payment-history${query}`)
  }


  deleteComplaintData(complaintId: any) {
    return this.http.delete(`${environment.apiUrl}/patient/delete-patient-complaint?complaintId=${complaintId}`);
  }

  getComplaintById(bookAppointmentId: any) {
    return this.http.get(`${environment.apiUrl}/patient/patient-complaint-by-id?bookAppointmentId=${bookAppointmentId}`)
  }

  getPatientHash(hash) {
    return this.http.get(`${environment.apiUrl}/adminportal/document-by-hash?hash=${hash}`)
  }

  // getPatientDocument(bookingId){
  //   return this.http.get(`${environment.apiUrl}/adminportal/get-consent-document?BookingId=${bookingId}`)
  // }

  getPatientDocument(bookingId, type) {
    return this.http.get(`${environment.apiUrl}/adminportal/share-consent?BookingId=${bookingId}&DocumentType=${type}`)
  }

  postPatientShareDocument(obj) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-document-response`, obj)
  }

  getFinaADoctor(requestBody: any) {
    return this.http.post<any[]>(`${environment.apiUrl}/patient/provider-by-filter`, requestBody);
  }

  getProviderProfileData(userId,date,time) {
    return this.http.get(`${environment.apiUrl}/adminportal/provider-detail-providerid?providerId=${userId}&Date=${date}&Time=${time}`)
  }

  rescheduleAppointment(obj: any) {
    return this.http.post(`${environment.apiUrl}/bookingappointment/reschedule-booking-appointment`, obj);
  }

  followUpWithDoctorByPatient() {
    const patientId = this.authService.getUserInfo();
    console.log(patientId);
    return this.http.post(`${environment.apiUrl}/patient/get-follow-up-providers?patientId=${patientId.userId}`, {})
  }

  // getReviewAndRatingByPatientId(){
  //   const userInfo = this.authService.getUserInfo()
  //   return this.http.get(`${environment.apiUrl}/reviewandrating/review-rating-by-patientid?PatientId=${userInfo.userId}`)
  // }

  getReviewAndRatingByPatientId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?PatientId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&Filter=${searchTerm}`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/reviewandrating/review-rating-by-patientid${query}`)
  }

  UpdateReviewAndRating(obj) {
    return this.http.post(`${environment.apiUrl}/reviewandrating/update-review-rating`, obj)
  }


  addToGoogleCalender(obj) {
    return this.http.post(`${environment.apiUrl}/google-calendar/start-authentication`,obj) 
   }

  getNotificationMedicalShopList() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/bookingappointment/patient-today-booking-appointment?UserId=${userInfo.userId}`)
  }

  getReviewAndRatingById(id) {
    // const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/reviewandrating/review-rating-by-id?id=${id}`)
  }

}

