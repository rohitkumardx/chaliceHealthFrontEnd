import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageComponent } from '../message/message.component';
import { ViewReportComponent } from '../view-report/view-report.component';
import { AuthService } from 'src/app/Services/auth.service';
import { AppointmentsViewComponent } from '../appointments-view/appointments-view.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {



  patientList = []
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
    this.getPatientList()
  }


  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getPatientList();
 
  }

  viewAppointments(id: any) {
    const modalRef = this.modalService.open(AppointmentsViewComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.userId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getPatientList();
    });
  }
  getPatientList() {
    this.loading = true
    this.patientList = []
    this.adminService.getPatientList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {

      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.patientList = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.patientList = data.items;
          this.filteredItems = [...this.patientList];
        }
      }
      this.loading = false
      this.patientList = data.items
      console.log(this.patientList)
    },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }



  toggleStatus(id: any, isActive: boolean) {
    
    const toggledStatus = !isActive;
    const obj = {
      userId: id,
      isActive: toggledStatus
    }
    this.adminService.updatePatientStatus(obj).subscribe((resposne) => {
      this.notificationService.showSuccess("Status updated successfully");
      this.getPatientList();
    })
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
      this.getPatientList();
    });
  }

 
  redirectToMessage(id:any) {
    
    this.router.navigate(['/admin/messages'],{ queryParams: { userId: id } });
  }

  
  viewReport(reportId: any) {
    const modalRef = this.modalService.open(ViewReportComponent, {
      backdrop: 'static',
      size: 'sm',
      centered: true,
      windowClass: 'custom-modal'
    });
    modalRef.componentInstance.userId = reportId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getPatientList();
    });
  }
}
