import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { switchMap } from 'rxjs/operators'; 

interface Notification {
  bookAppointmentId: number;
  title: string;
  message: string;
}

@Component({
  selector: 'app-notification-appointment-reminder',
  templateUrl: './notification-appointment-reminder.component.html',
  styleUrls: ['./notification-appointment-reminder.component.css']
})
export class NotificationAppointmentReminderComponent implements OnInit {
  notificationList: Notification[] = [];
  loading: boolean = false;

  appointmentCancellationCount: any;
  providerRequestCount: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private providerService: ProviderService,
  ) { 
    this.fetchAppointmentReminderCount();
  }

  ngOnInit(): void {
    this.getNotificationList();
    this.getAppointmentCancellationCount();
    this.getProviderRequestCount();
  }

  getNotificationList(): void {
    ;
    this.loading = true;
    this.adminService.getPatientReminderNotificationsList().subscribe({
      next: (data: Notification[]) => {
        this.notificationList = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.loading = false;
      }
    });
  }
  newNotification: any;  
  
 // notification-appointment-reminder.component.ts
 showDetails(bookAppointmentId: number) {
  // सीधे appointment list पर navigate करें
  this.router.navigate(['/patient/appointment-list']);
  
  // अगर notification count भी reset करना है तो:
  this.providerService.markAppointmentReminderNotificationAsRead(bookAppointmentId).subscribe({
    next: (response) => {
      if(response) {
        this.newNotification.appointmentCount = 0;
      }
    },
    error: (err) => console.error('Error:', err)
  });
}


  private fetchAppointmentReminderCount() {
    ;
    this.providerService.getAppointmentReminderCount().subscribe((response: any) => {
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