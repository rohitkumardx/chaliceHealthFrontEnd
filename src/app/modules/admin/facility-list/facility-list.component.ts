import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ClinicProfileComponent } from '../clinic-profile/clinic-profile.component';

@Component({
  selector: 'app-facility-list',
  templateUrl: './facility-list.component.html',
  styleUrls: ['./facility-list.component.css']
})
export class FacilityListComponent implements OnInit {


  facilityList = []

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

  constructor(private router: Router,
    private adminService: AdminService,
    private modalService: NgbModal,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    localStorage.removeItem('ClinicId')
    this.getAllFacilityList()
  }


  getAllFacilityList() {
    this.facilityList = []
    this.loading = true
    this.adminService.getAllFacilities(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.facilityList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.facilityList = data.items;
          this.filteredItems = [...this.facilityList];
        }
      }
      this.loading = false
      this.facilityList = data.items
      console.log(this.facilityList)
    },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }

  viewProviders(id: any) {
    localStorage.setItem('ClinicId',id)
    this.router.navigate(['/admin/clinic-provider']);
  }

    viewClinicProfile(id: any) {
      const modalRef = this.modalService.open(ClinicProfileComponent, {
        backdrop: 'static',
        size: 'xl',
        centered: true,
        // windowClass: 'custom-modal'
      });
      modalRef.componentInstance.userId = id;
      modalRef.componentInstance.dialogClosed.subscribe(() => {
       this.getAllFacilityList();
      });
    }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getAllFacilityList();
  }

  toggleStatus(id: any, isActive: boolean) {
    
    const toggledStatus = !isActive;
    const obj = {
      userId: id,
      isActive: toggledStatus
    }
    this.adminService.updateClinicStatus(obj).subscribe((resposne) => {
      this.notificationService.showSuccess("Status updated successfully");
      this.getAllFacilityList();
    })
  }
}
