import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewsoapnotesComponent } from '../viewsoapnotes/viewsoapnotes.component';
import { AddReviewComponent } from '../add-review/add-review.component';
import { AdminService } from 'src/app/Services/admin.service';
import { CancelAppointmentModelComponent } from '../cancel-appointment-model/cancel-appointment-model.component';
import { ComplaintModalComponent } from '../complaint-modal/complaint-modal.component';
import { environment } from 'src/environments/environment';
import { ViewChild, ElementRef } from '@angular/core';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';


@Component({
  selector: 'app-patient-appointment-list',
  templateUrl: './patient-appointment-list.component.html',
  styleUrls: ['./patient-appointment-list.component.css']
})
export class PatientAppointmentListComponent implements OnInit {
  todayAppointment: any[] = [];
  upcomingAppointment: any[] = [];
  pastAppointment: any[] = [];
  cancelledAppointment: any[] = [];
  userId: any;
  patientId:any;
  shareConsentId:any;
  hash: string;
  userInfo : any; loading: boolean = false;
  hasShareConsent: boolean =  true;
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  dynamicDateTime:any;
   _ = _ ;
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  roles: {
    id: number,
    numOfUsers: number,
    name: string,
    status: string
  }[] = [];
item: any;
hashData:any;
documentData:any;



  constructor(
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private adminService: AdminService,
     private activatedRoute: ActivatedRoute,
  ) { }


  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.hash = params['hash'];});
      this.dynamicDateTime=this.adminService.getDate();
      if(this.hash){
        this.getPatientHash();
      }
      else {
        this.userInfo = this.authService.getUserInfo()
        this.getTodayAppointmentsByUserId();
        this.selectedAppointment = 'Today'
      }
  }

  addToCalender(appointmentId) {
    const obj = {
      bookingAppointmentId: []
    };
 
    obj.bookingAppointmentId.push(appointmentId);
    this.patientService.addToGoogleCalender(obj).subscribe((response: any) => {
      
      const url = response.url
      if (url) {
        window.open(url, "_blank");
      }
    },
      (error: any) => {
        this.notificationService.showDanger(getErrorMessage(error));
      }
    )
  }

  rescheduleAppointment(bookingId: any, id: any, meetingType: any) {
    this.router.navigate(['/patient/view-profile'], { queryParams: { appointmentId: bookingId, providerProfileId: id, meetingType: meetingType } });
  
    }
  expanded = false;

  getShortText(text: string): string {
    if (!text) return '';
    let words = text.split(' ');
    return words.length > 10 ? words.slice(0, 10).join(' ') + '...' : text;
  }

  shouldShowToggle(text: string): boolean {
    return text && text.split(' ').length > 10; // Only show toggle if more than 7 words
  }

  toggleExpand(event: Event): void {
    event.preventDefault(); // Prevents page reload when clicking the link
    this.expanded = !this.expanded;
  }

  viewTodayProviderProfile(id: any, bookingId: any) {
    
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
    modalRef.componentInstance.bookingId = bookingId;
   modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getTodayAppointmentsByUserId();
  });
   
  }

  viewUpcomingProviderProfile( bookingId: any, id:any) {

      
      const modalRef = this.modalService.open(ProviderProfileComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.providerId = id;
      modalRef.componentInstance.bookingId = bookingId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getUpcomingAppointmentsByUserId();
    });
     
    }

    viewPastProviderProfile(id: any) {
      
      const modalRef = this.modalService.open(ProviderProfileComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.providerId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getPastAppointmentsByUserId();
    });
     
    }

    viewCancelledProviderProfile(id: any) {
      
      const modalRef = this.modalService.open(ProviderProfileComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.providerId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getCancelledAppointmentsByUserId();
    });
     
    }
  
  isTimePast(itemStartTime: string): boolean {
    const currentTime = new Date(); // Get current time

    // Get the current time in HH:mm:ss format (ignoring date part)
    const currentTimeString = currentTime.toTimeString().split(' ')[0]; // Format: HH:mm:ss

    // Compare current time with the given start time
    return itemStartTime < currentTimeString;
  }

  getPatientHash() {
    this.patientService.getPatientHash(this.hash).subscribe((data) => {
      this.hashData = data;
      console.log("hash patient data", this.hashData)
      localStorage.setItem("userInfo", JSON.stringify(data));
      this.userInfo = this.authService.getUserInfo()
      this.getTodayAppointmentsByUserId();
      this.selectedAppointment = 'Today'
    });
  }


downloadConsentDocument(bookingId: any) {
  this.patientService.getPatientDocument(bookingId,'ConsentForm').subscribe((data: any) => {
      if (!data || data.length === 0) {
          console.error("No document found.");
          return;
      }

      const documentData = data[0]; // Access first object from array
      const fileUrl = environment.fileUrl + documentData.filePath;

      fetch(fileUrl)
          .then(response => response.blob())
          .then(blob => {
              const a = document.createElement('a');
              const url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = documentData.fileName; // Use correct property
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
          })
          .catch(error => console.error("Error downloading file:", error));
  });
}




