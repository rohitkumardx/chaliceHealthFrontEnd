import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderComponent } from './provider.component';
import { dashboard } from './dashboard/doctor-profile.component';
import { CalendarViewComponent } from './calendar-view/calendar-view.component';
import { ProviderAppointmentListComponent } from './provider-appointment-list/provider-appointment-list.component';
import { AuthGuard } from 'src/app/Core/Auth/auth.guard';
import { AddPrescriptionComponent } from './add-prescription/add-prescription.component';
import { MessageComponent } from './message/message.component';
import { MessageListComponent } from './message-list/message-list.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { ProviderDocumentsComponent } from './provider-documents/provider-documents.component';
import { DocumentComponent } from './document/document.component';
import { ClinicProviderListComponent } from './clinic-provider-list/clinic-provider-list.component';
import { SettingsComponent } from './settings/settings.component';
import { NotificationListComponent } from './notification-list/notification-list.component';
import { FacilityProfileSetupComponent } from './facility-profile-setup/facility-profile-setup.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { ClinicDashboardComponent } from './clinic-dashboard/clinic-dashboard.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { FacilityMessageListComponent } from './facility-message-list/facility-message-list.component';
import { GroupMessageComponent } from './group-message/group-message.component';
import { FacilityRolePermissionComponent } from './facility-role-permission/facility-role-permission.component';
import { FacilityAddUserComponent } from './facility-add-user/facility-add-user.component';
import { FacilityUserListComponent } from './facility-user-list/facility-user-list.component';

const routes: Routes = [{
  path:'',component:ProviderComponent,
  children:[
    {path:'dashboard',component:dashboard, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'calendar',component:CalendarViewComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'appointment-list',component:ProviderAppointmentListComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'add-prescription',component:AddPrescriptionComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']}},
    {path:'message',component:MessageComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'group-message',component:GroupMessageComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'message-list',component:MessageListComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'patient-list',component:PatientListComponent,canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'document',component:DocumentComponent,canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']} },
    {path:'clinic-provider-list',component:ClinicProviderListComponent,canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices'] } },
    {path:'settings',component:SettingsComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'notifications',component:NotificationListComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'facility-profile-setup',component:FacilityProfileSetupComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'complaints',component:ComplaintsComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'clinic-dashboard',component:ClinicDashboardComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'facility-message-list',component:FacilityMessageListComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'my-profile',component:MyProfileComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'role-permission',component:FacilityRolePermissionComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'add-user',component:FacilityAddUserComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },
    {path:'user-list',component:FacilityUserListComponent, canActivate: [AuthGuard], data: { role: ['Facility','PrivatePractices','IndependentProvider']  } },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
