import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';

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
  newMessages : any 
  private messageSubscription: Subscription | undefined;

  isSidebarCollapsed = false;
  constructor(
    private elRef: ElementRef,
    private router : Router,
    private authService: AuthService,
    private providerService: ProviderService,
    private signalRService: SignalRService
  ) { }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo();
    if (this.userInfo.credentialStatus == 'Pending') {
      this.isDisabled == true
    }
    this.getCredentialSteps()

    this.signalRService.startConnection();
    this.getNewMessageCount()

    this.signalRService.addMessageCountListener()
    this.signalRService.addReceiveMessageListener()

    this.messageSubscription = this.signalRService.messageCount$.subscribe(
      (newMessage) => {
        this.getNewMessageCount()
        // this.messageList.push({
        //   messageContent: newMessage.messageContent,
        //   senderId: 'other', // Assuming 'other' indicates messages from the server
        //   messageId: newMessage.messageId,
        // });
        console.log('New message received and added to list:', newMessage);
      }
    );

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
  getCredentialSteps() {
    this.providerService.getCredetialCompletedSteps(this.userInfo.userId).subscribe((response: any) => {
      this.credentialSteps = response.stepNumber

    })
  }
  getNewMessageCount(){
    this.providerService.getMessageCount().subscribe((response : any)=>{
      this.newMessages = response.unreadMessageCount
    })
  }
  redirectToMessageList(){
   this.router.navigate(["/provider/message-list"])
  }
  openConversation(){
    
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
}
