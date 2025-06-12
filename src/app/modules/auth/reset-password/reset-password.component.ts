import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import * as _ from 'lodash';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/Services/notification.service';
import { CustomPasswordValidator } from 'src/app/shared/validators/password-validator';
import { getErrorMessage } from "../../../utils/httpResponse";

export function passwordPatternValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;  
    }
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    const valid = passwordPattern.test(value);
    return valid ? null : { 'invalidPasswordPattern': { value } };
  };
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent  {
  userInfo: any;
  hidePassword: boolean = true;
  hidePassword1: boolean = true;
  resetForm: FormGroup;
  passwordResetForm: FormGroup;
  email: string;
  hash: string;
  passwordReset: boolean = false;
  loading: boolean = false;
  passwordInputState: { type: string, eyeStateShow: boolean }[] = [{
    type: "password",
    eyeStateShow: false
  }, { type: "password", eyeStateShow: false }];
  _ = _ ;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.hash = params['hash'];

      // Now you can use the 'hash' variable as needed in your component logic.
    });
    this.passwordResetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8), passwordPatternValidator()]],
       confirmPassword: ['', [Validators.required, CustomPasswordValidator.confirmPasswordValidator('password')]],
     });
  
     this.passwordResetForm.get('password')?.valueChanges.subscribe(() => {
       this.passwordResetForm.get('confirmPassword')?.updateValueAndValidity();
     });
     this.userInfo = this.authService.getUserInfo();
     console.log("local storage from set password :", this.userInfo);
  }
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }


  toggleConfirmPasswordVisibility() {
    this.hidePassword1 = !this.hidePassword1;
  }

  redirectToHomePage(){
    ;
    this.router.navigate(['/home-page']);
  }

  initializePasswordResetForm() {
   
  }
  passwordResetFormSubmit() {
    ;
    let resetPasswordObject = { 
      "NewPassword": _.get(this.passwordResetForm, 'value.password'),
      "ConfirmPassword": _.get(this.passwordResetForm, 'value.confirmPassword'),
      "Hash": this.hash
    }
    this.loading = true;
    this.authService.passwordReset(resetPasswordObject).subscribe(res => {
      this.passwordReset = true;
      this.loading = false;
      ;
      this.router.navigate(['/thank-you']);
      // this.notificationService.showSuccess("Password reset sucessfully.")
    }, error => {
      this.loading = false;
      ;
      this.notificationService.showDanger(getErrorMessage(error));
    });
  }
  passwordShowHide(inputName: string) {
    if (inputName == "password") {
      this.passwordInputState[0].eyeStateShow = !this.passwordInputState[0].eyeStateShow;
      this.passwordInputState[0].type = this.passwordInputState[0].type == "password" ? "text" : "password";
    } else {
      this.passwordInputState[1].eyeStateShow = !this.passwordInputState[1].eyeStateShow;
      this.passwordInputState[1].type = this.passwordInputState[1].type == "password" ? "text" : "password";
    }
  }

  navigateToLogin() {
    
    this.router.navigate(['/login']);
  }
}
