import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from 'src/app/Services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { ProviderService } from 'src/app/Services/provider.service';
 
declare var bootstrap: any;
export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // If empty, let required validator handle it
 
    // Strict Email Pattern: Ensures valid domain like ".com", ".net", etc.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  };
}
 
 
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild('offcanvasRef') offcanvasElement!: ElementRef;
  location: string = '';
  // suggestions: { address: string }[] = [];
  selectedIndex: number = -1;
  showLocationInput: boolean = false;
  serviceData: any;
   userInfo: any;
   communityForm: FormGroup;
   suggestions: any[] = [];
 constructor(private router: Router,
   private authService: AuthService,
       private providerService: ProviderService,
   private fb: FormBuilder,
     private notificationService: NotificationService,
 ){
 
 }
 ngOnInit(): void{
     this.communityForm = this.fb.group({
               email: ['', [Validators.required, customEmailValidator()]],      
           });
   this.getServices();
 
   this.userInfo = this.authService.getUserInfo();
 console.log("local storage from how it works :", this.userInfo);

 
 // Hide input when clicking outside
 document.addEventListener('click', this.handleOutsideClick.bind(this));
 }
 onAddressChange(event: any): void {
 
  const query = event.target.value;
  if (query.length > 2) {
    this.providerService.getAddressSearch(query).subscribe((response: any) => {
      this.suggestions = response
    });
  } else {
    this.suggestions = [];
  }
}

 

 
 closeOffcanvas() {
  const offcanvasInstance = bootstrap.Offcanvas.getInstance(this.offcanvasElement.nativeElement);
  if (offcanvasInstance) {
    offcanvasInstance.hide();
  }
}
 navigateToMyPortal(){
  this.closeOffcanvas();
   ;
   if(this.userInfo.accountType == "Patient"){
     this.router.navigate(['/patient/dashboard'], { queryParams: { request: 'PatientPortal' } });
   }
   if(this.userInfo.accountType == "Admin"){
     this.router.navigate(['/admin/dashboard'], { queryParams: { request: 'AdminPortal' } });
   }  
   if(this.userInfo.accountType == "IndependentProvider"){
     this.router.navigate(['/provider/dashboard'], { queryParams: { request: 'ProviderPortal' } });
   }
   if(this.userInfo.accountType == "PrivatePractices" || this.userInfo.accountType == "Facility"){
     this.router.navigate(['/provider/clinic-dashboard'], { queryParams: { request: 'ProviderPortal' } });
   }
 }
 
 logout(){
   this.authService.logOut();
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
   contact(){
    this.closeOffcanvas();  
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
     });  
 
   }
 
   redirectToDoctorSearch(){
    this.closeOffcanvas();  
     this.router.navigate(['/doctor-search'], { queryParams: { request: 'withoutLogin' } });
   }
   navigateToPatientSignup() {
    this.closeOffcanvas();  
     this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
   }
   navigateToPatientLogin() {
    this.closeOffcanvas();  
     this.router.navigate(['/login'], { queryParams: { request: 'PatientPortal' } });
   }
   navigateToDoctorSignup() {
    this.closeOffcanvas();  
     this.router.navigate(['/signup'], { queryParams: { request: 'ProviderPortal' } });
   }
   navigateToDoctorLogin() {
    this.closeOffcanvas();  
     this.router.navigate(['/login'], { queryParams: { request: 'ProviderPortal' } });
   }
 
   viewAllSpecialties() {
    this.closeOffcanvas();
     this.router.navigate(['/all-specility'],
       );
   }
 
   howItWork() {
    this.closeOffcanvas();
     this.router.navigate(['/how-its-work']);
   }
   FAQS() {
    this.closeOffcanvas();
     this.router.navigate(['/faqs']);
   
   }
   benefits() {
    this.closeOffcanvas();
     this.router.navigate(['/benefits']);
   }
   providerbenefits() {
    this.closeOffcanvas();
     this.router.navigate(['/provider-benefit']);
   }
   navigateToBlogContent(){
    this.closeOffcanvas();
     this.router.navigate(['/blog-content']);
   }
   redirectToHeaderService(){
    this.closeOffcanvas();
     this.router.navigate(['/listing-category'],
       {
         queryParams: { serviceId:0}
       }
     );
   }
   redirectToSignUpPage() {
    this.closeOffcanvas();
     this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
   }
   getServices(){
     this.authService.getServices().subscribe((data)=>{
       this.serviceData=data
       console.log("This is service data",this.serviceData);
     })
   }
   redirectToServiceListing(serviceObject:any){
    this.closeOffcanvas();  
     this.authService.updateService(serviceObject);
     this.router.navigate(['/listing-category']);
   }
   activeTab: string = '';
 
   setActiveTab(tab: string) {
     this.activeTab = tab;
   }
 
   
selectSuggestion(suggestion: { address: string }): void {
  this.location = suggestion.address;
  this.suggestions = [];
  this.showLocationInput = false;
  localStorage.setItem('manualLocation', this.location);
}
 
handleOutsideClick(event: any): void {
  const inside = event.target.closest('.nav-item');
  if (!inside) {
    this.showLocationInput = false;
    this.suggestions = [];
  }
}


}
 
 
 
 
 