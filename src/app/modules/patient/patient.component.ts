import { ChangeDetectorRef, Component, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { without } from 'lodash';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { PopUpService } from 'src/app/Services/pop-up.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent {

  newNotification: any = {
    appointmentCount: 0,
    medicationCount: 0,
    blogCount: 0,
    totalCount: 0
  };


  userInfo: any;
  isDisabled: boolean = true;
  newMessages: any
  openSubmenus = {
    dashboard: false,
    plan: false,
    appointment: false
  };
message = '';
  show = false;
  private messageSubscription: Subscription | undefined;
  private notificationSubscription: Subscription | undefined;
  private blogSubscription: Subscription | undefined;

  isSidebarCollapsed = false;
  constructor(private popupService: PopUpService,
    private elRef: ElementRef,
    private authService: AuthService,
    private providerService: ProviderService,
    private router: Router,
    private signalRService: SignalRService,
    private route : ActivatedRoute
  ) {
       this.popupService.popup$.subscribe((msg) => {
      this.message = msg;
      this.show = true;

      // Optional: auto close after 3 seconds
      // setTimeout(() => this.show = false, 3000);
    });
  }
  
  isScrolled = false;
  withoutLogin: boolean = false;
  // Listen to the window scroll event
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollTop > 10;
  }




  ngOnInit() {
        
    this.userInfo = this.authService.getUserInfo();

    if (
      this.router.url.includes('/patient/doctor-search') ||
      this.router.url.includes('/patient/book-appointment') ||
      this.router.url.includes('/patient/view-profile') ||
      this.router.url.includes('/patient/provider-detail')
    ) {
      this.onClickSidebarToggler();
    }

    this.route.queryParams.subscribe(params => { this.withoutLogin = params['request'] === 'withoutLogin'; });
    setTimeout(() => {
      this.signalRService.startConnection();
      this.signalRService.addMessageCountListener();
      this.signalRService.addReceiveMessageListener();
      this.signalRService.addNotificationCountListener();
      this.signalRService.addAllNotificationCount();

      this.messageSubscription = this.signalRService.messageCount$.subscribe(
        (newMessage) => {
          this.getNewMessageCount();
          this.fetchNotificationCount();
          this.fetchAppointmentReminderCount();
          this.fetchMedicalReminderCount();
          this.getNewNotificatiounCount();
          console.log('New message received and added to list:', newMessage);
        }
      );

      // 👇 Notification subscription
      this.notificationSubscription = this.signalRService.notificationCount$.subscribe(
        (notificationData) => {
          this.newNotification = notificationData;
          this.getNewNotificatiounCount();
          console.log('Notification data updated:', notificationData);
        }
      );
      this.blogSubscription = this.signalRService.BlogCount$.subscribe(
        (blogData: any) => {
          this.getNewNotificatiounCount()
        }
      );
    }, 0);

    this.getNewMessageCount();
    this.getNewNotificatiounCount();

    this.messageSubscription = this.providerService.messageCountUpdate$.subscribe(
      (newMessage) => {
        if (this.router.url.includes('/patient/message-list')) {
          // Reload the current route
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/patient/message-list']);
          });
        } else {
          this.getNewMessageCount();
        }
      }
    );

    // this.checkScreenSize();
    // window.addEventListener('resize', () => this.checkScreenSize());

  }

  onSidebarItemClick() {
    
    // this.isNotificationDropdownOpen = false;
    if (window.innerWidth <= 768) { // Adjust breakpoint as needed
      const sidebar = this.elRef.nativeElement.querySelector('.sidebar');
      const content = this.elRef.nativeElement.querySelector('.content');
      if (sidebar && content) {
        sidebar.classList.toggle('open');
        content.classList.toggle('open');
      }
    }
  }

  redirectToprivacypolicy() {
    this.router.navigate(['/patient/support']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  // isSidebarOpen = true; // Default mobile pe sidebar closed hoga

  // checkScreenSize() {
  //   if (window.innerWidth < 992) {
  //     this.isSidebarOpen = false; // Mobile/tab view
  //   } 
  //   else {
  //     this.isSidebarOpen = true;  // Desktop/laptop view
  //   }
  // }

  // toggleSidebar() {
  //   this.isSidebarOpen = true;
  // }






  isSidebarVisible = false;

  checkSidebarVisibility() {
    if (this.userInfo && this.userInfo.accountType === 'Patient') {
      this.isSidebarVisible = true;
    } else {
      this.isSidebarVisible = false;
    }
  }

  formatAccountType(accountType: string): string {
    return accountType ? accountType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  getNewMessageCount() {
    this.providerService.getMessageCount().subscribe((response: any) => {
      this.newMessages = response.unreadMessageCount
    })
  }
  redirectToDoctorSearch() {
    this.router.navigate(['/patient/doctor-search']);
  }
  navigateToPatientSignup() {
    this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
  }

  toggleSubmenu(menu: string): void {
    for (const key in this.openSubmenus) {
      if (this.openSubmenus.hasOwnProperty(key) && key !== menu) {
        this.openSubmenus[key] = false;
      }
    }
    this.openSubmenus[menu] = !this.openSubmenus[menu];
    localStorage.setItem('openSubmenus', JSON.stringify(this.openSubmenus));
    this.onSidebarItemClick();
  }
  redirectToDoctorFollowUp() {
    this.router.navigate(['/patient/FollowUpDoctor']);
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
    this.authService.logOut();
  }




  isNotificationDropdownOpen = false;

  toggleNotificationDropdown(event: MouseEvent) {
    event.preventDefault(); // Yeh important hai!!
    this.isNotificationDropdownOpen = !this.isNotificationDropdownOpen;
  }

  closeNotification() {
    // this.isNotificationDropdownOpen = false;
  }

  // Medical Notifcaiton
  closeMedicationNotification() {
    // this.isNotificationDropdownOpen = false;
  }
  private fetchMedicalReminderCount() {
    this.providerService.getMedicalReminderCount().subscribe((response: any) => {
      this.newNotification = response.data;
    });
  }



  // Appointment reminder 
  closeAppointmentReminderNotification() {
    // this.isNotificationDropdownOpen = false;
  }
  private fetchAppointmentReminderCount() {
    this.providerService.getAppointmentReminderCount().subscribe((response: any) => {
      this.newNotification = response.data;
    });
  }

  fetchNotificationCount() {

    this.providerService.getBlogNotificationCount().subscribe((response: any) => {
      this.newNotification = response.data || response;
    });
  }

  ngOnDestroy() {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  getNewNotificatiounCount() {
    console.log('Fetching notification count...');
    this.providerService.getPatientNotificationCount().subscribe((response: any) => {
      console.log('Notification count response:', response);
      this.newNotification = response.data || response; // Handle both response formats
    },
      (error) => {
        console.error('Error fetching notification count:', error);
      }
    );
  }

} 