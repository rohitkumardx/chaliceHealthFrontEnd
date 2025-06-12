import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

@Component({
  selector: 'app-main-footer',
  templateUrl: './main-footer.component.html',
  styleUrls: ['./main-footer.component.css']
})
export class MainFooterComponent implements OnInit{
    userInfo: any;
      communityForm: FormGroup;
        serviceData: any;
  constructor(  private router: Router,
     private authService: AuthService,
      private notificationService: NotificationService,
         private providerService: ProviderService,
  ){}
  ngOnInit(): void {
this.userInfo = this.authService.getUserInfo();
  }
 redirectToServiceListing(serviceObject: any) {

    this.authService.updateService(serviceObject);
    this.notificationService.scrollToTop();
    // this.router.navigate(['/listing-category']);
  }

  navigateToBlogContent() {
    this.router.navigate(['/blog-content']);
  }

  navigateToMyPortal() {
    ;
    if (this.userInfo.accountType == "Patient") {
      this.router.navigate(['/patient/dashboard'], { queryParams: { request: 'PatientPortal' } });
    }
    if (this.userInfo.accountType == "Admin") {
      this.router.navigate(['/admin/dashboard'], { queryParams: { request: 'AdminPortal' } });
    }
    if (this.userInfo.accountType == "IndependentProvider") {
      this.router.navigate(['/provider/dashboard'], { queryParams: { request: 'ProviderPortal' } });
    }
    if (this.userInfo.accountType == "PrivatePractices" || this.userInfo.accountType == "Facility") {
      this.router.navigate (['/provider/clinic-dashboard'], { queryParams: { request: 'ProviderPortal' } });
    }
  }

  logout() {
    this.authService.logOut();
  }

  redirectTotermofservice() {
    this.router.navigate(['/terms-of-service']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  redirectToprivacypolicy() {
    this.router.navigate(['/privacy-policy']).then(() => {
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
  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.stateName) return item?.stateName || '';

    // Extract country (assuming the last part after the last comma is the country)
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];

    return `${item.stateName}, ${country}`;
  }
  suggestionsSpeciality: any[] = [];
  suggestionsSpeciality1: any[] = [];
  onSpecialityChange(event: any): void {


    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getSpecialitySearch(query).subscribe((response: any) => {

        this.suggestionsSpeciality = response
        console.log("This is speciality", this.suggestionsSpeciality)
      });

    } else {
      this.suggestionsSpeciality = [];
    }
  }
  contact() {
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  selectedIndex: number | null = null;

  @HostListener('document:keydown', ['$event'])










  // Scroll selected item into view
  scrollToSelected() {
    setTimeout(() => {
      const selectedItem = document.querySelector('.selected-suggestion');
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
 FAQS() {
    this.router.navigate(['/faqs']);
    this.scrollToTop();
  }
 scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
   getServices() {
    this.authService.getServices().subscribe((data) => {
      this.serviceData = data
      console.log("This is service data", this.serviceData);
    })
  }
}

