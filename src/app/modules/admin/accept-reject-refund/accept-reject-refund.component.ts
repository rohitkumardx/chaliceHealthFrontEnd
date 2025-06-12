import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { noWhitespaceValidator } from 'src/app/shared/validators/no-whitespace-validator';
import { AdminService } from 'src/app/Services/admin.service';

@Component({
  selector: 'app-accept-reject-refund',
  templateUrl: './accept-reject-refund.component.html',
  styleUrls: ['./accept-reject-refund.component.css']
})
export class AcceptRejectRefundComponent {
  @Input() appointmentDataId: any
  refundForm!: FormGroup;
  hash: any;
  data: any;
  loading: boolean = false;
  loading1: boolean = false;
  percentangeOptions: any;
  result: number;
  settingData: any;
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private adminService: AdminService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private router: Router,
    public activeModel: NgbActiveModal,
  ) { }
  ngOnInit() {
    this.percentangeOptions = this.getPercentageOptions();
    this.refundForm = this.fb.group({
      reason: ['', [Validators.required, noWhitespaceValidator()]],
    });
    this.patientService.getRefundAppointmentDetails(this.appointmentDataId).subscribe((response: any) => {
      
      this.data = response;
      if(this.data.isTimeBelow3Hrs == false){
        this.result=this.data?.totalAmount-this.data?.noRefundableAmount;
      }
      else{
        this.adminService.getAdminSettings()?.subscribe((data: any) => {
          
          this.settingData = data;
          const providerPercentage = this.settingData.percentage;
          this.calculateAmounts(this.data?.totalAmount, this.data?.noRefundableAmount, providerPercentage)
        });
      }  
    });
  }
  providerCharges: any;
  PlatformCharges: any;
  calculateAmounts(amount: number, gatewayAmount: number, applicationPercentage) {

    const providerPercentage= 100-applicationPercentage;
    amount = amount - gatewayAmount;
    const platformPercentage = Number(applicationPercentage);
    this.PlatformCharges= (amount * platformPercentage) / 100;
    this.providerCharges= (amount * providerPercentage) / 100;  
  }

  getPercentageOptions(): number[] {
    const result: number[] = [];
    for (let i = 5; i <= 100; i += 5) {
      result.push(i);
    }
    return result;
  }
  selectedPercentage: any;
  calculatePercentage(amount: number, gatewayAmount: number, event: Event) {
    amount = amount - gatewayAmount;
    const selectedPercentage = (event.target as HTMLSelectElement).value;  // Cast event.target to HTMLSelectElement
    this.selectedPercentage = Number(selectedPercentage);
    this.result = (amount * +selectedPercentage) / 100;  // Convert string to number
    const applicationPercentage=this.settingData.percentage;
     const remainingAmount=amount-this.result
    const providerPercentage= 100-applicationPercentage;
    const platformPercentage = Number(applicationPercentage);
    this.PlatformCharges= (remainingAmount * platformPercentage) / 100;
    this.providerCharges= (remainingAmount * providerPercentage) / 100;  
  }
  acceptOrRejectRefund(status: boolean) {
    if (status === false) {
      this.loading1 = true;
      if (this.refundForm.invalid) {
        this.markAllAsTouched();
        return;
      }
      const formData = this.refundForm.value;
      const postData = {
        bookAppointmentId: this.data.bookAppointmentId,
        status: status,
        refundPercentage: 0,
        reason: formData.reason
      };

      this.patientService.acceptOrRejectRefund(postData).subscribe((response: any) => {
        this.notificationService.showSuccess("Refund rejected");
        this.data = response;
        this.loading1 = false;
        this.activeModel.close();
      },
        (error: any) => {
          this.loading1 = false;
          this.notificationService.showDanger(getErrorMessage(error));
          this.activeModel.close();
        }
      );

    } else {
      this.loading = true;
      const postData = {
        bookAppointmentId: this.data.bookAppointmentId,
        refundPercentage: this.selectedPercentage,
        status: status,
        reason: "string"
      };
      this.patientService.acceptOrRejectRefund(postData).subscribe((response: any) => {
        
        this.notificationService.showSuccess("Refund accepted sucessfully");
        this.loading = false;
        this.data = response;
        this.activeModel.close();
      },
        (error: any) => {
          this.loading = false;
          this.notificationService.showDanger(getErrorMessage(error));
          this.activeModel.close();
        }
      );
    }
  }
  // Utility method to mark all form controls as touched
  private markAllAsTouched() {
    Object.keys(this.refundForm.controls).forEach(controlName => {
      const control = this.refundForm.get(controlName);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  closePopup() {
    this.loading = true;
    this.activeModel.close();
    this.loading = false;
  }
}
