import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';

@Component({
  selector: 'app-login-logs',
  templateUrl: './login-logs.component.html',
  styleUrls: ['./login-logs.component.css']
})
export class LoginLogsComponent {
    loginLogs = []
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
  
  
    constructor(private adminService: AdminService,
      private modalService: NgbModal,
      private notificationService: NotificationService,
      private router: Router,
      private authService: AuthService
    ) { }
  
    ngOnInit() {
      // const userInfo = this.authService.getUserInfo()
      // this.userId = userInfo.userId
      this.getLoginLogs();
    }
  
  
    sortData(column: string) {
      if (this.sortColumn === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortColumn = column;
        this.sortOrder = 'asc';
      }
      this.getLoginLogs();   
    }
  

    getLoginLogs() {
      this.loading = true
      this.loginLogs = []
      this.adminService.getLoginLogs(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
  
        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.loginLogs = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.loginLogs = data.items;
            this.filteredItems = [...this.loginLogs];
          }
        }
        this.loading = false
        this.loginLogs = data.items
        console.log(this.loginLogs)
      },
        (error) => {
          this.loading = false
          console.error("Error fetching Login Logs:", error);
        }
      );
    }
  
 

}
