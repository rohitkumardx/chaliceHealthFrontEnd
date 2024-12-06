import { Component } from '@angular/core';
import { AuthService } from 'src/app/Services/auth.service';
import { isValidEmail } from "../../../utils/validation";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})

export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup;
  loading: boolean = false;

  constructor(private fb: FormBuilder,
    private authService : AuthService,
    private notificationService: NotificationService,
    private router: Router) {}

  ngOnInit() {
    this.initForm();
  }
  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }
  isEmailInvalid(): boolean {
    const emailControl = this.forgotPasswordForm.get('email');
    return emailControl ? emailControl.invalid && emailControl.touched : false;
  }
  sendResetLink() {
    // Implement the logic to send the reset link
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get('email')?.value;
      console.log('Sending reset link to:', email);
    }
  }
  submit(){
    this.loading= true;
    this.authService.sendResetLink(this.forgotPasswordForm.value.email).subscribe((response : any) => {
      this.router.navigate(['otp-verify'], { queryParams: { request: 'forgot-password',userId : response.userId } });
      // this.notificationService.showSuccess("Password-reset url send to your email sucessfully !")
      this.loading= false;
    },(error) =>{
      this.notificationService.showDanger(getErrorMessage(error));
      this.loading= false;
    })
  }
  navigateToLogin() {
    debugger
    this.router.navigate(['/login']);
  }

}
