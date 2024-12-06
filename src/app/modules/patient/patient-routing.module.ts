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
const routes: Routes = [{
  path: '', component: PatientComponent,
  children: [
    { path: 'patient-information', component: PatientInformationComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'patient-documents', component: PatientDocumentsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'patient-health-records', component: PatientHealthRecordsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'doctor-search', component: DoctorSearchComponent },
    { path: 'book-appointment', component: BookAppointmentsComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'view-profile', component: ViewProfileComponent },
    { path: 'prescription', component: PatientPrescriptionComponent },
    { path: 'appointment-list', component: PatientAppointmentListComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'message', component: MessageComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },
    { path: 'message-list', component: MessageListComponent, canActivate: [AuthGuard], data: { role: 'Patient' } },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule { }
