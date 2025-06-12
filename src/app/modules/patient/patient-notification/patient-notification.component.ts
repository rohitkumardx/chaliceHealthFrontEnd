import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { ViewsoapnotesComponent } from '../viewsoapnotes/viewsoapnotes.component';
import { SignalRService } from 'src/app/Services/signalr.service';
import { Subscription } from 'rxjs';



export enum NotificationPreferenceOption {
  Email = 'Email',
  Phone = 'Phone',
  Both = 'Both'
}


export function phonePatternValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const valid = /^\(\d{3}\)-\d{3}-\d{4}$/.test(value);
    return valid ? null : { 'invalidPhonePattern': { value } };
  };
}

interface Notification {
  bookAppointmentId: number;
  title: string;
  message: string;
}



@Component({
  selector: 'app-patient-notification',
  templateUrl: './patient-notification.component.html',
  styleUrls: ['./patient-notification.component.css']
})
export class PatientNotificationComponent implements OnInit {
  notificationForm!: FormGroup;
  userId: any;
  loading: boolean = false;
  isLoading: boolean = false;
  notificationData: any;
  preference = NotificationPreferenceOption;
   private messageSubscription: Subscription | undefined;
    private notificationSubscription: Subscription | undefined;
    private blogSubscription: Subscription | undefined;
  
  constructor(
    private patientService: PatientService,
    private globalModalService: GlobalModalService,
    private notificationService: NotificationService,
    private providerService: ProviderService,
    private fb: FormBuilder,
    private authService: AuthService,
    private modalService: NgbModal, 
    private router: Router, 
    private adminService: AdminService,
     private signalRService: SignalRService
  ) { }

  ngOnInit() {
   
    this.notificationForm = this.fb.group({
      id: ['0'],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      preference: [this.preference.Both]

    })
    this.getBlogNotificatioun();

    setTimeout(() => {
     
      this.signalRService.startConnection();
      this.signalRService.addMessageCountListener();
      this.signalRService.addReceiveMessageListener();
      this.signalRService.addNotificationCountListener();
      this.signalRService.addAllNotificationCount();
      
  
      this.blogSubscription = this.signalRService.BlogCount$.subscribe(
        (blogData:any) => {

         this.getNewNotificatiounCount();
         this.newNotification=blogData;
         this.getBlogNotificatioun();
         this.getNotificationMedical();
         this.getNotificationList();
         //this.notificationService.showSuccess(this.newNotification.message)
        }
      );
      // this.notificationSubscription = this.signalRService.BlogCount$.subscribe(
      //   (notificationData:any) => {
        
      //     this.getNewNotificatiounCount();
      //     this.newNotification=notificationData;
      //     this.notificationService.showSuccess(notificationData.Message)
      //     console.log('Notification data updated:', notificationData);
      //   }
      // );

    }, 0);

    this.getNotificationByUserId();

    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId


    // Reminder Notification;
    this.getNotificationList();
    this.getAppointmentCancellationCount();
    this.getProviderRequestCount();
    // this.fetchAppointmentReminderCount();

    // Medical Notification;
    this.getNotificationMedical();
    // this.fetchMedicalReminderCount(); 
    

    // Blog Notification
    // this.getBlogNotificatioun();


    // Notification Count
    this.getNewNotificatiounCount();
  }
  postNotification() {
    this.isLoading = true;
    const notificationForm = this.notificationForm.value;

    // Ensure a preference is selected
    if (!notificationForm.preference) {
      notificationForm.preference = this.preference.Both;
      this.notificationForm.get('preference')?.setValue(this.preference.Both);
    }

    if (notificationForm.phoneNumber) {
      notificationForm.phoneNumber = notificationForm.phoneNumber.replace(/\D/g, '');
    }

    notificationForm.userId = this.userId; // Ensure userId is included

    this.providerService.postNotification(notificationForm).subscribe(
      (data) => {
        console.log('Post successful', data);

        if (this.notificationForm.value.id == 0) {
          this.notificationService.showSuccess(" Information added successfully.");
        } else {
          this.notificationService.showSuccess(" Information updated successfully.");
        }
        this.isLoading = false;
        // this.notificationForm.reset();
      },
      (error) => {
        console.error('Error posting notification:', error);
        this.isLoading = false;
        // this.notificationService.showError("Failed to update notification preferences.");
      }
    );
  }

  getNotificationByUserId() {
    this.providerService.getNotificationByUserId().subscribe((data) => {
      this.notificationData = data;

      const formattedPhoneNumber = this.globalModalService.formatPhoneNumberForDisplay(this.notificationData.phoneNumber);

      this.notificationForm.patchValue({
        id: this.notificationData.id,
        userId: this.notificationData.userId,
        email: this.notificationData.email,
        phoneNumber: formattedPhoneNumber,
        preference: this.notificationData.preference || this.preference.Both,

      });
      console.log("notification data", this.notificationData);

    })
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  onSettingsChange(event: any) {
    // this.searchTerm = ''
    // this.roles = []
    const selectedIndex = event.index;
  }
  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.notificationForm.get('phoneNumber').setValue(formattedValue);
  }



  notificationList: Notification[] = []; 
  appointmentCancellationCount: any;
  providerRequestCount: any;


  getNotificationList(): void {
   
    this.loading = true;
    this.adminService.getPatientReminderNotificationsList().subscribe({
      next: (data: Notification[]) => {
        this.notificationList = data;
        console.log('shahid',data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
        this.loading = false;
      }
    });
  }
 

 showDetails(appointmentId: any) { 
 

  this.providerService.markAppointmentReminderNotificationAsRead(appointmentId).subscribe({
    next: (response) => {
      if(response) {
        this.newNotification.appointmentCount = 0;
      }
      this.router.navigate(['/patient/appointment-list']); 
    },
    error: (err) => console.error('Error:', err)
  });
}


  fetchAppointmentReminderCount() {
   
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



  // Medication Remider Notification
  notificationMedicalList: any;

  getNotificationMedical(): void {
     
      this.loading = true;
      this.adminService.getMedicalReminderNotificationsList().subscribe({
        next: (data: Notification[]) => {
          this.notificationMedicalList = data;
          console.log('shahid',this.notificationMedicalList);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching notifications:', error);
          this.loading = false;
        }
      });
    } 
    
 
    MedicalviewDetails(medicationId: any) {
     
      this.providerService.markMedicalReminderNotificationAsRead(medicationId).subscribe({
        next: (response) => {
          if (response === true) {
            // this.newNotification.medicationCount = 0;
            this.getNewNotificatiounCount();
          }
          const modalRef = this.modalService.open(ViewsoapnotesComponent, {
            backdrop: 'static',
            size: 'md',
            centered: true
          });
          modalRef.componentInstance.bookingId = medicationId; 
          modalRef.closed.subscribe(() => {
            this.getNotificationMedical();  
          }); 
          modalRef.dismissed.subscribe(() => {
            console.log('Modal dismissed');
          });
    
        },
        error: (err) => console.error('Error:', err)
      });
    }
  
  
  
  fetchMedicalReminderCount() {
     
      this.providerService.getMedicalReminderCount().subscribe((response: any) => {
        this.newNotification = response.data;
      });
    }

        // toggle
        expanded = false;

        getShortText(text: string): string {
          if (!text) return '';
          let words = text.split(' ');
          return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : text;
        }
      
      
        shouldShowToggle(text: string): boolean {
          return text && text.split(' ').length > 8; // Only show toggle if more than 7 words
        }
      
        toggleExpand1(event: Event): void {
          event.preventDefault(); // Prevents page reload when clicking the link
          this.expanded = !this.expanded;
        }


      // view shop action
      todayAppointment: any[] = [];

      getTodayAppointmentsByUserId() {
        this.todayAppointment = []
        this.loading = true
        this.patientService.getNotificationMedicalShopList().subscribe(
          (data: any) => { 
              this.todayAppointment = data.items 
            } 
        );
      }


    blogNotification: any; 

    getBlogNotificatioun() {

      console.log('Fetching notification count...');
      this.adminService.getBlogReminderNotifications().subscribe(
        (response: any) => {
          console.log('Notification count response:', response);
          this.blogNotification = response; // Assign directly if API returns array
        },
        (error) => {
          console.error('Error fetching notification count:', error);
        }
      );
    }
  
   
    closeBlogsNotificationDropdown(id) {
      
      this.providerService.markBlogNotificationAsRead(id).subscribe({
        next: (response: any) => {
          // if (response === true) {
          //   this.newNotification.blogCount = 0;
          // }
          this.router.navigate(['/blog-content']); 
        },
        error: (err) => {
          console.error('Error marking notification as read:', err);
        }
      });
    }



    BlogDetails(id: number) {
      console.log('View details clicked for blog ID:', id); 
    }


  

// Notification Count

newNotification: any; 

    getNewNotificatiounCount() {
      console.log('Fetching notification count...');
      this.providerService.getPatientNotificationCount().subscribe((response: any) => {
       
        console.log('Notification count response:', response);
        this.newNotification = response.data || response; // Handle both response formats
      },
        (error) => {
          console.error('Error fetching notification count:', error);
        }
      );
    }


    isExpanded: boolean[] = [];

    toggleContent(index: number): void {
      this.isExpanded[index] = !this.isExpanded[index];
    }
  
    getFirstWords(text: string, wordCount: number): string {
      const words = text.split(' ');
      return words.length > wordCount ? words.slice(0, wordCount).join(' ') + '...' : text;
    }
  
    isLongContent(text: string, wordCount: number): boolean {
      return text.split(' ').length > wordCount;
    }

  
}