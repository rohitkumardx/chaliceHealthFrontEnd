import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageComponent } from '../message/message.component';
import { ViewReportComponent } from '../view-report/view-report.component';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-appointments-view',
  templateUrl: './appointments-view.component.html',
  styleUrls: ['./appointments-view.component.css']
})
export class AppointmentsViewComponent implements OnInit {
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() userId: any;
  appointmentList = []


    loading: boolean = false
     filteredItems = []
 
    
  
  
    constructor(private adminService: AdminService,
      private activeModel: NgbActiveModal,
      private notificationService: NotificationService,
      private router: Router,
      private authService: AuthService
    ) { }
  
    ngOnInit() {
      this.getAppointmentListByUserId()
    }
  
    getAppointmentListByUserId() {
     
      this.adminService.getAppointmentListByUserId(this.userId).subscribe((response: any) => {
        this.appointmentList = response.items   
        console.log("appointment list data", this.appointmentList);
      });
    }

    modalClose() {
      this.activeModel.close();
      this.dialogClosed.emit();
    }
  
    formatMeetingType(meetingType: string): string {
      return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
    }
 

}
