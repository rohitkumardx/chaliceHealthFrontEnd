import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientComponent } from './patient.component';
import { PatientInformationComponent } from './patient-information/patient-information.component';
import { PatientDocumentsComponent } from './patient-documents/patient-documents.component';
import { PatientHealthRecordsComponent } from './patient-health-records/patient-health-records.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { BookAppointmentsComponent } from './book-appointments/book-appointments.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { AuthGuard } from 'src/app/Core/Auth/auth.guard';
import { PatientPrescriptionComponent } from './patient-prescription/patient-prescription.component';
import { PatientAppointmentListComponent } from './patient-appointment-list/patient-appointment-list.component';
import { MessageComponent } from '../patient/message/message.component';
import { MessageListComponent } from './message-list/message-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { SettingsComponent } from './settings/settings.component';
import { GroupMessageComponent } from './group-message/group-message.component';
import { ProviderDetailComponent } from './provider-detail/provider-detail.component';
import { PatientFaqsComponent } from './patient-faqs/patient-faqs.component';
import { SupportComponent } from './support/support.component';
import { FollowUpDoctorsComponent } from './follow-up-doctors/follow-up-doctors.component';
import { RatingComponent } from './rating/rating.component';
import { NotificationAppointmentReminderComponent } from './notification-appointment-reminder/notification-appointment-reminder.component';
import { NotificationMedicationReminderComponent } from './notification-medication-reminder/notification-medication-reminder.component';
import { NotificationAlertsBlogsComponent } from './notification-alerts-blogs/notification-alerts-blogs.component';
import { BillingPaymentsComponent } from './billing-payments/billing-payments.component';
import { PatientNotificationComponent } from './patient-notification/patient-notification.component';
const routes: Routes = [{
  path: '', component: PatientComponent,
  children: [
    { path: 'patient-information', component: PatientInformationComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'patient-documents', component: PatientDocumentsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'patient-health-records', component: PatientHealthRecordsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'doctor-search', component: DoctorSearchComponent },
    { path: 'book-appointment', component: BookAppointmentsComponent },
    { path: 'view-profile', component: ViewProfileComponent },
    { path: 'prescription', component: PatientPrescriptionComponent },
    { path: 'appointment-list', component: PatientAppointmentListComponent },
    { path: 'message', component: MessageComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'group-message', component: GroupMessageComponent, canActivate: [AuthGuard], data: { role:['Patient','Facility']  } },
    { path: 'message-list', component: MessageListComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'complaints', component: ComplaintsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'provider-detail', component: ProviderDetailComponent },
    { path: 'patient-faq', component: PatientFaqsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'support', component: SupportComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'FollowUpDoctor', component: FollowUpDoctorsComponent , canActivate: [AuthGuard], data: { role: 'Patient' }},
    { path: 'rating', component: RatingComponent , canActivate: [AuthGuard], data: { role: 'Patient' }},
    { path: 'notification-appointment-reminder', component: NotificationAppointmentReminderComponent, canActivate: [AuthGuard], data: { role:['Patient','notification'] }},
    { path: 'notification-medication-reminder', component: NotificationMedicationReminderComponent, canActivate: [AuthGuard], data: { role:['Patient','notification'] }},
    { path: 'notification-alerts-blogs', component: NotificationAlertsBlogsComponent, canActivate: [AuthGuard], data: { role:['Patient','notification'] }},
    { path: 'billing-payments', component: BillingPaymentsComponent, canActivate: [AuthGuard], data: { role:['Patient','notification'] }},
    { path: 'patient-notification', component: PatientNotificationComponent, canActivate: [AuthGuard], data: { role:['Patient','notification'] }},


    




  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
