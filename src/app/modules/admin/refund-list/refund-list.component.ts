import { AcceptRejectRefundComponent } from '../accept-reject-refund/accept-reject-refund.component';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { ProviderProfileComponent } from '../provider-profile/provider-profile.component';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.component.html',
  styleUrls: ['./refund-list.component.css']
})
export class RefundListComponent implements OnInit {
  constructor(private adminService: AdminService,
    private modalService: NgbModal,
    private router: Router,
    private notificationService: NotificationService
  ) { }
  ngOnInit() {
    this.getRefundList();
  }
  refundList = []
  loading: boolean = false
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
   _=_ ;
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

  hasMoreFeatures(item: any): boolean {
    return item.hasExtraFeatures; // Customize this condition based on your logic
}

  getRefundList() {
    this.loading = true
    this.refundList = []
    this.adminService.getRefundList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.refundList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.refundList = data.items;
          this.filteredItems = [...this.refundList];
        }
      }
      this.loading = false;
      this.refundList = data.items;
      console.log("refund list data", this.refundList)
    },
      (error) => {
        this.loading = false
        this.notificationService.showDanger(getErrorMessage(error));
      }
    );
  }
   viewProviderProfile(id: any, ) {
     
      const modalRef = this.modalService.open(ProviderProfileComponent, {
        backdrop: 'static',
        size: 'lg',
        centered: true
      });
      modalRef.componentInstance.providerId = id;
      // modalRef.componentInstance.bookAppointmentId = bookingId;
     modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getRefundList();
    });     
   }

  redirectToMessage(id:any) {
   
    this.router.navigate(['/admin/messages'],{ queryParams: { userId: id } });
  }

  viewProfile(id: any) {
    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.patientId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getRefundList();
    });
  }
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getRefundList();
  }
  showDetails(id: any) {
    const modalRef = this.modalService.open(AcceptRejectRefundComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.appointmentDataId = id;
    modalRef.result.then(
      (result) => {
       this.getRefundList();
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }
  
}
