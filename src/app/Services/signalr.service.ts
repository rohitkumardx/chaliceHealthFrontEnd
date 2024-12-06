import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private messageSubject = new Subject<{ messageContent: string; messageId: any }>();
  public message$ = this.messageSubject.asObservable();

  private messageCount = new Subject<{ messageCount: string }>();
  public messageCount$ = this.messageCount.asObservable();
  
  private hubConnection: signalR.HubConnection;
 constructor(
    private authService: AuthService,
    private loggingService: LoggingService,
    private snackBar: MatSnackBar ) {
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
    debugger
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
    debugger
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

  public addNotifacationCountListener(callback: (message: string) => void): void {
    this.hubConnection.on('ReceiveNotificationCountUpdate', (message: string) => {
      this.loggingService.log('Notification update  received:', message);
     // this.notifyUser(`New Notification update: ${message}`);
      callback(message); 
    });
  }
  // public addMessageCountListener(callback: (message: string) => void): void {
  //   this.hubConnection.on('ReceiveMessageCountUpdate', (message: string) => {
  //     this.loggingService.log('Notification update  received:', message);
  //    // this.notifyUser(`New Notification update: ${message}`);
  //     callback(message); 
  //   });
  // }

  
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

  // private notifyUser(message: string) {
  //   this.snackBar.open(message, 'Close', {
  //     duration: 5000, 
  //     horizontalPosition: 'right',
  //     verticalPosition: 'top',
  //   });
  // }




  public addReceiveMessageListener(): void {
    debugger
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
}

