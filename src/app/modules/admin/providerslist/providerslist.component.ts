import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { ClinicService } from 'src/app/Services/clinic.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderProfileComponent } from '../../provider/provider-profile/provider-profile.component';
import { ProviderDocumentsComponent } from '../../provider/provider-documents/provider-documents.component';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderReportViewComponent } from '../provider-report-view/provider-report-view.component';
import { ProviderAppointmentsViewComponent } from '../provider-appointments-view/provider-appointments-view.component';

@Component({
  selector: 'app-providerslist',
  templateUrl: './providerslist.component.html',
  styleUrls: ['./providerslist.component.css']
})
export class ProviderslistComponent {

  providerList = []

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

  userInfo: any
  userId:any
  isClinic = false

  private notifyCloseSubscription: Subscription;

  constructor(private router: Router,
    private adminService: AdminService,
    private modalService: NgbModal,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()
    if (localStorage.getItem('ClinicId')) {
      this.isClinic =  true
      this.userId = localStorage.getItem('ClinicId')
      this.getClinicProvidersList()
    }
    else {
      this.getAllProviderList()
    }

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
      this.getAllProviderList();
    });
  }

  getClinicProvidersList(){
     this.providerList = []
        this.loading = true
        this.adminService.getClinicProviders(this.userId,this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
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
          console.log("clinic providers data",this.providerList)
        },
          (error) => {
            this.loading = false
            console.error("Error fetching upcoming appointments:", error);
          }
        );
      }
  

  getAllProviderList() {
    this.providerList = []
    this.loading = true
    this.adminService.getAllProviders(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
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
      console.log(this.providerList)
    },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
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
    if(this.isClinic){
      this.getClinicProvidersList()
    }
    else {
      this.getAllProviderList();
    }
 
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

  toggleStatus1(id: any, isActive: boolean) {
    const toggledStatus = !isActive;
    const obj = {
      userId: id,
      isActive: toggledStatus
    }
    this.adminService.updateProviderStatus(obj).subscribe((resposne) => {
      this.notificationService.showSuccess("Status updated successfully");
   
      this.getAllProviderList();
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
      this.getAllProviderList()
    })

  }

  // deleteDoctor(id : any){
  //   localStorage.setItem('NewProviderId',id)
  //   this.router.navigate(['/provider/dashboard']);
  // }

  deleteDoctor(id: any) {
    // const modalRef = this.modalService.open(DeletePopupComponent, {
    //   backdrop: 'static',
    //   size: 'md',
    //   centered: true
    // });
    // modalRef.componentInstance.deletePropertyId = id
    // modalRef.componentInstance.deleteProperty = 'ClinicProvider'
    // modalRef.componentInstance.dialogClosed.subscribe(() => {
    //   this.getClinicProvidersList();
    // });
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
      this.getAllProviderList();
    });
  }

  editDoctor(id: any) {
    localStorage.setItem('NewProviderId', id)
    this.router.navigate(['/provider/dashboard']);
  }


  addProvider() {
    this.router.navigate(['/provider/dashboard']);
  }

  redirectToMessage(id:any) {
    ;
    this.router.navigate(['/admin/messages'],{ queryParams: { userId: id } });
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
        this.getAllProviderList();
      });
    }

}
