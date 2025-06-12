import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  styleUrls: ['./view-notification.component.css']
})
export class ViewNotificationComponent {
 @Input() appointmentDataId: any
 // refundForm!: FormGroup;
  hash: any;
  data: any;
  loading: boolean = false;
  loading1: boolean = false;
  constructor(//private fb: FormBuilder,
    private authService: AuthService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private router: Router,
    public activeModel: NgbActiveModal,
  ) { }
  ngOnInit() {
    // this.refundForm = this.fb.group({
    //   reason: ['', Validators.required],
    // });  
   
    this.patientService.getRefundAppointmentDetails(this.appointmentDataId).subscribe((response: any) => {
      this.data = response;
    })
  }
  // acceptOrRejectRefund(status: boolean) {
 
  //   if (status === false) {
  //     this.loading1=true;
  //     // Check if the form is invalid
  //     if (this.refundForm.invalid) {
  //       this.markAllAsTouched();
  //       return;  
  //     }
  //     const formData = this.refundForm.value;
  //     const postData = {
  //       bookAppointmentId: this.data.bookAppointmentId,
  //       Status: status, 
  //       reason: formData.reason
  //     };
  //     // Submit the form data to the backend
  //     this.patientService.acceptOrRejectRefund(postData).subscribe((response: any) => {
  //       this.notificationService.showSuccess("Refund rejected");
  //       this.data = response;
  //       this.loading1=false;
  //       this.activeModel.close();
  //     },
  //       (error: any) => {
  //         this.loading1=false;
  //         this.notificationService.showDanger(getErrorMessage(error.error));
  //         this.activeModel.close();
  //       }
  //     );

  //   } else {
  //     this.loading=true;
  //     const postData = {
  //       bookAppointmentId: this.data.bookAppointmentId,
  //       Status: status,
  //       reason: "string"
  //     };
  //     this.patientService.acceptOrRejectRefund(postData).subscribe((response: any) => {
  
  //       this.notificationService.showSuccess("Refund accepted sucessfully");
  //       this.loading=false;
  //       this.data = response;
  //       this.activeModel.close();
  //     },
  //       (error: any) => {
  //         this.loading=false;
  //         this.notificationService.showDanger(error.error);
  //         this.activeModel.close();
  //       }
  //     );
  //   }
  //   //this.loading=false;
  //   //this.loading1=false;
  // }
  // Utility method to mark all form controls as touched
  // private markAllAsTouched() {
  //   Object.keys(this.refundForm.controls).forEach(controlName => {
  //     const control = this.refundForm.get(controlName);
  //     if (control) {
  //       control.markAsTouched();
  //     }
  //   });
  // }

  closePopup() {
    this.loading = true;
    this.activeModel.close();
    this.loading = false;
  }
}
