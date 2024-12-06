import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { PatientRoutingModule } from './patient-routing.module';
import { PatientComponent } from './patient.component';
import { PatientInformationComponent } from './patient-information/patient-information.component';
import {MatTabsModule} from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
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
    AddReviewComponent

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
    SharedModule

  ]
})
export class PatientModule { }
