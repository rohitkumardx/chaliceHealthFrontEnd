import { Component, ElementRef, ViewChild, SimpleChanges, AfterViewInit, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';
import { AudioRecordingComponent } from 'src/app/shared/components/audio-recording/audio-recording.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild(AudioRecordingComponent) audioRecorderComponent: AudioRecordingComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;
  message: any;
  bookAppointmentId: any
  messageId: any
  messageList = []
  userId: any
  receiverId: any;
  audioFile: File | null = null;
  private messageSubscription: Subscription | undefined;
  messageContainer: any;

  constructor(private providerService: ProviderService,
    private signalRService: SignalRService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router:Router
  ) { }
  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.bookAppointmentId = parama.appointmentId;
      this.receiverId = parama.providerId ?? parama.userId; 
      // this.receiverId = parama.userId;
      // this.receiverId = parama.providerId

    });
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    this.getMessageList()
    this.messageSubscription = this.signalRService.message$.subscribe(
      (newMessage) => {
     this.getMessageList();
      }
    );
    //this.signalRService.addReceiveMessageListener();
    //const delay = 500;

    this.signalRService.addReceiveMessageListener();
    const delay = 500;
    setTimeout(() => {
      this.notificationService.scrollToBottom();
    }, delay);
    this.getReceiverData();
    setTimeout(() => {
      this.notificationService.scrollToBottom();
    }, delay);;


  } //PatientMessage
  // ngOnInit() {
  //   this.route.queryParams.subscribe((parama: any) => {
  //     this.bookAppointmentId = parama.appointmentId;
  //     this.receiverId = parama.providerId ?? parama.userId; 
  //     // this.receiverId = parama.userId;
  //     // this.receiverId = parama.providerId

  //   });
  //   const userInfo = this.authService.getUserInfo()
  //   this.userId = userInfo.userId
  //   this.getMessageList()
  //   this.messageSubscription = this.signalRService.message$.subscribe(
  //     (newMessage) => {
  //       if (this.router.url.includes('/patient/message')) {
  //         this.getMessageList();
  //       }

  //     }
  //   );

  //   // this.signalRService.addReceiveMessageListener();
  //   this.getReceiverData()
  //   const delay = 500;


  // }

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messageList'] && changes['messageList'].currentValue) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  handleAudioRecorded(audioBlob: Blob) {
    this.audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });  // Store the audio file
  }
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  replyMessage() {
    
    const userInfo = this.authService.getUserInfo()
    const obj = {
      messageId: Number(this.messageId),
      senderType: userInfo.accountType,
      bookAppointmentId: Number(this.bookAppointmentId),
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      FileName: null,
      VoiceMessage: null,
      senderId: userInfo.userId,
      receiverId: this.receiverId
    }
    if (this.selectedFile.length > 0) {
      obj.FileName = this.selectedFile[0],
        obj.messageContent = ''
    }

    if (this.audioFile) {
      obj.VoiceMessage = this.audioFile;  // Assign audio file if available
      //obj.messageContent = '';  // If it's audio, clear the message content
    }
    const formData = new FormData;
    if (this.audioFile) {
      formData.append('audio', this.audioFile, 'audio.webm');
    }

    //const formData = new FormData;
    Object.keys(obj).forEach(key => {
      formData.append(key, obj[key]);
    });
    this.providerService.replyMessage(formData).subscribe((response: any) => {
      // this.messageList.push({ messageContent: this.message, senderId: this.receiverId });
      this.getMessageList();
      this.message = '';
      this.selectedFile = [];
      this.audioFile = null;
      if (this.audioRecorderComponent) {
        this.audioRecorderComponent.resetAudio();  // Call reset method to clear everything
      }
    })
  }

  createMessage() {
    ;
    const userInfo = this.authService.getUserInfo()
    const obj = {
      bookAppointmentId: Number(this.bookAppointmentId),
      senderType: userInfo.accountType,
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      FileName: null,
      receiverId: this.receiverId,
      senderId: userInfo.userId,
      VoiceMessage:null,
    }
    
  //  const formData = new FormData;
   
    ;
    
    const formData = new FormData;
    if (this.audioFile) {
      formData.append('audio', this.audioFile, 'audio.webm');
    }
    if (this.audioFile) {
      obj.VoiceMessage = this.audioFile;  // Assign audio file if available
      //obj.messageContent = '';  // If it's audio, clear the message content
    }
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
    
    if (this.messageList.length > 0) {
      this.replyMessage()
    }
    else {
      this.createMessage()
    }
  }
  getMessageList() {
    this.providerService.getMessageList(this.receiverId).subscribe((response: any) => {
      this.messageList = response
      
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
          if (message?.voiceMessagePath) {
            if (!message.voiceMessagePath.startsWith('http')) {
              message.voiceMessagePath = environment.fileUrl + message.voiceMessagePath;
            }
            if (message.messageContent = undefined) {
              message.messageContent = '';
            }
          }
        })
      })
      const currentHref = window.location.href;
      const isMessagePage = (currentHref.includes('/patient/message') &&
      currentHref.includes('userId=') &&
      currentHref.includes('appointmentId='))||(currentHref.includes('/patient/message') &&
      currentHref.includes('userId=') );
    if (isMessagePage) {
      this.markUnreadMessages();
    }
     // this.markUnreadMessages();
    });
  }
  superParentMessageId: any
  markUnreadMessages() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      superParentMessageId: this.superParentMessageId,
      senderId: userInfo.userId
    }

    this.providerService.markMessagesUnread(obj).subscribe((response: any) => {
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
    this.providerService.getMessageReceiverData(this.receiverId).subscribe((response: any) => {
      this.messageReceiverData = response
      if (this.messageReceiverData.profilePicturePath) {
        this.messageReceiverData.profilePicturePath = environment.fileUrl + this.messageReceiverData.profilePicturePath;
      } else {
        this.messageReceiverData.profilePicturePath = undefined;
      }
    })
  }


}
