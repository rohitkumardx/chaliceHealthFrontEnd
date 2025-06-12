import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { ProviderService } from 'src/app/Services/provider.service';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { AuthService } from 'src/app/Services/auth.service';
import { Router } from '@angular/router';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit {

  patientListData:any = []
  
  userInfo:any;

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

  constructor(private providerService: ProviderService,
    private modalService: NgbModal,
    private authService: AuthService,
    private router : Router,
    private adminService : AdminService
  ) { }

  ngOnInit() {
    this.getPatientList()
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

  viewChat(userId:any,id :any){
    this.router.navigate(["/provider/message"] ,{ queryParams: { userId: userId ,appointmentId :id} })
  }

  viewFacilityChat(userId: any, id: any, clinicId) {
  
    this.router.navigate(["/provider/message"], { queryParams: { userId: userId, appointmentId: id, clinicId: clinicId } })
  }

  
  getPatientList() {
    this.loading = true;
    this.patientListData = [];
    this.userInfo = this.authService.getUserInfo();
  ;
    if (this.userInfo.accountType == 'IndependentProvider') {
     this.providerService.getPatientList(
        this.searchTerm,
        this.paginator.pageNumber,
        this.paginator.pageSize,
        this.sortColumn,
        this.sortOrder
      ).subscribe((data:any)=>{
        if (data?.items?.length > 0) {
          this.roles = _.get(data, 'items', []);
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.patientListData = data.items;
          console.log('hjhjhgjhdata',this.patientListData);
          this.filteredItems = [...this.patientListData];
        }
        console.log('data', this.patientListData);
        this.loading = false;
      }, (error) => {
        this.loading = false;
        console.error("Error fetching data:", error);
      });
    } else if (this.userInfo.accountType == 'PrivatePractices' || this.userInfo.accountType == 'Facility') {
     this.providerService.getSettingListByUserId(
        this.searchTerm,
        this.paginator.pageNumber,
        this.paginator.pageSize,
        this.sortColumn,
        this.sortOrder
      ) .subscribe(
        (data: any) => {
        ;
          if (data?.items?.length > 0) {
            this.roles = _.get(data, 'items', []);
            this.paginator = {
              ...this.paginator,
              pageNumber: _.get(data, 'pageNumber'),
              totalCount: _.get(data, 'totalCount'),
              totalPages: _.get(data, 'totalPages'),
            };
            this.patientListData = data.items;
            console.log('hjhjhgjhdata',this.patientListData);
            this.filteredItems = [...this.patientListData];
          }
          console.log('data', this.patientListData);
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error("Error fetching data:", error);
        }
      );
    } 
   
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
    this.getPatientList();
  });
   
  }


  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  

  // getPatientList() {
  //   this.loading = true
  //   this.patientListData = []
  //   this.providerService.getPatientList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
  //     if (data.items.length > 0) {
  //       this.roles = _.get(data, 'items');
  //       this.paginator = {
  //         ...this.paginator,
  //         pageNumber: _.get(data, 'pageNumber'),
  //         totalCount: _.get(data, 'totalCount'),
  //         totalPages: _.get(data, 'totalPages'),
  //       };
  //       this.patientListData = data.items
  //       if (data && data.items && Array.isArray(data.items)) {
  //         this.patientListData = data.items;
  //         this.filteredItems = [...this.patientListData];
  //       }
  //     }
  //     console.log('data', this.patientListData)
  //     this.loading = false
  //     this.patientListData = data.items
  //   },
  //     (error) => {
  //       this.loading = false
  //       console.error("Error fetching upcoming appointments:", error);
  //     }
  //   );
  // }

  formatDateWithAge(dateOfBirth: string): string {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const formattedDob = `${(dob.getMonth() + 1).toString().padStart(2, '0')}-${dob
      .getDate()
      .toString()
      .padStart(2, '0')}-${dob.getFullYear()}`;

    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    const dayDifference = today.getDate() - dob.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }
    return `${formattedDob} (${age} yrs)`;
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


}
