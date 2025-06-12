import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportAppointmentComponent } from '../report-appointment/report-appointment.component';
import { ProviderService } from 'src/app/Services/provider.service';
import * as _ from 'lodash';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { ViewsoapnotesComponent } from '../../patient/viewsoapnotes/viewsoapnotes.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { AdminService } from 'src/app/Services/admin.service';
import { environment } from 'src/environments/environment';





@Component({
  selector: 'app-provider-appointment-list',
  templateUrl: './provider-appointment-list.component.html',
  styleUrls: ['./provider-appointment-list.component.css']
})
export class ProviderAppointmentListComponent implements OnInit {

  todayAppointment = [];
  upcomingAppointment = [];
  pastAppointment = [];
  cancelledAppointment = [];
  userInfo: any;
  receivedData: any;
  shareConsentStatus: any;
  loading: boolean = false;
  isLoading: Boolean = false;
  dynamicDateTime: any;
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  _ = _;
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private modalService: NgbModal,
    private providerService: ProviderService,
    private notificationService: NotificationService,
    private adminService: AdminService
  ) { }



  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    this.dynamicDateTime = this.adminService.getDate();
    this.getTodayAppointmentsByUserId();
    this.selectedAppointment = 'Today'
  }

  selectedAppointment: string = ''
  onAppointmentChange(event: any) {
    this.searchTerm = ''
    this.roles = []
    const selectedIndex = event.index;
    if (selectedIndex === 0) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Today';
      this.getTodayAppointmentsByUserId();  // Call the function to fetch today's appointments 
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
      this.selectedAppointment = 'Cancelled';
      this.getCancelledAppointmentsByUserId();  // Call the function to fetch past appointments

    }
  }
  viewDetails(bookingId: any) {

  }


  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  loadingState: { [key: number]: { consent?: boolean; intake?: boolean } } = {}; // Separate loading state



  shareConsentAppointment(bookAppointmentId: number, adminDocumentId: number) {
    if (this.loadingState[bookAppointmentId]?.consent) return; // Prevent multiple clicks

    if (!this.loadingState[bookAppointmentId]) {
      this.loadingState[bookAppointmentId] = {};
    }

    this.loadingState[bookAppointmentId].consent = true; // Start loader for consent

    const requestData = {
      BookAppointmentId: bookAppointmentId,
      AdminDocumentId: adminDocumentId ?? 0
    };

    this.providerService.postConsentShare(requestData).subscribe(
      response => {
        this.notificationService.showSuccess("An email has been sent successfully to the patient");
        console.log('Consent status activated successfully', response);
        this.loadingState[bookAppointmentId].consent = false; // Stop loader for consent
        this.getTodayAppointmentsByUserId();
        this.getUpcomingAppointmentsByUserId();
      },
      error => {
        this.notificationService.showDanger(getErrorMessage(error));
        this.loadingState[bookAppointmentId].consent = false; // Stop loader on error
      }
    );
  }

  shareIntakeAppointment(bookAppointmentId: number, adminDocumentId: number) {
    if (this.loadingState[bookAppointmentId]?.intake) return; // Prevent multiple clicks

    if (!this.loadingState[bookAppointmentId]) {
      this.loadingState[bookAppointmentId] = {};
    }

    this.loadingState[bookAppointmentId].intake = true; // Start loader for intake

    const requestData = {
      BookAppointmentId: bookAppointmentId,
      AdminDocumentId: adminDocumentId ?? 0
    };

    this.providerService.postConsentShare(requestData).subscribe(
      response => {
        this.notificationService.showSuccess("An email has been sent successfully to the patient");
        console.log('Intake status activated successfully', response);
        this.loadingState[bookAppointmentId].intake = false; // Stop loader for intake
        this.getTodayAppointmentsByUserId();
        this.getUpcomingAppointmentsByUserId();
      },
      error => {
        this.notificationService.showDanger(getErrorMessage(error));
        this.loadingState[bookAppointmentId].intake = false; // Stop loader on error
      }
    );
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



  sendMessage(bookingId: any, id: any) {
    this.router.navigate(['/provider/message'], { queryParams: { appointmentId: bookingId, userId: id } });
  }

  joinCall(bookingId: any, time: string, meetingType: any, duration: any, patientId: any) {
    const currentTime = new Date();
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const callTime = new Date(currentTime);
    callTime.setHours(hours, minutes, seconds, 0); // Set the call time based on the passed time

    const timeDifference = callTime.getTime() - currentTime.getTime();
    const twoMinutesInMillis = 2 * 60 * 1000;
    const tenMinutesInMillis = 10 * 60 * 1000;
    const elapsedTime = currentTime.getTime() - callTime.getTime();

    if (timeDifference <= twoMinutesInMillis && timeDifference >= 0) {
      // Allow joining within 2 minutes before the start time
      this.router.navigate(['/call/join-call'], {
        queryParams: { appointmentId: bookingId, request: meetingType, serviceDuration: duration, receiverId: patientId }
      });
    } else if (elapsedTime <= tenMinutesInMillis && elapsedTime > 0) {
      // Allow joining up to 10 minutes after the start time
      this.router.navigate(['/call/join-call'], {
        queryParams: { appointmentId: bookingId, request: meetingType, serviceDuration: duration, receiverId: patientId }
      });
    } else {
      this.router.navigate(['/call/join-call'], {
        queryParams: { appointmentId: bookingId, request: meetingType, serviceDuration: duration, receiverId: patientId }
      });

      if (meetingType === 'VirtualVisit') {
        this.notificationService.showDanger(
          "You can join the call 2 minutes before or up to 10 minutes after the scheduled time"
        );
      }
    }
  }

  cancelAppointment(id: any) {
    const modalRef = this.modalService.open(ReportAppointmentComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    const obj = {
      type: "Cancel",
      bookingId: id
    }
    modalRef.componentInstance.bookingId = obj;
  }

  openReportPopUp(id: any) {
    const modalRef = this.modalService.open(ReportAppointmentComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    const obj = {
      type: "Report",
      bookingId: id
    }
    modalRef.componentInstance.bookingId = obj;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getTodayAppointmentsByUserId();
    });
  }

  showPatientDashboard(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
    });
    modalRef.componentInstance.bookingId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getTodayAppointmentsByUserId();
    });
  }

  showUpcomingPatientDashboard(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.bookingId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getUpcomingAppointmentsByUserId();
    });
  }

  showPastPatientDashboard(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.bookingId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getPastAppointmentsByUserId();
    });
  }

  showCancelledPatientDashboard(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.bookingId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getPastAppointmentsByUserId();
    });
  }

  getMeetingTypeIcon(meetingType: string): string {
    switch (meetingType) {
      case 'VirtualVisit':
        return 'fas fa-video';
      case 'InPersonVisit':
        return 'fa fa-building';
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

  copyLink(bookingId: any) {
    this.providerService.copyCallLink(bookingId).subscribe((response: any) => {
      const callUrl = response.callUrl;
      navigator.clipboard.writeText(callUrl).then(() => {
        this.notificationService.showSuccess('The link has been copied to your clipboard!')
      }).catch(err => {
        console.error('Failed to copy link: ', err);
      });
    });
  }


  // getTodayAppointmentsByUserId() {
  //   this.todayAppointment = []
  //   this.loading = true
  //   this.providerService.getProviderTodayAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder, this.dynamicDateTime).subscribe(
  //     (data: any) => {
  //       if (data.items.length > 0) {
  //         this.roles = _.get(data, 'items');
  //         this.paginator = {
  //           ...this.paginator,
  //           pageNumber: _.get(data, 'pageNumber'),
  //           totalCount: _.get(data, 'totalCount'),
  //           totalPages: _.get(data, 'totalPages'),
  //         };
  //         this.loading = false
  //         this.todayAppointment = data.items
  //         console.log("This is list ", this.todayAppointment);
  //         if (data && data.items && Array.isArray(data.items)) {
  //           this.todayAppointment = data.items;
  //           this.filteredItems = [...this.todayAppointment];
  //         }
  //       }
  //       this.loading = false
  //     },
  //     (error) => {
  //       this.loading = false
  //       console.error("Error fetching today appointments:", error);
  //     }
  //   );
  // }


getTodayAppointmentsByUserId() {
  this.todayAppointment = [];
  this.loading = true;

  this.providerService.getProviderTodayAppointmentList(
    this.searchTerm,
    this.paginator.pageNumber,
    this.paginator.pageSize,
    this.sortColumn,
    this.sortOrder,
    this.dynamicDateTime
  ).subscribe(
    (data: any) => {
      if (data.items.length > 0) {
        // Add full filePath to each item if consentFilePath exists
        this.todayAppointment = data.items.map((item: any) => {
          return {
            ...item,
            filePath: item.consentFilePath
              ? environment.fileUrl + item.consentFilePath
              : null,
               intakeFilePath: item.intakeFilePath
              ? environment.fileUrl + item.intakeFilePath
              : null
          };
        });

        this.roles = this.todayAppointment;

        this.filteredItems = [...this.todayAppointment];

        this.paginator = {
          ...this.paginator,
          pageNumber: data.pageNumber,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
        };
      }
      this.loading = false;
    },
    (error) => {
      this.loading = false;
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
    if (this.selectedAppointment == 'Today') {
      this.getTodayAppointmentsByUserId();
    }
    if (this.selectedAppointment == 'Upcoming') {
      this.getUpcomingAppointmentsByUserId();
    }
    if (this.selectedAppointment == 'Past') {
      this.getPastAppointmentsByUserId();
    }
    if (this.selectedAppointment == 'Cancelled') {
      this.getCancelledAppointmentsByUserId();
    }

  }

  // getUpcomingAppointmentsByUserId() {
  //   this.upcomingAppointment = []
  //   this.loading = true
  //   this.providerService.getProviderUpcomingAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder, this.dynamicDateTime).subscribe(
  //     (data: any) => {
  //       if (data.items.length > 0) {

  //         this.roles = _.get(data, 'items');
  //         this.paginator = {
  //           ...this.paginator,
  //           pageNumber: _.get(data, 'pageNumber'),
  //           totalCount: _.get(data, 'totalCount'),
  //           totalPages: _.get(data, 'totalPages'),
  //         };
  //         this.upcomingAppointment = data.items
  //         if (data && data.items && Array.isArray(data.items)) {
  //           this.upcomingAppointment = data.items;
  //           this.filteredItems = [...this.upcomingAppointment];
  //         }
  //       }
  //       this.loading = false
  //       console.log("Upcoming Appointment data:", this.upcomingAppointment);
  //     },
  //     (error) => {
  //       this.loading = false
  //       console.error("Error fetching upcoming appointments:", error);
  //     }
  //   );
  // }

getUpcomingAppointmentsByUserId() {
  this.upcomingAppointment = [];
  this.loading = true;

  this.providerService.getProviderUpcomingAppointmentList(
    this.searchTerm,
    this.paginator.pageNumber,
    this.paginator.pageSize,
    this.sortColumn,
    this.sortOrder,
    this.dynamicDateTime
  ).subscribe(
    (data: any) => {
      if (data.items.length > 0) {
        // Add filePath and intakeFilePath for each item
        this.upcomingAppointment = data.items.map((item: any) => {
          return {
            ...item,
             filePath: item.consentFilePath
              ? environment.fileUrl + item.consentFilePath
              : null,
               intakeFilePath: item.intakeFilePath
              ? environment.fileUrl + item.intakeFilePath
              : null
          };
        });

        this.roles = this.upcomingAppointment;
        this.filteredItems = [...this.upcomingAppointment];

        this.paginator = {
          ...this.paginator,
          pageNumber: data.pageNumber,
          totalCount: data.totalCount,
          totalPages: data.totalPages,
        };
      }
      this.loading = false;
      console.log("Upcoming Appointment data:", this.upcomingAppointment);
    },
    (error) => {
      this.loading = false;
      console.error("Error fetching upcoming appointments:", error);
    }
  );
}


  getPastAppointmentsByUserId() {
    ;
    this.pastAppointment = []
    this.loading = true
    this.providerService.getProviderPastAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder, this.dynamicDateTime).subscribe(
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
            this.pastAppointment = data.items;
            this.filteredItems = [...this.pastAppointment];
          }
        }
        this.loading = false
        console.log("Upcoming Appointment data:", this.pastAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }

  getCancelledAppointmentsByUserId() {
    this.cancelledAppointment = []
    this.loading = true
    this.providerService.getProviderCancelledAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {

        if (data.items.length > 0) {

          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.cancelledAppointment = this.cancelledAppointment
          if (data && data.items && Array.isArray(data.items)) {
            this.cancelledAppointment = data.items;
            this.filteredItems = [...this.cancelledAppointment];
          }
        }
        this.loading = false
        console.log("Cancelled data:", this.cancelledAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching Cancelled appointments:", error);
      }
    );
  }
  viewPrescriptions(bookingId: any) {

  }
  viewSoapNotes(bookingId: any) {
    const modalRef = this.modalService.open(ViewsoapnotesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.bookingId = bookingId;
  }
  formatCategory(category: string): string {
    if (!category) return '';
    return category.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.menu-container')) {
      this.todayAppointment.forEach((item: any) => item.showMenu = false);
    }
  }


}
