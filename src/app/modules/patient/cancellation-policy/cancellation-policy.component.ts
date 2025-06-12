import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';
export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // If empty, let required validator handle it
 
    // Strict Email Pattern: Ensures valid domain like ".com", ".net", etc.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  };
}
@Component({
  selector: 'app-cancellation-policy',
  templateUrl: './cancellation-policy.component.html',
  styleUrls: ['./cancellation-policy.component.css']
})
export class CancellationPolicyComponent {
 serviceData:any;
  communityForm:FormGroup;
  userInfo: any;
 
  constructor(
    public activeModal: NgbActiveModal,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private globalModalService: GlobalModalService,
    private authService: AuthService,
    private fb : FormBuilder
  ) {}
 @Input() scrollToId?: string;
 
  ngAfterViewInit(): void {
    // Wait a short moment to ensure content is rendered
    setTimeout(() => {
      if (this.scrollToId) {
        const el = document.getElementById(this.scrollToId);
        if (el) {
          // Scroll within the modal body
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 200); // Delay ensures DOM is ready
  }
 
 
  ngOnInit() {
    this.communityForm = this.fb.group({
                      email: ['', [Validators.required, customEmailValidator()]],      
                  });
    this.getServices();
    this.userInfo = this.authService.getUserInfo();
  console.log("local storage from provider benefits :", this.userInfo);
   
 
 
}
  closeModal() {
    this.activeModal.dismiss(); // or .close() if you want to return data
  }
contact() {
  this.router.navigate(['/contact']).then(() => {
    window.scrollTo(0, 0);
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
  if(this.userInfo.accountType == "PrivatePractices"){
    this.router.navigate(['/provider/clinic-dashboard'], { queryParams: { request: 'ProviderPortal' } });
  }
}
 
logout(){
  this.authService.logOut();
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
      this.router.navigate(['/faqs']).then(() => {
        window.scrollTo(0, 0);
       });  
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
 
}
 
 

