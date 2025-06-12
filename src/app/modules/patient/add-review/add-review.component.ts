import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.css']
})
export class AddReviewComponent  implements OnInit {



  reviewForm: FormGroup;
  charCount: number = 0;
  selectedRating: number | null = null;
  @Input() reviewObj: any
  @Input() Id: any
  @Output() dialogClosed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private authService: AuthService,
    private activeModel: NgbActiveModal,
  ) {
    const currentDate = new Date().toISOString().split('T')[0];
    this.reviewForm = this.fb.group({
      rating: [null, Validators.required], // Ensure a rating is selected
      review: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S+/)]]
      // review: ['', [Validators.required, Validators.maxLength(500)]], 
    });

    // date: [currentDate]
  
  }
  ngOnInit(){
   
    
    this.getReviewAndRatingById();
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.get('rating')?.setValue(rating); // Updates the form control
    console.log('Rating set to:', rating); // Debugging
  }


  updateCharCount(): void {
    const review = this.reviewForm.get('review')?.value || '';
    this.charCount = review.length;
  }

  submitReview(): void {
    if (this.reviewForm.valid) {
       if(this.reviewObj.Id){
        const userInfo = this.authService.getUserInfo()

        const reviewData = {
          id:this.reviewObj.Id,
          patientId: userInfo.userId,
          providerId: this.reviewObj.providerId,
          rating: this.reviewForm.value.rating,
          review: this.reviewForm.value.review,
        };
        this.patientService.UpdateReviewAndRating(reviewData).subscribe(response =>{
          this.notificationService.showSuccess('Review Updated successfully.');
          this.modalClose();
        },
        error => {
          console.error('Error submitting review:', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      )
       }
       else{
        const userInfo = this.authService.getUserInfo()
        const reviewData = {
          patientId: userInfo.userId,
          providerId: this.reviewObj.providerId,
          rating: this.reviewForm.value.rating,
          review: this.reviewForm.value.review,
        };
        this.patientService.postRating(reviewData).subscribe(
          response => {
            this.notificationService.showSuccess('Review submitted successfully.');
            this.modalClose()
          },
          error => {
            console.error('Error submitting review:', error);
            this.notificationService.showDanger(getErrorMessage(error));
          }
        );
       }
  
     
    } else {
      console.error('Form is invalid:', this.reviewForm);
      this.notificationService.showDanger('Please fill out the form correctly before submitting.');
    }
  }

  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
  

  getReviewAndRatingById() {

    this.patientService.getReviewAndRatingById(this.reviewObj.Id).subscribe((data:any) => {
      if (data) {
        console.log("get data",data)
      
        this.reviewForm.patchValue({
          rating: data.rating,
          review: data.review,
          
        });
  
        // Update selected rating so the UI reflects the correct stars
        this.selectedRating = data.rating;
  
        // Update character count based on the loaded review
        this.charCount = data.review?.length || 0;

        // ✅ Update provider name for display in template
      this.reviewObj.providerName = data.providerName;
      }
    });
  }
  
  

}
