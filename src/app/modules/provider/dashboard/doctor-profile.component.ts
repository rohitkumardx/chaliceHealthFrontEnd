import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProviderProfileComponent } from '../provider-profile/provider-profile.component';
import { ContactDetailsComponent } from '../contact-details/contact-details.component';
import { ProviderMedicalLicenseInfoComponent } from '../provider-medical-license-info/provider-medical-license-info.component';
import { ProviderServicesComponent } from '../provider-services/provider-services.component';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderDocumentsComponent } from '../provider-documents/provider-documents.component';
import { ProviderService } from 'src/app/Services/provider.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { AnnouncementPopupComponent } from '../../patient/announcement-popup/announcement-popup.component';
import { PatientService } from 'src/app/Services/patient.service';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css']
})
export class dashboard implements OnInit {

  userInfo: any
  userId: any
  currentStep: any = 1
  clinicDoctorId: any;
  expiredDocument: any;
  dynamicDateTime: any;
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


  constructor(private modalService: NgbModal,
    private router: Router,
    private authService: AuthService,
    private adminService:AdminService,
    private patientService: PatientService,
    private providerService: ProviderService,
  ) { }
  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    this.dynamicDateTime=this.adminService.getDate();
    if (this.userInfo.accountType == "IndependentProvider") {
      this.userId = this.userInfo.userId
    }
    if (localStorage.getItem('NewProviderId')) {
      this.userId = localStorage.getItem('NewProviderId')
    }
    if (this.userInfo.accountType != "IndependentProvider" && !localStorage.getItem('NewProviderId')) {
      this.userId = this.userInfo.userId
    }
    this.getCredentialStatus()

    if (this.userInfo.credentialStatus == 'CompletedAndApproved') {
      this.getAnnouncement();
      this.getUpcomingAppointmentsByUserId();
      this.getExpiredDocuments();
    }
  }

  getExpiredDocuments() {
    this.providerService.getExpiredDocuments().subscribe((data: any) => {
      this.expiredDocument = data.expiredDocuments
      console.log("expired documents", this.expiredDocument)
    })

  }

  formatServiceType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  formatCategoryName(categoryName: string): string {
    return categoryName ? categoryName.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  getCredentialStatus() {
    this.providerService.getCredetialCompletedSteps(this.userId).subscribe((response: any) => {
      this.currentStep = response.stepNumber
    })
  }
  openProfilePopUp() {
    this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  openContactPopUp() {
    this.modalService.open(ContactDetailsComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  openMedicalPopUp() {
    this.modalService.open(ProviderMedicalLicenseInfoComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }

  openServicePopUp() {
    this.modalService.open(ProviderServicesComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }
  openDocumentPopUp() {
    this.modalService.open(ProviderDocumentsComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
  }


  nextStep(): void {
    if (this.currentStep == 1) {
      const modalRef = this.modalService.open(ProviderProfileComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.dialogClosed.subscribe((clinicDoctorId: any) => {
        this.clinicDoctorId = clinicDoctorId
        this.currentStep++;
      });
    }

    if (this.currentStep == 2) {
      const modalRef = this.modalService.open(ContactDetailsComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 3) {
      const modalRef = this.modalService.open(ProviderMedicalLicenseInfoComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 4) {
      const modalRef = this.modalService.open(ProviderServicesComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
      });
    }

    if (this.currentStep == 5) {
      const modalRef = this.modalService.open(ProviderDocumentsComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      // modalRef.componentInstance.unassignedData = obj
      modalRef.componentInstance.dialogClosed.subscribe(() => {
        this.currentStep++;
        if (!localStorage.getItem('enable-calendar')) {
          localStorage.setItem('enable-calendar', 'true');
          window.location.reload();
        } else {
          localStorage.removeItem('enable-calendar');
        }
      });
    }


  }


  goBack() {
    this.router.navigate(['/provider/clinic-provider-list']);
  }
  upcomingAppointment = []
  getUpcomingAppointmentsByUserId() {
    this.upcomingAppointment = []
    this.loading = true
    this.providerService.getProviderUpcomingAppointmentList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder,this.dynamicDateTime).subscribe(
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

  getAnnouncement() {
    this.patientService.getAnnouncementByUserId(this.userInfo.userId).subscribe((response: any) => {
      this.announcementData = response.items
    })
  }
  announcementData = []
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

  sortData(column: string) {

    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }

    this.getUpcomingAppointmentsByUserId();


  }
  showPatientDashboard(id: any) {
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
}