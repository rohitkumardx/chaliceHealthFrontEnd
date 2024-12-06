import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewsoapnotesComponent } from '../viewsoapnotes/viewsoapnotes.component';

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
  userInfo : any;
  loading: boolean = false

  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
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



  constructor(
    private router: Router,
    private modalService: NgbModal,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
  ) { }


  ngOnInit(): void {


    this.userInfo = this.authService.getUserInfo()
    this.getTodayAppointmentsByUserId();

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
    this.patientService.getPatientTodayAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {
      debugger
        if (data.items.length > 0) {
          // this.todayAppointment = data.items.map((item: any) => {
          //   const [year, month, day] = item.date.split("-");
          //   const formattedDate = `${month}/${day}/${year}`;

          //   let [hours, minutes] = item.startTime.split(":").map(Number);
          //   const period = hours >= 12 ? "PM" : "AM";
          //   hours = hours % 12 || 12;
          //   const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;

          //   return {
          //     ...item,
          //     date: formattedDate,
          //     time: formattedTime
          //   };
          // });

          console.log('xsssss', this.todayAppointment);
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
        this.loading = false
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


  // getTodayAppointmentsByUserId() {
  //   this.todayAppointment = []
  //       this.patientService.getPatientTodayAppointmentList(this.userInfo.userId).subscribe(
  //     (data: any) => {
  //       this.todayAppointment = data;
  //       console.log("Today Appointment data:", this.todayAppointment);
  //     },
  //     (error) => {
  //       console.error("Error fetching today appointments:", error);
  //     }
  //   );
  // }

  
  
  getUpcomingAppointmentsByUserId() {
    debugger;
    this.upcomingAppointment = []
    this.loading = true
    this.patientService.getPatientUpcomingAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {
        debugger
        if (data.items.length > 0) {
         
          console.log('xsssss', this.upcomingAppointment );
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.upcomingAppointment = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.todayAppointment = this.upcomingAppointment;
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
    this.patientService.getPatientPastAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
      (data: any) => {
        debugger
        if (data.items.length > 0) {
         

          console.log('past appointment data', this.pastAppointment );
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


  // getPastAppointmentsByUserId() {
  //   this.pastAppointment= [];
  //   this.patientService.getPatientPastAppointmentList(this.userInfo.userId).subscribe(
  //     (data: any) => {
  //       this.pastAppointment = data;
  //       console.log("Past Appointment data:", this.pastAppointment);
  //     },
  //     (error) => {
  //       console.error("Error fetching past appointments:", error);
  //     }
  //   );
  // }

  getCancelledAppointmentsByUserId() {
    debugger;
    this.cancelledAppointment = []
    this.loading = true
    this.patientService.getPatientCancelledAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe(
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
          this.cancelledAppointment = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.todayAppointment = this.cancelledAppointment;
            this.filteredItems = [...this.cancelledAppointment];
          }
        }
        this.loading = false
        console.log("Upcoming Appointment data:", this.cancelledAppointment);
      },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
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

  sendMessage(bookingId: any) {
    this.router.navigate(['/patient/message'], { queryParams: { appointmentId: bookingId } });
  }

  viewSoapNotes(bookingId: any){
    const modalRef = this.modalService.open(ViewsoapnotesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.bookingId = bookingId;
  }
  joinCall(bookingId: any, time: string, meetingType: any) {
    const currentTime = new Date();
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const callTime = new Date(currentTime);
    callTime.setHours(hours, minutes, seconds, 0); // Set the time based on the passed time

    const timeDifference = callTime.getTime() - currentTime.getTime();
    const fiveMinutesInMillis = 5 * 60 * 1000;

    if (timeDifference <= fiveMinutesInMillis && timeDifference >= 0) {
      this.router.navigate(['/call/join-call'], { queryParams: { appointmentId: bookingId, request: meetingType } });
    } else {
      this.router.navigate(['/call/join-call'], { queryParams: { appointmentId: bookingId, request: meetingType } });
      this.notificationService.showDanger("You can join the call only within 5 minutes of the scheduled time.")
    }
  }


}
