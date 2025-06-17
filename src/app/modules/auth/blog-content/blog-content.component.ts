import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
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
  selector: 'app-blog-content',
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.css']
})
export class BlogContentComponent implements OnInit {
  blogGet: any[] = [];
  serviceData: any;
  pagedBlogs: any[][] = []; // 3-card groups for slides
  currentIndex: number = 0;
  autoSlideInterval: any;
  communityForm: FormGroup;

  constructor(private router: Router,
    private adminService: AdminService,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit() {
    this.communityForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator()]],
    });
    this.getBlogContent();
    this.getServices()
  }
  getServices() {
    this.authService.getServices().subscribe((data) => {
      this.serviceData = data
      console.log("This is service data", this.serviceData);
    })
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
  contact() {
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
    });
  }
  redirectToprivacypolicy() {
    this.router.navigate(['/privacy-policy']).then(() => {
      window.scrollTo(0, 0);
    });
  }
  redirectToServiceListing(serviceObject: any) {

    this.authService.updateService(serviceObject);
    this.router.navigate(['/listing-category']);
  }

  // getBlogContent() {
  //   this.adminService.getBlogContent().subscribe((data: any) => {
  //     this.blogGet = data.map((blog: any) => {
  //       return {
  //         ...blog,
  //         postFileUrl: blog.postFileUrl ? `${environment.fileUrl}/${blog.postFileUrl}` : undefined
  //       };
  //     });

  //     console.log("This is blog list with images:", this.blogGet);

  //     this.createPagedBlogs(); // Split into groups of 3
  //     this.startAutoSlide(); // Start auto-slide
  //   });
  // }

  getBlogContent() {
  this.adminService.getBlogContent().subscribe(
    (response: any) => {
      if (response && response.items && Array.isArray(response.items)) {
        this.blogGet = response.items.map((blog: any) => {
          return {
            ...blog,
            postFileUrl: blog.postFileUrl ? `${environment.fileUrl}/${blog.postFileUrl}` : undefined
          };
        });
        this.createPagedBlogs(); // Split into groups of 3
        this.startAutoSlide(); // Start auto-slide
        console.log('Pagination info:', {
          pageNumber: response.pageNumber,
          totalPages: response.totalPages,
          totalCount: response.totalCount
        });
      } else {
        console.error("Invalid response structure:", response);
        this.blogGet = []; // Set empty array as fallback
      }
    },
    (error) => {
      console.error("Error fetching blog content:", error);
      this.blogGet = []; // Set empty array on error
    }
  );
}
  createPagedBlogs() {
    this.pagedBlogs = [];
    for (let i = 0; i < this.blogGet.length; i += 3) {
      this.pagedBlogs.push(this.blogGet.slice(i, i + 3));
    }
  }
  startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 9000);
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.pagedBlogs.length;
  }

  prevSlide() {
    this.currentIndex =
      this.currentIndex === 0 ? this.pagedBlogs.length - 1 : this.currentIndex - 1;
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }



  maxLength = 100;
  getShortText(text: string): string {
    return text.length > this.maxLength ? text.substring(0, this.maxLength) + '...' : text;
  }
  toggleFullText(item: any): void {
    item.showFullText = !item.showFullText;
  }
  isTextLongerThanMaxLength(text: string): boolean {
    return text.length > this.maxLength;
  }




  maxLength1 = 26;
  getShortText1(text: string): string {
    return text.length > this.maxLength1 ? text.substring(0, this.maxLength1) + '...' : text;
  }
  toggleFullText1(item: any): void {
    item.showFullText1 = !item.showFullText1;
  }
  isTextLongerThanMaxLength1(text: string): boolean {
    return text.length > this.maxLength1;
  }

  redirectToDoctorSearch() {

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
  navigateToBlogContent() {
    this.router.navigate(['/blog-content']);
  }


  redirectToBlogComments(id: number) {
    this.router.navigate(['/blog-comment'], { queryParams: { blogPostId: id } });
  }


}

