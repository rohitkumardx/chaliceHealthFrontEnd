import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideoCallProcessComponent } from './video-call-process.component';
import { JoinVideoCallComponent } from './join-video-call/join-video-call.component';




const routes: Routes = [{
  path:'',component:VideoCallProcessComponent,
  children:[
    {path:'join-call',component:JoinVideoCallComponent },
  ]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoCallProcessRoutingModule { }
