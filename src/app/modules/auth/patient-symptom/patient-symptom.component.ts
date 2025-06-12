import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { PatientService } from 'src/app/Services/patient.service';
import { AuthService } from 'src/app/Services/auth.service';
import { environment } from 'src/environments/environment';
import { ProviderService } from 'src/app/Services/provider.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import * as _ from 'lodash';

export function customEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // If empty, let required validator handle it

    // Strict Email Pattern: Ensures valid domain like ".com", ".net", etc.
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(control.value) ? null : { invalidEmail: true };
  };
}

@Component({
  selector: 'app-patient-symptom',
  templateUrl: './patient-symptom.component.html',
  styleUrls: ['./patient-symptom.component.css'],
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
    trigger('slideInTop', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translatey(-50px)' }),
        animate('1.2s ease-out', style({ opacity: 1, transform: 'translatey(0)' }))
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
export class PatientSymptomComponent {
  userInfo: any;
  communityForm: FormGroup;
  currentIndex = 0;
  slideWidth: number = 0;
  totalSlides: number = 0;
  slideWidth2: number = 0;
  totalSlides2: number = 0;
  _ = _ ;
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 6,
    totalCount: 0,
    totalPages: 0
  };
  filteredItems = []
  roles: {
    id: number,
    numOfUsers: number,
    name: string,
    status: string
  }[] = [];
  constructor(
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private providerService: ProviderService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.communityForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator()]],
    });
    this.getServices();
    this.userInfo = this.authService.getUserInfo();

    // Get search term from query parameters
    this.route.queryParams.subscribe(params => {
      this.searchTerm1 = params['search'] || '';

      if (this.searchTerm1) {
        this.getimmunizationList();
      }
      this.getLanguages();
    });
    if (this.userInfo) {
      let acctType = this.userInfo.accountType;
      if (acctType == "Patient") {
        this.role = true;
      }
    }
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


  parseLocalDate(dateStr: string | Date): Date {

    if (typeof dateStr === 'string') {

      // Force parsing in local time instead of UTC

      const [year, month, day] = dateStr.split('-').map(Number);

      return new Date(year, month - 1, day); // Local date (no time)

    }

    return new Date(dateStr);

  }



  isToday(date: string | Date): boolean {

    const today = new Date();

    const givenDate = this.parseLocalDate(date);

    return today.toDateString() === givenDate.toDateString();

  }



  isTomorrow(date: string | Date): boolean {

    const today = new Date();

    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const givenDate = this.parseLocalDate(date);

    return tomorrow.toDateString() === givenDate.toDateString();

  }



  isNextWeek(date: string | Date): boolean {

    const today = new Date();

    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

    const givenDate = this.parseLocalDate(date);



    return givenDate > tomorrow && givenDate <= nextWeek;

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
  serviceData: any;

  getServices() {
    this.authService.getServices().subscribe((data) => {
      this.serviceData = data
      console.log("This is service data", this.serviceData);
    })
  }
  redirectToServiceListing(serviceObject: any) {

    this.authService.updateService(serviceObject);
    this.notificationService.scrollToTop();
    // this.router.navigate(['/listing-category']);
  }



  loading: boolean = false;
  searchTerm: string = '';
  searchTerm1: string = '';
  findADoctor: any = [];
  searchTimeout: any;


  getimmunizationList() {
    debugger
  clearTimeout(this.searchTimeout); // Prevent multiple API calls


    const finalSearchTerm = (this.searchTerm1).trim();

    
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1);

    const requestBody = {
      address: this.location ,
      name: this.searchTerm,
      conditionName: finalSearchTerm,
      telehealthVisit: this.selectedVisit.includes('telehealth'),
      officeVisit: this.selectedVisit.includes('in office'),
      inHomeVisit: this.selectedVisit.includes('in home'),
      currentDateTime: localISOTime
    };

    console.log("Sending request body:", requestBody);

    this.patientService.getFilteredProviderList(requestBody, this.paginator.pageNumber, this.paginator.pageSize).subscribe(
      (data: any) => {
        this.loading = false;

        if (data?.items?.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };

          let filteredDoctors = data.items.map((doctor: any) => {
            if (doctor?.profilePicturePath) {
              doctor.profilePicturePath = environment.fileUrl + doctor.profilePicturePath;
            } else {
              doctor.profilePicturePath = undefined;
            }

            let allSlots = doctor.availabilities.map((slot: any) => ({
              ...slot,
              startTime: this.formatTo12Hour(slot.startTime) // Format time
            }));

            return {
              ...doctor,
              availabilities: allSlots,
              limitedAvailabilities: allSlots.slice(0, 5),
              showMoreTimes: false
            };
          });

          // Apply Gender Filter
          if (this.selectedGender.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor: any) =>
              this.selectedGender.includes(doctor.gender)
            );
          }

          // Apply Language Filter
          if (this.selectedLanguages.length > 0) {
            filteredDoctors = filteredDoctors.filter((doctor: any) =>
              doctor.languages.some((lang: any) =>
                this.selectedLanguages.includes(lang.languageName)
              )
            );
          }

          // Apply Visit Type Filter
          filteredDoctors = filteredDoctors.filter((doctor: any) => {
            if (this.selectedVisit.length === 0) return true;
            return (
              (this.selectedVisit.includes('telehealth') && doctor.telehealthVisitPrice) ||
              (this.selectedVisit.includes('in office') && doctor.officeVisitPrice) ||
              (this.selectedVisit.includes('in home') && doctor.inHomeVisitPrice)
            );
          });

          this.findADoctor = filteredDoctors;

          // ✅ Final Check for "Nothing Found"
          this.noResultsFound = finalSearchTerm && filteredDoctors.length === 0;
        } else { 
          this.findADoctor = [];
          this.noResultsFound = finalSearchTerm.length > 0;
        }

        console.log("Filtered doctors:", this.findADoctor);
      },
      (error) => {
        console.error("Error fetching doctor list:", error);
        this.findADoctor = [];
        this.noResultsFound = true;
      }
    );
 
}


  states: any[] = [];
  getState() {
    this.patientService.getState().subscribe(
      (data: any) => {
        this.states = data.items;
      }
    );
  }

  selectedGender: string = ''; // Store the selected gender

  selectGender(gender: string): void {
    if (this.selectedGender !== gender) {
      this.selectedGender = gender; // Select the new gender
    }
  }


  languages: any[] = [];
  getLanguages() {
    this.providerService.getLanguages().subscribe((response: any) => {
      this.languages = response.items; // Backend se aaya data store kar diya
    });
  }

  selectedLanguages: string[] = [];
  toggleLanguage(language: string): void {
    const index = this.selectedLanguages.indexOf(language);
    if (index > -1) {
      this.selectedLanguages.splice(index, 1);
    } else {
      this.selectedLanguages.push(language);
    }
  }


  selectedVisit: string[] = []; // ✅ Array to hold selected visit types

  toggleVisit(visit: string): void {
    const index = this.selectedVisit.indexOf(visit);
    if (index > -1) {
      this.selectedVisit.splice(index, 1); // Remove if already selected
    } else {
      this.selectedVisit.push(visit); // Add if not selected
    }
    this.getimmunizationList(); // ✅ Refresh list on selection change
  }



  // Function to format time to 12-hour format
  formatTo12Hour(time: string): string {
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert to 12-hour format

    return `${hour}:${minutes} ${suffix}`;
  }


