import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-add-review',
  templateUrl: './add-review.component.html',
  styleUrls: ['./add-review.component.css']
})
export class AddReviewComponent {
  reviewForm: FormGroup;
  charCount: number = 0;
  selectedRating: number | null = null;

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private patientService: PatientService
  ) {
    const currentDate = new Date().toISOString().split('T')[0];
    this.reviewForm = this.fb.group({
      rating: [null, Validators.required], // Ensure a rating is selected
      review: ['', [Validators.required, Validators.maxLength(500)]], // Ensure a review is written
    });
    
      // date: [currentDate]
   
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
      const reviewData = {
        patientId: 1, // Replace with actual patientId from your logic
        providerId: 4, // Replace with actual providerId from your logic
        rating: this.reviewForm.value.rating,
        review: this.reviewForm.value.review,
      };
  
      console.log('Review data to submit:', reviewData);
  
      this.patientService.postRating(reviewData).subscribe(
        response => {
          console.log('Review submitted:', response);
          this.notificationService.showSuccess('Review submitted successfully!');
          this.reviewForm.reset(); // Reset the form on successful submission
          window.location.reload();
        },
        error => {
          console.error('Error submitting review:', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      console.error('Form is invalid:', this.reviewForm);
      this.notificationService.showDanger('Please fill out the form correctly before submitting.');
    }
  }
  
}
