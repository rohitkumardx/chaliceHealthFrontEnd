import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { ClinicService } from 'src/app/Services/clinic.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';

@Component({
  selector: 'app-clinic-provider-list',
  templateUrl: './clinic-provider-list.component.html',
  styleUrls: ['./clinic-provider-list.component.css']
})
export class ClinicProviderListComponent implements OnInit {

  providerList = []

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



  constructor(private router: Router,
    private clinicService: ClinicService,
    private modalService: NgbModal,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    localStorage.removeItem('NewProviderId')
    this.getClinicProvidersList()
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
      this.getClinicProvidersList();
    });
     
    }

  toggleStatus(Id: any, isVerified: boolean) {
    const toggledStatus = !isVerified;
    const active = {
      isVerified: toggledStatus
    }
    console.log(active)
    this.clinicService.updateClinicProfileStatus(Id, active).subscribe((resposne) => {
      this.notificationService.showSuccess("Status updated successfully");
      this.getClinicProvidersList();
    })
  }

  getClinicProvidersList() {
    this.providerList = []
    this.loading = true
    this.clinicService.getClinicProvidersList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      
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
      console.log("clinic provider data", this.providerList)
      this.loading = false
      this.providerList = data.items
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
    this.getClinicProvidersList();
  }


  // deleteDoctor(id : any){
  //   localStorage.setItem('NewProviderId',id)
  //   this.router.navigate(['/provider/dashboard']);
  // }

  deleteDoctor(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Provider'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getClinicProvidersList();
    });
  }

  editDoctor(id: any) {
    localStorage.setItem('NewProviderId', id)
    this.router.navigate(['/provider/dashboard']);
  }


  addProvider() {
    this.router.navigate(['/provider/dashboard']);
  }
}
