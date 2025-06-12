import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-notification-view-detail-popup',
  templateUrl: './notification-view-detail-popup.component.html',
  styleUrls: ['./notification-view-detail-popup.component.css']
})
export class NotificationViewDetailPopupComponent {

  transactionDetails: any
  @Input() notificationId: any
  @Output() dialogClosed = new EventEmitter<void>();

  constructor(public activeModel: NgbActiveModal,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.getDetails()
  }


  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }


  getDetails() {
    this.adminService.getNotificationDetails(this.notificationId).subscribe((response: any) => {
      this.transactionDetails = response.items[0]
    })
  }




  closePopup() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
}
