import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, } from '@angular/forms';
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
  reportOptions: any
  appointmentDetails: any
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any

  constructor(private fb: FormBuilder,
    private activeModel: NgbActiveModal,
    private datePipe: DatePipe,
    private notificationService: NotificationService,
    private providerService: ProviderService
  ) { }

  ngOnInit() {
    debugger
    if (this.bookingId.type == 'Report') {
      this.getReportTypeList()
    }
    this.getAppointmentDetails()
  }
  confirmCancellation() {
    if (!this.reasonForCancellation.trim()) {
      // alert('Please enter the reason for cancellation.');
      this.notificationService.showDanger('Please enter ')
      return;
    }

    const bookingId = this.bookingId.bookingId; // Extract booking ID from input
    const reason = this.reasonForCancellation; // Get reason for cancellation
    const obj =
    {
      reasonForCancellation: reason
    }
    this.providerService.appointmentCancellationStatus(bookingId, obj).subscribe(
      (response: any) => {
        this.notificationService.showSuccess('Appointment cancelled successfully.')
        console.log('Cancellation successful:', response);
        this.modalClose();
      },
      (error) => {
        console.error('Error cancelling appointment:', error);
      }
    );
  }

  getFormattedAppointment() {
    const formattedDate = this.datePipe.transform(this.appointmentDetails.date, 'MM/dd/yyyy');
    const timeParts = this.appointmentDetails.startTime.split(':');
    let hour = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const formattedTime = `${hour}:${minutes} ${ampm}`;
    return `${formattedDate}  (${formattedTime})`;
  }

  getAppointmentDetails() {
    this.providerService.getBookingDetails(this.bookingId.bookingId).subscribe((response: any) => {
      this.appointmentDetails = response
    })
  }
  getReportTypeList() {
    this.providerService.getReportList().subscribe((response: any) => {
      this.reportOptions = response
    })
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12; // Convert to 12-hour format, replacing 0 with 12
    return `${adjustedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  formatDOB(dob: string): string {
    const birthDate = new Date(dob);
    const today = new Date();

    // Format date as YYYY-MM-DD
    const formattedDate = birthDate.toISOString().split('T')[0];

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    // Adjust if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
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
    // Reset validation flags
    this.isReportReasonInvalid = !this.reportReason; // Invalid if reportReason is null or empty
    this.isCommentInvalid = !this.comment || !this.comment.trim(); // Invalid if comment is empty or whitespace only

    // If any validation fails, return early
    if (this.isReportReasonInvalid || this.isCommentInvalid) {
      return;
    }

    // Construct feedback object
    const feedbackObj = {
      bookAppointmentId: this.bookingId.bookingId,
      reportTypeId: this.reportReason,
      comment: this.comment
    };

    // Submit the feedback
    this.providerService.submitReport(feedbackObj).subscribe(
      (response: any) => {
        this.notificationService.showSuccess('Appointment reported successfully.')
        this.modalClose();
      },
      (error: any) => {
        console.error('Error submitting feedback:', error);
      }
    );
    this.modalClose();
  }

}
