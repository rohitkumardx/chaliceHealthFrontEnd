import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ViewComplaintComponent } from '../view-complaint/view-complaint.component';
import { Router } from '@angular/router';
import { AcceptRejectRefundComponent } from '../accept-reject-refund/accept-reject-refund.component';
import { AppointmentRefundConfirmationComponent } from '../appointment-refund-confirmation/appointment-refund-confirmation.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-complaint-list',
  templateUrl: './complaint-list.component.html',
  styleUrls: ['./complaint-list.component.css']
})
export class ComplaintListComponent {
  complaintData: any;
  userId: any;
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
    private adminService: AdminService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private router: Router,
  ) { }


  ngOnInit() {
    this.getAdminComplaintList();
  }

  onStatusChange(event: Event, id: any, bookingId?) {
   
    this.complaintData = [];
    this.loading = true
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'Refund') {
      console.log('Selected status is refund');
      const obj={
        bookAppointmentId:bookingId
      }
      this.showDetails(bookingId,true);
    //   this.adminService.updateStatusForRefund(obj).subscribe((response: any) => {
    //     this.notificationService.showSuccess("Complaint status updated successfully.");
    //     this.getAdminComplaintList()
    //   },(error)=>{
    //     console.error("Error fetching complaint list:", error);
    //     this.getAdminComplaintList();
    //   }
    // );

    } else {
      const obj = {
        id: id,
        status: selectedValue
      }
      this.adminService.complaintStatus(obj).subscribe((response: any) => {
        this.notificationService.showSuccess("Complaint status updated successfully.");
        this.getAdminComplaintList()
      });
    }

  }
  redirectToMessage(id: any) {
   
    this.router.navigate(['/admin/messages'], { queryParams: { userId: id } });
  }

  getRead() {
   
    this.adminService.getAdminComplaintList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.complaintData = data.items
    });
  }

  // ViewDetails(complaintId: any) {
  //   const modalRef = this.modalService.open(ViewComplaintComponent, {
  //     size: 'md',
  //     centered: true,
  //     windowClass: 'custom-modal'
  //   });
  //   modalRef.componentInstance.complaintId = complaintId;
  //   modalRef.componentInstance.dialogClosed.subscribe(() => {
  //     this.getAdminComplaintList();
  //   });
  // }


  markAsRead(complaintId: any) {
   
    const obj = {
      complaintId: complaintId,
      isRead: true
    }
    this.adminService.markReadComplaints(obj).subscribe((response: any) => {
      this.notificationService.emitNotificationUpdate();
      this.getRead()
    })
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  getAdminComplaintList() {
    this.complaintData = [];
    this.loading = true;

    this.adminService.getAdminComplaintList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder)?.subscribe(
      (data: any) => {
        this.loading = false;
       
        if (data && data.items && Array.isArray(data.items)) {
          this.complaintData = data.items;
          this.filteredItems = [...this.complaintData];
        } else {
          this.complaintData = []; // Ensure it's an empty array if no data
        }

        this.roles = _.get(data, 'items', []);
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };

        console.log(this.complaintData);
      },
      (error) => {
        this.loading = false;
        this.complaintData = []; // Ensure no data is displayed on error
        this.notificationService.showDanger(getErrorMessage(error));
      }
    );
  }
  showDetails(id: any,showbtn?:boolean) {
    const modalRef = this.modalService.open(AppointmentRefundConfirmationComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.appointmentDataId = id;
    modalRef.componentInstance.buttonShow = showbtn;
    modalRef.result.then(
      (result) => {
        this.getAdminComplaintList();
      },
      (reason) => {
        console.log('Modal dismissed with reason:', reason);
      }
    );
  }

  // getAdminComplaintList(){
  //   this.complaintData = []

  //    this.loading = true;
  //   this.adminService.getAdminComplaintList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder)?.subscribe((data: any) => { 

  //           if (data.items.length > 0) {
  //             this.loading = false;
  //             this.roles = _.get(data, 'items');
  //             this.paginator = {
  //               ...this.paginator,
  //               pageNumber: _.get(data, 'pageNumber'),
  //               totalCount: _.get(data, 'totalCount'),
  //               totalPages: _.get(data, 'totalPages'),
  //             };
  //             this.complaintData = data.items
  //             if (data && data.items && Array.isArray(data.items)) {
  //               this.complaintData = data.items;
  //               this.filteredItems = [...this.complaintData];
  //             }
  //             else {
  //               this.complaintData = []; // Ensure it's an empty array if no data
  //             }
  //           }
  //           // this.loading = false
  //           this.complaintData = data.items;    
  //           console.log(this.complaintData)
  //         },
  //           (error) => {
  //             this.loading = false;
  //             this.complaintData = [];
  //             console.error("Error fetching complaint list:", error);
  //           }
  //         );
  // }


}
