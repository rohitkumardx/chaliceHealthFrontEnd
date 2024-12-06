
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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword: boolean = true;
  loading: boolean = false;
  request: any
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
    debugger
    const token = response.credential;

    const data = {
      token: token
    }
    // return this.http.post(`${environment.apiUrl}/auth/otp-verification`, { "userId": userInfo.userId, "otp": otpCode });
    // Send the token to your backend


    this.authService.signWithGoogle(data).subscribe((response: any) => {
      debugger
      localStorage.clear();
      this.authService.setUserInfo(response);
      this.getToken();
      const userInfo = this.authService.getUserInfo();
      debugger
    
    },
    )
  }




  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Mark all fields as touched to show validation messages
      return;
    }
    localStorage.clear();
    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.value;
    this.authService.validateUserCreds(email, password).subscribe((data: any) => {
      this.authService.setUserInfo(data);
      if (rememberMe) {
        localStorage.setItem('userId', email);
        localStorage.setItem('password', password);
        localStorage.setItem('rememberMe', JSON.stringify(rememberMe));
      }
      else {
        localStorage.removeItem('userId');
        localStorage.removeItem('password');
        localStorage.removeItem('rememberMe');
      }
      this.loginForm.reset();
      this.router.navigate(['/otp-verify']);
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
      else {
        this.router.navigate(["/patient/patient-information"]);
      }
      // this.authService.redirectToUser()
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