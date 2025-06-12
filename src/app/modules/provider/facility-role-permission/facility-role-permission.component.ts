import { Component, ErrorHandler, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { FacilityRolePermissionPopupComponent } from '../facility-role-permission-popup/facility-role-permission-popup.component';

@Component({
  selector: 'app-facility-role-permission',
  templateUrl: './facility-role-permission.component.html',
  styleUrls: ['./facility-role-permission.component.css']
})
export class FacilityRolePermissionComponent {
  userId: any;
  constructor(private adminService: AdminService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private authService: AuthService
  ) { }
  ngOnInit() {
    this.roleForm = this.fb.group({
      id: ['0'],
      roleName: ['', [Validators.required, Validators.pattern(/\S+/)]],
      description: ['', [Validators.required, Validators.pattern(/\S+/)]],
    });
    this.getRoleList();

    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    console.log("this is local storage data:", userInfo)
  }
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  filteredItems: any[] = [];
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
  roleForm: FormGroup;
  loading: boolean = false;
  loading1: boolean = false;
  roleData: any;


  postRole() {


    if (this.roleForm.invalid) {
      this.notificationService.markFormGroupTouched(this.roleForm);
      return;
    }
    this.loading1 = true;
    const userInfo = this.authService.getUserInfo();

    const obj = {
      roleName: this.roleForm.value.roleName,
      description: this.roleForm.value.description,
      id: this.roleForm.value.id,
      roleType: userInfo.accountType,
      userId: userInfo.userId,
      clinicId: userInfo.userId,
    }

    this.adminService.addRoleManagement(obj).subscribe((data) => {
      if (this.roleForm.value.id == 0) {
        this.notificationService.showSuccess("Role added successfully");
      }
      else {
        this.notificationService.showSuccess("Role Updated successfully");
      }
      this.roleForm.reset();
      this.getRoleList();
      this.loading1 = false;
    }, (error) => {
      this.loading1 = false;
      this.notificationService.showDanger(error.error.exception);
    });
  }

  expanded = false;

  getShortText(text: string): string {
    if (!text) return '';
    let words = text.split(' ');
    return words.length > 8 ? words.slice(0, 8).join(' ') + '...' : text;
  }


  expandedItems: { [key: string]: boolean } = {}; // Store expanded state per item

  shouldShowToggle(text: string): boolean {
    return text && text.split(' ').length > 8; // Only show toggle if more than 7 words
  }

  toggleExpand(event: Event, itemId: string): void {
    event.preventDefault(); // Prevent page reload
    this.expandedItems[itemId] = !this.expandedItems[itemId]; // Toggle for the specific item
  }



  getRoleList() {
    this.adminService.getFacilityRoleList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.roleData = data.items
      this.roles = _.get(data, 'items');
      this.paginator = {
        ...this.paginator,
        pageNumber: _.get(data, 'pageNumber'),
        totalCount: _.get(data, 'totalCount'),
        totalPages: _.get(data, 'totalPages'),
      };
      this.roleData = data.items
      if (data && data.items && Array.isArray(data.items)) {
        this.roleData = data.items;
        console.log(this.roleData);
        const status = this.roleData[0].status;
        console.log(status);
        // this.statusForm.get('selectedStatus').setValue(status);
        this.filteredItems = [...this.roleData];

      }
      console.log(this.roleData);
    }, (error) => {
      this.notificationService.showDanger(error);
    });
  }
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getRoleList();
  }
  toggleStatus(Id: any, status: boolean) {
    const toggledStatus = !status;
    const active = {
      status: toggledStatus
    }
    console.log(active)
    this.adminService.updateStatus(Id, active).subscribe((resposne) => {
      this.notificationService.showSuccess("Role Status updated successfully");
      this.getRoleList();
    })
  }
  getRoleById(id) {
    // ✅ Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.adminService.getRoleById(id).subscribe((data) => {
      this.roleForm.patchValue(data);
    })
  }
  deleteRole(id) {
    this.adminService.deleteRole(id).subscribe((data) => {
      this.notificationService.showSuccess("Role deleted successfully");
      this.getRoleList();
    })
  }
  filterItems() {
    this.getRoleList();
  }
  permissionPopup(roleId) {
    const modalRef = this.modalService.open(FacilityRolePermissionPopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.roleId = roleId;
  }

  deleteItem(id: any) {

  }

}
