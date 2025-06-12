import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from '@angular/material/icon';
import { ProviderslistComponent } from './providerslist/providerslist.component';
import { FacilityListComponent } from './facility-list/facility-list.component';
import { TransactionHistoryComponent } from './transaction-history/transaction-history.component';
import { NgChartsModule } from 'ng2-charts';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { ShowDetailsPopupComponent } from './show-details-popup/show-details-popup.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { ServiceComponent } from './service/service.component';
import { SettingsComponent } from './settings/settings.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { RoleManagementComponent } from './role-management/role-management.component';
import { RolePermissionPopupComponent } from './role-permission-popup/role-permission-popup.component';
import { UserListComponent } from './user-list/user-list.component';
import { MessageComponent } from './message/message.component';
import { ClinicProfileComponent } from './clinic-profile/clinic-profile.component';
import { ViewReportComponent } from './view-report/view-report.component';
import { DocumentsComponent } from './documents/documents.component';
import { ProviderReportViewComponent } from './provider-report-view/provider-report-view.component';
import { RefundListComponent } from './refund-list/refund-list.component';
import { AcceptRejectRefundComponent } from './accept-reject-refund/accept-reject-refund.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ViewNotificationComponent } from './view-notification/view-notification.component';
import { ComplaintListComponent } from './complaint-list/complaint-list.component';
import { ViewComplaintComponent } from './view-complaint/view-complaint.component';
import { ProviderProfileComponent } from './provider-profile/provider-profile.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ReportedMessagesListComponent } from './reported-messages-list/reported-messages-list.component';
import { AppointmentsViewComponent } from './appointments-view/appointments-view.component';
import { AppointmentRefundConfirmationComponent } from './appointment-refund-confirmation/appointment-refund-confirmation.component';
import { ProviderAppointmentsViewComponent } from './provider-appointments-view/provider-appointments-view.component';
import { LoginLogsComponent } from './login-logs/login-logs.component';
import { AddBlogComponent } from './add-blog/add-blog.component';
import { ClinicProvidersListComponent } from './clinic-providers-list/clinic-providers-list.component';
import { ConditionsSymptomsComponent } from './conditions-symptoms/conditions-symptoms.component';

@NgModule({
  declarations: [
    AdminComponent,
    ProviderslistComponent,
    FacilityListComponent,
    TransactionHistoryComponent,
    AdminDashboardComponent,
    PatientListComponent,
    ShowDetailsPopupComponent,
    AnnouncementComponent,
    ServiceComponent,
    SettingsComponent,
    UserManagementComponent,
    RoleManagementComponent,
    RolePermissionPopupComponent,
    UserListComponent,
    MessageComponent,
    ClinicProfileComponent,
    ViewReportComponent,
    DocumentsComponent,
    ProviderReportViewComponent,
    RefundListComponent,
    AcceptRejectRefundComponent,
    NotificationsComponent,
    ViewNotificationComponent,
    ComplaintListComponent,
    ViewComplaintComponent,
    ProviderProfileComponent,
    ReportedMessagesListComponent,
    AppointmentsViewComponent,
    AppointmentRefundConfirmationComponent,
    ProviderAppointmentsViewComponent,
    LoginLogsComponent,
    AddBlogComponent,
    ClinicProvidersListComponent,
    ConditionsSymptomsComponent
  ],
   providers: [DatePipe],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
    NgChartsModule,
    MatTabsModule,
    
   
  ]
})
export class AdminModule {
}
