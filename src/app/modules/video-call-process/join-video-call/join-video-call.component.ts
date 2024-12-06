import { Component, OnInit, OnDestroy, ViewChild, ElementRef, } from '@angular/core';
import AgoraRTC, { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack, IRemoteVideoTrack, IRemoteAudioTrack, ILocalVideoTrack, } from 'agora-rtc-sdk-ng';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from 'src/app/Services/provider.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { SignalRService } from 'src/app/Services/signalr.service';
import { NotificationService } from 'src/app/Services/notification.service';

@Component({
  selector: 'app-join-video-call',
  templateUrl: './join-video-call.component.html',
  styleUrls: ['./join-video-call.component.css'],
})
export class JoinVideoCallComponent implements OnInit, OnDestroy {
  client: IAgoraRTCClient;
  localAudioTrack: IMicrophoneAudioTrack | null = null;
  localVideoTrack: ICameraVideoTrack | ILocalVideoTrack | null = null;
  soapNotesForm: FormGroup

  appId: string = '';
  bookingId: string = '';
  token: string = '';
  channelName: string = '';
  userId: string;

  isScreenSharing: boolean = false;
  isAudioEnabled: boolean = true;
  isVideoEnabled: boolean = true;
  isVirtual = false
  userInfo: any
  @ViewChild('signaturePad', { static: false }) signaturePad: ElementRef<HTMLCanvasElement>;
  private context: CanvasRenderingContext2D;
  private isDrawing = false;
  signature: any
  isSignatureFilled = false;


  selectedFile: any[];
  message = '';
  messageId: any
  private messageSubscription: Subscription | undefined;
  isChatOpen: boolean = false;
  meetingType: any

  messageList = []

  @ViewChild('fileInput') fileInput!: ElementRef;


  constructor(
    private http: HttpClient,
    private router: Router,
    private signalRService: SignalRService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private providerService: ProviderService
  ) {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()
    this.route.queryParams.subscribe((parama: any) => {
      this.bookingId = parama.appointmentId;
      this.meetingType = parama.request
      if (parama.request == 'Virtual') {
        this.isVirtual = true
      }
    });
    if (this.isVirtual) {
      this.providerService.getJoinDetails(this.bookingId).subscribe((data: any) => {
        this.token = data.token;
        this.appId = data.appId
        this.userId = this.userInfo.userId
        this.channelName = data.channelName;
        this.joinChannel();
        this.subscribeToRemoteUsers();
      });
    }
    this.soapNotesForm = this.fb.group({
      subjective: [''],
      objective: [''],
      assessment: [''],
      plan: [''],
      statusOfVisit: ['', Validators.required],
      exitTime: [''],
      arrivalTime: [''],
      remarks: [''],
      signature: [''],
      bookAppointmentId: [this.bookingId]
    })

    const now = new Date();
    // Get the local time in HH:mm format
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits

    const formattedTime = `${hours}:${minutes}`;
    this.soapNotesForm.patchValue({ arrivalTime: formattedTime });

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
  }



