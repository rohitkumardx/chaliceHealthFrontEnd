import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';

@Component({
  selector: 'app-report-appointment',
  templateUrl: './report-appointment.component.html',
  styleUrls: ['./report-appointment.component.css']
})
export class ReportAppointmentComponent {
  isReportReasonInvalid: boolean = false;
  isCommentInvalid: boolean = false;
  reportReason: string = '';
  reasonForCancellation: string = '';
  comment: string = '';
  reportOptions: any[] = [];
  appointmentDetails: any = {};
  
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any;

  constructor(
    private fb: FormBuilder,
    private activeModel: NgbActiveModal,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private providerService: ProviderService
  ) {}

  ngOnInit() {
    if (this.bookingId?.type == 'Report') {
      this.getReportTypeList();
    }
    this.getAppointmentDetails();
  }

  confirmCancellation() {
    if (!this.reasonForCancellation.trim()) {
      this.notificationService.showDanger('Please enter the reason for cancellation.');
      return;
    }

    const bookingId = this.bookingId.bookingId;
    const obj = { reasonForCancellation: this.reasonForCancellation };

    this.providerService.appointmentCancellationStatus(bookingId, obj).subscribe(
      () => {
        this.notificationService.showSuccess('Appointment cancelled successfully.');
        this.modalClose();
      },
      (error) => {
        console.error('Error cancelling appointment:', error);
      }
    );
  }

  // getFormattedAppointment() {
  //   if (!this.appointmentDetails?.startTime) return 'N/A';

  //   const formattedDate = this.datePipe.transform(this.appointmentDetails.appointmentDateTime, 'MM-dd-yyyy') ;
  //   const timeParts = this.appointmentDetails.startTime?.split(':') || [];
    
  //   if (timeParts.length < 2) return formattedDate;

  //   let hour = parseInt(timeParts[0], 10);
  //   const minutes = timeParts[1];
  //   const ampm = hour >= 12 ? 'PM' : 'AM';
  //   hour = hour % 12 || 12;

  //   return `${formattedDate} (${hour}:${minutes} ${ampm})`;
  // }
  
  getFormattedAppointment() {
    if (!this.appointmentDetails?.appointmentDateTime) return 'N/A';
  
    const appointmentDateTime = new Date(this.appointmentDetails.appointmentDateTime);
    const formattedDate = this.datePipe.transform(appointmentDateTime, 'MM-dd-yyyy');
  
    let hours = appointmentDateTime.getHours();
    const minutes = appointmentDateTime.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  
    return `${formattedDate} (${hours}:${minutes} ${ampm})`;
  }
  

  getAppointmentDetails() {
    if (!this.bookingId?.bookingId) return;

    this.providerService.getBookingDetails(this.bookingId.bookingId).subscribe(
      (response: any) => {
        this.appointmentDetails = response || {};
      },
      (error) => {
        console.error('Error fetching appointment details:', error);
      }
    );
  }

  getReportTypeList() {
    this.providerService.getReportList().subscribe(
      (response: any) => {
        this.reportOptions = response || [];
      },
      (error) => {
        console.error('Error fetching report options:', error);
      }
    );
  }

  formatTime(time: string): string {
    if (!time) return 'N/A';
    
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  formatDOB(dob: string): string {
    if (!dob) return 'N/A';
    
    const birthDate = new Date(dob);
    const today = new Date();
    const formattedDate = `${birthDate.getMonth() + 1}/${birthDate.getDate()}/${birthDate.getFullYear()}`;

    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${formattedDate} (${age} yrs)`;
  }

  cancel() {
    this.activeModel.close();
  }

  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }

  submitFeedback() {
    this.isReportReasonInvalid = !this.reportReason;
    this.isCommentInvalid = !this.comment.trim();

    if (this.isReportReasonInvalid || this.isCommentInvalid) return;

    const feedbackObj = {
      bookAppointmentId: this.bookingId.bookingId,
      reportTypeId: this.reportReason,
      comment: this.comment
    };

    this.providerService.submitReport(feedbackObj).subscribe(() => {
      this.notificationService.showSuccess('Appointment reported successfully.');
      this.modalClose();
    });
  }
}
