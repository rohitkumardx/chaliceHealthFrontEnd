import { NumberFormatStyle } from '@angular/common';

import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from 'src/app/Services/auth.service';

import { NotificationService } from 'src/app/Services/notification.service';

import { getErrorMessage } from 'src/app/utils/httpResponse';

 

 

@Component({

  selector: 'app-otp-verify',

  templateUrl: './otp-verify.component.html',

  styleUrls: ['./otp-verify.component.css']

})

export class OtpVerifyComponent implements OnInit, OnDestroy {

 

  request: any

  userId: any

  userEmail : any

  otpForm: FormGroup;

otpArray = Array(6).fill(null); // Assuming you have 6 OTP fields

  loading: boolean = false;

  isExpired = false; // Flag for OTP expiration

  minutes: number = 5; // Starting minutes

  seconds: number = 0; // Starting seconds

  private intervalId: any;

  isOtpValid = false;

  skipOtpForNextTime = false;

  constructor(private fb: FormBuilder,

    private authService: AuthService,

    private router: Router,

    private route: ActivatedRoute,

    private notificationService: NotificationService

  ) { }

 

  ngOnInit(){

    debugger;

    this.initOtpForm();

    this.startOtpCountdown();

    debugger;

  //  const skipOtp = localStorage.getItem('skipOtp');

   // if (skipOtp === 'true') {

   //   this.skipOtpVerification(); // Implement logic to bypass OTP

   // }

 

    this.route.queryParams.subscribe(params => {

      const encodedKey = params['userId'];

      const request = params['request'];

     

   debugger;

      if (encodedKey && request) {

        const userId = atob(encodedKey); // base64 decode

        this.userId=Number(userId);

        this.request = params['request'];

      }else{

        const userId = atob(encodedKey); // base64 decode

        this.userId=Number(userId);

        // this.userId = params['userId'];

        // this.request = params['request'];

      }

     

   

    });

   

    const userInfo = this.authService.getUserInfo()

     this.userEmail = userInfo.email

  }

  getFormattedEmail(email: string): string {

    if (!email) return '';

    const firstTwoChars = email.slice(0, 2);

    const lastTwoChars = email.slice(-6);

    return `${firstTwoChars}******${lastTwoChars}`;

  }

  ngOnDestroy(): void {

    if (this.intervalId) {

      clearInterval(this.intervalId); // Cleanup when the component is destroyed

    }

  }

 

  initOtpForm() {

    const controls = {};

    for (let i = 0; i < 6; i++) {

      controls[`otp${i}`] = ['', [Validators.required, Validators.pattern('[0-9]{1}')]];

    }

    this.otpForm = this.fb.group(controls);

  }

handlePaste(event: ClipboardEvent): void {

  debugger;

  event.preventDefault(); // Prevent default paste behavior

 

  const pastedData = event.clipboardData?.getData('text') || '';

  const digits = pastedData.replace(/\D/g, '').slice(0, this.otpArray.length); // Extract up to N digits

 

  for (let i = 0; i < digits.length; i++) {

    const control = this.otpForm.get('otp' + i);

    if (control) {

      control.setValue(digits[i]);

    }

  }

 

  // Optional: move focus to the last filled input

  const nextInputIndex = Math.min(digits.length, this.otpArray.length - 1);

  const nextInput = document.getElementById('otpInput' + nextInputIndex);

  nextInput?.focus();

}

 

 

  startOtpCountdown() {

    const totalTime = 5 * 60; // 5 minutes in seconds

    let remainingTime = totalTime;

 

    this.intervalId = setInterval(() => {

      this.minutes = Math.floor(remainingTime / 60);

      this.seconds = remainingTime % 60;

 

      if (remainingTime === 0) {

        this.isExpired = true;

        clearInterval(this.intervalId);

      }

 

      remainingTime--;

    }, 1000);

  }

 

 

 

  verifyOtp() {

    debugger;  

   // const userInfo = this.authService.getUserInfo();

    if (this.otpForm.valid && !this.isExpired) {

      this.loading = true;

      const otpCode = Object.values(this.otpForm.value).join('');

      debugger;  

        const obj = {

          userId: this.userId,

          otp: otpCode,

        };

        if(this.request == 'forgot-password'){

        this.authService.otpVerificationForForgotPassword(obj).subscribe((resposne : any)=>{

          // this.router.navigate(["/thank-you"]);

          this.router.navigate(['/thank-you'], { queryParams: { request: 'forgot-password' } });

         

        },

        (error) => {

         

          this.notificationService.showDanger(getErrorMessage(error));

          this.loading = false;

        })

      }

      else {

        this.authService.otpVerification(obj).subscribe((resposne: any) => {

          debugger;

          if(resposne){

            const data = sessionStorage.getItem('userInfo');

            this.authService.setUserInfo(data);

          }

          this.getToken();

        },

          (error) => {

            this.notificationService.showDanger(getErrorMessage(error));

            this.loading = false;

          }

        )

      }

     

 

    }

  }

