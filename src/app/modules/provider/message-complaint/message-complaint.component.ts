import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';@Component({
  selector: 'app-message-complaint',
  templateUrl: './message-complaint.component.html',
  styleUrls: ['./message-complaint.component.css']
})
export class MessageComplaintComponent implements OnInit {
  @Input() patientId: any
  @Input() providerId: any

  value: string = '';  // Changed type to string
  bookingData: any;
  loading: boolean = false;
  messageReportTypeId: any;
  reportOptions: any[] = [];
  reportReason: string = '';

  complaintForm : FormGroup

  constructor(public activeModal: NgbActiveModal,
    private patientService : PatientService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private datePipe: DatePipe,
    private providerService: ProviderService
  ) {}

  ngOnInit() {
this.getMessageReportList()

    this.complaintForm = this.fb.group({
          // reason: ['',  [Validators.required, Validators.pattern(/\S+/)]],
          reason: [''],

          
        });
     
    // this.getComplaintById();
    // this.getBookAppointmentById();

  }
  formatTime(time: string): string {
    return this.datePipe.transform(`1970-01-01T${time}`, 'hh:mm a') || '';
  }

  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }


  getMessageReportList() {
    this.providerService.getMessageReportList().subscribe(
      (response: any) => {
        this.reportOptions = response || [];
      },
      (error) => {
        console.error('Error fetching report options:', error);
      }
    );
  }
  confirmComplaintMessage() {
   
    if (this.complaintForm.valid) {
      this.loading = true;
      const formData = this.complaintForm.value; // Get the form values
  
      const postData = {
        complaintById: this.providerId,  // Ensure camelCase format
        complaintToId: this.patientId,  // Ensure camelCase format
        messageReportTypeId: this.reportReason, // Use reportReason correctly
        reason: formData.reason // Already correct
      };
  
      this.providerService.postComplaintMessageReason(postData).subscribe(
        (response: any) => {
          if (response === true) {
            this.notificationService.showSuccess("Complaint request created successfully");
            this.activeModal.close();
          }
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger("Please provide a valid reason for the complaint.");
    }
  }
  



  modalClose() {
 
    this.activeModal.close();
  }


}
