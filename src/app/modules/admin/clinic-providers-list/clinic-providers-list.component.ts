import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderReportViewComponent } from '../provider-report-view/provider-report-view.component';
import { ProviderAppointmentsViewComponent } from '../provider-appointments-view/provider-appointments-view.component';
import { Subscription } from 'rxjs';
import { ProviderProfileComponent } from '../../provider/provider-profile/provider-profile.component';


@Component({
  selector: 'app-clinic-providers-list',
  templateUrl: './clinic-providers-list.component.html',
  styleUrls: ['./clinic-providers-list.component.css']
})
export class ClinicProvidersListComponent implements OnInit {
  userInfo: any;
  providerList = [];
  userId: any

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

  private notifyCloseSubscription: Subscription;

  constructor(private router: Router,
    private adminService: AdminService,
    private modalService: NgbModal,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()

    this.userId = localStorage.getItem('ClinicId')
    this.getClinicProvidersList()


  }

goBack() {
  window.history.back();
}

  getClinicProvidersList() {
    this.providerList = []
    this.loading = true
    this.adminService.getClinicProviders(this.userId, this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.providerList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.providerList = data.items;
          this.filteredItems = [...this.providerList];
        }
      }
      this.loading = false
      this.providerList = data.items
      console.log("clinic providers data", this.providerList)
    },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }

  viewReport(reportId: any) {
    const modalRef = this.modalService.open(ProviderReportViewComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true,
      windowClass: 'custom-modal'
    });
    modalRef.componentInstance.userId = reportId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getClinicProvidersList();
    });
  }

  redirectToMessage(id: any) {
    ;
    this.router.navigate(['/admin/messages'], { queryParams: { userId: id } });
  }

  toggleStatus(id: any, isActive: boolean) {
    const toggledStatus = !isActive;
    const obj = {
      userId: id,
      isActive: toggledStatus
    }
    this.adminService.updateProviderStatus(obj).subscribe((resposne) => {
      this.notificationService.showSuccess("Status updated successfully");
      this.getClinicProvidersList();
    })
  }


  onStatusChange(event: Event, id: any) {
    this.providerList = []
    this.loading = true
    const selectedValue = (event.target as HTMLSelectElement).value;
    const obj = {
      credentialStatus: selectedValue,
      userId: id
    }
    this.adminService.updateProfileStatus(obj).subscribe((response: any) => {
      this.notificationService.showSuccess("Profile status updated successfully.");
      this.getClinicProvidersList();
    })

  }

  viewAppointments(id: any) {

    const modalRef = this.modalService.open(ProviderAppointmentsViewComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.userId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getClinicProvidersList();
    });
  }


  viewProfile(id: any) {
    localStorage.setItem('NewProviderId', id)
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    // modalRef.componentInstance.dialogClosed.subscribe(() => {
    //   this.getAllProviderList();
    // });

    this.notifyCloseSubscription = this.adminService.notifyClose.subscribe(() => {
      this.getClinicProvidersList();
    });
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }


    this.getClinicProvidersList();


  }
}
