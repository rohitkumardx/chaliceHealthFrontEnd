import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';

@Component({
  selector: 'app-facility-user-list',
  templateUrl: './facility-user-list.component.html',
  styleUrls: ['./facility-user-list.component.css']
})
export class FacilityUserListComponent implements OnInit {
   userList = []
  
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
      private modalService: NgbModal,
      private router: Router,
      private notificationService: NotificationService
    ) { }
  
    ngOnInit() {
      this.getUserList()
    }
  
    getUserList() {
      this.loading = true
      this.userList = []
      this.adminService.getFacilityUserList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.userList = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.userList = data.items;
            this.filteredItems = [...this.userList];
          }
        }
        this.loading = false
        this.userList = data.items
        console.log(this.userList)
      },
        (error) => {
          this.loading = false
          console.error("Error fetching upcoming appointments:", error);
        }
      );
    }
  
    addUser(){
      this.router.navigate(['/provider/add-user']);
    }
    
    editUser(id:any){
      this.router.navigate(['/provider/add-user'], { queryParams: { userId: id } });
    }
  
    toggleStatus(id: any, isActive: boolean) {
      const toggledStatus = !isActive;
      const obj = {
        isActive: toggledStatus
      }
      this.adminService.updateUserStatus(id,obj).subscribe((resposne) => {
        this.notificationService.showSuccess("Status updated successfully");
        this.getUserList();
      })
    }

}
