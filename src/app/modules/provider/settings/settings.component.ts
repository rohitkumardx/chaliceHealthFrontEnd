import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import * as _ from 'lodash';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { creditCardValidator } from 'src/app/shared/validators/credit-card-validator';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientClinicalDashboardComponent } from '../../patient/patient-clinical-dashboard/patient-clinical-dashboard.component';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';
import { noWhitespaceValidator } from 'src/app/shared/validators/no-whitespace-validator';
import { TermsOfServiceComponent } from '../../auth/terms-of-service/terms-of-service.component';
declare var Stripe: any; // Declare Stripe global object

export enum NotificationPreferenceOption {
  Email = 'Email',
  Phone = 'Phone',
  Both = 'Both'
}

export function phonePatternValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const valid = /^\(\d{3}\)-\d{3}-\d{4}$/.test(value);
    return valid ? null : { 'invalidPhonePattern': { value } };
  };
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  payoutForm!: FormGroup;
  notificationForm!: FormGroup;
  state: any;
  filter: any;
  states: any[] = [];
  userId: any;
  reportList: any;
  totalAmount: any;
  loading: boolean = false;
  isLoading: boolean = false;
  notificationData: any;
  selectedFilter: string = '';
  totalClinicAmount: any;
  preference = NotificationPreferenceOption;

  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  _ = _;

  stripe: any;
  elements: any;
  cardElement: any;

  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  roles: {
    id: number,
    numOfUsers: number,
    name: string,
    status: string
  }[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private providerService: ProviderService,
    private globalModalService: GlobalModalService,
    private modalService: NgbModal,

  ) { }

  ngOnInit() {

    this.payoutForm = this.fb.group({
      id: ['0'],
      LegalName: ['', [Validators.required, noWhitespaceValidator()]],
      // EmployerIdentificationNumber: [''],
      EmployerIdentificationNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      AddressLine1: ['', Validators.required],
      AddressLine2: [''],
      // City: ['', Validators.required],
      // StateId: ['', Validators.required],
      City: ['', [Validators.required, noWhitespaceValidator()]],
      StateId: ['', [Validators.required, noWhitespaceValidator()]],
      // AccountNumber: ['', Validators.required],
      AccountNumber: ['', [Validators.required, Validators.pattern(/^\d{5,12}$/)]],
      ConfirmAccountNumber: ['', [Validators.required]],
      // ConfirmAccountNumber: [''],
      RoutingNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      accountType: [''],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],

    }, { validator: this.matchingAccountNumbers });

    this.notificationForm = this.fb.group({
      id: ['0'],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      preference: [this.preference.Both]
      // notificationMethod: ['both', Validators.required],
    })

    // this.saveCard(); 
    //  this.getClinicAmountByUserId();
    this.getNotificationByUserId();
    this.getproviderAmountByUserId();
    this.getReportList();
    this.getPayoutDetailByUserId();
    this.getState();

    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    console.log("this is local storage data:", userInfo)

  }


  ngAfterViewInit() {
    this.initializeStripe();
    // Wait for the DOM to load before trying to mount
    // this.card = this.elements.create('card');
    // this.card.mount('#card-element');
  }
  // cardNumber:any;
  // cardExpiry:any;
  // cardCvc:any;

  initializeStripe() {
    this.stripe = Stripe('pk_test_51R7hk1EaQjLSiiPEZryryBg0q1q83D1iTA36iQ7zDEyexD7iRQvLrfGPQEEcGksFfCL6TTfrXPLgUK7vgOxMuDcS00y2nRehqY'); // Replace with your Stripe public key
    this.elements = this.stripe.elements();

    this.cardElement = this.elements.create('card');


    this.cardElement.mount('#card-element');
  }

  async handlePayment() {
    event.preventDefault();

    const { paymentMethod, error } = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement
    });

    if (error) {

      document.getElementById('card-errors')!.textContent = error.message;
    } else {

      //console.log('Payment Method ID:', paymentMethod.id);
      this.paymentId = paymentMethod.id;
      //  this.saveCard(paymentMethod.id);
      this.postPayoutDetails();
    }
  }

      sortData(column: string) {
    debugger
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getReportList();
  }

  matchingAccountNumbers(formGroup: FormGroup) {
    const accountNumber = formGroup.get('AccountNumber')?.value?.replace(/-/g, '');
    const confirmAccountNumber = formGroup.get('ConfirmAccountNumber')?.value?.replace(/-/g, '');

    // if (confirmAccountNumber && confirmAccountNumber.length !== 12) {
      if (confirmAccountNumber.length < 5 || confirmAccountNumber.length > 12) {
        formGroup.get('ConfirmAccountNumber')?.setErrors({ length: true });
      } else if (accountNumber !== confirmAccountNumber) {
        formGroup.get('ConfirmAccountNumber')?.setErrors({ mismatch: true });
      } else {
        formGroup.get('ConfirmAccountNumber')?.setErrors(null);
      }
    }
   
   
   
   
    allowOnlyDigits(event: KeyboardEvent): void {
      const char = event.key;
      if (!/^[0-9]$/.test(char)) {
        event.preventDefault();
      }
    }
   
    blockNonDigitsOnPaste(event: ClipboardEvent): void {
      const clipboardData = event.clipboardData?.getData('text') || '';
      if (!/^\d+$/.test(clipboardData)) {
        event.preventDefault();
      }
    }
   
  
    accountMatchValidator(form: FormGroup) {
      const account = form.get('AccountNumber')?.value;
      const confirm = form.get('ConfirmAccountNumber')?.value;
      return account === confirm ? null : { mismatch: true };
    }
     

  // clientIp: any;
  // saveCard() {
  //   
  //   this.providerService.getClientIp().subscribe((response: any) => {
  //     
  //     // this.clientIp = response.ip; // This will give you the client's IP
  //    // console.log('Client IP:', this.clientIp);
  //     // this.sendIpToApi(this.clientIp);
  //   },
  //   (error) => {
  //    
  //     this.notificationService.showDanger(getErrorMessage(error));
  //     this.isLoading = false; 
  //     console.error(error);
  //   }
  // );
  // }
  paymentId: any;
  postPayoutDetails() {

    //  this.handlePayment();

    if (this.payoutForm.valid) {
      this.isLoading = true;
      const payoutDetails = {
        ...this.payoutForm.value,
        userId: this.userId,
        paymentMethodId: this.paymentId
      };


      this.providerService.postPayoutDetails(payoutDetails).subscribe(
        (response) => {
          // this.isLoading = false; // Set loading state to false
          const userInfo = this.authService.getUserInfo();

          if (userInfo.accountType === "PrivatePractices" || userInfo.accountType === 'Facility') {
            // const obj = { 
            //   IpAddress:this.clientIp
            // }
            this.providerService.createAccountOnStripeForCompany(this.userId).subscribe((data) => {
              this.notificationService.showSuccess('Payout details added successfully!');
              this.isLoading = false;
            }, (error) => {
              ;
              this.notificationService.showDanger(getErrorMessage(error));
              this.isLoading = false;
            }
            );
          } else {
            const obj = {
              userId: this.userId,
              // ip:this.clientIp
            }
            this.providerService.createAccountOnStripe(obj).subscribe((data) => {
              this.notificationService.showSuccess('Payout details added successfully!');
              this.isLoading = false;
            }, (error) => {
              ;
              this.notificationService.showDanger(getErrorMessage(error));
              this.isLoading = false;
            }
            );
          }
        },
        (error) => {
          this.isLoading = false;
          this.notificationService.showDanger(getErrorMessage(error));
          this.isLoading = false;
          console.error(error);
        }
      );
    } else {
      this.payoutForm.markAllAsTouched();
    }
  }


  validateExpiryDate(event: any): void {
    const inputValue = event.target.value;
    // Automatically format as MM/YY while user types
    if (inputValue.length === 2 && !inputValue.includes('/')) {
      event.target.value = `${inputValue}/`; // Automatically add slash after month input
    }
  }
  formatMeetingType(meetingType: string): string {
    return meetingType ? meetingType.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }

  postNotification() {
    this.loading = true;
    const notificationForm = this.notificationForm.value;

    if (!notificationForm.preference) {
      notificationForm.preference = this.preference.Both;
      this.notificationForm.get('preference')?.setValue(this.preference.Both);
    }

    if (notificationForm.phoneNumber) {
      notificationForm.phoneNumber = notificationForm.phoneNumber.replace(/\D/g, '');
    }

    notificationForm.userId = this.userId; // Ensure userId is included

    this.providerService.postNotification(notificationForm).subscribe(
      (data) => {
        console.log('Post successful', data);

        if (this.notificationForm.value.id == 0) {
          this.notificationService.showSuccess(" Information added successfully.");
        } else {
          this.notificationService.showSuccess(" Information updated successfully.");
        }
        this.loading = false;

      },
      (error) => {
        console.error('Error posting notification:', error);
        this.loading = false;

      }
    );
  }


  getNotificationByUserId() {
    this.providerService.getNotificationByUserId().subscribe((data) => {
      this.notificationData = data;

      const formattedPhoneNumber = this.globalModalService.formatPhoneNumberForDisplay(this.notificationData.phoneNumber);

      this.notificationForm.patchValue({
        id: this.notificationData.id,
        userId: this.notificationData.userId,
        email: this.notificationData.email,
        phoneNumber: formattedPhoneNumber,
        preference: this.notificationData.preference || this.preference.Both,

      });
      console.log("notification data", this.notificationData);
    });
  }

  viewProfile(id: any) {

    const modalRef = this.modalService.open(PatientClinicalDashboardComponent, {
      backdrop: 'static',
      size: 'xl',
      centered: true,
      // windowClass: 'custom-modal'
    });
    modalRef.componentInstance.patientId = id;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getReportList();
    });
  }

  viewProviderProfile(id: any,) {
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
    // modalRef.componentInstance.bookAppointmentId = bookingId;
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getReportList();
    });
  }


  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.notificationForm.get('phoneNumber').setValue(formattedValue);
  }


  maskedEIN: string = '';

  onEINInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const rawValue = inputElement.value.replace(/\D/g, ''); // Remove non-numeric characters

    if (rawValue.length > 9) {
      inputElement.value = rawValue.slice(0, 9); // Limit to 9 digits
    }

    this.maskedEIN = this.maskEIN(rawValue);
  }

  maskEIN(ein: string): string {
    if (ein.length < 9) {
      return ein.replace(/(\d{3})(\d{3})?(\d{3})?/, '$1-$2-$3'); // Partial formatting
    }

    return `***-***-${ein.slice(-3)}`; // Mask first 6 digits, show last 3
  }







  formatConfirmAccountNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, ''); // Remove all non-numeric characters

    // Restrict the value to 12 digits
    if (value.length > 12) {
      value = value.substring(0, 12);
    }

    // Add dashes after every 4 digits
    value = value.replace(/(.{4})/g, '$1-').replace(/-$/, '');

    // Update the input value
    input.value = value;

    // Set the form control value without emitting additional events
    this.payoutForm.get('ConfirmAccountNumber')?.setValue(value, { emitEvent: false });

    // Validate the confirm account number field
    this.validateConfirmAccountNumber();
  }

  validateConfirmAccountNumber(): void {
    const accountNumber = this.payoutForm.get('AccountNumber')?.value?.replace(/-/g, '');
    const confirmAccountNumber = this.payoutForm.get('ConfirmAccountNumber')?.value?.replace(/-/g, '');

    const confirmControl = this.payoutForm.get('ConfirmAccountNumber');

    // Check length validation
    // if (confirmAccountNumber.length !== 12) {
      if (confirmAccountNumber.length < 5 || confirmAccountNumber.length > 12) {
      confirmControl?.setErrors({ ...confirmControl.errors, length: true });
    } else {
      const errors = confirmControl?.errors || {};
      delete errors['length'];
      confirmControl?.setErrors(Object.keys(errors).length ? errors : null);
    }

    if (accountNumber !== confirmAccountNumber) {
      confirmControl?.setErrors({ ...confirmControl.errors, mismatch: true });
    } else {
      const errors = confirmControl?.errors || {};
      delete errors['mismatch'];
      confirmControl?.setErrors(Object.keys(errors).length ? errors : null);
    }
  }


  matchFields(field1: string, field2: string) {
    return (formGroup: AbstractControl) => {
      const control1 = formGroup.get(field1);
      const control2 = formGroup.get(field2);

      if (control1 && control2 && control1.value !== control2.value) {
        control2.setErrors({ mismatch: true });
      } else {
        control2?.setErrors(null);
      }
    };
  }
  onFilterChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    console.log('Selected filter:', selectedValue);
    this.getproviderAmountByUserId();
  }


  getproviderAmountByUserId() {
    const userInfo = this.authService.getUserInfo();

    if (userInfo.accountType === "IndependentProvider") {
      this.providerService.getproviderAmountByUserId(this.selectedFilter).subscribe((data: any) => {
        this.totalAmount = data;
        console.log('Total amount data:', this.totalAmount);
      });
    } else if (userInfo.accountType === "PrivatePractices" || userInfo.accountType === "Facility") {
      this.providerService.getClinicAmountByUserId(this.selectedFilter).subscribe((data: any) => {
        this.totalAmount = data;
        console.log('Total clinic amount data:', this.totalAmount);
      });
    }
  }

  getReportList() {

    this.reportList = [];
    const userInfo = this.authService.getUserInfo();
    let reportServiceCall;
    if (userInfo.accountType === "IndependentProvider") {
      reportServiceCall = this.providerService.getReportListByUserId(
        this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder
      );
    } else if (userInfo.accountType === "PrivatePractices" || userInfo.accountType === "Facility") {
      reportServiceCall = this.providerService.getSettingListByUserId(
        this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder
      );

    } else {
      console.error("Invalid account type:", userInfo.accountType);
      return;
    }
    reportServiceCall.subscribe(
      (data: any) => {
        console.log("This is private ", data)
        if (data.items && data.items.length >= 0) {
          this.reportList = data.items
          console.log("my dataa", this.reportList)
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber', this.paginator.pageNumber),
            totalCount: _.get(data, 'totalCount', this.paginator.totalCount),
            totalPages: _.get(data, 'totalPages', this.paginator.totalPages),
          };
          this.filteredItems = [...this.reportList];

        }
      },
      (error) => {
        console.error("Error fetching report list:", error);
      }
    );
  }


  getPayoutDetailByUserId() {
    this.providerService.getPayoutDetailByUserId().subscribe((data: any) => {
      console.log("This is my payout data", data);

      // Check if data exists and is an array
      if (Array.isArray(data) && data.length > 0) {
        const payoutData = data[0]; // Get the first object from the array
        // Assuming payoutData.expiryDate is in YYYY-MM-DD format, e.g., "2026-12-31"
        const expiryDate = payoutData.expiryDate;

        if (expiryDate) {
          const date = new Date(expiryDate); // Create a Date object from the string

          // Get the month and year
          const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 because months are 0-based
          const year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year

          const formattedExpiryDate = `${month}/${year}`; // Format as MM/YY
          payoutData.expiryDate = formattedExpiryDate;
          console.log(formattedExpiryDate); // Example: "12/26"
        }

        this.payoutForm.patchValue({
          id: payoutData.id,
          LegalName: payoutData.legalName,
          EmployerIdentificationNumber: payoutData.employerIdentificationNumber,
          AddressLine1: payoutData.addressLine1,
          AddressLine2: payoutData.addressLine2,
          City: payoutData.city,
          StateId: payoutData.stateId,
          zipCode: payoutData.zipCode,
          RoutingNumber: payoutData.routingNumber,
          AccountNumber: payoutData.accountNumber,
          ConfirmAccountNumber: payoutData.accountNumber,
          cvv: payoutData.cvv,
          expiryDate: payoutData.expiryDate,
          creditCardNo: payoutData.creditCardNo
        });
      } else {
        console.error('Payout data is not in the expected format.');
      }
    }, (error) => {
      console.error('Failed to fetch payout data:', error);
    });
  }

  getState() {
    this.patientService.getState().subscribe((response: any) => {
      this.states = response.items;
      console.log("states :", this.state)
    });
  }

  onSettingsChange(event: any) {
    const selectedIndex = event.index;
  }


}
