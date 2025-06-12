
import { NotificationService } from './Services/notification.service';
import { IdleService } from './Services/idle.service';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ChaliceHealth';
  constructor(public notificationService: NotificationService,private idleService: IdleService){}


}
