import { Component } from '@angular/core';
import { NotificationService } from './Services/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ChaliceHealth';
  constructor(public notificationService: NotificationService){}

}
