import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
 
export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // If empty, let required validator handle it
 
    // Strict Email Pattern: Ensures valid domain like ".com", ".net", etc.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  };
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
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  hidePassword: boolean = true;
  request: any
  patient: boolean = false
  loading: boolean = false;
  selectedProviderId : any
  slotId : any
  slotData : any
  userInfo:any
 
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
  ) { }
 
  ngOnInit() {
    this.signupForm = this.fb.group({
      firstName: ['',[Validators.required, Validators.pattern(/\S+/)]],
      lastName: ['',[Validators.required, Validators.pattern(/\S+/)]],
      accountType: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      // email: ['', [Validators.required, Validators.email]],
      email: ['', [Validators.required, customEmailValidator()]], // Use custom validator
      password: ['', [Validators.required, Validators.minLength(8)]],
      howdidyouhearaboutus: ['']
    });
    this.route.queryParams.subscribe(params => {
      this.request = params['request'];
      this.selectedProviderId = params['providerProfileId'];
      this.slotId = params['slotId'];
      this.slotData = params['data'];
      if (this.request == 'PatientPortal') {
        this.patient = true
      }
    });
    this.userInfo = this.authService.getUserInfo();
     console.log("local storage from signup :", this.userInfo);
  }
 
  signup() {
    if (this.request == 'PatientPortal') {
      this.signupForm.get('accountType').setValue(1)
    }
    if (this.signupForm.invalid) {
      this.notificationService.markFormGroupTouched(this.signupForm);
      return;
    }
    this.loading = true;
    const signupForm = this.signupForm.value
    if (signupForm.howdidyouhearaboutus == "") {
      signupForm.howdidyouhearaboutus = 0
    }
    if (signupForm.phoneNumber !== undefined && signupForm.phoneNumber !== null && signupForm.phoneNumber !== undefined && signupForm.phoneNumber !== null) {
      signupForm.phoneNumber = signupForm.phoneNumber.replace(/\D/g, '');
    }
    this.authService.postUser(signupForm).subscribe(
      (response: any) => {
        localStorage.setItem("userInfo",JSON.stringify(response));
       // this.authService.setUserInfo(response);
        this.authService.Token().subscribe((data) => {
          this.authService.setToken(data.token);
          const appointmentInfo = this.authService.getAppointmentInfo();
          if (this.request == 'PatientPortal' && this.selectedProviderId != undefined) {
            const profileUrl = this.router.createUrlTree(['/patient/book-appointment'], { queryParams: { providerProfileId: this.selectedProviderId, slotId: this.slotId, data: this.slotData } }).toString();
            window.open(profileUrl, '_blank');
          }
          if (this.request == 'PatientPortal' && this.selectedProviderId == undefined) {
            this.router.navigate(['/patient/patient-information']);
          }
           if (this.request == 'PatientPortal' && this.selectedProviderId == undefined && appointmentInfo!=null) {
               this.router.navigate(['/patient/book-appointment'], {
            queryParams: { providerProfileId: appointmentInfo.providerProfileId, slotId: appointmentInfo.id, data: JSON.stringify(appointmentInfo.data) }
 
          });
          }
 
          const userInfo = this.authService.getUserInfo();
          if (userInfo.accountType == 'PrivatePractices' || userInfo.accountType == 'Facility') {
            this.router.navigate(['/provider/facility-profile-setup']);
          }
          if (userInfo.accountType == 'IndependentProvider') {
            this.router.navigate(['/provider/dashboard']);
          }
        });
 
      },
      (error: any) => {
        console.error('Signup failed', error);
        this.loading = false
        this.notificationService.showDanger(getErrorMessage(error));
        // this.notificationService.showDanger('Signup failed. Please try again.');
      }
    );
  }
 
 
  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.signupForm.get('phoneNumber').setValue(formattedValue);
  }
 
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
 
  redirectToLogin() {
    this.router.navigate(['/login'], { queryParams: { request: this.request } });
  }
}
 
 