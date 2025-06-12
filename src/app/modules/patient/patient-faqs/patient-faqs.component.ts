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
  selector: 'app-patient-faqs',
  templateUrl: './patient-faqs.component.html',
  styleUrls: ['./patient-faqs.component.css'],
 animations: [
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('800ms ease-in', style({ opacity: 1 })),
      ])
    ])
  ]
})
export class PatientFaqsComponent implements OnInit {
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

    this.userInfo = this.authService.getUserInfo();
    console.log("local storage from faqs :", this.userInfo);

    // Scroll to top when the component loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  redirectToDoctorSearch() {

    this.router.navigate(['/patient/doctor-search'], { queryParams: { request: 'withoutLogin' } });
  }
  redirectTotermofservice() {
    this.router.navigate(['/terms-of-service']).then(() => {
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

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  // @HostListener('window:scroll', ['$event'])
  // onScroll(event: Event) {
  //   const element = document.querySelector('.animate-on-scroll') as HTMLElement;
  //   const position = element.getBoundingClientRect();

  //   if (position.top < window.innerHeight) {
  //     element.classList.add('active');
  //   }
  // }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const element = document.querySelector('.animate-on-scroll') as HTMLElement;
    if (!element) return; // Prevent error if element is missing

    const position = element.getBoundingClientRect();
    if (position.top < window.innerHeight) {
      element.classList.add('active');
    }
  }


  redirectToHeaderService() {

    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId: 0 }
      }
    );
  }

  userInfo: any;


}

