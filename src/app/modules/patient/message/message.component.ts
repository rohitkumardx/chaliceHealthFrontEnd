import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';
import { environment } from 'src/environments/environment';




@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent {


  @ViewChild('fileInput') fileInput!: ElementRef;
  message: any;
  bookAppointmentId: any
  messageId: any
  messageList = []
  userId: any
  private messageSubscription: Subscription | undefined;

  constructor(private providerService: ProviderService,
    private signalRService: SignalRService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.bookAppointmentId = parama.appointmentId;

    });
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    this.getMessageList()
    this.messageSubscription = this.signalRService.message$.subscribe(
      (newMessage) => {
        this.getMessageList()
        // this.messageList.push({
        //   messageContent: newMessage.messageContent,
        //   senderId: 'other', // Assuming 'other' indicates messages from the server
        //   messageId: newMessage.messageId,
        // });
        console.log('New message received and added to list:', newMessage);
      }
    );

    this.signalRService.addReceiveMessageListener();
this.getReceiverData()
    const delay = 500; 
    setTimeout(() => {
      this.notificationService.scrollToBottom();
    }, delay);

  }


  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  replyMessage() {
    debugger
    const userInfo = this.authService.getUserInfo()
    const obj = {
      messageId: Number(this.messageId),
      senderType: userInfo.accountType,
      bookAppointmentId: Number(this.bookAppointmentId),
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      FileName: null,
      senderId: userInfo.userId
    }
    if (this.selectedFile.length > 0) {
      obj.FileName = this.selectedFile[0],
        obj.messageContent = ''
    }
    const formData = new FormData;
    Object.keys(obj).forEach(key => {
      formData.append(key, obj[key]);
    });
    this.providerService.replyMessage(formData).subscribe((response: any) => {
      // this.messageList.push({ messageContent: this.message, senderId: this.receiverId });
      this.getMessageList()
      this.message = '';
      this.selectedFile = []
    })
  }

  createMessage() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      bookAppointmentId: Number(this.bookAppointmentId),
      senderType: userInfo.accountType,
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      FileName: null,
      senderId: userInfo.userId
    }
    const formData = new FormData;
    Object.keys(obj).forEach(key => {
      formData.append(key, obj[key]);
    });
    this.providerService.sendMessage(formData).subscribe((response: any) => {
      // this.messageList.push({ messageContent: this.message, senderId: this.receiverId });
      this.getMessageList()
      this.message = '';
      this.selectedFile = []
    })
  }

  goBack() {
    window.history.back()
  }
  sendMessage() {
    debugger
    if (this.messageList.length > 0) {
      this.replyMessage()
    }
    else {
      this.createMessage()
    }

  }
  getMessageList() {
    this.providerService.getMessageList(this.bookAppointmentId).subscribe((response: any) => {
      this.messageList = response
      debugger
      if (this.messageList && this.messageList.length > 0) {
        const lastMessage = this.messageList[this.messageList.length - 1];
        const lastMessageId = lastMessage.messageList[lastMessage.messageList.length - 1];
        this.messageId = lastMessageId.messageId; // Store the last messageId
        this.superParentMessageId = lastMessageId.superParentMessageId
      } else {
        this.messageId = null; // Handle case when the list is empty
      }


      this.messageList.forEach((item: any) => {
        item.messageList.forEach((message: any) => {
          if (message?.profilePicturePath) {
            message.profilePicturePath = environment.fileUrl + message.profilePicturePath;
          } else {
            message.profilePicturePath = undefined;
          }
        })
      })
      console.log(this.messageList)
      this.markUnreadMessages()
    
    })
  }
  superParentMessageId : any
  markUnreadMessages(){
    const userInfo  = this.authService.getUserInfo()
    const obj = {
      superParentMessageId : this.superParentMessageId,
      senderId : userInfo.userId
    }

    this.providerService.markMessagesUnread(obj).subscribe((response : any)=>{
       this.providerService.notifyMessageUpdate(); 
    })
  }

  capitalizeFirstLetter() {
    if (this.message) {
      this.message = this.message.charAt(0).toUpperCase() + this.message.slice(1);
    }
  }
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  selectedFile = []
  // Handle file upload
  handleFileUpload(event: any) {
    debugger
    this.selectedFile = []
    // this.selectedFilePath = null
    // this.profilePicture = []
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.push(file)
      this.message = file.name
      // this.documentForm.get('fileName').setValue(file);
    }
  }
  removeFile(): void {
    this.selectedFile = []; // Clear the selected file
    this.message = ''; // Enable the input for new messages
  }
  downloadFile(filePath: string): any {
    filePath = environment.fileUrl + filePath;
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  messageReceiverData: any
  getReceiverData() {
    this.providerService.getMessageReceiverData(this.bookAppointmentId).subscribe((response: any) => {
      this.messageReceiverData = response


      if(this.messageReceiverData.profilePicturePath){
        this.messageReceiverData.profilePicturePath = environment.fileUrl + this.messageReceiverData.profilePicturePath;
        } else {
          this.messageReceiverData.profilePicturePath = undefined;
        }
    })
  }
}