downloadIntakeDocument(bookingId: any) {
  this.patientService.getPatientDocument(bookingId,'IntakeForm' ).subscribe((data: any) => {
      if (!data || data.length === 0) {
          console.error("No document found.");
          return;
      }

      const documentData = data[0]; // Access first object from array
      const fileUrl = environment.fileUrl + documentData.filePath;

      fetch(fileUrl)
          .then(response => response.blob())
          .then(blob => {
              const a = document.createElement('a');
              const url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = documentData.fileName; // Use correct property
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
          })
          .catch(error => console.error("Error downloading file:", error));
  });
}

  

  selectedAppointment: string = ''
  onAppointmentChange(event: any) {
    const selectedIndex = event.index;
    if (selectedIndex === 0) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Today';
      this.getTodayAppointmentsByUserId();  
    } else if (selectedIndex === 1) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Upcoming';
      this.getUpcomingAppointmentsByUserId();  // Call the function to fetch upcoming appointments
    } else if (selectedIndex === 2) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Past';
      this.getPastAppointmentsByUserId();  // Call the function to fetch past appointments
    }
    else if (selectedIndex === 3) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Cancel';
       this.getCancelledAppointmentsByUserId();  // Call the function to fetch past appointments

    }
  }
  getTodayAppointmentsByUserId() {
    this.todayAppointment = []
    this.loading = true
    this.patientService.getPatientTodayAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder,this.dynamicDateTime).subscribe(
      (data: any) => {
      
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.todayAppointment = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.todayAppointment = data.items;
            this.filteredItems = [...this.todayAppointment];
          }
        }
        console.log("Today appointment data :", this.todayAppointment)
       
        this.loading = false;
      
      },
      (error) => {
        console.error("Error fetching today appointments:", error);
      }
    );
  }
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    if(this.selectedAppointment == 'Today'){
      this.getTodayAppointmentsByUserId();
    }
    if(this.selectedAppointment == 'Upcoming'){
      this.getUpcomingAppointmentsByUserId();
    }
    if(this.selectedAppointment == 'Past'){
      this.getPastAppointmentsByUserId();
    }
    if(this.selectedAppointment == 'Cancelled'){
      this.getCancelledAppointmentsByUserId();
    }
 
  }


  
  
  getUpcomingAppointmentsByUserId() {
    this.upcomingAppointment = []
    this.loading = true
    this.patientService.getPatientUpcomingAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder,this.dynamicDateTime).subscribe(
      (data: any) => {
        
        if (data.items.length > 0) {
        
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
       
          this.upcomingAppointment = data.items
          
          if (data && data.items && Array.isArray(data.items)) {
            this.upcomingAppointment = this.upcomingAppointment;
            this.filteredItems = [...this.upcomingAppointment];
          }
        }
        this.loading = false
        console.log("Upcoming Appointment data:", this.upcomingAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }

  getPastAppointmentsByUserId() {
    ;
    this.pastAppointment = []
    this.loading = true
    this.patientService.getPatientPastAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder,this.dynamicDateTime).subscribe(
      (data: any) => {
        
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.pastAppointment = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.pastAppointment = this.pastAppointment;
            this.filteredItems = [...this.pastAppointment];
          }
        }
        this.loading = false
        console.log("Past Appointment data:", this.pastAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }
  showDetails(id: any) {
    const modalRef = this.modalService.open(CancelAppointmentModelComponent, {
      size: 'md',
      centered: true,
    });
     modalRef.componentInstance.appointmentDataId = id;
     modalRef.result.then(
      (result) => {
       this.getUpcomingAppointmentsByUserId();
       this.getTodayAppointmentsByUserId(); 
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }


  getCancelledAppointmentsByUserId() {
    ;
    this.cancelledAppointment = []
    this.loading = true
    this.patientService.getPatientCancelledAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {
        
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.cancelledAppointment = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.todayAppointment = this.cancelledAppointment;
            this.filteredItems = [...this.cancelledAppointment];
          }
        }
        this.loading = false
        console.log("Cancelled Appointment data:", this.cancelledAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }

  
  getMeetingTypeIcon(meetingType: string): string {
    switch (meetingType) {
      case 'VirtualVisit':
        return 'fas fa-video';
      case 'InPersonVisit':
        return 'fas fa-user-md';
      case 'IHomeCareVisit':
        return 'fas fa-home';
      case 'OfficeVisit':
        return 'fas fa-hospital';
      default:
        return 'fas fa-question-circle';
    }
  }

  getMeetingTypeTitle(meetingType: string): string {
    switch (meetingType) {
      case 'Virtual':
        return 'Join  Call';
      case 'InPersonVisit':
        return 'In-Person Visit';
      case 'IHomeCareVisit':
        return 'Home Care Visit';
      case 'OfficeVisit':
        return 'Office Visit';
      default:
        return 'Unknown Meeting Type';
    }
  }

  sendMessage(bookingId: any,id:any) {
    this.router.navigate(['/patient/message'], { queryParams: { appointmentId: bookingId,userId :id } });
  }



    @ViewChild('fileInput1') fileInput1: ElementRef;
 selectedShareIntakeId: any;
  browseIntakeDocument(shareIntakeId) {
    // alert(shareIntakeId)
     this.selectedShareIntakeId = shareIntakeId; 
    this.fileInput1.nativeElement.click(); // Open file picker
  }



    onFileSelected1(event: any, _unused: string,index :any) {
      // alert(index)
    const file = event.target.files[0]; // Get selected file
    if (file) {
      console.log("Selected file:", file);
      this.userInfo = this.authService.getUserInfo(); // Ensure userInfo is fetched
      this.uploadDocument(file, this.userInfo.userId, this.selectedShareIntakeId); // Pass userId instead of patientId
    }
}






  @ViewChild('fileInput') fileInput: ElementRef;

selectedShareConsentId : any;
  browseConsentDocument(shareConsentId) {
    this.selectedShareConsentId = shareConsentId; 

    this.fileInput.nativeElement.click(); // Open file picker
  }


    onFileSelected(event: any, _unused: string,index :any) {
      // alert(index)
    const file = event.target.files[0]; // Get selected file
    if (file) {
      console.log("Selected file:", file);
      this.userInfo = this.authService.getUserInfo(); // Ensure userInfo is fetched
      this.uploadDocument(file, this.userInfo.userId, this.selectedShareConsentId); // Pass userId instead of patientId
    }
}

uploadDocument(file: File, userId: string, shareConsentId: string) {
    
    const formData = new FormData();
    formData.append("patientId", userId); // Use userId instead of patientId
    formData.append("shareConsentId", shareConsentId); 
    formData.append("Document", file);
  
    this.patientService.postPatientShareDocument(formData).subscribe(
      (data: any) => {
        console.log("Downloaded patient document data", data);
        this.notificationService.showSuccess("Document uploaded successfully!");
        window.location.reload();
      },
      (error) => {
        console.error("Error uploading document", error);
        // this.notificationService.showError("Failed to upload document.");
      }
    );
}

  
  
  // onFileSelected(event: any) {
  //   const file = event.target.files[0]; // Get selected file
  //   if (file) {
  //     console.log("Selected file:", file);
  //     // Handle file upload or further processing here
  //   }



  // }

  // postPatientShareDocument(){
  //   this.patientService.postPatientShareDocument(obj).subscribe((data :any) => {
 

  //         console.log("Downloaded patient document data", this.documentData);
  //      });

  // }

  handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected File:', file.name);
      // Perform file upload logic here
    }
  }
  
  complaintModal(bookAppointmentId: any){
    const modalRef = this.modalService.open(ComplaintModalComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.bookAppointmentId = bookAppointmentId;
  }


  formatServiceType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }



  viewSoapNotes(bookingId: any){
    const modalRef = this.modalService.open(ViewsoapnotesComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.bookingId = bookingId;
    // modalRef.componentInstance.userId = userId;
  }

  joinCall(bookingId: any, time: string, meetingType: any,providerId:any) {
  
    const currentTime = new Date();
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const callTime = new Date(currentTime);
    callTime.setHours(hours, minutes, seconds, 0); // Set the time based on the passed time

    const timeDifference = callTime.getTime() - currentTime.getTime();
    const fiveMinutesInMillis = 5 * 60 * 1000;

    if (timeDifference <= fiveMinutesInMillis && timeDifference >= 0) {
      this.router.navigate(['/call/join-call'], { queryParams: { appointmentId: bookingId, request: meetingType ,receiverId:providerId} });
    } else {
      this.router.navigate(['/call/join-call'], { queryParams: { appointmentId: bookingId, request: meetingType ,receiverId:providerId} });
      this.notificationService.showDanger("You can join the call only within 5 minutes of the scheduled time.")
    }
  }
  // joinCall(bookingId: any, time: string, meetingType: any) {
  //   const currentTime = new Date();
  //   const [hours, minutes, seconds] = time.split(':').map(Number);

  //   const callTime = new Date(currentTime);
  //   callTime.setHours(hours, minutes, seconds, 0); // Set the time based on the passed time

  //   const timeDifference = callTime.getTime() - currentTime.getTime();
  //   const fiveMinutesInMillis = 5 * 60 * 1000;

  //   if (timeDifference <= fiveMinutesInMillis && timeDifference >= 0) {
  //     this.router.navigate(['/call/join-call'], { queryParams: { appointmentId: bookingId, request: meetingType } });
  //   } else {
  //     this.router.navigate(['/call/join-call'], { queryParams: { appointmentId: bookingId, request: meetingType } });
  //     this.notificationService.showDanger("You can join the call only within 5 minutes of the scheduled time.")
  //   }
  // }

  giveFeedback(id: any,providerName : any){
    const obj = {
      providerId : id,
      providerName : providerName
    }
    const modalRef = this.modalService.open(AddReviewComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.reviewObj = obj;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getTodayAppointmentsByUserId();
    });
  }


}
