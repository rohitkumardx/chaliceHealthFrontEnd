import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClinicService } from 'src/app/Services/clinic.service';
import { NotificationService } from 'src/app/Services/notification.service';
@Component({
  selector: 'app-facility-role-permission-popup',
  templateUrl: './facility-role-permission-popup.component.html',
  styleUrls: ['./facility-role-permission-popup.component.css']
})
export class FacilityRolePermissionPopupComponent {
  constructor(
    private modalService: NgbModal,
    private activeModel: NgbActiveModal,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) { }
  @Input() roleId: number;
  loading: boolean = false;
  checkedId: any[] = [];
  sidebarItems: any[]; // List of sidebar permissions
  ngOnInit(): void {
    this.getPermission();
  }
  getPermission() {
    const type = this.authService.getUserInfo();

    this.adminService.getRolePermissionList(type.accountType).subscribe((data: any) => {
      this.sidebarItems = data.items;

      this.getRolePermissionByRoleId();
    });
  }
  modalClose() {
    this.activeModel.close();
  }
  onCheckboxChange(event: any, id: number) {
    const checked = event.target.checked;
    if (checked) {
      this.checkedId.push({
        permissionId: id
      });
    } else {
      this.checkedId = this.checkedId.filter(item => item.permissionId !== id);
    }
  }
  postRolePermission() {
    this.loading = true;
    const userInfo = this.authService.getUserInfo()

    const obj = {
      roleId: this.roleId,
      permissions: this.checkedId,
      userId: userInfo.userId
    };

    this.adminService.postRolePermission(obj).subscribe((data) => {
      this.notificationService.showSuccess("Role Permission added");
      this.loading = false;
      this.activeModel.close();
    });
  }
  anyCheckboxChecked(): boolean {
    return this.checkedId.length > 0;
  }
  getRolePermissionByRoleId() {
    this.adminService.getRolePermissionByRoleId(this.roleId).subscribe((data: any) => {

      this.sidebarItems.forEach((item: any) => {
        if (data.permissionIds.includes(item.id)) {
          item.isActive = true,
            this.checkedId.push({
              permissionId: item.id
            });
        }
      });
    });
  }

}
