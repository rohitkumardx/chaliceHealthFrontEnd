import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  userInfo: any
  private notificationCount = new Subject<{ notificationCount: string }>();
  public notificationCount$ = this.notificationCount.asObservable();

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {

  }

  getLanguages() {
    return this.http.get(`${environment.apiUrl}/language/language-list`)
  }

  getClientIp(): Observable<any> {
    const accessKey = 'af2c2871b02ccfa168f9745cf0b3ea11';  // Replace this with the key you got from the dashboard
    return this.http.get(`http://api.ipstack.com/check?access_key=${accessKey}`);
  }

  postProviderGeneralInfo(obj) {
    return this.http.post(`${environment.apiUrl}/provider/add-update-doctor-general-information`, obj)
  }

  postContactDetails(obj: any) {
    return this.http.post(`${environment.apiUrl}/provider/add-update-contact-detail`, obj);
  }

  getQualifications() {
    return this.http.get(`${environment.apiUrl}/qualification/qualification-list`)
  }

  getSpeciality() {
    return this.http.get(`${environment.apiUrl}/specialty/specialty-dropdown-list`)
  }

  getProvdierProfileData(userId: any) {
    return this.http.get(`${environment.apiUrl}/provider/doctor-general-information?userId=${userId}`)
  }

  getCredetialCompletedSteps(userId: any) {
    return this.http.get(`${environment.apiUrl}/provider/credentialstatussteps?userId=${userId}`)
  }

  getContactDetailsById(id: any) {
    return this.http.get(`${environment.apiUrl}/provider/doctor-contact?userId=${id}`)
  }

  postServiceAndPriceData(obj: any, id: any) {
    return this.http.post(`${environment.apiUrl}/provider/specialty-service?userId=${id}`, obj)
  }

  getServiceAndPriceData() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/doctor-general-information?userId=${userInfo.userId}`)
  }

  deleteProfilePicture(userId: any) {
    return this.http.delete(`${environment.apiUrl}/provider/delete-provider-profile?userId=${userId}`)
  }

  getSpecialSpeciality() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/specialty/specialty-service`)
  }

  getServiceDataById(id: any) {
    return this.http.get(`${environment.apiUrl}/provider/specialty-service-list?userId=${id}`)
  }

  postMedicalLicenseInfo(obj: any, id: any) {
    const userInfo = this.authService.getUserInfo()
    obj.userId = id
    return this.http.post(`${environment.apiUrl}/provider/add-update-qualification`, obj)
  }

  postDocuments(obj: any) {
    return this.http.post(`${environment.apiUrl}/provider/add-update-document`, obj);
  }

  getMedicalDataById(id: any) {
    return this.http.get(`${environment.apiUrl}/provider/provider-qualification?userId=${id}`)
  }

  getDocumentsList(id) {
    return this.http.get(`${environment.apiUrl}/provider/provider-document?userId=${id}`)
  }

  deleteDocument(id) {
    return this.http.delete(`${environment.apiUrl}/provider/provider-documents?id=${id}`)
  }

  PostAvailability(obj: any) {
    return this.http.post(`${environment.apiUrl}/provider/add-update-availability`, obj);
  }

  createGroup(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-update-provider-group`, obj);
  }

  addGroupMembers(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-update-provider-group-member`, obj);
  }

  getClinicDoctor(clinicId) {
    return this.http.get(`${environment.apiUrl}/adminportal/clinic-doctor-list?userId=${clinicId}`)
  }

  getClinicStaffList(clinicId) {
    return this.http.get(`${environment.apiUrl}/clinic/clinic-staff-list?ClinicId=${clinicId}`)
  }

  getWeekData(date: any, userId: any) {
    return this.http.get(`${environment.apiUrl}/provider/provider-availability-slot?userId=${userId}&date=${date}`)
  }

  getMonthlyData(date: any, userId: any) {
    return this.http.get(`${environment.apiUrl}/provider/monthly-provider-availability-slot?userId=${userId}&date=${date}`)
  }

  deleteAvailability(date: any) {
    const userInfo = this.authService.getUserInfo()
    return this.http.delete(`${environment.apiUrl}/provider/provider-availabilities?date=${date}&userId=${userInfo.userId}`)
  }

  getAppointmentDetails(obj: any, userId: any) {
    
    // return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment-userid?userId=${userId}`)

    return this.http.get(`${environment.apiUrl}/bookingappointment/booking-appointment?userId=${userId}&Date=${obj.date}&StartTime=${obj.startTime}`)
  }
  getProviderTodayAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any, CurrentDateTime: any) {
    const userInfo = this.authService.getUserInfo();
 
    const requestBody = {
      UserId: userInfo.userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
      Filter: searchTerm ? `PatientUniqueId.Contains("${searchTerm}")` : undefined,
      OrderBy: (sortColumn && sortOrder) ? `${sortColumn} ${sortOrder}` : undefined,
      CurrentDateTime: CurrentDateTime
    };
 
    return this.http.post(`${environment.apiUrl}/bookingappointment/today-booking-appointment`, requestBody);
  }
 
  // getProviderTodayAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
  //   const userInfo = this.authService.getUserInfo()

  //   let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  //   if (searchTerm) {
  //     query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
  //   }
  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }

  //   return this.http.get(`${environment.apiUrl}/bookingappointment/today-booking-appointment${query}`)
  // }
  getProviderUpcomingAppointmentList(
    searchTerm: string,
    pageNumber: number,
    pageSize: number = 10,
    sortColumn: any,
    sortOrder: any,
    CurrentDateTime: any
  ) {
    const userInfo = this.authService.getUserInfo();
 
    // Function to check if searchTerm is a valid date (either YYYY-MM-DD or DD-MM-YYYY)
    const isDate = (term: string) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(term) || /^\d{2}-\d{2}-\d{4}$/.test(term);
    };
 
    // Build the request body
    const requestBody = {
      UserId: userInfo.userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
      // Check if searchTerm is a valid date
      Filter: searchTerm ? `${searchTerm}` : undefined,
      OrderBy: (sortColumn && sortOrder) ? `${sortColumn} ${sortOrder}` : undefined,
      CurrentDateTime: CurrentDateTime
    };
 
    return this.http.post(`${environment.apiUrl}/bookingappointment/upcoming-booking-appointment`, requestBody);
  }
 
  // getProviderUpcomingAppointmentList(
  //   searchTerm: string,
  //   pageNumber: number,
  //   pageSize: number = 10,
  //   sortColumn: any,
  //   sortOrder: any
  // ) {
  //   const userInfo = this.authService.getUserInfo();
  //   let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

  //   // Function to check if searchTerm is a valid date
  //   const isDate = (term: string) => {
  //     return /^\d{4}-\d{2}-\d{2}$/.test(term) || /^\d{2}-\d{2}-\d{4}$/.test(term);
  //   };

  //   if (searchTerm) {
  //     if (isDate(searchTerm)) {

  //       query += `&filter=${searchTerm}`;
  //     } else {
  //       query += `&filter=${searchTerm}`;
  //     }
  //   }

  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }

  //   return this.http.get(`${environment.apiUrl}/bookingappointment/upcoming-booking-appointment${query}`);
  // }

  // getProviderPastAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
  //   const userInfo = this.authService.getUserInfo()
  //   let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
  //   if (searchTerm) {
  //     query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
  //   }
  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }
  //   return this.http.get(`${environment.apiUrl}/bookingappointment/past-booking-appointment${query}`)
  // }

  getProviderPastAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any, CurrentDateTime: any) {
    const userInfo = this.authService.getUserInfo();
 
    const requestBody = {
      UserId: userInfo.userId,
      PageNumber: pageNumber,
      PageSize: pageSize,
      Filter: searchTerm ? `PatientUniqueId.Contains("${searchTerm}")` : undefined,
      OrderBy: (sortColumn && sortOrder) ? `${sortColumn} ${sortOrder}` : undefined,
      CurrentDateTime: CurrentDateTime
    };
 
    return this.http.post(`${environment.apiUrl}/bookingappointment/past-booking-appointment`, requestBody);
  }
 

  postPrescription(obj) {
    return this.http.post(`${environment.apiUrl}/prescription/add-update-prescription`, obj)
  }

  getReportList() {
    return this.http.get(`${environment.apiUrl}/reportappointment/report-type-list`)
  }

  getBookingDetails(id: any) {
    return this.http.get(`${environment.apiUrl}/reportappointment/book-appointment-by-id?bookAppointmentId=${id}`)
  }

  submitReport(obj: any) {
    return this.http.post(`${environment.apiUrl}/reportappointment/add-report-appointment`, obj)
  }

  getProviderCancelledAppointmentList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
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

  getJoinDetails(bookingId: any) {
    return this.http.get(`${environment.apiUrl}/token/getagoratoken?bookingId=${bookingId}`)
  }

  sendMessage(obj: any) {
    const userInfo = this.authService.getUserInfo()
    obj.senderId = userInfo.userId
    return this.http.post(`${environment.apiUrl}/message/add-messages`, obj)
  }

  sendGroupMessage(obj: any) {
    const userInfo = this.authService.getUserInfo()
    obj.senderId = userInfo.userId
    return this.http.post(`${environment.apiUrl}/message/add-provider-messages`, obj)
  }

  getMessageList(receiverId: any) {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/message/messages?senderId=${userInfo.userId}&receiverId=${receiverId}`)
  }

  getGroupMessageList(ProviderGroupsId: any, userId) {
    return this.http.get(`${environment.apiUrl}/message/provider-group-messages?ProviderGroupsId=${ProviderGroupsId}&ReceiverId=${userId}`)
  }

  replyMessage(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/reply-messages`, obj)
  }

  replyGroupMessage(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/provider-reply-messages`, obj)
  }

  getProvidersForShareDocument() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/patientmanagedocument/provider-list?userId=${userInfo.userId}`)
  }

  addSoapNotes(obj: any) {
    return this.http.post(`${environment.apiUrl}/appointmentsoapnote/add-appointment`, obj)
  }

  getMessageCount() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/message/unread-message?userId=${userInfo.userId}`)
  }

  getMessageListByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo();
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (searchTerm) {
      query += `&filter=${searchTerm}`;
    }
    ;
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/message/message-list${query}`);
  }

  appointmentCancellationStatus(id: number, reason: any) {
    return this.http.put(`${environment.apiUrl}/bookingappointment/${id}/cancel-appointment`, reason);
  }

  endMeetAppointment(data: any) {
    return this.http.put(`${environment.apiUrl}/appointmentsoapnote/change-status`, data);
  }

  markMessagesUnread(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-messageread-unread`, obj)
  }

  markGroupMessagesUnread(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-provider-message-unread`, obj)
  }

  private messageUpdate = new Subject<void>();
  messageCountUpdate$ = this.messageUpdate.asObservable();

  notifyMessageUpdate() {
    this.messageUpdate.next();
  }

  getMessageReceiverData(userId: any) {
    return this.http.get(`${environment.apiUrl}/message/profile-by-accounttype?userId=${userId}`)
  }

  getPatientList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
      ;
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=patientUniqueId.Contains(\"${searchTerm}\") OR patientName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/provider/patient-list${query}`)
  }

  getNotificationList(searchTerm: string, pageNumber: number, pageSize: number,) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=PatientUniqueId.Contains(\"${searchTerm}\")`;
    }

    return this.http.get(`${environment.apiUrl}/notification/notification-list${query}`)
  }

  getFacilityProvidersDropdownList(facilityId: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/clinic-doctor-list?UserId=${facilityId}`)
  }

  markReadNotification(obj: any) {
    return this.http.post(`${environment.apiUrl}/notification/notification-read`, obj)
  }

  getNotificationCount(id: any) {
    return this.http.get(`${environment.apiUrl}/notification/unread-notification?userId=${id}`)
  }

  getSavedMessagesList(id: any) {
    return this.http.get(`${environment.apiUrl}/message/default-messages?UserId=${id}`)
  }
  
  createDefaultMessage(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-default-message`, obj)
  }

  copyCallLink(bookingId: any) {
    return this.http.get(`${environment.apiUrl}/clinic/call-url-by-id?appointmentId=${bookingId}`)
  }

  activateDefaultMessage(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-update-active-auto`, obj)
  }
  decodeAppointmentId(hash: any) {
    return this.http.get(`${environment.apiUrl}/clinic/call-url-by-hash?hash=${hash}`)
  }

  getActiveMessageByUserId(id: any) {
    return this.http.get(`${environment.apiUrl}/message/auto-reply?UserId=${id}`)
  }
  postPayoutDetails(obj: any) {
    return this.http.post(`${environment.apiUrl}/payoutdetail/add-update-payout-detail`, obj);
  }
  postClinicInfo(obj) {
    return this.http.post(`${environment.apiUrl}/clinic/add-update-clinic-profile`, obj)
  }

  getClinicInfo() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/clinic/clinic-profile-by-id?userId=${userInfo.userId}`)
  }

  getPayoutDetailByUserId() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/payoutdetail/patient-payout-by-userid?userId=${userInfo.userId}`)
  }

  getReportListByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo();
    ;
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=patientUniqueCode.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/payoutdetail/payout-detail-list${query}`)
  }

  getproviderAmountByUserId(type: any) {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/provider-patient-amount?userId=${userInfo.userId}&type=${type}`)
  }

  getRequestNotificationCount() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/notification/notification-count?UserId=${userInfo.userId}`)
  }

  getproviderConsentForm() {
    return this.http.get(`${environment.apiUrl}/adminportal/account-type-document-list`)
  }

  createAccountOnStripe(obj) {
    return this.http.post(`${environment.apiUrl}/payment-gateway/provider-connected-account`, obj);
  }

  createAccountOnStripeForCompany(userId) {
    return this.http.post(`${environment.apiUrl}/payment-gateway/company-connected-account/${userId}`, {});
  }

  postActivateStatus(obj) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-update-active-document`, obj);
  }

  getProviderActiveDocuments() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/adminportal/active-document-list?userId=${userInfo.userId}`)
  }

  getClinicAmountByUserId(type: any) {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/clinic/clinic-patient-amount?userId=${userInfo.userId}&type=${type}`)
  }

  getSettingListByUserId(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo();
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (searchTerm) {
      query += `&filter=patientUniqueCode.Contains(\"${searchTerm}\") OR providerName.Contains(\"${searchTerm}\")`;
    }

    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }

    return this.http.get(`${environment.apiUrl}/clinic/clinic-patient-detail${query}`);
  }

  getExpiredDocuments() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/document-expiry?userId=${userInfo.userId}`)
  }

  getClinicDashboardByUserId() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/clinicdashboard/total-patient-clinic-booking?userId=${userInfo.userId}`)
  }

  postConsentShare(obj) {
    return this.http.post(`${environment.apiUrl}/adminportal/share-document`, obj);
  }

  getNotificationByUserId() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/notification/notification-preference?UserId=${userInfo.userId}`)
  }

  postNotification(obj) {
    return this.http.post(`${environment.apiUrl}/notification/add-update-notification-preference`, obj);
  }

  getProviderProfileByUserId() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/provider/provider-profile?userId=${userInfo.userId}`)
  }

  postProviderProfile(obj) {
    return this.http.post(`${environment.apiUrl}/provider/add-update-provider-profile`, obj);
  }

  postComplaintMessageReason(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/add-message-complaint-by-patient-and-provider`, obj);
  }

  getMessageReportList() {
    return this.http.get(`${environment.apiUrl}/reportappointment/message-report-type-list`)
  }

  getMessageReadUnread(isRead: boolean) {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/message/read-unread-message?UserId=${userInfo.userId}&IsRead=${isRead}`)
  }

  // getGroupList() {
  //   const userInfo = this.authService.getUserInfo()
  //   return this.http.get(`${environment.apiUrl}/message/provider-group-name?userId=${userInfo.userId}`)
  // }

    getGroupList(searchTerm: string, pageNumber: number, pageSize: number = 10, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
 
    if (searchTerm) {
      query += `&filter=${searchTerm}`;
    }
    ;
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    };
 
    return this.http.get(`${environment.apiUrl}/message/provider-group-name${query}`);
  }
 

  getNewProviderRequest() {
    return this.http.get(`${environment.apiUrl}/provider/provider-profile-count`)
  }

  getAddressSearch(search: any) {
    return this.http.get(`${environment.apiUrl}/address/search?query=${search}`)
  }

  getSpecialitySearch(search: any) {
    return this.http.get(`${environment.apiUrl}/specialty/condition-name?ConditionName=${search}`)
  }

  getMessageForClinic(senderId: any, receiverId: any) {
    return this.http.get(`${environment.apiUrl}/message/messages?senderId=${senderId}&receiverId=${receiverId}`)
  }

  getPatientNotificationCount() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/reminder/notification-count-userid?userId=${userInfo.userId}`)
  }
 
  checkAppointmentExists(bookAppointmentId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${environment.apiUrl}/appointments/check-exists?id=${bookAppointmentId}`
    );
  }

  markAppointmentReminderNotificationAsRead(appointmentId: number) {
    const userInfo = this.authService.getUserInfo();
    const payload = {
      userId: userInfo.userId,
      appointmentId: appointmentId
    };
    return this.http.post(`${environment.apiUrl}/reminder/appointment-read`, payload);
  }

  getAppointmentReminderCount() {
    const userInfo = this.authService.getUserInfo();
    return this.http.get(`${environment.apiUrl}/reminder/notification-count-userid?userId=${userInfo.userId}`);
  }

  markMedicalReminderNotificationAsRead(appointmentId: number) {
    const userInfo = this.authService.getUserInfo();
    const payload = {
      userId: userInfo.userId,
      appointmentId: appointmentId
    }; // Use the passed ID
    return this.http.post(`${environment.apiUrl}/reminder/medication-read`, payload);
  }

  getMedicalReminderCount() {
    const userInfo = this.authService.getUserInfo();
    return this.http.get(`${environment.apiUrl}/reminder/notification-count-userid?userId=${userInfo.userId}`);
  }

  NotificationReminderUnread() {
    const userInfo = this.authService.getUserInfo();
    const payload = { userId: userInfo.userId };
    return this.http.post(`${environment.apiUrl}/reminder/appointment-read`, payload);
  }

  readMedicalNotification() {
    const userInfo = this.authService.getUserInfo();
    const payload = { userId: userInfo.userId };
    return this.http.post(`${environment.apiUrl}/reminder/medication-read`, payload);
  }

  markBlogNotificationAsRead(blogPostId) {
    const userInfo = this.authService.getUserInfo();
    const payload = {
      userId: userInfo.userId,
      blogPostId: blogPostId
    };
    return this.http.post(`${environment.apiUrl}/blog/add-messageread-unread`, payload);
  }

  getBlogNotificationCount() {
    const userInfo = this.authService.getUserInfo();
    return this.http.get(`${environment.apiUrl}/blog/notification-count?userId=${userInfo.userId}`);
  }



}