  async toggleScreenShare(): Promise<void> {
    try {
      if (this.isScreenSharing) {
        await this.client.unpublish(this.localVideoTrack as ICameraVideoTrack);
        this.localVideoTrack?.close();

        this.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        await this.client.publish(this.localVideoTrack);

        const localVideoContainer = document.getElementById('local-stream');
        if (localVideoContainer && this.localVideoTrack) {
          localVideoContainer.innerHTML = '';
          this.localVideoTrack.play(localVideoContainer, { fit: 'contain' });
        }

        this.isScreenSharing = false;
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: '1080p_1',
          optimizationMode: 'detail',
        });

        // Attach event listener for when screen sharing is stopped
        const screenMediaStreamTrack = Array.isArray(screenTrack)
          ? screenTrack[0].getMediaStreamTrack()
          : screenTrack.getMediaStreamTrack();

        screenMediaStreamTrack.onended = async () => {
          await this.toggleScreenShare();
        };

        await this.client.unpublish(this.localVideoTrack as ICameraVideoTrack);

        this.localVideoTrack = Array.isArray(screenTrack) ? screenTrack[0] : screenTrack;
        await this.client.publish(this.localVideoTrack);

        const localVideoContainer = document.getElementById('local-stream');
        if (localVideoContainer && this.localVideoTrack) {
          localVideoContainer.innerHTML = ''; // Clear previous content
          this.localVideoTrack.play(localVideoContainer, { fit: 'contain' });
        }

        this.isScreenSharing = true;
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      alert('Screen sharing failed. Please check your browser permissions.');
    }
  }

  async joinChannel(): Promise<void> {
    try {
      await this.client.join(this.appId, this.channelName, this.token, this.userId);

      [this.localAudioTrack, this.localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      const localVideoContainer = document.getElementById('local-stream');
      if (localVideoContainer) {
        this.localVideoTrack.play(localVideoContainer);
      }

      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);
    } catch (error) {
      console.error('Failed to join the channel:', error);
    }
  }

  subscribeToRemoteUsers() {
    this.client.on('user-published', async (user, mediaType) => {
      await this.client.subscribe(user, mediaType);
      console.log('Subscribed to remote user:', user.uid);

      if (mediaType === 'video') {
        const remoteVideoTrack = user.videoTrack as IRemoteVideoTrack;
        const remoteVideoContainer = document.createElement('div');
        remoteVideoContainer.id = `remote-container-${user.uid}`;
        remoteVideoContainer.style.width = '100%';
        remoteVideoContainer.style.height = '100%';
        document.getElementById('remote-stream')?.appendChild(remoteVideoContainer);
        remoteVideoTrack.play(remoteVideoContainer.id);
      }

      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack as IRemoteAudioTrack;
        remoteAudioTrack.play();
      }
    });

    this.client.on('user-unpublished', (user) => {
      console.log('Remote user unpublished:', user.uid);
      const remoteVideoContainer = document.getElementById(`remote-container-${user.uid}`);
      if (remoteVideoContainer) {
        remoteVideoContainer.remove();
      }
    });
  }

  toggleAudio(): void {
    if (this.localAudioTrack) {
      this.isAudioEnabled = !this.isAudioEnabled;
      this.localAudioTrack.setEnabled(this.isAudioEnabled);
      console.log(this.isAudioEnabled ? 'Audio unmuted' : 'Audio muted');
    }
  }

  toggleVideo(): void {
    if (this.localVideoTrack) {
      this.isVideoEnabled = !this.isVideoEnabled;
      this.localVideoTrack.setEnabled(this.isVideoEnabled);
      console.log(this.isVideoEnabled ? 'Video enabled' : 'Video disabled');
    }
  }

  async leaveChannel(): Promise<void> {
    try {
      if (this.localAudioTrack) {
        this.localAudioTrack.stop();
        this.localAudioTrack.close();
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.stop();
        this.localVideoTrack.close();
      }

      await this.client.leave();
      console.log('Left the channel successfully');
    } catch (error) {
      console.error('Failed to leave the channel:', error);
    }
  }

  ngOnDestroy(): void {
    this.leaveChannel();
  }


  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  capitalizeFirstLetter() {
    if (this.message) {
      this.message = this.message.charAt(0).toUpperCase() + this.message.slice(1);
    }
  }
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

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

  removeFile() {
    this.selectedFile = []; // Clear the selected file
    this.message = ''; // Enable the input for new messages
  }

  replyMessage() {
    debugger
    const userInfo = this.authService.getUserInfo()
    const obj = {
      messageId: Number(this.messageId),
      senderType: userInfo.accountType,
      bookAppointmentId: Number(this.bookingId),
      messageContent: this.message,
      createdBy: Number(userInfo.userId),
      FileName: null,
      senderId: userInfo.userId
    }
    if (this.selectedFile != null) {
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
    })
  }

  createMessage() {
    const userInfo = this.authService.getUserInfo()
    const obj = {
      bookAppointmentId: Number(this.bookingId),
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
    })
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
  endMeet(){
    this.notificationService.markFormGroupTouched(this.soapNotesForm);
    if (this.soapNotesForm.invalid) {
      this.notificationService.markFormGroupTouched(this.soapNotesForm);
      return;
    }
    const data  = {
      bookAppointmentId : this.bookingId,
      bookingStatus : this.soapNotesForm.get('statusOfVisit').value
    }
    debugger
    this.providerService.endMeetAppointment(data).subscribe((response : any)=>{
      
      this.router.navigate(['/provider/appointment-list']);
    })
  }
  endMeetFromPatient(){
    this.router.navigate(['/patient/appointment-list']);
  }


  getMessageList() {
    this.providerService.getMessageList(this.bookingId).subscribe((response: any) => {
      this.messageList = response
      debugger
      if (this.messageList && this.messageList.length > 0) {
        const lastMessage = this.messageList[this.messageList.length - 1];
        const lastMessageId = lastMessage.messageList[lastMessage.messageList.length - 1];
        this.messageId = lastMessageId.messageId; // Store the last messageId
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

    })
  }

  addSoapNotes() {
    this.saveSignature()
    this.notificationService.markFormGroupTouched(this.soapNotesForm);
    if (this.soapNotesForm.invalid) {
      this.notificationService.markFormGroupTouched(this.soapNotesForm);
      return;
    }
    const formData = this.soapNotesForm.value;
    formData.meetingType = this.meetingType
    if(formData.exitTime == ""){
      const now = new Date();
      // Get the local time in HH:mm format
      const hours = now.getHours().toString().padStart(2, '0'); // Ensure two digits
      const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure two digits
  
      const formattedTime = `${hours}:${minutes}`;
      formData.exitTime = formattedTime
    }

    formData.arrivalTime = this.formatTimeToSeconds(formData.arrivalTime);
    formData.exitTime = this.formatTimeToSeconds(formData.exitTime);

    console.log(formData)

    formData.signature = this.signature
    this.providerService.addSoapNotes(formData).subscribe((response: any) => {
      this.router.navigate(['/provider/add-prescription'], { queryParams: { appointmentId: this.bookingId } });
    })
  }
  formatTimeToSeconds(time: string): string {
    if (time.includes(':') && !time.toLowerCase().includes('am') && !time.toLowerCase().includes('pm')) {
      return `${time}:00`; 
    }

    // Handle 12-hour format with AM/PM
    const [hours, minutes] = time.split(':'); // Split the time string
    const [cleanMinutes, period] = minutes.split(' '); // Extract minutes and AM/PM
    let formattedHours = parseInt(hours, 10);

    if (period.toUpperCase() === 'PM' && formattedHours !== 12) {
      formattedHours += 12; // Convert PM hours to 24-hour format
    } else if (period.toUpperCase() === 'AM' && formattedHours === 12) {
      formattedHours = 0; // Convert 12 AM to 00
    }

    return `${formattedHours.toString().padStart(2, '0')}:${cleanMinutes}:00`;
  }


  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  }
  downloadFile(filePath: string): any {
    filePath = environment.fileUrl + filePath;
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }
  ngAfterViewInit() {
    const canvas = this.signaturePad.nativeElement;
    this.context = canvas.getContext('2d');
    this.context.strokeStyle = '#000';  // Black color for signature
    this.context.lineWidth = 2;  // Line width for signature
    this.context.lineJoin = 'round';  // Rounded joins for smooth strokes
    this.context.lineCap = 'round';  // Rounded caps for smooth strokes
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    const { offsetX, offsetY } = this.getEventCoordinates(event);
    this.context.beginPath();
    this.context.moveTo(offsetX, offsetY);
    this.isDrawing = true;
    this.isSignatureFilled = true;
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.context.closePath();
    this.isDrawing = false;
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    const { offsetX, offsetY } = this.getEventCoordinates(event);
    this.context.lineTo(offsetX, offsetY);
    this.context.stroke();
  }

  private getEventCoordinates(event: MouseEvent | TouchEvent) {
    let offsetX, offsetY;
    if (event instanceof MouseEvent) {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0];
      offsetX = touch.clientX - this.signaturePad.nativeElement.getBoundingClientRect().left;
      offsetY = touch.clientY - this.signaturePad.nativeElement.getBoundingClientRect().top;
    }
    return { offsetX, offsetY };
  }

  // Method to clear the canvas
  clearSignature() {
    const canvas = this.signaturePad.nativeElement;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.isSignatureFilled = false;
    this.signature = null
  }

  // Method to save the signature as an image
  saveSignature(): void {
    const canvas = this.signaturePad.nativeElement;
    const dataUrl = canvas.toDataURL('image/png');
    const base64String = dataUrl.split(',')[1];
    this.signature = base64String;
  }



}