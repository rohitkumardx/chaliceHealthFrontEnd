import { ChangeDetectorRef, Component, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent {

  userInfo: any;
  isDisabled: boolean = true;
  newMessages : any 
  openSubmenus = {
    dashboard: false,
    plan: false,
    appointment: false
  };

  private messageSubscription: Subscription | undefined;
  isSidebarCollapsed = false;
  constructor(
    private elRef: ElementRef,
    private authService: AuthService,
    private providerService: ProviderService,
    private router: Router,
    private signalRService: SignalRService
  ) { }


  isScrolled = false;

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
    this.router.url.includes('/patient/view-profile')
  ) {
    this.onClickSidebarToggler();
  }

  // Delay the SignalR connection by 5 seconds
  setTimeout(() => {
    this.signalRService.startConnection();
    this.signalRService.addMessageCountListener();
    this.signalRService.addReceiveMessageListener();

    this.messageSubscription = this.signalRService.messageCount$.subscribe(
      (newMessage) => {
        this.getNewMessageCount();
        console.log('New message received and added to list:', newMessage);
      }
    );
  }, 5000);

  this.getNewMessageCount();

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
}

  getNewMessageCount(){
    this.providerService.getMessageCount().subscribe((response : any)=>{
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
} 