import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from 'src/app/Core/Auth/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignupComponent } from './signup/signup.component';
import { HomePageComponent } from './home-page/home-page.component';
import { OtpVerifyComponent } from './otp-verify/otp-verify.component';
import { ThankYouComponent } from './thank-you/thank-you.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AllSpecilityComponent } from './all-specility/all-specility.component';
import { HowItsWorkComponent } from './how-its-work/how-its-work.component';
import { PatientSymptomComponent } from './patient-symptom/patient-symptom.component';
import { FAQSComponent } from './faqs/faqs.component';
import { ProviderBenefitComponent } from './provider-benefit/provider-benefit.component';
import { BenefitsComponent } from './benefits/benefits.component';
import { BlogContentComponent } from './blog-content/blog-content.component';
import { BlogCommentComponent } from './blog-comment/blog-comment.component';
import { ListingCategoryComponent } from './listing-category/listing-category.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ContactComponent } from './contact/contact.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { DoctorDetailComponent } from './doctor-detail/doctor-detail.component';

const routes: Routes = [
  { path: '', component: HomePageComponent }, // 👈 Load homepage at root URL
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'set-password', component: ResetPasswordComponent },
  // Optionally redirect /home-page to root
  { path: 'home-page', redirectTo: '', pathMatch: 'full' },
  { path: 'otp-verify', component: OtpVerifyComponent },
  { path: 'thank-you', component: ThankYouComponent },
  { path: 'all-specility', component: AllSpecilityComponent },
  { path: 'how-its-work', component: HowItsWorkComponent },
  { path: 'patient-symptom', component: PatientSymptomComponent },
  { path: 'faqs', component: FAQSComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'benefits', component: BenefitsComponent },
  { path: 'provider-benefit', component: ProviderBenefitComponent },
  { path: 'blog-content', component: BlogContentComponent },
  { path: 'blog-comment', component: BlogCommentComponent },
  { path: 'listing-category', component: ListingCategoryComponent },
  { path: 'terms-of-service', component: TermsOfServiceComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'doctor-search', component: DoctorSearchComponent},
  { path: 'doctor-detail', component: DoctorDetailComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
