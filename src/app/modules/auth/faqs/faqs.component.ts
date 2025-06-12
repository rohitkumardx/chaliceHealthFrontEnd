import { Component, HostListener, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // If empty, let required validator handle it

    // Strict Email Pattern: Ensures valid domain like ".com", ".net", etc.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  };
}

@Component({
  selector: 'app-faqs',
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-in', style({ opacity: 1 }))
      ])
    ]),

    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('1s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),

    trigger('slideInRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('1s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),

    trigger('zoomIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.5s ease-in-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})

export class FAQSComponent implements OnInit {
  serviceData: any;
  communityForm: FormGroup;
  constructor(private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,

  ) {

  }

  ngOnInit() {
    this.communityForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator()]],
    });
    this.getServices();

    this.userInfo = this.authService.getUserInfo();
    console.log("local storage from faqs :", this.userInfo);
  }
  redirectToDoctorSearch() {

    this.router.navigate(['/patient/doctor-search'], { queryParams: { request: 'withoutLogin' } });
  }
  redirectTotermofservice() {
    this.router.navigate(['/terms-of-service']).then(() => {
      window.scrollTo(0, 0);
    });
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

  redirectToprivacypolicy() {
    this.router.navigate(['/privacy-policy']).then(() => {
      window.scrollTo(0, 0);
    });
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
  scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const element = document.querySelector('.animate-on-scroll') as HTMLElement;
    const position = element.getBoundingClientRect();

    if (position.top < window.innerHeight) {
      element.classList.add('active');
    }
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
  redirectToHeaderService() {

    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId: 0 }
      }
    );
  }

  navigateToBlogContent() {
    this.router.navigate(['/blog-content']);
  }
  userInfo: any;


  logout() {
    this.authService.logOut();
  }

  getServices() {
    this.authService.getServices().subscribe((data) => {
      this.serviceData = data
      console.log("This is service data", this.serviceData);
    })
  }
  redirectToServiceListing(serviceObject: any) {

    this.authService.updateService(serviceObject);
    this.router.navigate(['/listing-category']);
  }
}
