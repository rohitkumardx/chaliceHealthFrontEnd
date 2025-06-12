import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SignupComponent } from './signup/signup.component';
import { HomePageComponent } from './home-page/home-page.component';
import { OtpVerifyComponent } from './otp-verify/otp-verify.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AllSpecilityComponent } from './all-specility/all-specility.component';
import { PatientSymptomComponent } from './patient-symptom/patient-symptom.component';
import { MatIconModule } from '@angular/material/icon';
import { BlogContentComponent } from './blog-content/blog-content.component';
import { BlogCommentComponent } from './blog-comment/blog-comment.component';
import { ListingCategoryComponent } from './listing-category/listing-category.component';
import { BenefitsComponent } from './benefits/benefits.component';
import { ProviderBenefitComponent } from './provider-benefit/provider-benefit.component';
import { FAQSComponent } from './faqs/faqs.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { HowItsWorkComponent } from './how-its-work/how-its-work.component';
import { ContactComponent } from './contact/contact.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { DoctorDetailComponent } from './doctor-detail/doctor-detail.component';

@NgModule({
  declarations: [
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    SignupComponent,
    HomePageComponent,
    OtpVerifyComponent,
    ThankYouComponent,
    AdminLoginComponent,
    AllSpecilityComponent,
    PatientSymptomComponent,
    BlogContentComponent,
    BlogCommentComponent,
    ListingCategoryComponent,
    BenefitsComponent,
    ProviderBenefitComponent,
    FAQSComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    HowItsWorkComponent,
    ContactComponent,
    DoctorSearchComponent,
    DoctorDetailComponent,

  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    MatIconModule
  ]
})
export class AuthModule { }
