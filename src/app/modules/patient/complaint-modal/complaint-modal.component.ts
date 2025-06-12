import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-complaint-modal',
  templateUrl: './complaint-modal.component.html',
  styleUrls: ['./complaint-modal.component.css']
})
export class ComplaintModalComponent implements OnInit {
   @Input() bookAppointmentId: any

  value: string = '';  // Changed type to string
  bookingData: any;
  loading: boolean = false;
  complaintForm : FormGroup

  constructor(public activeModal: NgbActiveModal,
    private patientService : PatientService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.complaintForm = this.fb.group({
          reason: ['',  [Validators.required, Validators.pattern(/\S+/)]],
        });
     
    this.getComplaintById();
    this.getBookAppointmentById();

  }
  formatTime(time: string): string {
    return this.datePipe.transform(`1970-01-01T${time}`, 'hh:mm a') || '';
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  getComplaintById(){
    this.patientService.getComplaintById(this.bookAppointmentId).subscribe((data: any) => {
  
      this.complaintForm.patchValue({
        complaintId: data.complaintId,
        reason: data.reason,
        patientName: data.patientName,
        complaintDate: data.complaintDate,
        status: data.status,
        meetingType: data.meetingType,
        providerName: data.providerName,
       
      });
      this.getBookAppointmentById();
      console.log("complaint data :", this.bookingData)
    })
  }
  getBookAppointmentById() {
    this.patientService.getBookAppointmentById(this.bookAppointmentId).subscribe((data: any) => {
      this.bookingData = data;
  
      // Check if reason is provided in API response
      this.bookingData.reason =  this.complaintForm.value.reason; 
  
      console.log("Booking data:", this.complaintForm.value.reason);
    });
  }
  

  confirmComplaintAppointment(){
 if (this.complaintForm.valid) {
      this.loading = true;
      const formData = this.complaintForm.value; // get the form values
      const postData = {
        bookAppointmentId: this.bookAppointmentId, // Assuming this is available from previous logic
        reason: formData.reason
      };
      this.patientService.postComplaintReason(postData).subscribe((response: any) => {
        const data = response;
        if (data == true) {
          this.notificationService.showSuccess("Complaint request created sucessfully");
          this.activeModal.close();
          this.loading = false;
        }
      },
        (error: any) => {
          this.loading = false;
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    }

  }



  modalClose() {
 
    this.activeModal.close();
  }
  
  
  
}
