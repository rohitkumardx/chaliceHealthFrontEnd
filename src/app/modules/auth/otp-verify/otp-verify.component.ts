


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
  otpArray = new Array(6); // Assuming you have 6 OTP fields
  loading: boolean = false;
  isExpired = false; // Flag for OTP expiration
  minutes: number = 2; // Starting minutes
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

  ngOnInit(): void {
    this.initOtpForm();
    this.startOtpCountdown();
    const skipOtp = localStorage.getItem('skipOtp');
    if (skipOtp === 'true') {
      this.skipOtpVerification(); // Implement logic to bypass OTP
    }


    this.route.queryParams.subscribe(params => {
      this.request = params['request'];
      this.userId = params['userId'];
   
    });
    debugger
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

  startOtpCountdown() {
    const totalTime = 2 * 60; // 5 minutes in seconds
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
    const userInfo = this.authService.getUserInfo();
    if (this.otpForm.valid && !this.isExpired) {
      this.loading = true;
      const otpCode = Object.values(this.otpForm.value).join('');

      if(this.request == 'forgot-password'){
        const obj = {
          userId: this.userId,
          otp: otpCode,
        };
        this.authService.otpVerificationForForgotPassword(obj).subscribe((resposne : any)=>{
          // this.router.navigate(["/thank-you"]);
          this.router.navigate(['/thank-you'], { queryParams: { request: 'forgot-password' } });
        })
      }
      else {
        this.authService.otpVerification(otpCode).subscribe((resposne: any) => {
          this.getToken();
          if (userInfo.accountType == 'IndependentProvider') {
            this.router.navigate(["/provider/dashboard"]);
          }
          else {
            this.router.navigate(["/patient/patient-information"]);
          }
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
      this.authService.setToken(data.token);
    }, error => {
      this.loading = false;
      this.notificationService.showDanger(getErrorMessage(error));
    });
  }
  resendOtp() {
    this.authService.resendOtp().subscribe((data) => {
      this.notificationService.showSuccess("Otp send successfully");
      this.isExpired = false;
      this.minutes = 2;
      this.seconds = 0;
      this.startOtpCountdown();
    })
  }

  moveToNext(event: any, index: number) {
    const input = event.target;

    // Handle forward movement when a digit is entered
    if (input.value.length === 1 && index < 5) {
      const nextInput = document.getElementById('otpInput' + (index + 1));
      nextInput?.focus();
    }

    // Handle backward movement when backspace is pressed
    if (event.key === 'Backspace' && index > 0 && input.value === '') {
      const previousInput = document.getElementById('otpInput' + (index - 1));
      previousInput?.focus();
    }
  }

  skipOtpVerification() {
    // Implement logic to skip OTP verification and directly log in the user
    console.log('OTP verification skipped');
  }
}
