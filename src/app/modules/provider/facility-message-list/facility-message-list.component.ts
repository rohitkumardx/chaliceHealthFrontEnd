import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/Services/admin.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageComplaintComponent } from '../message-complaint/message-complaint.component';
import { AuthService } from 'src/app/Services/auth.service';
import { SignalRService } from 'src/app/Services/signalr.service';

@Component({
  selector: 'app-facility-message-list',
  templateUrl: './facility-message-list.component.html',
  styleUrls: ['./facility-message-list.component.css']
})
export class FacilityMessageListComponent implements OnInit {
  userId: any;
  typeOption: any = 1;
  loading: boolean = false;
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


  messagesList = [];
  userInfo: any;
  private messageSubscription: Subscription | undefined;

  constructor(private providerService: ProviderService,

    private router: Router,
    private adminService: AdminService,
    private modalService: NgbModal,
    private authService: AuthService,
    private signalRService : SignalRService
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    console.log("local storage data", this.userInfo);
    const data = JSON.parse(sessionStorage.getItem('selectedIndex')); 
    this.getMessageList();
    this.messageSubscription = this.providerService.messageCountUpdate$.subscribe(
      (newMessage) => {
      //  this.getMessageList()
      //   this.getGroupMessageList();
      }
    );
    this.messageSubscription = this.signalRService.messageCount$.subscribe(
      (newMessage) => {
        this.getMessageList();
        this.getGroupMessageList();
      }
    );
    this.getGroupMessageList();
  }
 
  

  calculateAge(dob: string | Date): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    // Adjust age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  viewMessageComplaint(patientId: any, providerId: any) {
    const modalRef = this.modalService.open(MessageComplaintComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.patientId = patientId;
    modalRef.componentInstance.providerId = providerId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getMessageList();
    });
  }
  getAdminIdByUser() {
   
    this.adminService.getAdminIdByUser().subscribe((response: any) => {
      this.userId = response.adminMessageId;
      console.log("myId", this.userId);
      this.router.navigate(['/provider/message'], { queryParams: { userId: this.userId } });
    });
  }
  groupList: any;
  selectedTabIndex = 0;
  onTabChange(event: any): void {
    const selectedTabIndex = event.index; // Get the index of the selected tab
    const selectedTabLabel = event.tab.textLabel; // Get the label of the selected tab
    if (selectedTabLabel === 'Group Messages') {
     this.getGroupMessageList();
    }
  }

  selectedAppointment: string = ''
  onMessageChange(event: any) {
    const selectedIndex = event.index;
    if (selectedIndex === 0) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Messages';
      this.getMessageList();  
    } else if (selectedIndex === 1) {
      this.paginator = {
        pageNumber: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 0
      };
      this.selectedAppointment = 'Group Messages';
      this.getGroupMessageList();  // Call the function to fetch upcoming appointments
    }
  }


  isLoading = true;


  getGroupMessageList() {
  this.isLoading = true;
  this.providerService.getGroupList(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((response: any) => {
    this.isLoading = false; // <- fix here
    this.groupList = response.items || []; // <- ensure fallback
    this.paginator = {
      ...this.paginator,
      pageNumber: _.get(response, 'pageNumber'),
      totalCount: _.get(response, 'totalCount'),
      totalPages: _.get(response, 'totalPages'),
    };
  });
}

 
  selectedStatus: string = 'All';
  setActiveStatus(status: string): void {
   
    this.typeOption = status; // Update typeOption first
    this.selectedStatus = status;
    if (status == "All") {
      this.getMessageList();
    }
    else {
      this.providerService.getMessageReadUnread(this.typeOption).subscribe({
        next: (data: any) => {
          this.messagesList = data.items;
          this.messagesList.forEach((item: any) => {
            if (item.profilePicturePath) {
              item.profilePicturePath = environment.fileUrl + item.profilePicturePath;
            } else {
              item.profilePicturePath = undefined;
            }
          });
        },
        error: (error) => {
          console.error("Error updating message status:", error);
        }
      });
    }

  }
  getMessageList() {
    this.messagesList = [];
    this.loading = true;
    this.providerService.getMessageListByUserId(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder
    ).subscribe(
      (data: any) => {
        this.loading = false;
       
        if (Array.isArray(data.items) && data.items.length > 0) {
          this.messagesList = data.items
          console.log('this is message list', data.items);
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.messagesList.forEach((item: any) => {
            if (item.profilePicturePath) {
              item.profilePicturePath = environment.fileUrl + item.profilePicturePath;
            } else {
              item.profilePicturePath = undefined;
            }
          });
        } else {
          this.messagesList = [];
        }
      },
      (error) => {
        this.loading = false;
        console.error("Error fetching messages:", error);
      }
    );
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
      this.getMessageList();
    });
  }
  viewChat(userId: any, id: any, clinicId) {
   
    this.router.navigate(["/provider/message"], { queryParams: { userId: userId, appointmentId: id, clinicId: clinicId } })
  }
  viewGroupChat(userId: any, providerGroupId) {
    this.router.navigate(["/provider/group-message"], { queryParams: { userId: userId, providerGroupId: providerGroupId } })
  }

}
