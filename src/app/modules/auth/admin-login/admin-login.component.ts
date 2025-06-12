
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

declare var google: any;

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
loginForm!: FormGroup;
  hidePassword: boolean = true;
  loading: boolean = false;
  request: any
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpClient) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.route.queryParams.subscribe(params => {
      this.request = params['request'];

    });
    this.loadRememberedCredentials();
    google.accounts.id.initialize({
      client_id: '225335056212-r3qa159ure8r2tgmsic8t355c1p3p3u3.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
    });

    google.accounts.id.renderButton(
      document.getElementById("googleButton"),
      { theme: "outline", size: "large" }
    );
  }


  handleCredentialResponse(response: any) {

    const token = response.credential;
    const data = {
      token: token
    }
    this.loading = true
    debugger;
    this.authService.signWithGoogle(data).subscribe((response: any) => {
      debugger
      localStorage.clear();
      sessionStorage.setItem('userInfo', JSON.stringify(response));
      const data = sessionStorage.getItem('userInfo');
      this.authService.setUserInfo(data);

      this.getToken();
    },
      (error: any) => {
        this.errorMessage = "User with the specified email does not exist."
        this.loading = false;

        this.notificationService.showDanger(getErrorMessage(error));
      });
  }




  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Mark all fields as touched to show validation messages
      return;
    }

    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.validateUserCreds(email, password).subscribe((data: any) => {
      debugger;
      if (data.errorMessage) {
        this.notificationService.showDanger(getErrorMessage(data.errorMessage));
        this.router.navigate(['/set-password'], { queryParams: { hash: data.hash } });
      }
      else {
       
        sessionStorage.setItem('userInfo', JSON.stringify(data));
        // Example: assuming your API response includes a token as data.token
        if (rememberMe) {
        
        } else {
        
        }

      
        // Retrieve additional user-specific info as needed
        this.authService.getAppointmentInfo();
        //this.authService.getUserInfo();
        if (data.userId) {
          const userId = btoa(data.userId);
          //   btoa(userId)
          this.router.navigate(['/otp-verify'], { queryParams: { userId: userId } });
        }
        else {
          this.notificationService.showDanger(getErrorMessage('Please try again'));
        }

        //this.router.navigate(['/otp-verify']);
      }
      this.loading = false;
    },
      error => {
        this.loading = false;
        this.notificationService.showDanger(getErrorMessage(error));
      });
  }

  getToken() {
    this.authService.Token().subscribe((data) => {
      this.authService.setToken(data.token);
      const userInfo = this.authService.getUserInfo();
      if (userInfo.accountType == 'IndependentProvider') {
        this.router.navigate(["/provider/dashboard"]);
      }
      if (userInfo.accountType == 'Patient') {
        this.router.navigate(["/patient/patient-information"]);
      }
      if (userInfo.accountType == 'PrivatePractices' || userInfo.accountType == 'Facility'){
        this.router.navigate(['/provider/clinic-provider-list']);
      }
      if (userInfo.accountType == 'Admin'){
        this.router.navigate(['/admin/providers-list']);
      }
    }, error => {
      this.loading = false;
      this.notificationService.showDanger(getErrorMessage(error));
    });
  }
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }
  navigateToSignup() {
    if (this.request == 'PatientPortal') {
      this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
    }
    else {
      this.router.navigate(['/signup'], { queryParams: { request: 'ProviderPortal' } });
    }
  }
  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  updateRememberMeState() {
    const rememberMe = this.loginForm.value.rememberMe;
    if (rememberMe) {
      localStorage.setItem('userId', this.loginForm.value.email);
      localStorage.setItem('password', this.loginForm.value.password);
      localStorage.setItem('rememberMe', JSON.stringify(rememberMe));
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('password');
      localStorage.removeItem('rememberMe');
    }
  }

  loadRememberedCredentials() {
    const rememberMe = JSON.parse(localStorage.getItem('rememberMe') || 'false');
    if (rememberMe) {
      const email = localStorage.getItem('userId') || '';
      const password = localStorage.getItem('password') || '';
      this.loginForm.patchValue({ email, password, rememberMe });
    }
  }
}

