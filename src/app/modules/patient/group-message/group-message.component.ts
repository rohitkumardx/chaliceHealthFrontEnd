import { Component, ElementRef, ViewChild, SimpleChanges, AfterViewInit, OnChanges, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { SignalRService } from 'src/app/Services/signalr.service';
import { AudioRecordingComponent } from 'src/app/shared/components/audio-recording/audio-recording.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-group-message',
  templateUrl: './group-message.component.html',
  styleUrls: ['./group-message.component.css']
})
export class GroupMessageComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(AudioRecordingComponent) audioRecorderComponent: AudioRecordingComponent;
  @ViewChild('fileInput') fileInput!: ElementRef;
  message: any;
  messageList = []
  messageId: any
  userId: any
  receiverId: any
  groupId: any
  showAttachOptions = false;
  isMessageVisible = false
  isInputBoxVisible = false
  //bookAppointmentId: any;
  audioFile: File | null = null;
  private messageSubscription: Subscription | undefined;
  messageContainer: any;
  constructor(private providerService: ProviderService, private el: ElementRef,
    private authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private signalRService: SignalRService,
    private modalService: NgbModal,
    private router: Router
  ) { }
  //patientId:any;
  clinicId: any;
  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.receiverId = parama.userId;
      this.groupId = parama.providerGroupId
      // this.clinicId=parama.clinicId
      // this.bookAppointmentId = parama.appointmentId;
    });
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    this.getMessageList()
    this.messageSubscription = this.signalRService.message$.subscribe(
      (newMessage) => {
        this.messageSubscription = this.signalRService.message$.subscribe(
          (newMessage) => {
            if (this.router.url.includes('/patient/group-message')) {
              this.getMessageList();
            }
          }
        );
      }
    );
    this.signalRService.addReceiveMessageListener();
    const delay = 500;
    setTimeout(() => {
      this.notificationService.scrollToBottom();
    }, delay);
    this.getReceiverData();
    setTimeout(() => {
      this.notificationService.scrollToBottom();
    }, delay);
  }
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

  replyMessage() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      messageId: Number(this.messageId),
      senderType: userInfo.accountType,
      providerGroupId: Number(this.groupId),
      //   bookAppointmentId: Number(this.bookAppointmentId),
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
    Object.keys(obj).forEach(key => {
      formData.append(key, obj[key]);
    });
    this.providerService.replyGroupMessage(formData).subscribe((response: any) => {
      // this.messageList.push({ messageContent: this.message, senderId: this.receiverId });
      this.getMessageList()
      this.message = '';
      this.selectedFile = [];
      this.audioFile = null;
      if (this.audioRecorderComponent) {
        this.audioRecorderComponent.resetAudio();  // Call reset method to clear everything
      }
    });
  }

  createMessage() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      // bookAppointmentId: Number(this.bookAppointmentId),
      senderType: userInfo.accountType,
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      providerGroupId: Number(this.groupId),
      FileName: null,
      senderId: userInfo.userId,
      receiverId: this.receiverId
    }
    const formData = new FormData;
    Object.keys(obj).forEach(key => {
      formData.append(key, obj[key]);
    });
    this.providerService.sendGroupMessage(formData).subscribe((response: any) => {
      // this.messageList.push({ messageContent: this.message, senderId: this.receiverId });
      this.getMessageList()
      this.message = '';
      this.selectedFile = [];
      this.audioFile = null;
      if (this.audioRecorderComponent) {
        this.audioRecorderComponent.resetAudio();  // Call reset method to clear everything
      }
    })
  }

  sendMessage() {

    if (this.messageList.length > 0) {
      this.replyMessage()
    }
    else {
      this.createMessage()
    }
  }
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }

  goBack() {
    const activatedTab = { name: 'John', age: 30 };
    sessionStorage.setItem('someData', JSON.stringify(activatedTab));
    window.history.back()
  }
  superParentMessageId: any
  // providerGroupId:any
  getMessageList() {
    this.providerService.getGroupMessageList(this.groupId, this.receiverId).subscribe((response: any) => {
      this.messageList = response

      if (this.messageList && this.messageList.length > 0) {
        const lastMessage = this.messageList[this.messageList.length - 1];
        const lastMessageId = lastMessage.messageList[lastMessage.messageList.length - 1];
        this.messageId = lastMessageId.messageId;
        this.superParentMessageId = lastMessageId.superParentMessageId;
        //this.providerGroupId=lastMessageId.providerGroupId;
      } else {
        this.messageId = null;
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

        });
      });
      const currentHref = window.location.href;
      const isMessagePage = currentHref.includes('/patient/group-message') &&
        currentHref.includes('userId=') &&
        currentHref.includes('providerGroupId=');
      if (isMessagePage) {
        this.markUnreadMessages();
      }
      // this.markUnreadMessages();
    });

  }
  markUnreadMessages() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      receiverId: userInfo.userId,
      providerGroupId: this.groupId,
      superParentMessageId: this.superParentMessageId
      // superParentMessageId: this.superParentMessageId,
      //receiverId: userInfo.userId
    }

    this.providerService.markGroupMessagesUnread(obj).subscribe((response: any) => {
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

  selectPhoto(): void {
    const photoInput = document.getElementById('photoInput') as HTMLInputElement;
    if (photoInput) {
      photoInput.click(); // Programmatically click the hidden file input
    }
  }
  selectVideo(): void {
    const videoInput = document.getElementById('videoInput') as HTMLInputElement;
    if (videoInput) {
      videoInput.click(); // Programmatically click the hidden file input
    }
  }

  // Handle video file selection
  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('Selected video file:', file);

      // Optionally, display a video preview or handle it further
      // Example: Show the video preview
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(file);
      videoElement.controls = true; // Add controls to the video
      videoElement.style.maxWidth = '300px'; // Example style for preview
      document.body.appendChild(videoElement); // Append the video preview to the body
    }
  }
  // Trigger file input click for document selection
  selectDocument(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click(); // Programmatically click the hidden file input
    }
  }
  // slectProvider() {
  //   const modalRef = this.modalService.open(AssignChatComponent, {
  //     backdrop: 'static',
  //     size: 'md',
  //     centered: true,
  //   });
  //   const obj ={
  //     patientId :this.receiverId,
  //     clinicId: this.clinicId
  //   }
  //   modalRef.componentInstance.receivedData = obj;
  //   modalRef.componentInstance.dialogClosed.subscribe(() => {
  //     //this.getMessageList();
  //   });
  // }


  // Trigger file input click for audio selection
  selectAudio(): void {
    const audioInput = document.getElementById('audioInput') as HTMLInputElement;
    if (audioInput) {
      audioInput.click(); // Programmatically click the hidden file input
    }
  }


  // Handle audio file selection
  onAudioSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      console.log('Selected audio file:', file);
      const audioElement = document.createElement('audio');
      audioElement.src = URL.createObjectURL(file);
      audioElement.controls = true; // Add controls to the audio element
      audioElement.style.maxWidth = '300px'; // Example style for preview
      document.body.appendChild(audioElement); // Append the audio preview
    }
  }

  selectedFileName: string | null = null;
  filePreview: string | null = null;
  isImage: boolean = false;
  isAudio: boolean = false;
  isVideo: boolean = false;

  onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      // this.selectedFileName = file.name;


      this.selectedFile = []

      if (file) {
        this.selectedFile.push(file)
        this.message = file.name
        // this.documentForm.get('fileName').setValue(file);
      }


      this.showAttachOptions = false;
    }
  }

  savedMessages = []

  // Function to show the save message screen
  showSaveMessage() {
    this.savedMessages = []
    this.providerService.getSavedMessagesList(this.userId).subscribe((response: any) => {
      this.savedMessages = response.items
      this.getActiveMessage()

    })
    this.isMessageVisible = !this.isMessageVisible;
  }
  activeReply: any;
  getActiveMessage() {
    this.activeReply = null
    this.providerService.getActiveMessageByUserId(this.userId).subscribe((response: any) => {
      this.activeReply = response.items[0].defaultMessageId

    })
  }

  closeSaveMessage(): void {
    this.isMessageVisible = false;
  }
  activateAutoReply() {
    const obj = {
      defaultMessageId: this.selectedDefaultMessage.id,
      userId: this.userId
    }
    this.providerService.activateDefaultMessage(obj).subscribe((response: any) => {
      this.isMessageVisible = false
      this.notificationService.showSuccess('Auto-reply set up successfully! It will now send automatically when someone contacts you.')
    })
  }
  // Toggle the visibility of the input box
  toggleInputBox() {

    this.isInputBoxVisible = !this.isInputBoxVisible;
  }

  // Detect clicks outside specific elements
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedElement = event.target as HTMLElement;

    // Close input box if clicking outside of it and the button
    if (
      this.isInputBoxVisible &&
      !clickedElement.closest('.create-message') &&
      !clickedElement.closest('.dynamic-input')
    ) {
      this.isInputBoxVisible = false;
    }

    // Close saved message screen if clicking outside
    if (
      this.isMessageVisible &&
      !clickedElement.closest('.save-message') &&
      !clickedElement.closest('.fa-robot')
    ) {
      this.closeSaveMessage();
    }
    const attachOptions = document.getElementById('attachOptions');
    const plusIcon = document.querySelector('.fa-plus-circle');
    if (this.showAttachOptions && attachOptions && !attachOptions.contains(event.target as Node) && !plusIcon.contains(event.target as Node)) {
      this.showAttachOptions = false;
    }
  }
  defaultMessage: string = ''
  submitMessage() {
    const obj = {
      messages: this.defaultMessage,
      userId: this.userId
    }
    this.providerService.createDefaultMessage(obj).subscribe((response: any) => {
      this.defaultMessage = ''
      this.savedMessages = []

      // this.providerService.getSavedMessagesList(this.userId).subscribe((response: any) => {
      //   this.savedMessages = response.items
      // })
    })
  }


  activeIndex: number | null = null;
  selectedDefaultMessage: any

  toggleActive(index: number, message: any): void {
    // Toggle active state: If the same item is clicked, remove the active class
    if (this.activeReply == message.id) {
      this.activeReply = null
      this.selectedDefaultMessage = message
    }
    else {
      this.activeReply = message.id
      this.selectedDefaultMessage = message
    }

  }

  toggleAttachOptions(): void {
    this.showAttachOptions = !this.showAttachOptions;
  }

}
