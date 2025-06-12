import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { noWhitespaceValidator } from 'src/app/shared/validators/no-whitespace-validator';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-cancel-appointment-model',
  templateUrl: './cancel-appointment-model.component.html',
  styleUrls: ['./cancel-appointment-model.component.css']
})
export class CancelAppointmentModelComponent implements OnInit {
  @Input() appointmentDataId: any
  @Output() dialogClosed = new EventEmitter<void>();

  constructor(public activeModel: NgbActiveModal,
    private patientService: PatientService,
    private fb: FormBuilder,
  private notificationService: NotificationService,
  ) { }
  data: any;
  appointmentCancellationForm: FormGroup;
  loading: boolean = false;
  
  ngOnInit() {
    this.getCancelDetails();
    this.appointmentCancellationForm = this.fb.group({
       reason: ['', [Validators.required, noWhitespaceValidator()]]  
      
    });
  }

  closePopup() {
    this.loading = true;
    this.activeModel.close();
    this.loading = false;
    this.dialogClosed.emit();
   
  }
  getCancelDetails() {
    this.loading = true;
    this.patientService.getCancelAppointmentDetails(this.appointmentDataId).subscribe((response: any) => {
      this.data = response;
      this.loading = false;
    });
  }
  confirmCancelAppointment() {
    if (this.appointmentCancellationForm.valid) {
      this.loading = true;
      const formData = this.appointmentCancellationForm.value; // get the form values
      const postData = {
        appointmentId: this.appointmentDataId, // Assuming this is available from previous logic
        reason: formData.reason
      };
      this.patientService.postReasonForCancellation(postData).subscribe((response: any) => {
        const data = response;
        if (data == true) {
          this.notificationService.showSuccess("Cancel request created sucessfully");
          this.activeModel.close();
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

}