  getToken() {

    this.authService.Token().subscribe((data) => {

      debugger;

      this.authService.setToken(data.token);

      const userInfo = this.authService.getUserInfo();

      if (userInfo.accountType == 'IndependentProvider') {

        this.router.navigate(["/provider/dashboard"]);

      }

      ;

      if (userInfo.accountType == 'Patient') {

 

      const appointmentInfo=this.authService.getAppointmentInfo();

     

        if(appointmentInfo!=null){

          this.router.navigate(['/patient/book-appointment'], {

            queryParams: { providerProfileId:appointmentInfo.providerProfileId, slotId: appointmentInfo.id, data: JSON.stringify(appointmentInfo.data) }

          });

        }

       else{

        this.router.navigate(["/patient/dashboard"]);

       }

      }

      if (userInfo.accountType == 'PrivatePractices' || userInfo.accountType == 'Facility'){

        this.router.navigate(['/provider/clinic-dashboard']);

      }

      if (userInfo.accountType == 'Admin'){

        this.router.navigate(['/admin/dashboard']);

      }

    }, error => {

      debugger;

      this.loading = false;

      this.notificationService.showDanger(getErrorMessage(error));

    });

  }

  resendOtp() {

    this.authService.resendOtp(this.userId).subscribe((data) => {

      this.notificationService.showSuccess("Otp send successfully");

      this.isExpired = false;

      this.minutes = 5;

      this.seconds = 0;

      this.startOtpCountdown();

    })

  }

  allowOnlyNumbers(event: KeyboardEvent): void {

    const key = event.key;

    // Allow only digits

    if (!/^[0-9]$/.test(key)) {

      event.preventDefault();

    }

  }

 

moveToNext(event: KeyboardEvent, index: number) {

  const input = event.target as HTMLInputElement;

 

  const key = event.key;

  const value = input.value;

 

  // Move to next input only if a digit is typed (not on backspace or arrow keys)

  if (/^[0-9]$/.test(key) && value.length === 1 && index < this.otpArray.length - 1) {

    const nextInput = document.getElementById('otpInput' + (index + 1));

    nextInput?.focus();

  }

 

  // Move back on Backspace if input is empty

  if (key === 'Backspace' && value === '' && index > 0) {

    const prevInput = document.getElementById('otpInput' + (index - 1));

    prevInput?.focus();

  }

}

 

  skipOtpVerification() {

    // Implement logic to skip OTP verification and directly log in the user

    console.log('OTP verification skipped');

  }

 

  handleKey(event: KeyboardEvent, index: number) {

    const input = event.target as HTMLInputElement;

   

    // Allow arrow keys and backspace for navigation

    if (['Backspace', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {

      switch (event.key) {

        case 'Backspace':

          if (input.value === '' && index > 0) {

            const prevInput = document.getElementById(`otpInput${index - 1}`) as HTMLInputElement;

            prevInput?.focus();

            event.preventDefault();

          }

          break;

        case 'ArrowLeft':

          if (index > 0) {

            const prevInput = document.getElementById(`otpInput${index - 1}`) as HTMLInputElement;

            prevInput?.focus();

            event.preventDefault();

          }

          break;

        case 'ArrowRight':

          if (index < this.otpArray.length - 1) {

            const nextInput = document.getElementById(`otpInput${index + 1}`) as HTMLInputElement;

            nextInput?.focus();

            event.preventDefault();

          }

          break;

      }

    }

   

    // Block non-numeric keys

    if (!/^[0-9]$/.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {

      event.preventDefault();

    }

  }

   

  handleInput(event: Event, index: number) {

    const input = event.target as HTMLInputElement;

    const value = input.value.replace(/[^0-9]/g, '');

   

    input.value = value;

   

    if (value && index < this.otpArray.length - 1) {

      const nextInput = document.getElementById(`otpInput${index + 1}`) as HTMLInputElement;

      nextInput?.focus();

    }

  }

}

 

 