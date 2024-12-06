import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent {

  
  messagesList: any
  private messageSubscription: Subscription | undefined;

  constructor(private providerService: ProviderService,
    private router : Router
  ) { }
  ngOnInit() {
    this.getMessageList();

    this.messageSubscription = this.providerService.messageCountUpdate$.subscribe(
      (newMessage) => {
        this.getMessageList()
   
      }
    );
  }

  getMessageList() {
    this.providerService.getMessageListByUserId().subscribe((response: any) => {
      this.messagesList = response.messages
      this.messagesList.forEach((item : any)=>{
        if(item.profilePicturePath){
          item.profilePicturePath = environment.fileUrl + item.profilePicturePath;
          } else {
            item.profilePicturePath = undefined;
          }
        
      })
      console.log(this.messagesList)
    })
  }

  viewChat(id :any){
    this.router.navigate(["/patient/message"] ,{ queryParams: { appointmentId: id } })
  }
}
