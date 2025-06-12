import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PatientRoutingModule } from './patient-routing.module';
import { PatientComponent } from './patient.component';
import { PatientInformationComponent } from './patient-information/patient-information.component';
import {MatTabsModule} from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthRoutingModule } from '../auth/auth-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatientDocumentsComponent } from './patient-documents/patient-documents.component';
import { PatientHealthRecordsComponent } from './patient-health-records/patient-health-records.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { BookAppointmentsComponent } from './book-appointments/book-appointments.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { PatientPrescriptionComponent } from './patient-prescription/patient-prescription.component';
import { AddMedicationComponent } from './add-medication/add-medication.component';
import { PatientAppointmentListComponent } from './patient-appointment-list/patient-appointment-list.component';
import { ShareDocPopupComponent } from './share-doc-popup/share-doc-popup.component';
import { MessageComponent } from './message/message.component';
import { PatientClinicalDashboardComponent } from './patient-clinical-dashboard/patient-clinical-dashboard.component';
import { ViewsoapnotesComponent } from './viewsoapnotes/viewsoapnotes.component';
import { MessageListComponent } from './message-list/message-list.component';
import { AddReviewComponent } from './add-review/add-review.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AnnouncementPopupComponent } from './announcement-popup/announcement-popup.component';
import { CancelAppointmentModelComponent } from './cancel-appointment-model/cancel-appointment-model.component';
import { ComplaintsComponent } from './complaints/complaints.component';
import { ComplaintModalComponent } from './complaint-modal/complaint-modal.component';
import { SettingsComponent } from './settings/settings.component';
import { EditSlotModelComponent } from './edit-slot-model/edit-slot-model.component';
import { MessageComplaintComponent } from '../provider/message-complaint/message-complaint.component';
import { GroupMessageComponent } from './group-message/group-message.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { PatientMessageComplaintComponent } from './patient-message-complaint/patient-message-complaint.component';
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
import { MessagePopUpComponent } from './message-pop-up/message-pop-up.component';
import { CancellationPolicyComponent } from './cancellation-policy/cancellation-policy.component';




@NgModule({
  declarations: [
    PatientComponent,
    PatientInformationComponent,
    PatientDocumentsComponent,
    PatientHealthRecordsComponent,
    DoctorSearchComponent,
    BookAppointmentsComponent,
    ViewProfileComponent,
    PatientPrescriptionComponent,
    AddMedicationComponent,
    PatientAppointmentListComponent,
    ShareDocPopupComponent,
    MessageComponent,
    PatientClinicalDashboardComponent,
    ViewsoapnotesComponent,
    MessageListComponent,
    AddReviewComponent,
    DashboardComponent,
    AnnouncementPopupComponent,
    CancelAppointmentModelComponent,
    ComplaintsComponent,
    ComplaintModalComponent,
    SettingsComponent,
    EditSlotModelComponent,
    MessageComplaintComponent,
    GroupMessageComponent,
    PatientMessageComplaintComponent,
    ProviderDetailComponent,
    PatientFaqsComponent,
    SupportComponent,
    FollowUpDoctorsComponent,
    RatingComponent,
    NotificationAppointmentReminderComponent,
    NotificationMedicationReminderComponent,
    NotificationAlertsBlogsComponent,
    BillingPaymentsComponent,
    PatientNotificationComponent,
    MessagePopUpComponent,
    CancellationPolicyComponent

  ],
  providers :[DatePipe],
  imports: [
    CommonModule,
    PatientRoutingModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatSnackBarModule,
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    
    
  ]
})
export class PatientModule { }