noResultsFound: boolean = false;

  clearFilters() {
    this.searchTerm = '';
    this.location = '';
    this.searchTerm1 = '';
    this.selectedGender = '';
    this.selectedLanguages = [];
    this.selectedVisit = [];
    this.states = [];
    this.getState();

    this.noResultsFound = false; // 👈 Reset this


     // Remove query param from URL
  this.router.navigate([], {
    queryParams: { search: null },
    queryParamsHandling: 'merge',
  }); 

    setTimeout(() => {
      this.getimmunizationList();
    }, 100);
  }




  // Function to toggle more times
  toggleShowMore(doctor: any) {
    doctor.showMoreTimes = !doctor.showMoreTimes;
  }

  getSpecialistNames(specialist: any[]): string {
    return specialist.map(s => s.specialistNames).join(', ');
  }

  redirectToBookAppointment(providerProfileId: any, id: string, date: any, time: any): void {
    const data: any = {}

    const formattedTime = this.convertTimeTo24HrFormat(time);

    data.date = date
    data.time = formattedTime

    if (this.userInfo) {
      this.router.navigate(['/patient/book-appointment'], {
        queryParams: { providerProfileId: providerProfileId, slotId: id, data: JSON.stringify(data) }
      });
    }
    else {
      this.router.navigate(['/login'], {
        queryParams: { request: 'PatientPortal', providerProfileId: providerProfileId, slotId: id, data: JSON.stringify(data) }
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
    this.router.navigate(['/faqs']);
    this.scrollToTop();
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  location: any;
  suggestions: any[] = [];
  suggestionsSpeciality: any[] = [];
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
  selectSuggestion(suggestion: any): void {


    this.location = suggestion.address
    this.suggestions = [];
  }

  selectedIndex1: number | null = null;

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
        this.selectSuggestion(this.suggestions[this.selectedIndex1]);
      }
    }
    
    scrollToSelected() {
      setTimeout(() => {
        const selectedItem = document.querySelector('.selected-suggestion');
        if (selectedItem) {
          selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }


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
  selectedIndex: number | null = null;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.suggestionsSpeciality.length) return; // Exit if no suggestions

    if (event.key === 'ArrowDown') {
      // Move selection down
      if (this.selectedIndex === null || this.selectedIndex >= this.suggestionsSpeciality.length - 1) {
        this.selectedIndex = 0; // Reset to first item
      } else {
        this.selectedIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      // Move selection up
      if (this.selectedIndex === null || this.selectedIndex <= 0) {
        this.selectedIndex = this.suggestionsSpeciality.length - 1; // Move to last item
      } else {
        this.selectedIndex--;
      }
    } else if (event.key === 'Enter' && this.selectedIndex !== null) {
      // Select the highlighted item
      this.selectSpeciality(this.suggestionsSpeciality[this.selectedIndex], this.selectedIndex);
    }

    // ✅ Automatically scroll the selected item into view
    setTimeout(() => {
      const selectedItem = document.querySelector('.selected-suggestion');
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 10);
  }

  selectSpeciality(suggestion: any, index: number) {
    this.selectedIndex = index;
    this.searchTerm1 = suggestion.name;
    this.getimmunizationList();
    this.suggestionsSpeciality = []; // Close the dropdown
  }

  contact() {
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  redirectToHeaderService() {

    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId: 0 }
      }
    );
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

  logout() {
    this.authService.logOut();
  }

  formatTime(time: string): string {
    const [timePart, modifier] = time.trim().split(/ (AM|PM)/i);

    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier?.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }

    if (modifier?.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }

    const paddedHour = hours.toString().padStart(2, '0');
    const paddedMinute = minutes.toString().padStart(2, '0');

    return `${paddedHour}:${paddedMinute}`;
  }

  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.stateName) return item?.stateName || '';

    // Extract country (assuming the last part after the last comma is the country)
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];

    return `${item.stateName}, ${country}`;
  }
  role: boolean = false;
  redirectToProviderDetail(userId: any) {
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/doctor-detail'], {
        queryParams: { request: 'PatientPortal', userId: userId }
      });
    }

  }

  redirectToDoctorProfile(id: string, clinicId: any): void {
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id, clinicId: clinicId } });
    }
  }

  getTodayOrNextSlots(availabilities: any[]): any[] {
    const today = new Date().toISOString().split('T')[0];
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
 

}
