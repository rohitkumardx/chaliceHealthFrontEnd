import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideoCallProcessRoutingModule } from './video-call-process-routing.module';
import { JoinVideoCallComponent } from './join-video-call/join-video-call.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [
    JoinVideoCallComponent
  ],
  imports: [
    CommonModule,
    FormsModule,ReactiveFormsModule,
    VideoCallProcessRoutingModule
  ]
})
export class VideoCallProcessModule { }
