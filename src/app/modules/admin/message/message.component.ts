import { Component, ElementRef, ViewChild, SimpleChanges, AfterViewInit, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  userId: any;
  receiverId :any;
  audioFile: File | null = null;
  private messageSubscription: Subscription | undefined;
  messageContainer: any;

  constructor(private providerService: ProviderService,
    private signalRService: SignalRService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.bookAppointmentId = parama.appointmentId;
      this.receiverId = parama.userId;

    });
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    this.getMessageList()
    this.messageSubscription = this.signalRService.message$.subscribe(
      (newMessage) => {
        this.getMessageList()

      }
    );

    // this.signalRService.addReceiveMessageListener();
    this.getReceiverData()
    const delay = 500;
    setTimeout(() => {
      this.notificationService.scrollToBottom();
    }, delay);

  }

  isRecordingComplete: boolean = false;

  // // Method that gets called when the child emits the audioRecorded event
  // onAudioRecorded(audioBlob: Blob) {
  //   console.log('Received audio Blob:', audioBlob);
  //   this.isRecordingComplete = true;  // Update the status to true after receiving the audio
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
   
    this.isRecordingComplete = true; 
    this.message=this.audioFile ;
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
      receiverId : this.receiverId
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
   // const formData = new FormData;
    Object.keys(obj).forEach(key => {
      formData.append(key, obj[key]);
    });
    this.providerService.replyMessage(formData).subscribe((response: any) => {
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

  createMessage() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      bookAppointmentId: Number(this.bookAppointmentId),
      senderType: userInfo.accountType,
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      FileName: null,
      receiverId :this.receiverId,
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
    
    if (this.messageList.length > 0) {
      this.replyMessage()
    }
    else {
      this.createMessage()
    }

  }
  closePopup(){}
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
      this.markUnreadMessages()

    })
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

  
  // Trigger file input click
  selectPhoto(): void {
    const photoInput = document.getElementById('photoInput') as HTMLInputElement;
    if (photoInput) {
      photoInput.click(); // Programmatically click the hidden file input
    }
  }

  // Handle file selection

  // Trigger file input click for video
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

  // Handle document file selection


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

      // Optionally, process the selected audio file
      // For example, display the audio file name or upload it


      // Optionally, create an audio preview (if desired)
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
  showAttachOptions: boolean = false;

  // Toggle the visibility of attach options


  // Handle file selection for different types of files (image, video, file, audio)
  onFileSelected(event: Event, fileType: string): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      const file = input.files[0];
      // this.selectedFileName = file.name;

      
      this.selectedFile = []
      // this.selectedFilePath = null
      // this.profilePicture = []

      if (file) {
        this.selectedFile.push(file)
        this.message = file.name
        // this.documentForm.get('fileName').setValue(file);
      }

      // Set preview based on file type
      // if (fileType === 'photo' && file.type.startsWith('image')) {
      //   this.isImage = true;
      //   this.isAudio = false;
      //   this.isVideo = false;
      //   this.filePreview = URL.createObjectURL(file);
      // } else if (fileType === 'audio' && file.type.startsWith('audio')) {
      //   this.isAudio = true;
      //   this.isImage = false;
      //   this.isVideo = false;
      //   this.filePreview = URL.createObjectURL(file);
      // } else if (fileType === 'video' && file.type.startsWith('video')) {
      //   this.isVideo = true;
      //   this.isImage = false;
      //   this.isAudio = false;
      //   this.filePreview = URL.createObjectURL(file);
      // } else {
      //   this.isImage = false;
      //   this.isAudio = false;
      //   this.isVideo = false;
      //   this.filePreview = null;
      // }

      // Close the attach options box
      this.showAttachOptions = false;
    }
  }
  toggleAttachOptions(): void {
    this.showAttachOptions = !this.showAttachOptions;
  }
}
