import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';
enum userPermission{
  Dashboard =18,
  ProfileSetup = 19,
  Appointment=20,
  PatientManagement=21,
  ProviderList=22,
  UserManagement=23,
  RoleManagement=24,
  Messages=25,
  Document =26,
  Calendar =27,
  Notification = 28,
  Settings = 29
  }

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.css']
})
export class ProviderComponent {

  userInfo: any;
  credentialSteps: any
  openSubmenus = {
    dashboard: false,
    plan: false,
    appointment: false
  };

  isDisabled: boolean = false
  Dashboard:boolean=true;
  ProfileSetup :boolean=true;
  Appointment:boolean=true;
  PatientManagement:boolean=true;
  ProviderList:boolean=true;
  UserManagement:boolean=true;
  RoleManagement:boolean=true;
  Messages:boolean=true;
  Document :boolean=true;
  Calendar :boolean=true;
  Notification : boolean= true;
  Settings : boolean = true;
  newMessages: any
  private messageSubscription: Subscription | undefined;
  private notificationSubscription: Subscription | undefined;

  isSidebarCollapsed = false;
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private authService: AuthService,
    private providerService: ProviderService,
      private notificationService: NotificationService,
    private signalRService: SignalRService
  ) { }
  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    console.log("local storage data", this.userInfo)
    if (this.userInfo.credentialStatus == 'Pending') {
      this.isDisabled == true
    }
    this.updateSidebar();
    this.getCredentialSteps()
    this.getNotificationCount()
    // this.signalRService.startConnection();
     this.getNewMessageCount();

    // this.signalRService.addMessageCountListener()
    // this.signalRService.addReceiveMessageListener()
    setTimeout(() => {
      this.signalRService.startConnection();
      this.signalRService.addReceiveMessageListener();
      this.signalRService.addMessageCountListener();
      this.messageSubscription = this.signalRService.messageCount$.subscribe(
        (newMessage) => {
          this.getNewMessageCount();
        }
      );
    }, 1000);

    this.messageSubscription = this.signalRService.messageCount$.subscribe(
      (newMessage) => {
        this.getNewMessageCount()
      }
    );




    this.notificationService.notificationUpdate$.subscribe(() => {
      this.getNotificationCount();
    });

    this.messageSubscription = this.providerService.messageCountUpdate$.subscribe(
      (newMessage) => {
        if (this.router.url === '/provider/message-list') {
          // Reload the current route
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/provider/message-list']);
          });
        } else {
          this.getNewMessageCount();
        }
      }
    );
  }  
 

  updateSidebar() {
    var userInfo = this.authService.getUserInfo();
    if (userInfo.clinicType == "ClinicStaff") {

      if (!userInfo.permissionIds.includes(userPermission.Dashboard)) {
        this.Dashboard = false
      }
      if (!userInfo.permissionIds.includes(userPermission.ProfileSetup)) {
        this.ProfileSetup = false
      }
      if (!userInfo.permissionIds.includes(userPermission.Appointment)) {
        this.Appointment = false
      }
      if (!userInfo.permissionIds.includes(userPermission.PatientManagement)) {
        this.PatientManagement = false
      }
      if (!userInfo.permissionIds.includes(userPermission.ProviderList)) {
        this.ProviderList = false
      }
      if (!userInfo.permissionIds.includes(userPermission.UserManagement)) {
        this.UserManagement = false
      }
      if (!userInfo.permissionIds.includes(userPermission.RoleManagement)) {
        this.RoleManagement = false
      }
      if (!userInfo.permissionIds.includes(userPermission.Messages)) {
        this.Messages = false
      }
      if (!userInfo.permissionIds.includes(userPermission.Document)) {
        this.Document = false
      }
      if (!userInfo.permissionIds.includes(userPermission.Calendar)) {
        this.Calendar = false
      }
      if (!userInfo.permissionIds.includes(userPermission.Notification)) {
        this.Notification = false
      }
      if (!userInfo.permissionIds.includes(userPermission.Settings)) {
        this.Settings = false
      }
    }

  }


  formatAccountType(accountType: string): string {
    return accountType ? accountType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  getCredentialSteps() {
    this.providerService.getCredetialCompletedSteps(this.userInfo.userId).subscribe((response: any) => {
      this.credentialSteps = response.stepNumber
    })
  }
  getNewMessageCount() {
    this.providerService.getMessageCount().subscribe((response: any) => {
      this.newMessages = response.unreadMessageCount
    })
  }
  redirectToMessageList() {
    this.router.navigate(["/provider/message-list"])
  }
  openConversation() {

  }
  noticationCount = 0
  getNotificationCount() {
    this.providerService.getNotificationCount(this.userInfo.userId).subscribe((response: any) => {
      this.noticationCount = response.totalNotificationCount
    })
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




  logout() {
    localStorage.clear();
    this.authService.logOut();
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
