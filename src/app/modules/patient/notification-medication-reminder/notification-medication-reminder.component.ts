import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { switchMap } from 'rxjs/operators'; 
import { ViewsoapnotesComponent } from '../viewsoapnotes/viewsoapnotes.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-notification-medication-reminder',
  templateUrl: './notification-medication-reminder.component.html',
  styleUrls: ['./notification-medication-reminder.component.css']
})
export class NotificationMedicationReminderComponent implements OnInit {
  notificationList: any;
  loading: boolean = false;

  appointmentCancellationCount: any;
  providerRequestCount: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private providerService: ProviderService,
        private modalService: NgbModal,
  ) { 
    this.fetchMedicalReminderCount();
  }

  ngOnInit(): void {
    this.getNotificationList();
    this.getAppointmentCancellationCount();
    this.getProviderRequestCount();
  }

  getNotificationList(): void {
    ;
    this.loading = true;
    this.adminService.getMedicalReminderNotificationsList().subscribe({
      next: (data: Notification[]) => {
        this.notificationList = data;
        console.log('shahid',this.notificationList);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.loading = false;
      }
    });
  }
  newNotification: any;  
  
 //
 showDetails(medicationId: number) { 
;
  this.providerService.markMedicalReminderNotificationAsRead(medicationId).subscribe({
    next: (response) => {
      console.log(response);
      ;
       
        const modalRef = this.modalService.open(ViewsoapnotesComponent, {
          backdrop: 'static',
          size: 'md',
          centered: true
        });
        modalRef.componentInstance.medicationId = medicationId;
       this.newNotification.medicationCount = 0;
    },
    error: (err) => console.error('Error:', err)
  });
}

//  viewSoapNotes(bookingId: any){
//     const modalRef = this.modalService.open(ViewsoapnotesComponent, {
//       backdrop: 'static',
//       size: 'md',
//       centered: true
//     });
//     modalRef.componentInstance.bookingId = bookingId;
//   }




  private fetchMedicalReminderCount() {
    ;
    this.providerService.getMedicalReminderCount().subscribe((response: any) => {
      this.newNotification = response.data;
    });
  }

  

  getAppointmentCancellationCount(){
    this.providerService.getRequestNotificationCount().subscribe((response : any)=>{
      this.appointmentCancellationCount = response.count;
      console.log("this is apointment cancellation count", this.appointmentCancellationCount)

    })
  }

  getProviderRequestCount(){
    this.providerService.getNewProviderRequest().subscribe((response : any)=>{
      this.providerRequestCount = response.count;
      console.log("this is provider request count", this.providerRequestCount)
    })
  }



  
}