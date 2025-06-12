import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { PatientService } from 'src/app/Services/patient.service';
import { PatientClinicalDashboardComponent } from '../patient-clinical-dashboard/patient-clinical-dashboard.component';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';

@Component({
  selector: 'app-billing-payments',
  templateUrl: './billing-payments.component.html',
  styleUrls: ['./billing-payments.component.css']
})
export class BillingPaymentsComponent implements OnInit {
  settingData: any;
  loading: boolean = false;
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
  constructor(
    private patientService: PatientService,
    private modalService: NgbModal,


  ) { }


  ngOnInit() {
    this.getPatientSettingByUserId();
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getPatientSettingByUserId();
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
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
      this.getPatientSettingByUserId();
    });
  }
  viewProviderProfile(id: any,) {

    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
    // modalRef.componentInstance.bookAppointmentId = bookingId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getPatientSettingByUserId();
    });

  }

  getPatientSettingByUserId() {
    this.settingData = []

    this.loading = true;
    this.patientService.getPatientSettingByUserId(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder)?.subscribe((data: any) => {
      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.settingData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.settingData = data.items;
          this.filteredItems = [...this.settingData];
        }
      }
      this.loading = false
      this.settingData = data.items;
      console.log("payment history :", this.settingData)
    },
      (error) => {
        this.loading = false
        console.error("Error fetching complaint list:", error);
      }
    );

  }

}
