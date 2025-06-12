import { NotificationService } from 'src/app/Services/notification.service';
import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';
import { AdminService } from 'src/app/Services/admin.service';
import { forkJoin } from 'rxjs';

enum userPermission{
  Dashboard = 2,
  CancelRequests = 3,
  Notifications = 4,
  PatientManagement = 5,
  ProviderManagement = 6,
  FacilityManagement = 7,
  UserManagement = 8,
  RoleManagement = 9,
  ServiceManagement = 10,
  TransactionHistory = 11,
  Documents = 12,
  Announcements = 14,
  ReportedMessage =  15,
  ComplaintsList = 16,
  Settings = 17,
  LoginLogs = 30,
  Blog = 31,
  Conditions = 32 
  }


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit{

  userInfo: any;
  credentialSteps: any
  openSubmenus = {
    dashboard: false,
    plan: false,
    appointment: false
  };

  isDisabled: boolean = false
  newMessages: any
  notificationCount:any;
  Dashboard:boolean=true;
  CancelRequests :boolean=true;
  Notifications:boolean=true;
  PatientManagement:boolean=true;
  ProviderManagement:boolean=true;
  FacilityManagement:boolean=true;
  UserManagement:boolean=true;
  RoleManagement:boolean=true;
  ServiceManagement :boolean=true;
  TransactionHistory :boolean=true;
  Documents : boolean= true;
  Announcements : boolean = true;
  ReportedMessage :boolean=true;
  ComplaintsList : boolean= true;
  Settings : boolean = true;
  LoginLogs: boolean = true;
  Blog: boolean = true;
  Conditions: boolean =  true;
  complaintMessages: any;
  reportedMessages: any;
  providerRequestCount:any;
  combinedResponse:any;



  isSidebarCollapsed = false;
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private authService: AuthService,
    private providerService: ProviderService,
    private signalRService: SignalRService,
    private notificationService:NotificationService,
    private adminService : AdminService
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    if (this.userInfo.credentialStatus == 'Pending') {
      this.isDisabled == true
    }
    this.getNewComplaintCount();
    this.getNewRequestCount();
    this.getReportedMessageCount();
    this.updateSidebar();
    this.notificationService.notificationUpdate$.subscribe(() => {
    this.getNewRequestCount();
    this.getNewComplaintCount();
    this.getReportedMessageCount();

    });
   
  }

  // @HostListener('window:beforeunload', ['$event'])
  // unloadNotification($event: any): void {
  //   this.handleBeforeUnload();
  //   //$event.returnValue = 'Are you sure you want to leave?'; 
  // }
  // handleBeforeUnload(): void {
  //   this.logout();
  // }

  getNewRequestCount() {
    forkJoin({
      notificationCount: this.providerService.getRequestNotificationCount(),
      providerRequestCount: this.providerService.getNewProviderRequest()
    }).subscribe((response: any) => {
      this.notificationCount = response.notificationCount.count;
      this.providerRequestCount = response.providerRequestCount.count;
      
      this.combinedResponse = this.notificationCount + this.providerRequestCount;
      console.log("combined data :", this.combinedResponse);
    });
  }
  

  isFacilityManagementActive(): boolean {
    return this.router.url.includes('/admin/facility-list') || this.router.url.includes('/admin/clinic-provider');
  }


  getNewProviderRequest(){
    this.providerService.getNewProviderRequest().subscribe((response : any)=>{
      this.providerRequestCount = response.count
    })

  }


  getReportedMessageCount() {
    this.adminService.getReportedMessageCount().subscribe((response: any) => {
      this.reportedMessages = response.count
    })
  }

  
  getNewComplaintCount() {
    this.adminService.getComplaintMessageCount().subscribe((response: any) => {
      this.complaintMessages = response.count
    })
  }
   

    updateSidebar() {
      var userInfo = this.authService.getUserInfo();
      if (userInfo.type == "AdminStaff") {
     
        if (!userInfo.permissionIds.includes(userPermission.Dashboard)) {
          this.Dashboard = false
        }
        if (!userInfo.permissionIds.includes(userPermission.CancelRequests)) {
          this.CancelRequests = false
        }
        if (!userInfo.permissionIds.includes(userPermission.Notifications)) {
          this.Notifications = false
        }
        if (!userInfo.permissionIds.includes(userPermission.LoginLogs)) {
          this.LoginLogs = false
        }
        if (!userInfo.permissionIds.includes(userPermission.PatientManagement)) {
          this.PatientManagement = false
        }
        if (!userInfo.permissionIds.includes(userPermission.ProviderManagement)) {
          this.ProviderManagement = false
        }
        if (!userInfo.permissionIds.includes(userPermission.FacilityManagement)) {
          this.FacilityManagement = false
        }
        if (!userInfo.permissionIds.includes(userPermission.UserManagement)) {
          this.UserManagement = false
        }
        if (!userInfo.permissionIds.includes(userPermission.RoleManagement)) {
          this.RoleManagement = false
        }
        if (!userInfo.permissionIds.includes(userPermission.ServiceManagement)) {
          this.ServiceManagement = false
        }
        if (!userInfo.permissionIds.includes(userPermission.TransactionHistory)) {
          this.TransactionHistory = false
        }
        if (!userInfo.permissionIds.includes(userPermission.Documents)) {
          this.Documents = false
        }
        
        if (!userInfo.permissionIds.includes(userPermission.Announcements)) {
          this.Announcements = false
        }
        if (!userInfo.permissionIds.includes(userPermission.ReportedMessage)) {
          this.ReportedMessage = false
        }
        if (!userInfo.permissionIds.includes(userPermission.ComplaintsList)) {
          this.ComplaintsList = false
        }
        if (!userInfo.permissionIds.includes(userPermission.Settings)) {
          this.Settings = false
        }
        if (!userInfo.permissionIds.includes(userPermission.Blog)) {
          this.Blog = false
        }
         if (!userInfo.permissionIds.includes(userPermission.Conditions)) {
          this.Conditions = false
        }
       
        
      }

    }

  openConversation() {
  }
  toggleSubmenu(menu: string): void {
    for (const key in this.openSubmenus) {
      if (this.openSubmenus.hasOwnProperty(key) && key !== menu) {
        this.openSubmenus[key] = false;
      }
    }
    this.openSubmenus[menu] = !this.openSubmenus[menu];
    localStorage.setItem('openSubmenus', JSON.stringify(this.openSubmenus));
  }
  onClickSidebarToggler() {
    const sidebar = this.elRef.nativeElement.querySelector('.sidebar');
    const content = this.elRef.nativeElement.querySelector('.content');

    if (sidebar && content) {
      sidebar.classList.toggle('open');
      content.classList.toggle('open');
    }
  }

  redirectToList() {
    localStorage.removeItem('ClinicId');
    if (this.router.url === '/admin/providers-list') {
      // If already on the desired URL, reload the page
      this.router.navigateByUrl('/admin', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/providers-list']);
      });
    } else {
      // Navigate to the desired URL
      this.router.navigate(['/admin/providers-list']);
    }
  }


  logout() {
    localStorage.clear();

    this.router.navigate(['/admin-login']);
  }

  isNotificationDropdownOpen = false;
  onSidebarItemClick() {
    this.isNotificationDropdownOpen = false;
    if (window.innerWidth <= 768) { // Adjust breakpoint as needed
    const sidebar = this.elRef.nativeElement.querySelector('.sidebar');
    const content = this.elRef.nativeElement.querySelector('.content');
    if (sidebar && content) {
      sidebar.classList.toggle('open');
      content.classList.toggle('open');
    }
    }
    }
}

