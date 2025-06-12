import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';

@Component({
  selector: 'app-view-report',
  templateUrl: './view-report.component.html',
  styleUrls: ['./view-report.component.css']
})
export class ViewReportComponent implements OnInit {

  reportData: any;
   userId:any

constructor(
        private activeModel: NgbActiveModal,
        private adminService: AdminService,
        private notificationService:NotificationService
) {}


 ngOnInit() {
   this.getReportAppointment();      
  }

  getReportAppointment() {
    this.adminService.getReportAppointment(this.userId)?.subscribe((data: any) => {       
   this.reportData = data;    
   console.log("This is report appointment data", this.reportData);

 });
}

  closeModal(){
    this.activeModel.close(); 
  }

}
