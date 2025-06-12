import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { NotificationViewDetailPopupComponent } from '../notification-view-detail-popup/notification-view-detail-popup.component';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';



@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {

  notificationListData = []
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
    private notificationService: NotificationService,
    private modalService: NgbModal,
  ) { }



  ngOnInit() {
    this.getNotification()
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  
getRead(){
  this.providerService.getNotificationList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize).subscribe((data: any) => {
    this.notificationListData = data.items
  }
)
}

viewProfile(id: any) {
  const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
    backdrop: 'static',
    size: 'xl',
    centered: true,
    windowClass: 'custom-modal'
  });
  modalRef.componentInstance.patientId = id;
  modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getNotification();
  });
}
  getNotification() {
    this.notificationListData = []
    // this.loading = true;
    this.providerService.getNotificationList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize).subscribe((data: any) => {
      if (data.items.length > 0) {
     
        this.notificationListData = data.items;
        console.log("notification list :", this.notificationListData)
        this.loading = false;
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
       
       
        if (data && data.items && Array.isArray(data.items)) {
          this.notificationListData = data.items;
          this.filteredItems = [...this.notificationListData];
        }
      }
    
    },
      (error) => {
        this.loading = false
        console.error("Error fetching upcoming appointments:", error);
      }
    );
  }

  ViewDetails(id: any) {
    const modalRef = this.modalService.open(NotificationViewDetailPopupComponent, {
      size: 'md',
      centered: true,
     
    });

    modalRef.componentInstance.notificationId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getNotification();
    });
  }

  markAsRead(id: any) {
    const obj = {
      id: id,
      isProviderRead: true
    }
    this.providerService.markReadNotification(obj).subscribe((response: any) => {
      this.notificationService.emitNotificationUpdate();
      
     this.getRead()
    })
  }

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
}
