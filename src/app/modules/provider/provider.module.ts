import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProviderRoutingModule } from './provider-routing.module';
import { dashboard } from './dashboard/doctor-profile.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProviderProfileComponent } from './provider-profile/provider-profile.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ProviderMedicalLicenseInfoComponent } from './provider-medical-license-info/provider-medical-license-info.component';
import { ProviderServicesComponent } from './provider-services/provider-services.component';
import { ProviderDocumentsComponent } from './provider-documents/provider-documents.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { AddAvailabilityComponent } from './add-availability/add-availability.component';
import { ProviderAppointmentListComponent } from './provider-appointment-list/provider-appointment-list.component';
import {MatTabsModule} from '@angular/material/tabs';
import { AddPrescriptionComponent } from './add-prescription/add-prescription.component';
import { ReportAppointmentComponent } from './report-appointment/report-appointment.component';
import { MessageComponent } from './message/message.component';
import { MessageListComponent } from './message-list/message-list.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { DocumentComponent } from './document/document.component';
import { ClinicDashboardComponent } from './clinic-dashboard/clinic-dashboard.component';
import { ClinicProviderListComponent } from './clinic-provider-list/clinic-provider-list.component';
import { SettingsComponent } from './settings/settings.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationViewDetailPopupComponent } from './notification-view-detail-popup/notification-view-detail-popup.component';
import { FacilityProfileSetupComponent } from './facility-profile-setup/facility-profile-setup.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { NgChartsModule } from 'ng2-charts';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { FacilityMessageListComponent } from './facility-message-list/facility-message-list.component';
import { AssignChatComponent } from './assign-chat/assign-chat.component';
import { GroupMessageComponent } from './group-message/group-message.component';
import { FacilityRolePermissionComponent } from './facility-role-permission/facility-role-permission.component';
import { FacilityRolePermissionPopupComponent } from './facility-role-permission-popup/facility-role-permission-popup.component';
import { FacilityAddUserComponent } from './facility-add-user/facility-add-user.component';
import { FacilityUserListComponent } from './facility-user-list/facility-user-list.component';


@NgModule({
  declarations: [
    dashboard,
    ProviderProfileComponent,
    ContactDetailsComponent,
    ProviderMedicalLicenseInfoComponent,
    ProviderServicesComponent,
    ProviderDocumentsComponent,
    CalendarViewComponent,
    AddAvailabilityComponent,
    ProviderAppointmentListComponent,
    AddPrescriptionComponent,
    ReportAppointmentComponent,
    MessageComponent,
    MessageListComponent,
    PatientListComponent,
    DocumentComponent,
    ClinicDashboardComponent,
    ClinicProviderListComponent,
    SettingsComponent,
    NotificationListComponent,
    NotificationViewDetailPopupComponent,
    FacilityProfileSetupComponent,
    ComplaintsComponent,
    MyProfileComponent,
    GroupMessageComponent,
    FacilityMessageListComponent,
    AssignChatComponent,
    FacilityRolePermissionComponent,
    FacilityRolePermissionPopupComponent,
    FacilityAddUserComponent,
    FacilityUserListComponent
    
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, 
    SharedModule,
    ProviderRoutingModule,
    MatTabsModule,
    NgChartsModule
  ]
})
export class ProviderModule { }
