import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settingData: any;
  value: number | null = null;
  showError: boolean = false;
  paymentOptions = [
    { label: 'Monthly', value: 30 },    
    { label: 'Bi-weekly', value: 14 },    
    { label: 'Weekly', value: 7 }         
  ];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.getAdminSettings();
  }

  checkValidation() {
    this.showError = !this.value;
    const value= Number(this.value)
    this.providerPercentage = 100-value;
  }
  selectedPaymentValue: number;
  selectedPaymentLabel:any;

  onPaymentOptionChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.selectedPaymentValue = Number(selectedValue); // Convert string to number
    this.selectedPaymentLabel = this.getSelectedPaymentLabel(this.selectedPaymentValue);
  }
  getSelectedPaymentLabel(value: number): string {
    const option = this.paymentOptions.find(option => option.value === value);
    return option ? option.label : '';  // Return the label if found, else return an empty string
  }
  submit() {
    if (!this.value) {
      this.showError = true;
      return;
    }
    const valueAsString = this.value.toString();
    // If settingData.id is not present, send 0
    const idToSend = this.settingData?.id || 0;

    const obj = {
      percentage: valueAsString,
      paymentTransferDays:this.selectedPaymentValue,
      id: idToSend,
    };

    // Call the service to handle submission
    this.adminService.addPlatformPercentage(obj).subscribe((response: any) => {
      const actionType = idToSend === 0 ? 'added' : 'updated';
      this.notificationService.showSuccess(
        `Platform fees and provider fees updated have been successfully.`
        // `Platform fees of ${this.value}% have been successfully ${actionType}.`
      );
    });
  }
providerPercentage:any;
  getAdminSettings() {
    this.adminService.getAdminSettings()?.subscribe((data: any) => {
      this.settingData = data;
     
      console.log("This is setting appointment data", this.settingData);

      if (this.settingData?.percentage) {
        this.value = Number(this.settingData.percentage);
        this.providerPercentage= 100-this.value;

      }
      if (this.settingData?.paymentTransferDays !== undefined) {
        this.selectedPaymentValue = this.settingData.paymentTransferDays;
        this.selectedPaymentLabel = this.getSelectedPaymentLabel(this.selectedPaymentValue);
      }
    });
  }
}
