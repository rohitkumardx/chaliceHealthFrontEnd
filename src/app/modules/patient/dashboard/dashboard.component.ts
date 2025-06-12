import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';
import { AnnouncementPopupComponent } from '../announcement-popup/announcement-popup.component';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';
import { CancelAppointmentModelComponent } from '../cancel-appointment-model/cancel-appointment-model.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { NotificationService } from 'src/app/Services/notification.service';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  upcomingAppointment: any[] = [];
  userInfo: any;
  loading: boolean = false
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  dynamicDateTime: any;
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

  patientData: any
  announcementData = []

  constructor(private authService: AuthService,
    private patientService: PatientService,
    private modalService: NgbModal,
    private router: Router,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    this.dynamicDateTime = this.adminService.getDate();
    this.getPatientDashboardData()
    this.getUpcomingAppointmentsByUserId();
    this.getAnnouncement()
  }

  downloadConsentDocument(bookingId: any) {
    this.patientService.getPatientDocument(bookingId, 'ConsentForm').subscribe((data: any) => {
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
  @ViewChild('fileInput') fileInput: ElementRef;

  selectedShareConsentId: any;
  browseConsentDocument(shareConsentId) {
    this.selectedShareConsentId = shareConsentId;

    this.fileInput.nativeElement.click(); // Open file picker
  }

  @ViewChild('fileInput1') fileInput1: ElementRef;
  selectedShareIntakeId: any;
  browseIntakeDocument(shareIntakeId) {
    // alert(shareIntakeId)
    this.selectedShareIntakeId = shareIntakeId;
    this.fileInput1.nativeElement.click(); // Open file picker
  }


  onFileSelected(event: any, _unused: string, index: any) {
    // alert(index)
    const file = event.target.files[0]; // Get selected file
    if (file) {
      console.log("Selected file:", file);
      this.userInfo = this.authService.getUserInfo(); // Ensure userInfo is fetched
      this.uploadDocument(file, this.userInfo.userId, this.selectedShareConsentId); // Pass userId instead of patientId
    }
  }

  onFileSelected1(event: any, _unused: string, index: any) {
    // alert(index)
    const file = event.target.files[0]; // Get selected file
    if (file) {
      console.log("Selected file:", file);
      this.userInfo = this.authService.getUserInfo(); // Ensure userInfo is fetched
      this.uploadDocument(file, this.userInfo.userId, this.selectedShareIntakeId); // Pass userId instead of patientId
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

  downloadIntakeDocument(bookingId: any) {
    this.patientService.getPatientDocument(bookingId, 'IntakeForm').subscribe((data: any) => {
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

  rescheduleAppointment(bookingId: any, id: any, meetingType: any) {
    this.router.navigate(['/patient/view-profile'], { queryParams: { appointmentId: bookingId, providerProfileId: id, meetingType: meetingType } });

  }

  followUp(id: any) {
    this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
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



  showDetails(id: any) {
    const modalRef = this.modalService.open(CancelAppointmentModelComponent, {
      size: 'md',
      centered: true,
    });
    modalRef.componentInstance.appointmentDataId = id;
    modalRef.result.then(
      (result) => {
        this.getUpcomingAppointmentsByUserId();

      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }


  getAnnouncement() {
    this.patientService.getAnnouncementByUserId(this.userInfo.userId).subscribe((response: any) => {
      this.announcementData = response.items
    })
  }
  formatServiceType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  getPatientDashboardData() {
    this.patientService.getDashboardData(this.userInfo.userId).subscribe((response: any) => {

      if (response.profilePictureName != undefined) {
        response.profilePicturePath = environment.fileUrl + response.profilePicturePath
      }
      this.patientData = response
    })
  }

  viewProviderProfile(id: any, bookingId: any) {

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


  getUpcomingAppointmentsByUserId() {
    this.upcomingAppointment = []
    this.loading = true
    this.patientService.getPatientUpcomingAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder, this.dynamicDateTime).subscribe(
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
        this.loading = false;
        console.log("Upcoming Appointment dashboard data:", this.upcomingAppointment);
      },
      (error) => {
        this.loading = false;
        console.error("Error fetching upcoming dashboard appointments:", error);
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

    this.getUpcomingAppointmentsByUserId();
  }

  viewAnnouncement(item: any) {
    const modalRef = this.modalService.open(AnnouncementPopupComponent, {
      size: 'md',
      centered: true,

    });

    modalRef.componentInstance.announcementData = item;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getAnnouncement();
    });
  }

  formatDateWithAge(dateOfBirth: string): string {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const formattedDob = `${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob
      .getDate()
      .toString()
      .padStart(2, '0')}-${dob.getFullYear()}`;

    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    const dayDifference = today.getDate() - dob.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    return `${formattedDob} (${age} yrs)`;
  }

  sendMessage(bookingId: any, providerId: any) {
    this.router.navigate(['/patient/message'], { queryParams: { appointmentId: bookingId, providerId: providerId } });
  }

  // viewChat(userId:any,id :any){
  //   this.activeTabIndex = this.selectedTabIndex;
  //   this.router.navigate(["/patient/message"] ,{ queryParams: { userId: userId ,appointmentId :id} })
  // }

}
