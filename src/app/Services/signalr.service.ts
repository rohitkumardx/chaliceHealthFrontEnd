import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { NotificationService } from './notification.service';
import { PopUpService } from './pop-up.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private messageSubject = new Subject<{ messageContent: string; messageId: any }>();
  public message$ = this.messageSubject.asObservable();

  private messageCount = new Subject<{ messageCount: string }>();
  private BlogCount = new Subject<{ BlogCount: string }>();
  public BlogCount$ = this.BlogCount.asObservable();
  public messageCount$ = this.messageCount.asObservable();


  private notificationCount = new Subject<any>();
  public notificationCount$ = this.notificationCount.asObservable();



  private hubConnection: signalR.HubConnection;
  constructor(
    private authService: AuthService,
   private popupService:PopUpService,
    private loggingService: LoggingService,
    private snackBar: MatSnackBar) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => this.getAccessToken()
      })
      .build();

    this.hubConnection.onclose((error) => {
      this.loggingService.error('Connection closed due to error:', error);
      //  this.notifyUser('Connection closed. Please refresh the page.');
      this.reconnect();
    });

    this.hubConnection.onreconnected((connectionId) => {
      this.loggingService.log('Reconnected. Connection ID:', connectionId);
      // this.notifyUser('Reconnected to server.');
    });

    this.hubConnection.onreconnecting((error) => {
      this.loggingService.warn('Reconnecting due to error:', error);
      // this.notifyUser('Reconnecting to server...');
    });
  }


  public startConnection() {
    
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
      this.loggingService.log('Starting SignalR connection...');
      this.hubConnection
        .start()
        .then(() => {
          this.loggingService.log('SignalR connected');
          this.getConnectionId();
        })
        .catch(err => this.loggingService.error('Error while establishing connection:', err));
    } else {
      this.loggingService.warn(`Cannot start connection because it is in ${this.hubConnection.state} state`);
    }
  }

  private reconnect() {
    setTimeout(() => {
      this.startConnection();
    }, 5000);
  }

  private getConnectionId() {
    
    this.hubConnection.invoke('GetConnectionId')
      .then((connectionId: string) => {
        this.loggingService.log('Connection ID:', connectionId);

      })
      .catch(err => this.loggingService.error('Error while getting connection ID:', err));
  }

  public addNotificationListener(callback: (message: string) => void): void {
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      this.loggingService.log('Notification received:', message);
      // this.notifyUser(`New Notification: ${message}`);
      callback(message);
    });
  }

  public addMessageListener(callback: (message: string) => void): void {
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      this.loggingService.log('Message received:', message);
      //this.notifyUser(`New Message: ${message}`);
      callback(message);
    });
  }




  private getHubUrl() {
    const userId = this.getUserId();
    return `${environment.apiUrl}/notificationHub?userId=${encodeURIComponent(userId)}`;
  };

  private getUserId(): string {
    const userInfo = this.authService.getUserInfo();
    return userInfo ? userInfo.userId : 'unknown-user';
  }

  private getAccessToken(): any {
    return this.authService.getToken();
  }





  public addReceiveMessageListener(): void {
    this.hubConnection.on('ReceiveMessage', (messageContent: string, messageId: any) => {
      this.messageSubject.next({ messageContent, messageId });
      this.loggingService.log('Message received:', { messageContent, messageId });

      this.messageCount.next({ messageCount: messageId });
      this.loggingService.log('Received message count update:', { messageContent });
    });
  }

  public addMessageCountListener(): void {
    this.hubConnection.on('ReceiveMessageCountUpdate', (messageCount: string) => {
      this.messageCount.next({ messageCount });
      this.loggingService.log('Message count update:', { messageCount });
    });
  }
  
  public addAllNotificationCount(): void {
    this.hubConnection.on('NotificationCount', (BlogCount: any) => {
       this.BlogCount.next(BlogCount);
       console.log("This is motification count",BlogCount);
         this.popupService.showPopup(BlogCount.message);
      //  this.notificationService.showSuccess(BlogCount.message)
    });
    
  }
  
  addNotificationCountListener() {
    this.hubConnection.on('BookAppointment', (notificationData: any) => {
      console.log('Notification received:', notificationData);
      this.notificationCount.next(notificationData);
    });
  }

  public getNotificationCount(){
    this.BlogCount.next(null);
  }
  
}

