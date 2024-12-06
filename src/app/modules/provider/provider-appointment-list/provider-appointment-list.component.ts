import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReportAppointmentComponent } from '../report-appointment/report-appointment.component';
import { ProviderService } from 'src/app/Services/provider.service';
import * as _ from 'lodash';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { ViewsoapnotesComponent } from '../../patient/viewsoapnotes/viewsoapnotes.component';





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
  receivedData: any
  loading: boolean = false

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
    private notificationService: NotificationService

  ) { }



  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()
    debugger
    this.getTodayAppointmentsByUserId();

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
  sendMessage(bookingId: any) {
    debugger
    this.router.navigate(['/provider/message'], { queryParams: { appointmentId: bookingId } });
  }


  joinCall(bookingId: any, time: string, meetingType: any, duration: any) {
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
        queryParams: { appointmentId: bookingId, request: meetingType, serviceDuration: duration }
      });
    } else if (elapsedTime <= tenMinutesInMillis && elapsedTime > 0) {
      // Allow joining up to 10 minutes after the start time
      this.router.navigate(['/call/join-call'], {
        queryParams: { appointmentId: bookingId, request: meetingType, serviceDuration: duration }
      });
    } else {
      this.router.navigate(['/call/join-call'], {
        queryParams: { appointmentId: bookingId, request: meetingType, serviceDuration: duration }
      });

      this.notificationService.showDanger(
        "You can join the call 2 minutes before or up to 10 minutes after the scheduled time"
      );
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

  showPatientDashboard(id :any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal'
    });
    modalRef.componentInstance.bookingId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getTodayAppointmentsByUserId();
    });
  }

  getMeetingTypeIcon(meetingType: string): string {
    switch (meetingType) {
      case 'Virtual':
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


  getTodayAppointmentsByUserId() {
    this.todayAppointment = []
    this.loading = true
    this.providerService.getProviderTodayAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.loading = false
          this.todayAppointment = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.todayAppointment = data.items;
            this.filteredItems = [...this.todayAppointment];
          }
        }
        this.loading = false
      },
      (error) => {
        this.loading = false
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

  getUpcomingAppointmentsByUserId() {
    this.upcomingAppointment = []
    this.loading = true
    this.providerService.getProviderUpcomingAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
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
            this.upcomingAppointment = data.items;
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
    debugger;
    this.pastAppointment = []
    this.loading = true
    this.providerService.getProviderPastAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {
        debugger
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
        debugger
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
        console.log(" Cancelled data:", this.cancelledAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching Cancelled appointments:", error);
      }
    );
  }
  viewPrescriptions(bookingId : any){

  }
  viewSoapNotes(bookingId: any){
    const modalRef = this.modalService.open(ViewsoapnotesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.bookingId = bookingId;
  }

}
