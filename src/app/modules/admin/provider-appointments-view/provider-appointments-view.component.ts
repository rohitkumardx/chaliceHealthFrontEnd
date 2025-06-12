import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';

@Component({
  selector: 'app-provider-appointments-view',
  templateUrl: './provider-appointments-view.component.html',
  styleUrls: ['./provider-appointments-view.component.css']
})
export class ProviderAppointmentsViewComponent implements OnInit {

  @Output() dialogClosed = new EventEmitter<void>();
  @Input() userId: any;

  appointmentList: any[] = [];
  loading: boolean = false;
  filteredItems: any[] = [];

  constructor(
    private adminService: AdminService,
    private activeModal: NgbActiveModal,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getAppointmentListByUserId();
  }

  getAppointmentListByUserId() {
    this.adminService.getProvidersAppointmentListByUserId(this.userId).subscribe((response: any) => {
      this.appointmentList = response.items || [];
      console.log("Appointment list data", this.appointmentList);
    });
  }

  modalClose() {
    this.activeModal.close();
    this.dialogClosed.emit();
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
}
