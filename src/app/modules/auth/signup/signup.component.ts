import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

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
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      accountType: ['', Validators.required],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],
      email: ['', [Validators.required, Validators.email]],
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
    if(signupForm.howdidyouhearaboutus == ""){
      signupForm.howdidyouhearaboutus = 0
    }
 
    if (signupForm.phoneNumber !== undefined && signupForm.phoneNumber !== null && signupForm.phoneNumber !== undefined && signupForm.phoneNumber !== null) {
      signupForm.phoneNumber = signupForm.phoneNumber.replace(/\D/g, '');

    }
  
    this.authService.postUser(signupForm).subscribe(
      (response: any) => {
        debugger
        this.authService.setUserInfo(response);
        if (this.request == 'PatientPortal' && this.selectedProviderId != undefined) {
          const profileUrl = this.router.createUrlTree(['/patient/book-appointment'], { queryParams: { providerProfileId: this.selectedProviderId, slotId: this.slotId, data: this.slotData } }).toString();
          window.open(profileUrl, '_blank');
        }
        if (this.request == 'ProviderPortal'){
          this.router.navigate(['/provider/dashboard']);
        }
        if (this.request == 'PatientPortal' && this.selectedProviderId == undefined){
          this.router.navigate(['/patient/patient-information']);
        }
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
