import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';

@Component({
  selector: 'app-provider-report-view',
  templateUrl: './provider-report-view.component.html',
  styleUrls: ['./provider-report-view.component.css']
})
export class ProviderReportViewComponent implements OnInit {
  reportData: any;
  userId:any

constructor(
       private activeModel: NgbActiveModal,
       private adminService: AdminService,
       private notificationService:NotificationService
) {}


ngOnInit() {
  this.getProviderReportAppointment();      
 }

 getProviderReportAppointment() {
   this.adminService.getProviderReportAppointment(this.userId)?.subscribe((data: any) => {       
  this.reportData = data;    
  console.log("This is provider report data", this.reportData);

});
}

 closeModal(){
   this.activeModel.close(); 
 }


}
