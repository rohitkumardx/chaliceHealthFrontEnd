import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators, FormControl, ValidationErrors } from '@angular/forms';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { NotificationService } from 'src/app/Services/notification.service';
import { AuthService } from 'src/app/Services/auth.service';
import { Router } from '@angular/router';
import { GlobalModalService } from 'src/app/Services/global-modal.service';

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

export function customEmailValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!control.value || emailPattern.test(control.value)) {
      return null; // Valid email
    }
    return { email: true }; // Invalid email
  };
}

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {
serviceData: any;
  userInfo: any;
  loading : boolean = false;
  communityForm: FormGroup;
  ContactUsForm: FormGroup
constructor(private router: Router,
  private authService: AuthService,
  private fb: FormBuilder,
  private notificationService: NotificationService,
  private globalModalService: GlobalModalService,
){

}
ngOnInit(): void{

          this.ContactUsForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.pattern(/^\S.*\S$/)]],  
            lastName: ['', [Validators.required, Validators.pattern(/^\S.*\S$/)]],  
            // phoneNumber: [''],  
            phoneNumber: ['', [Validators.required, phonePatternValidator()]],
            email: ['', [Validators.required, customEmailValidator()]],  
            subject: ['', [Validators.pattern(/^\S.*\S$/)]],  
            message: ['', Validators.required],  
          }); 
     
  this.getServices();
  this.userInfo = this.authService.getUserInfo();
console.log("local storage from contact us :", this.userInfo);


    // Scroll to top when the component loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
navigateToMyPortal(){

  if(this.userInfo.accountType == "Patient"){
    this.router.navigate(['/patient/dashboard'], { queryParams: { request: 'PatientPortal' } });
  }
  if(this.userInfo.accountType == "Admin"){
    this.router.navigate(['/admin/dashboard'], { queryParams: { request: 'AdminPortal' } });
  }  
  if(this.userInfo.accountType == "IndependentProvider"){
    this.router.navigate(['/provider/dashboard'], { queryParams: { request: 'ProviderPortal' } });
  }
  if(this.userInfo.accountType == "PrivatePractices" || this.userInfo.accountType == 'Facility'){
    this.router.navigate(['/provider/clinic-dashboard'], { queryParams: { request: 'ProviderPortal' } });
  }
}

contact(){
  this.router.navigate(['/contact']);
}

logout(){
  this.authService.logOut();
}


formatPhoneNumber(event: any): void {
  const input = event.target as HTMLInputElement;
  const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
  this.ContactUsForm.get('phoneNumber').setValue(formattedValue);
}




postContactUs() {
  this.loading = true;
  if (this.ContactUsForm.invalid) {
    this.ContactUsForm.markAllAsTouched();
    this.loading = false;
    return;
  }
  const ContactUsForm = this.ContactUsForm.value;
  if (ContactUsForm.phoneNumber) {
    ContactUsForm.phoneNumber = ContactUsForm.phoneNumber.replace(/\D/g, '');
  }

  const formData = this.ContactUsForm.value;
  const postData = {   
    firstName: formData.firstName,   
    lastName: formData.lastName,        
    phoneNumber: formData.phoneNumber,        
    message: formData.message,        
    subject: formData.subject,             
    email: formData.email 
  };

  this.authService.postContactUs(postData).subscribe({
    next: (response: any) => {
      if (response === true) {
        this.notificationService.showSuccess("Request submitted successfully");
        this.loading = false;
        this.ContactUsForm.reset(); // Reset the form after success
      }
    },
    error: (error: any) => {
      this.notificationService.showDanger(getErrorMessage(error));
      this.loading = false;
    }
  });
}

 postJoinOurCommunity() {
    if (this.communityForm.invalid) {
      this.communityForm.markAllAsTouched();
      return;
    }
  
    const formData = this.communityForm.value;
    const postData = {           
      email: formData.email 
    };
  
    this.authService.postJoinOurCommunity(postData).subscribe({
      next: (response: any) => {
        if (response === true) {
          this.notificationService.showSuccess("Request submitted successfully");
          this.communityForm.reset(); // Reset the form after success
        }
      },
      error: (error: any) => {
        this.notificationService.showDanger(getErrorMessage(error));
      }
    });
  }
redirectTotermofservice() {
  this.router.navigate(['/terms-of-service']).then(() => {
    window.scrollTo(0, 0);
   });   
}

redirectToprivacypolicy(){
  this.router.navigate(['/privacy-policy']).then(() => {
    window.scrollTo(0, 0);
  }); 
}
  redirectToDoctorSearch(){
  
    this.router.navigate(['/patient/doctor-search'], { queryParams: { request: 'withoutLogin' } });
  }
  navigateToPatientSignup() {
    this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
  }
  navigateToPatientLogin() {
    this.router.navigate(['/login'], { queryParams: { request: 'PatientPortal' } });
  }
  navigateToDoctorSignup() {
    this.router.navigate(['/signup'], { queryParams: { request: 'ProviderPortal' } });
  }
  navigateToDoctorLogin() {
    this.router.navigate(['/login'], { queryParams: { request: 'ProviderPortal' } });
  }

  viewAllSpecialties() {
    this.router.navigate(['/all-specility'],
      );
  }

  howItWork() {
    this.router.navigate(['/how-its-work']);
  }
  FAQS() {
    this.router.navigate(['/faqs']);
  
  }
  benefits() {
    this.router.navigate(['/benefits']);
  }
  providerbenefits() {
    this.router.navigate(['/provider-benefit']);
  }
  navigateToBlogContent(){
    this.router.navigate(['/blog-content']);
  }
  redirectToHeaderService(){

    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId:0}
      }
    );
  }
  redirectToSignUpPage() {
    this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
  }
  getServices(){
    this.authService.getServices().subscribe((data)=>{
      this.serviceData=data
      console.log("This is service data",this.serviceData);
    })
  }
  redirectToServiceListing(serviceObject:any){

    this.authService.updateService(serviceObject);
    this.router.navigate(['/listing-category']);
  }
}

