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

const routes: Routes = [{
  path:'',component:ProviderComponent,
  children:[
    {path:'dashboard',component:dashboard , canActivate: [AuthGuard], data: { role: 'IndependentProvider' } },
    {path:'calendar',component:CalendarViewComponent , canActivate: [AuthGuard], data: { role: 'IndependentProvider' }},
    {path:'appointment-list',component:ProviderAppointmentListComponent },
    {path:'add-prescription',component:AddPrescriptionComponent , canActivate: [AuthGuard], data: { role: 'IndependentProvider' }},
    {path:'message',component:MessageComponent },
    {path:'message-list',component:MessageListComponent },

  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }
