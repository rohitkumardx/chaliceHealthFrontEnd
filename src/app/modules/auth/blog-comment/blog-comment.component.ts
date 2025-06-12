import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { environment } from 'src/environments/environment';
import { customEmailValidator } from '../login/login.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
 
@Component({
  selector: 'app-blog-comment',
  templateUrl: './blog-comment.component.html',
  styleUrls: ['./blog-comment.component.css']
})
export class BlogCommentComponent implements OnInit {
 
  commentBlogForm!: FormGroup;
  loading: boolean = false;
  blogPostId: any;
 
  blogGet: any[] = [];
 
  // blogPostId: number | null = null;
  // blogGet: any = null;
  // loading: boolean = false;
 
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private globalModalService: GlobalModalService,
    private authService: AuthService
  ) {}
 

 
 
  ngOnInit() {
    // Footer
    this.communityForm = this.fb.group({
                  email: ['', [Validators.required, customEmailValidator()]],      
                });
 
    this.activatedRoute.queryParams.subscribe((params: any) => {
        this.blogPostId = params.blogPostId;
 
        // Agar ID mil gaya to blog ka data fetch kar
        if (this.blogPostId) {
            this.getBlogContent();
        }
    });
 
    // Comment Form initialize
    this.commentBlogForm = this.fb.group({
        comment: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
        name: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
        email: ['', [Validators.required, Validators.email]],
        website: [''],
    });
}

contact() {
  this.router.navigate(['/contact']).then(() => {
    window.scrollTo(0, 0);
   });   
}
 
getBlogContent() {
  this.loading = true;
  if (!this.blogPostId) {
      console.error("Blog Post ID not found!");
      return;
  }
  this.authService.getBlogcommentId(this.blogPostId).subscribe(
      (data: any) => {
          console.log("Fetched Blog Data:", data);
         
          // Check if postFileUrl exists; if not, assign a default image
          this.blogGet = [{
              ...data,
              postFileUrl: data.postFileUrl ? (environment.fileUrl + '/' + data.postFileUrl) : '../../../../assets/svg/bydefault.png'
          }];
 
          console.log("Updated Blog Data with Image:", this.blogGet);
      },
      (error) => {
          console.error("Error fetching blog:", error);
      }
  ).add(() => {
      this.loading = false;
  });
}
 
 
 
   
  submitcommentBlogForm() {
    if (this.commentBlogForm.invalid) {
      this.notificationService.markFormGroupTouched(this.commentBlogForm);
      this.notificationService.showDanger('Please fill all the required fields correctly.');
      return;
    }
 
    this.loading = true;
    //const blogGet = this.authService.getUserInfo();
 
    const formData = {
      blogPostId : this.blogPostId,
      commentText: this.commentBlogForm.get('comment')?.value,
      name: this.commentBlogForm.get('name')?.value,
      email: this.commentBlogForm.get('email')?.value,
      webSiteUrl: this.commentBlogForm.get('website')?.value || null
    };
 
    this.authService.postBlogcomment(formData).subscribe(
      (data) => {
        this.notificationService.showSuccess('Comment posted successfully.');
        this.commentBlogForm.reset();
      },
      (error) => {
        this.notificationService.showDanger('Error posting comment: ' + error.message);
      }
    );
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
 
  redirectToBlogComments(id: number) {
    this.router.navigate(['/blog-comment'], { queryParams: { blogPostId: id } });
  }
 
 
 
  // Foter
 
  communityForm : FormGroup;
  serviceData: any;
 
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
 
  redirectToServiceListing(serviceObject:any){
 
    this.authService.updateService(serviceObject);
    this.router.navigate(['/listing-category']);
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
 
  goBack() {
    this.router.navigate(['/blog-content'],);
  }
}
 
 
 
 
 
 
 
 
 
 
 
 