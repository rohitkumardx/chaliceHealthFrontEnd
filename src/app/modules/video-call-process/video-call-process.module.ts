import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoCallProcessRoutingModule } from './video-call-process-routing.module';
import { JoinVideoCallComponent } from './join-video-call/join-video-call.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AddPrescriptionByProviderComponent } from './add-prescription-by-provider/add-prescription-by-provider.component';
import { SharedModule } from 'src/app/shared/shared.module';




@NgModule({
  declarations: [
    JoinVideoCallComponent,
    AddPrescriptionByProviderComponent
  ],
  imports: [
    CommonModule,SharedModule,
    FormsModule,ReactiveFormsModule,
    VideoCallProcessRoutingModule
  ]
})
export class VideoCallProcessModule { }
