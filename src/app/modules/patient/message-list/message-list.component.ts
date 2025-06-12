import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { AdminService } from 'src/app/Services/admin.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClinicProfileComponent } from '../../admin/clinic-profile/clinic-profile.component';
import { PatientMessageComplaintComponent } from '../patient-message-complaint/patient-message-complaint.component';
import { SignalRService } from 'src/app/Services/signalr.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {
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


  messagesList = []
  private messageSubscription: Subscription | undefined;
  constructor(private providerService: ProviderService,
    private router: Router,
    private adminService: AdminService,
    private modalService: NgbModal,
     private signalRService: SignalRService

  ) { }
  ngOnInit() {
    // 
    this.messageSubscription = this.signalRService.messageCount$.subscribe(
      (newMessage) => {
        // this.getMessageList();
        this.getGroupMessageList();
      }
    );
    
    if (this.activeTabIndex !== undefined) {
      this.selectedTabIndex = this.activeTabIndex;  // Set back to the previous tab
    }
    this.getMessageList();
    this.getGroupMessageList();
  }
 

  viewClinicProfile(id: any) {
    const modalRef = this.modalService.open(ClinicProfileComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.userId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
     this.getMessageList();
    });
  }
  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.state) return item?.state || '';

    // Extract country (assuming the last part after the last comma is the country)
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];

    return `${item.state}, ${country}`;
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
  groupList: any;
  selectedTabIndex = 0;                                                       
  onTabChange(event: any): void {
    const selectedTabIndex = event.index; // Get the index of the selected tab
    const selectedTabLabel = event.tab.textLabel; // Get the label of the selected tab
    if (selectedTabLabel === 'Group Messages') {
      //   this.providerService.getGroupList().subscribe((response: any) => {
      //     this.groupList =response;
      //   },
      //  (error)=>{
      //   console.error("Error grtting List:", error);
      //  });
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
 

  activeTabIndex: number;
  viewGroupChat(providerGroupId, userId: any,) {
    // this.activeTabIndex = this.selectedTabIndex;
    // this.getGroupMessageList();
    this.router.navigate(["/patient/group-message"], { queryParams: { userId: userId, providerGroupId: providerGroupId, } });
    this.getGroupMessageList();
  }
  shouldShowReadMore(item: any): boolean {
    return item.messageContent.length > 50; // Adjust character limit as needed
  }
  toggleReadMore(item: any) {
    item.expanded = !item.expanded;
  }
  getAdminIdByUser() {
    this.adminService.getAdminIdByUser().subscribe((response: any) => {
      this.userId = response.adminMessageId;
      console.log("myId", this.userId);
      this.router.navigate(['/patient/message'], { queryParams: { userId: this.userId } });
    });
  }
  viewProviderProfile(id: any, bookingId: any) {
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
    modalRef.componentInstance.bookingId = bookingId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getMessageList();
    });

  }
  viewMessageComplaint(patientId: any, providerId: any) {
    const modalRef = this.modalService.open(PatientMessageComplaintComponent, {
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

  getMessageList() {
    this.loading = true;
    this.providerService.getMessageListByUserId(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((response: any) => {
      this.loading = false;
      this.messagesList = response.items;

      console.log('this is message list', response.items);
      this.paginator = {
        ...this.paginator,
        pageNumber: _.get(response, 'pageNumber'),
        totalCount: _.get(response, 'totalCount'),
        totalPages: _.get(response, 'totalPages'),
      };

      this.messagesList.forEach((item: any) => {
        if (item.profilePicturePath) {
          item.profilePicturePath = environment.fileUrl + item.profilePicturePath;
        } else {
          item.profilePicturePath = undefined;
        }

      })
      console.log(this.messagesList)
    })
  }

  viewChat(userId: any, id: any) {
    ;
    this.activeTabIndex = this.selectedTabIndex;
    // alert(id)
    this.router.navigate(["/patient/message"], { queryParams: { userId: userId, appointmentId: id } })
  }
}
