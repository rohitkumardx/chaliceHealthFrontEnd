import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
    MessageListComponent
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, SharedModule,
    ProviderRoutingModule,
    MatTabsModule
  ]
})
export class ProviderModule { }
