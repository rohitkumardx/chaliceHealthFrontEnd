import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { AcceptRejectRefundComponent } from '../../admin/accept-reject-refund/accept-reject-refund.component';
import { ViewNotificationComponent } from '../../admin/view-notification/view-notification.component';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { environment } from 'src/environments/environment';
import { ProviderProfileComponent } from '../../provider/provider-profile/provider-profile.component';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { PatientService } from 'src/app/Services/patient.service';

@Component({
  selector: 'app-notification-alerts-blogs',
  templateUrl: './notification-alerts-blogs.component.html',
  styleUrls: ['./notification-alerts-blogs.component.css']
})
export class NotificationAlertsBlogsComponent implements OnInit {
  providerRequestList: any;
  appointmentCancellationCount: any;
  providerRequestCount: any;


  constructor(
    private adminService: AdminService,
    private modalService: NgbModal,
    private router: Router,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private authService: AuthService,
    private patientService: PatientService,
    private providerService: ProviderService

  ) { }

  ngOnInit() {
    this.getNotificationList();
    this.getAppointmentCancellationCount();
    this.getProviderRequestCount();

  }




  notificationList = []
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


  onSettingsChange(event: any) {
    const selectedIndex = event.index;
  }

  getNotificationList() {
    this.loading = true
    this.notificationList = []
    this.adminService.getNotificationsList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.notificationList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.notificationList = data.items;

          this.filteredItems = [...this.notificationList];
        }
      }
      this.loading = false
      this.notificationList = data.items;

      console.log(this.notificationList)
    },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }



  viewProfile(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal'
    });
    modalRef.componentInstance.patientId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getNotificationList();
    });
  }

  viewProviderProfile(id: any) {
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getNotificationList();
    });

  }


  showDetails(id: any, notificationId: any) {
    const modalRef = this.modalService.open(ViewNotificationComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.appointmentDataId = id;
    modalRef.result.then(
      (result) => {
        // Handle the result when the modal is closed (e.g., accept or reject)
        console.log('Modal closed with result:', result);
        // Perform the service call to mark the notification
        this.adminService.readUnreadNotificationById(id, notificationId).subscribe((response) => {
          this.notificationService.emitNotificationUpdate();
          this.getNotificationList();
          this.getAppointmentCancellationCount()
        });
      },
      (reason) => {
        // Handle modal dismissal (optional)
        console.log('Modal dismissed with reason:', reason);
      }
    );
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