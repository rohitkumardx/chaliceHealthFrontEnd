import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { PatientService } from 'src/app/Services/patient.service';
import { HttpClient } from '@angular/common/http';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';
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
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
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
export class HomePageComponent implements OnInit, AfterViewInit {
  visibleSlides: number = 4;
  location: any;
  speciality: any;
  showAll: false;
  communityForm: FormGroup
  userInfo: any;
  topDoctorsData: any[] = [];
  serviceData: any;
  @ViewChild('sliderWrapper') sliderWrapper!: ElementRef<HTMLDivElement>;
  // @ViewChild('sliderWrapper2', { static: false }) sliderWrapper2!: ElementRef;
  @ViewChild('sliderWrapper2') sliderWrapper2!: ElementRef<HTMLDivElement>;
  // @ViewChild('sliderWrapper2') sliderWrapper2!: ElementRef<HTMLDivElement>;
  currentIndex = 0;
  slideWidth: number = 0;
  totalSlides: number = 0;
  slideWidth2: number = 0;
  totalSlides2: number = 0;
  role: boolean = false;
  searchTerm: String = '';
  private HERE_API_URL = 'https://autocomplete.search.hereapi.com/v1/autocomplete';
  private API_KEY = 't58P7DlKUdXX1Wlcn1C9bRO7U9t1tC-Y3M2Q1T2m3Ac';
  suggestions: any[] = [];
  sliderWidth: any;
  constructor(
    private router: Router,
    private patientService: PatientService,
    private http: HttpClient,
    private providerService: ProviderService,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
  ) { }
  ngOnInit() {
    this.communityForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator()]],
    });
    this.getSpeciality();
    this.getTopDoctors();
    this.getServices();
    this.userInfo = this.authService.getUserInfo();
    if (this.userInfo) {
      let acctType = this.userInfo.accountType;
      if (acctType == "Patient") {
        this.role = true;
      }
    }
    console.log("local storage from homepage :", this.userInfo);

    this.updateVisibleSlides();
    window.addEventListener('resize', this.updateVisibleSlides.bind(this));

    const loaderWrapper = document.getElementById('loader-wrapper');
    if (loaderWrapper) {
      loaderWrapper.style.display = 'none';
    }
  }


  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    this.suggestionsSpeciality1 = []; // Close the dropdown
    this.selectedIndex = null; // Reset index
    this.suggestions = [];
  }



  ngAfterViewInit() {
    // Set the initial width of the slides after the view is initialized
    this.totalSlides = this.sliderWrapper2.nativeElement.children.length;
    this.sliderWidth = this.sliderWrapper2.nativeElement.offsetWidth;
    this.slideWidth = this.sliderWrapper.nativeElement.clientWidth / 4; // Divide by 4 for 4 visible slides
    this.totalSlides = this.sliderWrapper.nativeElement.children.length;
    this.slideWidth2 = this.sliderWrapper2.nativeElement.clientWidth / 4; // Divide by 4 for 4 visible slides
    this.totalSlides2 = this.sliderWrapper2.nativeElement.children.length;
    this.updateSlider();
    this.setSliderWidth();
    window.addEventListener('resize', this.setSliderWidth.bind(this));
  }

  updateVisibleSlides() {
    const width = window.innerWidth;
    if (width < 576) {
      this.visibleSlides = 1; // small screen (mobile)
    } else if (width < 768) {
      this.visibleSlides = 2; // tablets
    } else if (width < 992) {
      this.visibleSlides = 3; // small desktops
    } else {
      this.visibleSlides = 4; // large desktops
    }

    this.totalSlides = this.topDoctorsData?.length || 0;
    this.updateSlider();
  }


  redirectToProviderDetail(userId: any) {
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/doctor-detail'], {
        queryParams: { request: 'PatientPortal', userId: userId }
      });
    }


  }

  // convertTime(time: string): string {
  //   const [timePart, modifier] = time.trim().split(/ (AM|PM)/i);

  //   let [hours, minutes] = timePart.split(':').map(Number);

  //   if (modifier?.toUpperCase() === 'PM' && hours < 12) {
  //     hours += 12;
  //   }

  //   if (modifier?.toUpperCase() === 'AM' && hours === 12) {
  //     hours = 0;
  //   }

  //   const paddedHour = hours.toString().padStart(2, '0');
  //   const paddedMinute = minutes.toString().padStart(2, '0');

  //   return `${paddedHour}:${paddedMinute}`;
  // }


  contact() {
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  // contact(){
  //   this.router.navigate(['/contact']);
  // }

  suggestionsSpeciality: any[] = [];
  suggestionsSpeciality1: any[] = [];

  onSpecialityChange1(event: any): void {


    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getSpecialitySearch(query).subscribe((response: any) => {

        this.suggestionsSpeciality1 = response
        console.log("This is speciality", this.suggestionsSpeciality)
      });

    } else {
      this.suggestionsSpeciality = [];
    }
  }

  // Scroll selected item into view
  scrollToSelected() {
    setTimeout(() => {
      const selectedItem = document.querySelector('.selected-suggestion');
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }
  // Handle keyboard navigation (Arrow Up, Arrow Down, Enter Key)
  handleKeydown(event: KeyboardEvent) {
    if (this.suggestionsSpeciality1.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = this.selectedIndex === null || this.selectedIndex >= this.suggestionsSpeciality1.length - 1
        ? 0
        : this.selectedIndex + 1;
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = this.selectedIndex === null || this.selectedIndex <= 0
        ? this.suggestionsSpeciality1.length - 1
        : this.selectedIndex - 1;
      this.scrollToSelected();
    } else if (event.key === 'Enter' && this.selectedIndex !== null) {
      this.selectSpeciality(this.suggestionsSpeciality1[this.selectedIndex], this.selectedIndex);
    }
  }
  // Select speciality and close dropdown
  selectSpeciality(suggestion: any, index: number) {
    this.selectedIndex = index;
    this.searchTerm = suggestion.name;
    this.suggestionsSpeciality1 = []; // Close the dropdown
    this.selectedIndex = null; // Reset index
  }

  selectedIndex: number | null = null;
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.suggestions.length) return; // Exit if no suggestions

    if (event.key === 'ArrowDown') {
      // Move selection down
      if (this.selectedIndex === null || this.selectedIndex >= this.suggestions.length - 1) {
        this.selectedIndex = 0; // Reset to first item
      } else {
        this.selectedIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      // Move selection up
      if (this.selectedIndex === null || this.selectedIndex <= 0) {
        this.selectedIndex = this.suggestions
          .length - 1; // Move to last item
      } else {
        this.selectedIndex--;
      }
    } else if (event.key === 'Enter' && this.selectedIndex !== null) {
      // Select the highlighted item
      this.selectSpeciality(this.suggestions[this.selectedIndex], this.selectedIndex);
    }

    // ✅ Automatically scroll the selected item into view
    setTimeout(() => {
      const selectedItem = document.querySelector('.selected-suggestion');
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 10);
  }





  searchDoctor(event: Event) {
    event.preventDefault();
    if (this.searchTerm.trim() || this.location) {
      this.router.navigate(['/patient/doctor-search'], {
        queryParams: { request: 'withoutLogin', search: this.searchTerm, location: this.location }
      });
    }
  }
  selectedIndex1: number | null = null;
  selectSuggestion(suggestion: any, index: number): void {

    this.selectedIndex1 = index;
    this.location = suggestion.address
    this.suggestions = [];
    this.selectedIndex1 = null;
  }

  handleKeydown1(event: KeyboardEvent) {

    if (this.suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex1 = this.selectedIndex1 === null || this.selectedIndex1 >= this.suggestions.length - 1
        ? 0
        : this.selectedIndex1 + 1;
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex1 = this.selectedIndex1 === null || this.selectedIndex1 <= 0
        ? this.suggestions.length - 1
        : this.selectedIndex1 - 1;
      this.scrollToSelected();
    } else if (event.key === 'Enter' && this.selectedIndex1 !== null) {
      this.selectSuggestion(this.suggestions[this.selectedIndex1], this.selectedIndex1);
    }
  }

  redirectToDoctorProfile(id: string): void {
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
    }
    //this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
  }

  redirectToBookAppointment(providerProfileId: any, id: string, date: any, time: any): void {

    const data: any = {}

    const formattedTime = this.convertTimeTo24HrFormat(time);

    data.date = date
    data.time = formattedTime

    this.userInfo = this.authService.getUserInfo();
    if (this.userInfo != null) {
      this.router.navigate(['/patient/book-appointment'], {
        queryParams: { providerProfileId: providerProfileId, slotId: id, data: JSON.stringify(data) }
      });
    }
    else {
      const obj = {
        providerProfileId: providerProfileId,
        id: id,
        data: data
      }

      this.authService.setAppointmentInfo(obj);
      this.router.navigate(['/login'], {
        queryParams: { request: 'PatientPortal' }
      });
    }

  }
  convertTimeTo24HrFormat(time: string): string {
    // Regular expression to handle time parsing
    const regex = /(\d{1,2}):(\d{2})\s([APap][Mm])/;
    const matches = time.match(regex);

    if (matches) {
      let hours = parseInt(matches[1]);
      const minutes = matches[2];
      const period = matches[3].toUpperCase(); // AM or PM

      // Convert to 24-hour format
      if (period === 'AM' && hours === 12) {
        hours = 0; // Midnight case
      } else if (period === 'PM' && hours !== 12) {
        hours += 12; // Convert PM times
      }

      // Format hours, minutes, and seconds to always be 2 digits
      const hoursFormatted = hours.toString().padStart(2, '0');
      const minutesFormatted = minutes.padStart(2, '0');
      const secondsFormatted = '00'; // Always set seconds to 00

      return `${hoursFormatted}:${minutesFormatted}:${secondsFormatted}`;
    } else {
      return 'Invalid time format';
    }
  }

  formatTime(time: string): string {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 -> 12 for 12AM, and 13 -> 1PM
    return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  getTodayOrNextSlots(availabilities: any[]): any[] {
    const today = new Date().toLocaleDateString('en-CA');
    const grouped: { [date: string]: any[] } = {};
 
    for (const slot of availabilities) {
      if (!grouped[slot.date]) grouped[slot.date] = [];
      grouped[slot.date].push(slot);
    }
 
    const sortedDates = Object.keys(grouped).sort();
    for (const date of sortedDates) {
      if (date >= today) return grouped[date];
    }
 
    return [];
  }

  logout() {
    this.authService.logOut();
  }
  firstAvailableDate: Date | null = null;
  private getAllFutureSlots(availabilities: any[]) {
const now = new Date();

return availabilities
  .map(slot => {
    const slotDateTime = this.getSlotDateTime(slot.date, slot.startTime);
    return { ...slot, slotDateTime };
  })
  .filter(slot => slot.slotDateTime > now);
}
getFutureSlots(availabilities: any[]) {
  const futureSlots = this.getAllFutureSlots(availabilities);
  if (futureSlots.length === 0) return [];

  // Determine the earliest date (ignoring time)
  const earliestDate = new Date(futureSlots[0].slotDateTime);
  earliestDate.setHours(0, 0, 0, 0);
  this.firstAvailableDate = earliestDate;

  // Return only slots that match the earliest future date
  return futureSlots.filter(slot => {
    const slotDay = new Date(slot.slotDateTime);
    slotDay.setHours(0, 0, 0, 0);
    return slotDay.getTime() === earliestDate.getTime();
  });
}

// Helper: Convert date + time string into a Date object
private getSlotDateTime(date: string, time: string): Date {
  const [timePart, modifier] = time.trim().split(/ (AM|PM)/i) as [string, string];
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date(date);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate;
}


  getTopDoctors() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Offset in ms
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // Remove 'Z'

    // Split into date and time
    const [datePart, timeWithMs] = localISOTime.split('T');
    const timePart = timeWithMs.split('.')[0];
    this.authService.getTopDoctors(datePart,timePart).subscribe((data: any) => {
      this.topDoctorsData = data.map((doctor: any) => ({
        ...doctor,
        profilePicturePath: environment.fileUrl + doctor.profilePicturePath
      }));
      this.topDoctorsData.forEach((doctor: any) => {

        if (doctor.availabilities.length > 0) {
          if (doctor.availabilities.length > 5) {
            doctor.availabilities = doctor.availabilities;
          }

          doctor.date = doctor.availabilities[0].date;
          doctor.availabilities = doctor.availabilities.map((slot: any) => {
            if (typeof slot.startTime === 'string' && slot.startTime.includes(':')) {
              const timeParts = slot.startTime.split(':');
              const hours = parseInt(timeParts[0], 10);
              const minutes = timeParts[1];
              const suffix = hours >= 12 ? 'PM' : 'AM';
              const hour12 = hours % 12 || 12;

              slot.startTime = `${hour12}:${minutes} ${suffix}`;
            }
            return slot;
          });
        }
      });

      console.log("top doctors data:", this.topDoctorsData);
      this.updateTotalSlides();
    });
  }

  updateTotalSlides() {
    setTimeout(() => {
      if (this.sliderWrapper) {
        this.totalSlides = this.topDoctorsData.length;
      }
    }, 100);
  }

  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.stateName) return item?.stateName || '';

    // Extract country (assuming the last part after the last comma is the country)
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];

    return `${item.stateName}, ${country}`;
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



  nextSlide() {
    const maxIndex = Math.max(0, this.totalSlides - this.visibleSlides);
    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Reset to start
    }
    this.updateSlider();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = Math.max(0, this.totalSlides - this.visibleSlides);
    }
    this.updateSlider();
  }


  prevSlide2() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.sliderWrapper2.nativeElement.style.transform = `translateX(-${this.currentIndex * this.sliderWidth}px)`;
    } else {
      this.currentIndex = 0; // Loop back to the first group of slides
    }
    this.updateSlider2();
  }
  setSliderWidth() {
    const slideItems = this.sliderWrapper2.nativeElement.children as HTMLCollectionOf<HTMLElement>;
    if (slideItems.length > 0) {
      this.sliderWidth = slideItems[0].offsetWidth;
      this.totalSlides = slideItems.length;
      this.updateSlider2();
    }
  }


  nextSlide2() {
    if (this.currentIndex < this.totalSlides - 2) {
      this.currentIndex += 1; // Correct increment
      this.sliderWrapper2.nativeElement.style.transform = `translateX(-${this.currentIndex * this.sliderWidth}px)`;
    } else {
      this.currentIndex = 0; // Loop back to the first group of slides
    }
    this.updateSlider2();
  }


  updateSlider() {
    const wrapper = this.sliderWrapper?.nativeElement;
    const slideItems = wrapper?.children as HTMLCollectionOf<HTMLElement>;
    if (slideItems?.length > 0) {
      const slideWidth = slideItems[0].offsetWidth;
      wrapper.style.transform = `translateX(-${this.currentIndex * slideWidth}px)`;
    }
  }

  updateSlider2() {
    const wrapper = this.sliderWrapper2.nativeElement;
    wrapper.style.transform = `translateX(-${this.currentIndex * this.sliderWidth}px)`;
  }

  redirectToDoctorSearch() {
    this.router.navigate(['/doctor-search'], { queryParams: { request: 'withoutLogin' } });
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
    this.scrollToTop();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  patientSymptom() {
    this.router.navigate(['/patient-symptom']);
  }

  searchTerm1: string = '';
  findADoctor: any = [];


  getDoctorList(condition?: string) {
    // Agar condition hai (keyword pe click hua), to usko searchTerm1 me set karo
    if (condition) {
      this.searchTerm1 = condition;
    }

    if (!this.searchTerm1) {
      console.warn("Search term is empty!");
      return;
    }

    const requestBody = {
      conditionName: this.searchTerm1,
      telehealthVisit: true,
      officeVisit: true,
      inHomeVisit: true
    };

    console.log("Sending request body:", requestBody);

    this.patientService.getFinaADoctor(requestBody).subscribe(
      (data: any) => {
        console.log("API Response:", data);

        // Store data in localStorage (or use a service)
        localStorage.setItem('searchedDoctors', JSON.stringify(data));

        // Redirect to patient-symptom page with search term
        this.router.navigate(['/patient-symptom'], { queryParams: { search: this.searchTerm1 } });
      },
      (error) => {
        console.error("Error fetching doctor list:", error);
      }
    );
  }

  benefits() {
    this.router.navigate(['/benefits']);
  }

  providerbenefits() {
    this.router.navigate(['/provider-benefit']);
  }

  searchDoctorBySpeciality(specialty: string) {
    this.router.navigate(['/doctor-search'], {
      queryParams: { request: 'withoutLogin', search: specialty }
    });
  }



  getSpeciality() {
    this.providerService.getSpeciality().subscribe((response: any) => {
      const allowed = ['Primary Care', 'OB/GYN', 'Dermatology', 'Mental Health'];
      this.speciality = response
        .filter((item: any) => allowed.includes(item.name))
        .sort((a: any, b: any) => b.name.localeCompare(a.name)); // Descending order
      console.log("Filtered and sorted speciality list:", this.speciality);
    });
  }

  redirectToProviderSignup() {
    this.router.navigate(['/signup'], { queryParams: { request: 'ProviderPortal' } });
  }

  navigateToBlogContent() {
    this.router.navigate(['/blog-content']);
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

  redirectToHeaderService() {
    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId: 0 }
      }
    );
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

  redirectToprivacypolicy() {
    this.router.navigate(['/privacy-policy']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  getStarType(index: number, rating: number): 'full' | 'half' | 'empty' {
    const floorRating = Math.floor(rating);
    const decimal = rating - floorRating;

    if (index <= floorRating) {
      return 'full';
    }
    else if (index === floorRating + 1 && decimal >= 0.25) {
      return 'half';
    }
    else {
      return 'empty';
    }
  }

}
