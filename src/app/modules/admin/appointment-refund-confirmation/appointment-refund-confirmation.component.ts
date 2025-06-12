import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { AdminService } from 'src/app/Services/admin.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-appointment-refund-confirmation',
  templateUrl: './appointment-refund-confirmation.component.html',
  styleUrls: ['./appointment-refund-confirmation.component.css']
})
export class AppointmentRefundConfirmationComponent implements OnInit {
   @Input() buttonShow: any
  constructor(
    private patientService: PatientService,
    public activeModel: NgbActiveModal,
    private adminService: AdminService,
    private notificationService: NotificationService,

  ) {

  }
  button:boolean=false;
  appointmentDataId: any;
  data: any;
  result: any;
  settingData: any;
  loading: boolean = false
  ngOnInit() {
    this.getAppointmentDetails();
    ;
    this.button=this.buttonShow;
  }
  confirmRefund() {
    const obj = {
      bookAppointmentId: this.appointmentDataId
    }
    // this.showDetails(bookingId)
    this.adminService.updateStatusForRefund(obj).subscribe((response: any) => {
      this.notificationService.showSuccess("Complaint status updated successfully.");
      this.closePopup();
      //  this.getAdminComplaintList()
    }, (error) => {
      this.notificationService.showDanger(getErrorMessage(error));
      this.closePopup();
      //this.getAdminComplaintList();
    }
    );
  }
  getAppointmentDetails() {
    this.patientService.getRefundAppointmentDetails(this.appointmentDataId).subscribe((response: any) => {
      ;
      this.data = response;
      //   if(this.data.isTimeBelow3Hrs == false){
      //     this.result=this.data?.totalAmount-this.data?.noRefundableAmount;
      //   }
      //   else{
      this.adminService.getAdminSettings()?.subscribe((data: any) => {
        ;
        this.settingData = data;
        const providerPercentage = this.settingData.percentage;
        this.calculateAmounts(this.data?.totalAmount, this.data?.noRefundableAmount, providerPercentage)
      });
      //   }  
    });
  }
  providerCharges: any;
  PlatformCharges: any;
  calculateAmounts(amount: number, gatewayAmount: number, applicationPercentage) {
    ;
    const providerPercentage = 100 - applicationPercentage;
    amount = amount - gatewayAmount;
    const platformPercentage = Number(applicationPercentage);
    this.PlatformCharges = (amount * platformPercentage) / 100;
    this.providerCharges = (amount * providerPercentage) / 100;
  }

  closePopup() {
    this.loading = true;
    this.activeModel.close();
    this.loading = false;
  }
}
