import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {

  serviceForm: FormGroup

  serviceList = []

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



  constructor(private adminService: AdminService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private modalService: NgbModal
    // private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.serviceForm = this.fb.group({
      id: ['0'],
      name: ['', [Validators.required, Validators.pattern(/\S+/)]],
      serviceCategory: [''],
      description: [''],
    });

    this.getServiceList()
  }


  filterItems() {
    this.getServiceList();
  }

  deleteItem(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Service'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getServiceList();
    });
  }


  editItem(id: any) {
    // ✅ Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.adminService.getServiceById(id).subscribe((response: any) => {
      console.log('response', response)

      this.serviceForm.patchValue(response)
      console.log('value', this.serviceForm.value)
    })
  }



  addService() {
    this.loading = true;

    if (this.serviceForm.invalid) {
      this.notificationService.markFormGroupTouched(this.serviceForm);
      this.loading = false;
      return;
      
    }
    this.adminService.addUpdateService(this.serviceForm.value).subscribe((response: any) => {
      if (this.serviceForm.value.id == 0) {
        this.notificationService.showSuccess("Service added successfully.");
      } else {
        this.notificationService.showSuccess("Service updated successfully.");
      }
      this.loading = false;
      this.serviceForm.reset();
      this.getServiceList()
    },
      (error: any) => {
        console.error('Signup failed', error);
        this.loading = false;
        this.notificationService.showDanger(getErrorMessage(error));

        // this.notificationService.showDanger('Signup failed. Please try again.');
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
    this.getServiceList();
  }

  getServiceList() {
    this.serviceList = [];
    this.adminService.getServiceList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.serviceList = data.items
      this.roles = _.get(data, 'items');
      this.paginator = {
        ...this.paginator,
        pageNumber: _.get(data, 'pageNumber'),
        totalCount: _.get(data, 'totalCount'),
        totalPages: _.get(data, 'totalPages'),
      };
      this.serviceList = data.items
      if (data && data.items && Array.isArray(data.items)) {
        this.serviceList = data.items;
        console.log(this.serviceList);
        const status = this.serviceList[0].status;
        console.log(status);
        // this.statusForm.get('selectedStatus').setValue(status);
        this.filteredItems = [...this.serviceList];

      }
      console.log(this.serviceList);
    }, (error) => {
      this.notificationService.showDanger(getErrorMessage(error));
    });

  }


}
