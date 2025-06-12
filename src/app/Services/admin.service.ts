import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  public notifyClose: EventEmitter<void> = new EventEmitter();

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  getDate() {
    const now = new Date();
    // alert(now);
    // More robust padding function
    const pad = (n: number) => String(n).padStart(2, '0');
    // Date components
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    // Time components
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const second = pad(now.getSeconds());
    // Timezone offset (fixed sign logic)
    const offsetMinutes = now.getTimezoneOffset();
    const offsetSign = offsetMinutes > 0 ? '-' : '+'; // Inverted because getTimezoneOffset() is UTC - local
    const absOffset = Math.abs(offsetMinutes);
    const offsetHours = pad(Math.floor(absOffset / 60));
    const offsetMins = pad(absOffset % 60);
    const result = (`${year}-${month}-${day}T${hour}:${minute}:${second}${offsetSign}${offsetHours}:${offsetMins}`);
    return (result);

  }

  getAllProviders(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/provider-list${query}`)
  }

  updateProfileStatus(obj: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/change-provider-status`, obj)
  }

  updateProviderStatus(obj: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/activate-deactivate-status`, obj)
  }


  getProviderRequest(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\") OR patientName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/provider/provider-profile-list${query}`)
  }

  updateProviderRequestStatus(userId: any,
    isVerified: any) {
    return this.http.put(`${environment.apiUrl}/provider/change-specialty-status?userId=${userId}&isVerified=${isVerified}`, {})
  }
  getAllFacilities(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=facilityManagerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/clinic-list${query}`)
  }

  getTransactionsHistory(type: any, searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?Type=${type}&PageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=facilityManagerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/transaction-detail${query}`)
  }
  getTransactionTotalCount(type: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/transaction-list?Type=${type}`)
  }

  getAmountData() {
    return this.http.get(`${environment.apiUrl}/admindashboard/amount-patient-booking`)
  }

  getAmountTotalCountData() {
    return this.http.get(`${environment.apiUrl}/admindashboard/total-booked-count`)
  }
  getPatientList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=${searchTerm}`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/patient-list${query}`)
  }

  getClinicProvidersList(userId: any, searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?UserId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/clinic/provider-list${query}`)
  }
  getClinicProviders(userId: any, searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?UserId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/clinic-provider-list${query}`)
  }


  getHistoryDetails(id: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/transaction-view-detail?Id=${id}`)
  }

  getPatientDashboardByPatientId(id: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/patient-view?userId=${id}`)
  }

  updatePatientStatus(obj: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/activate-deactivate-patient-status`, obj)
  }

  getAnnouncementList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=${searchTerm}`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/announcement/announcement-list${query}`)
  }


  getServiceList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`

    if (searchTerm) {
      query += `&filter=name.Contains(\"${searchTerm}\")`;

    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/specialty/specialty-service-list${query}`)
  }

  addUpdateService(obj: any) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-update-services`, obj)
  }
  addAnnouncement(obj: any) {
    return this.http.post(`${environment.apiUrl}/announcement/add-update-announcement`, obj)
  }

  addRoleManagement(data: any) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-update-role`, data)
  }
  getAnnouncementById(id: any) {
    return this.http.get(`${environment.apiUrl}/announcement/announcements/${id}`)
  }

  // getRoleList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
  //   let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
  //   if (searchTerm) {
  //     query += `&filter=roleName.Contains(\"${searchTerm}\")`;
  //   }
  //   if (sortColumn && sortOrder) {
  //     query += `&OrderBy=${sortColumn} ${sortOrder}`;
  //   }
  //   return this.http.get(`${environment.apiUrl}/adminportal/role-list${query}`)
  // }
  getRoleListDropdown() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/adminportal/role-list?RoleType=${userInfo.accountType}`)
  }

  getFacilityRoleListDropdown() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/clinic/clinic-role-list?ClinicId=${userInfo.userId}&RoleType=${userInfo.accountType}`)
  }

  // getRolePermissionList() {
  //   return this.http.get(`${environment.apiUrl}/adminportal/role-permission`)
  // }


  getRolePermissionByRoleId(roleId: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/${roleId}/permissions`)
  }
  postRolePermission(obj: any) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-update-role-permission`, obj)
  }

  getRoleById(roleId: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/${roleId}/role`)
  }
  deleteRole(id: any) {
    return this.http.delete(`${environment.apiUrl}/adminportal/${id}/delete-role`)
  }
  updateStatus(id: any, status: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/${id}/status`, status)
  }
  getUserList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=userName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/admin-user-list${query}`)
  }

  postAdminStaff(obj: any) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-update-admin-user`, obj)
  }
  getEditUserById(id: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/admin-user-details-by-id?id=${id}`)
  }

  updateUserStatus(id: any, status: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/admin-user-status?userId=${id}`, status)
  }

  addPlatformPercentage(obj) {
    return this.http.post(`${environment.apiUrl}/setting/add-update-setting`, obj)
  }
  getNotificationDetails(id: any) {
    return this.http.get(`${environment.apiUrl}/notification/notification-by-bookingid?BookingId=${id}`)
  }

  getClinicProfile(userId: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/admin-list-by-user-id?userId=${userId}`)
  }

  getReportAppointment(id: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/report-appointment?userId=${id}`)
  }

  sendAdminMessage(obj: any) {
    const userInfo = this.authService.getUserInfo()
    obj.senderId = userInfo.userId
    return this.http.post(`${environment.apiUrl}/adminmessage/add-admin-message`, obj)
  }

  replyAdminMessage(obj: any) {
    return this.http.post(`${environment.apiUrl}/adminmessage/admin-reply-messages`, obj)
  }

  getAdminMessageList(id: any) {
    return this.http.get(`${environment.apiUrl}/adminmessage/admin-message-list?ReceiverId=${id}`)
  }

  getAdminIdByUser() {
    return this.http.get(`${environment.apiUrl}/adminportal/adminid-by-user`)
  }

  postAdminDocumentInfo(obj) {
    return this.http.post(`${environment.apiUrl}/adminportal/add-update-admin-document`, obj)
  }

  getAdminDocumentList() {
    return this.http.get(`${environment.apiUrl}/adminportal/admin-document-list`)
  }

  getTransactionList(type: any) {
    return this.http.get(`${environment.apiUrl}/admindashboard/payment-amount-booking?Type=${type}`)
  }

  getAdminDashboardData(id, year) {
    return this.http.get(`${environment.apiUrl}/admindashboard/patient-appointments-by-month?userId=${id}&year=${year}`)
  }

  getClinicDasboardItems(year) {
    const userInfo = this.authService.getUserInfo()

    return this.http.get(`${environment.apiUrl}/clinicdashboard/appointment-by-month?userId=${userInfo.userId}&year=${year}`)
  }

  getFacilityList() {
    return this.http.get(`${environment.apiUrl}/admindashboard/facility-list`)
  }

  getFacilityUserList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?ClinicId=${userInfo.userId}&?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=userName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/clinic/clinic-staff-role-list${query}`)
  }

  getRefundAmount() {
    return this.http.get(`${environment.apiUrl}/admindashboard/refund-amount`)
  }

  updateClinicStatus(obj: any) {
    return this.http.put(`${environment.apiUrl}/adminportal/activate-deactivate-facility-status`, obj)
  }

  getRefundList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=patientName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/bookingappointment/get-appointment-refund-list${query}`)
  }

  getAdminDocumentByUserId() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/adminportal/admin-document-by-id?userId=${userInfo.userId}`)
  }

  getProviderReportAppointment(id: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/provider-report-appointment?userId=${id}`)
  }

  deleteAdminDocument(id: any) {
    return this.http.delete(`${environment.apiUrl}/adminportal/${id}/delete-admin-document`)
  }

  getNotificationsList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?UserId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=patientName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/notification/appointment-cancellation-notification${query}`)
  }

  readUnreadNotificationById(BookAppointmentId: any, NotificationId: any) {
    return this.http.get(`${environment.apiUrl}/notification/notification-read-for-appointment?BookAppointmentId=${BookAppointmentId}&NotificationId=${NotificationId}`)
  }

  getAdminSettings() {
    return this.http.get(`${environment.apiUrl}/setting/setting`)
  }

  // getAdminComplaintList(){
  //   return this.http.get(`${environment.apiUrl}/adminportal/patient-complaint-list`)
  // }


  getAdminComplaintList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\") OR patientName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/patient-complaint-list${query}`)
  }


  getComplaintMessageCount() {
    return this.http.get(`${environment.apiUrl}/patient/complaint-count`)
  }

  markReadComplaints(obj: any) {
    return this.http.post(`${environment.apiUrl}/patient/complaint-read`, obj)
  }

  getComplaintDetailsById(id: any) {
    return this.http.get(`${environment.apiUrl}/notification/notification-by-bookingid?BookingId=${id}`)
  }

  // complaintStatus(obj){
  //   return this.http.put(`${environment.apiUrl}/patient/change-status`, obj);
  // }
  updateStatusForRefund(obj: any) {
    return this.http.post(`${environment.apiUrl}/payment-gateway/provider-charge-deduct`, obj)
  }
  complaintStatus(obj: any) {
    return this.http.put(`${environment.apiUrl}/patient/change-status`, obj)
  }

  deleteAnnoucementData(id: any) {
    return this.http.delete(`${environment.apiUrl}/announcement/announcement?id=${id}`);
  }
  getProviderProfileData(id, date, time) {
    return this.http.get(`${environment.apiUrl}/adminportal/provider-detail-providerid?providerId=${id}&Date=${date}&Time=${time}`)
  }

  messageStatus(obj: any) {
    return this.http.put(`${environment.apiUrl}/message/change-message-status`, obj)
  }

  getMessageComplaintList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=providerName.Contains(\"${searchTerm}\") OR patientName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/message-complaint-list${query}`)
  }


  markReadReportedMessages(obj: any) {
    return this.http.post(`${environment.apiUrl}/message/message-complaint-read`, obj)
  }

  getReportedMessageCount() {
    return this.http.get(`${environment.apiUrl}/message/reported-message-count`)
  }

  getEditFacilityUserById(id: any) {
    return this.http.get(`${environment.apiUrl}/clinic/clinic-staff-role-by-id?userId=${id}`)
  }

  postFacilityStaff(obj: any) {
    return this.http.post(`${environment.apiUrl}/clinic/add-update-clinic-staff`, obj)
  }
  getRolePermissionList(type: any) {
    return this.http.get(`${environment.apiUrl}/adminportal/role-permission?RoleType=${type}`)
  }

  getRoleList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    // let query = `?RoleType=${userInfo.accountType}&ClinicId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    let query = `?RoleType=${userInfo.accountType}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=roleName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/adminportal/role-list${query}`)
  }

  getAppointmentListByUserId(userId) {
    return this.http.get(`${environment.apiUrl}/adminportal/book-appointment-list-by-user-id?userId=${userId}`)
  }

  updateFacilityUserStatus(id: any, status: any) {
    return this.http.put(`${environment.apiUrl}/clinic/change-clinic-staff-status?userId=${id}`, status)
  }

  getFacilityRoleList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    const userInfo = this.authService.getUserInfo()
    let query = `?RoleType=${userInfo.accountType}&ClinicId=${userInfo.userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

    // let query = `?RoleType=${userInfo.accountType}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=roleName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/clinic/clinic-role-list${query}`)
  }

  getProvidersAppointmentListByUserId(userId) {
    return this.http.get(`${environment.apiUrl}/adminportal/book-appointment-list-by-provider-id?userId=${userId}`)
  }

  getLoginLogs(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=name.Contains(\"${searchTerm}\")`;

    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/login-logs${query}`)
  }

  postblogAdd(obj: any) {
    return this.http.post(`${environment.apiUrl}/blog/create-blog-post`, obj)
  }

  getBlogContent() {
    return this.http.get(`${environment.apiUrl}/blog/get-blog-list`);
  }

  deleteServiceData(id: any) {
    return this.http.delete(`${environment.apiUrl}/adminportal/specialty-service?specialtyServiceId=${id}`);
  }

  getServiceById(id: any) {
    return this.http.get(`${environment.apiUrl}/specialty/specialty-service-by-id?specialtyServiceId=${id}`)
  }


  // Patient Notification
  getPatientReminderNotificationsList() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/reminder/appointment-notification?userId=${userInfo.userId}`);
  }
  getMedicalReminderNotificationsList() {
    const userInfo = this.authService.getUserInfo()
    return this.http.get(`${environment.apiUrl}/reminder/medication-notification?userId=${userInfo.userId}`);
  }

  getBlogReminderNotifications() {
    const userInfo = this.authService.getUserInfo();
    return this.http.get(`${environment.apiUrl}/blog/blog-by-userid?UserId=${userInfo.userId}`);
  }

  updateMedicalInfo(obj: any, id: any) {
    const userInfo = this.authService.getUserInfo()
    obj.userId = id
    return this.http.post(`${environment.apiUrl}/adminportal/update-qualification`, obj)
  }

  postCondition(obj: any) {
    return this.http.post(`${environment.apiUrl}/specialty/add-update-conditions`, obj)
  }

  getCondition(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=conditionName.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/specialty/conditions-with-specialities${query}`);

  }
  getCondtionById(Id: any) {
    return this.http.get(`${environment.apiUrl}/specialty/condition-by-id?Id=${Id}`);
  }

  deleteCondition(id: any) {
    return this.http.delete(`${environment.apiUrl}/specialty/delete-condition?id=${id}`)
  }




  getSpecializationData(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=name.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/specialty/specialty-list${query}`);
  }

  getServiceCategoriesData() {
    return this.http.get(`${environment.apiUrl}/specialty/service-category`);
  }

  getSpecialityEdit(Id) {
    return this.http.get(`${environment.apiUrl}/specialty/specialty-by-id?id=${Id}`);
  }

  specialityDelete(id) {
    return this.http.delete(`${environment.apiUrl}/specialty/delete-specialty?id=${id}`);
  }

  postSpecializationData(obj: any) {
    return this.http.post(`${environment.apiUrl}/specialty/add-update-specialty`, obj)
  }

  deleteAnnoucementDoc(id: any) {
    return this.http.delete(`${environment.apiUrl}/announcement/announcement-attachment?id=${id}`)
  }

  updateBlog(obj: any) {
    return this.http.put(`${environment.apiUrl}/blog/blog-by-blogid`, obj)
  }

  getBlogList(searchTerm: string, pageNumber: number, pageSize: number, sortColumn: any, sortOrder: any) {
    let query = `?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (searchTerm) {
      query += `&filter=title.Contains(\"${searchTerm}\")`;
    }
    if (sortColumn && sortOrder) {
      query += `&OrderBy=${sortColumn} ${sortOrder}`;
    }
    return this.http.get(`${environment.apiUrl}/blog/get-blog-list${query}`)
  }

  getBlogById(id: any) {
    return this.http.get(`${environment.apiUrl}/blog/get-blog-by-id?Id=${id}`)
  }

  deleteBlog(id: any) {
    return this.http.delete(`${environment.apiUrl}/blog/blog-by-blogid?id=${id}`)
  }
}

