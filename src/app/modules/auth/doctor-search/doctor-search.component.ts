import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { customEmailValidator } from '../login/login.component';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { race } from 'rxjs';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-doctor-search',
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css']
})
export class DoctorSearchComponent implements OnInit {
  serviceData: any;
  userInfo: any;
  loading: boolean = false;
  communityForm: FormGroup;

  doctorData: any;
  filterForm: FormGroup
  selectedGender: string | null = null;
  selectedAvailability: string | null = null; // Holds the currently selected gender
  selectedVisit: string | null = null; // Holds the currently selected visit type
  specialities: any
  states: any[] = [];
  qualifications: any[] = [];
  selectedState: string | null = null; // Hold selected specialty
  searchName: any
  location: any;
  InHomeVisit: boolean = false
  OfficeVisit: boolean = false
  TelehealthVisit: boolean = false
  role: boolean = false;
  searchTerm: string = '';
  filteredSpecialities: any[] = [];
  selectedSpecialities: any[] = [];
  languages: any
  //providerProfileId: any; 
  _ = _;
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
  private HERE_API_URL = 'https://autocomplete.search.hereapi.com/v1/autocomplete';
  private API_KEY = 't58P7DlKUdXX1Wlcn1C9bRO7U9t1tC-Y3M2Q1T2m3Ac';


  constructor(private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService,
    private providerService: ProviderService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {

  }
  ngOnInit(): void {
    // Footer 
    this.communityForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator()]],
    });

    this.getServices();
    this.userInfo = this.authService.getUserInfo();
    console.log("local storage from contact us :", this.userInfo);

    // Doctor Search
    this.route.queryParams.subscribe(params => {
      if (params['search'] || params['location']) {
        this.searchName = params['search'];
        this.location = params['location'];
      }
    });
    if (!localStorage.getItem('doctor-search-page')) {
      localStorage.setItem('doctor-search-page', 'true');
      window.location.reload();
      this.getSpeciality();
    } else {
      localStorage.removeItem('doctor-search-page');
      this.getSpeciality();
      this.getState();
      this.getCredentials();
      this.getLanguages();
      this.userInfo = this.authService.getUserInfo();
      if (this.userInfo) {
        let acctType = this.userInfo.accountType;
        if (acctType == "Patient") {
          this.role = true;
        }
      }
    }

    this.filterForm = this.fb.group({
      credentials: [''],
      state: [''],
    })

    // Scroll to top when the component loads
    window.scrollTo({ top: 0, behavior: 'smooth' });



  }

  contact() {
    this.router.navigate(['/contact']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  logout() {
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
  redirectToHeaderService() {

    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId: 0 }
      }
    );
  }
  redirectToSignUpPage() {
    this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal' } });
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




  // Doctor



  isSpecialityFoundInVisible(): boolean {
    // Check if the search name matches any speciality in the hidden list
    return this.visibleSpecialities.some(item => item.name.toLowerCase() === this.searchName.toLowerCase());
  }
  isSpecialityFoundInHidden(): boolean {
    // Check if the search name matches any speciality in the hidden list
    return this.hiddenSpecialities.some(item => item.name.toLowerCase() === this.searchName.toLowerCase());
  }
  selectSpecialityOnLoad(suggestion: any) {
    this.selectedSpeciality = suggestion;
    this.searchName = suggestion;

    if (this.searchName) {
      if (!this.isSpecialityFoundInHidden()) {
        //this.suggestionsSpeciality = [];
        //this.selectedIndex = null;
      }
      else if (!this.isSpecialityFoundInVisible()) {
        this.isSpecialityOptionsVisible = true;
        this.showSpecialityMoreButton = false;
      }

    }
    this.suggestionsSpeciality = [];
    this.selectedIndex = null;
  }


  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    this.suggestionsSpeciality = []; // Close the dropdown
    this.selectedIndex = null; // Reset index
    this.suggestions = [];
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
  redirectToBookAppointment(providerProfileId: any, id: string, date: any, time: any): void {

    const data: any = {}
      ;
    const formattedTime = this.convertTimeTo24HrFormat(time);

    data.date = date
    data.time = formattedTime
      ;
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

  redirectToProviderDetail(userId: any) {
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/doctor-detail'], {
        queryParams: { request: 'PatientPortal', userId: userId }
      });
    }

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





  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.stateName) return item?.stateName || '';

    // Extract country (assuming the last part after the last comma is the country)
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];

    return `${item.stateName}, ${country}`;
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
  getLanguages() {
    this.providerService.getLanguages().subscribe((response: any) => {
      this.languages = response.items

    })
  }

  getState() {
    this.patientService.getState().subscribe(
      (data: any) => {
        this.states = data.items;
      }
    );
  }
  getSpecialistNames(specialists: any[]): string {
    return specialists.map(s => s.specialistNames).join(', ');
  }

  getCredentials() {
    this.providerService.getQualifications().subscribe(
      (data: any) => {
        this.qualifications = data.items.filter(
          (item) => item.inHomePage
        );
        this.showMoreButton = true
        this.visibleQualifications = this.qualifications.slice(0, 4);
        this.hiddenQualifications = this.qualifications.slice(0, 10);
      },
      (error) => {
        console.error("Error fetching qualifications:", error);
      }
    );
  }
  clearFilters() {
    this.filterForm.reset();
    // Reset filter-related variables
    this.filterData = {};  // Reset filterData completely
    this.selectedCredential = null;
    this.selectedSpeciality = null;
    this.states = [];
    this.selectedSpecialities = [];
    this.searchTerm = '';
    this.searchName = '';
    this.location = '';
    this.filteredSpecialities = [...this.specialities];
    this.selectedGender = '';
    this.selectedVisit = '';
    this.selectedAvailability = '';
    this.selectedLanguages = [];
    this.filterForm.get('state')?.setValue('');

    // Reset all language selections
    this.languages.forEach(lang => lang.selected = false);

    // Fetch updated state and language lists
    this.getLanguages();
    this.getState();

    // Call applyFilters after a short delay to ensure state reset is reflected
    setTimeout(() => {
      this.applyFilters();
    }, 100);
  }

  filterData: any = {};
  specialityList: any[] = [];
  search() {
    if (!this.searchName || this.searchName.trim() === '') {
      this.clearFilters();
      return;
    }
    else {
      this.applyFilters();
    }

  }
  conditionName: any;
  applyFilters() {
    this.loading = true;
    this.filterData.InHomeVisit = false;
    this.filterData.OfficeVisit = false;
    this.filterData.TelehealthVisit = false;
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // offset in ms
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // remove 'Z'
    this.filterData.currentDateTime = localISOTime;
    if (this.selectedSpeciality) {

      this.filterData.SpecialtyName = this.selectedSpeciality;
    }
    if (this.searchName && this.searchName.trim() !== '') {
      let matchedSpeciality = this.specialities.find(s =>
        s.name.toLowerCase().startsWith(this.searchName.toLowerCase()) // Matches first few characters
      );

      if (matchedSpeciality) {
        // If a match is found based on the first few characters, treat it as a specialty
        this.filterData.SpecialtyName = matchedSpeciality.name;
        this.filterData.specialistNames = this.selectedSpeciality;

        // Remove FirstName filter
        delete this.filterData.name;
      } else {
        // If no match is found in specialties, filter by FirstName
        this.filterData.name = this.searchName;

        // Remove SpecialtyName filter
        delete this.filterData.SpecialtyName;
        delete this.filterData.specialistNames;
      }
    }

    // if (this.selectedCredential) {
    //   this.filterData.QualificationIds = this.selectedCredential;
    // }
    if (this.selectedCredential) {
      this.filterData.QualificationIds = this.selectedCredential;
    } else {
      delete this.filterData.QualificationIds;
    }

    if (this.filterForm.value.state) {
      this.filterData.StateIds = this.filterForm.value.state;
    }

    if (this.selectedVisit === 'telehealth') {
      this.filterData.TelehealthVisit = true;
    } else if (this.selectedVisit === 'in office') {
      this.filterData.OfficeVisit = true;
    } else if (this.selectedVisit === 'in home') {
      this.filterData.InHomeVisit = true;
    }
    if (this.selectedGender === 'male') {
      this.filterData.gender = 'Male';
    } else if (this.selectedGender === 'female') {
      this.filterData.gender = 'Female';
    } else if (this.selectedGender === 'other') {
      this.filterData.gender = 'Other'; // <-- fix here
    }
    if (this.selectedLanguages.length > 0) {
      this.filterData.LanguageIds = this.selectedLanguages;
    } else {
      delete this.filterData.LanguageIds;
    }

    // *Filter by Address*
    if (this.location && this.location.trim() !== '') {
      this.filterData.Address = this.location.trim();
    } else {
      delete this.filterData.Address;
    }
    if (this.conditionName && this.conditionName.trim() !== '') {
      this.filterData.conditionName = this.conditionName.trim();
    } else {
      delete this.filterData.conditionName;
    }

    debugger
    this.patientService.getFilteredProviderList(this.filterData, this.paginator.pageNumber, this.paginator.pageSize).subscribe(
      (data: any) => {
        this.loading = false;
        // Always reset doctor list
        this.notificationService.scrollToTop();
        this.doctorData = [];
        this.filteredItems = [];

        if (data.items.length > 0) {
          this.roles = _.get(data, 'items');
          this.paginator = {
            ...this.paginator,
            pageNumber: _.get(data, 'pageNumber'),
            totalCount: _.get(data, 'totalCount'),
            totalPages: _.get(data, 'totalPages'),
          };
          this.doctorData = data.items
          if (data && data.items && Array.isArray(data.items)) {
            this.doctorData = data.items;
            this.filteredItems = [...this.doctorData];
          }
          this.doctorData = data.items;
          this.doctorData.forEach((doctor: any) => {
            if (doctor?.profilePicturePath) {
              doctor.profilePicturePath = environment.fileUrl + doctor.profilePicturePath;
            } else {
              doctor.profilePicturePath = undefined;
            }
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
        }
        console.log('Filtered doctors:', this.doctorData);
      },
      (error) => {
        console.error("Error fetching filtered providers:", error);
      }
    );
  }
  selectedLanguages = [];
  onCheckboxChange(event: any, languageId: number) {
    if (event.target.checked) {
      this.selectedLanguages.push(languageId);
    } else {
      const index = this.selectedLanguages.indexOf(languageId);
      if (index > -1) {
        this.selectedLanguages.splice(index, 1);
      }
    }
    console.log(this.selectedLanguages);
  }
  clearSearchTerm() {
    this.searchTerm = '';
    this.filteredSpecialities = this.specialities;
  }
  toggleSpeciality(item: any) {
    const index = this.selectedSpecialities.findIndex(speciality => speciality.name === item.name);
    this.searchTerm = '';
    if (index === -1) {
      this.selectedSpecialities.push(item);
    } else {
      this.selectedSpecialities.splice(index, 1);
    }
  }

  isSelected(item: any): boolean {
    return this.selectedSpecialities.some(speciality => speciality.name === item.name);
  }

  getSelectedSpecialitiesLabel(): string {
    if (this.selectedSpecialities.length > 0) {
      return this.selectedSpecialities.map(item => item.name).join(', ');
    } else {
      return 'Select Specialties';
    }
  }
  removeSpeciality(item: any) {
    const index = this.selectedSpecialities.findIndex(speciality => speciality.name === item.name);
    if (index !== -1) {
      this.selectedSpecialities.splice(index, 1);
    }
  }
  dropdownOpen: boolean = false;
  filterSpecialities() {
    this.filteredSpecialities = this.specialities.filter(item =>
      item.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  getSpeciality() {

    this.providerService.getSpeciality().subscribe((response: any) => {
      this.specialities = response
        ;
      this.applyFilters();
      const filteredSpecialities = this.specialities.filter(
        (speciality) => speciality.inHomePage
      );
      console.log("This is data", this.specialities);
      this.visibleSpecialities = filteredSpecialities.slice(0, 4);
      this.hiddenSpecialities = filteredSpecialities.slice(0, 10);
      this.showSpecialityMoreButton = true
      this.selectSpecialityOnLoad(this.searchName);
    })
  }

  getProviderList() {
    this.patientService.getProviderList().subscribe((data: any) => {
      this.doctorData = data.items;
      this.doctorData.forEach((doctor: any) => {
        if (doctor.availabilitySlots && doctor.availabilitySlots.length > 5) {
          doctor.availabilitySlots = doctor.availabilitySlots.slice(0, 5);
        }
        doctor.availabilitySlots = doctor.availabilitySlots.map((slot: any) => {

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
      });
      console.log('This is provider data:', this.doctorData);
    }, (error) => {
      console.error('Error fetching provider data:', error);
    });
  }

  toggleGender(gender: string): void {
    ;
    if (this.selectedGender == gender) {
      this.selectedGender = null;
    } else {
      this.selectedGender = gender;
    }
  }
  redirectToDoctorProfile(id: string, clinicId: any): void {
    // this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id, clinicId: clinicId } });
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id, clinicId: clinicId } });
    }
  }

  toggleAvailability(availability: string): void {

    if (this.selectedAvailability === availability) {
      this.selectedAvailability = null;
    } else {
      this.selectedAvailability = availability;
    }
  }

  toggleVisit(visit: string): void {

    if (this.selectedVisit === visit) {
      this.selectedVisit = null;
    } else {
      this.selectedVisit = visit;
    }
  }

  visibleQualifications = this.qualifications.slice(0, 3);
  hiddenQualifications = this.qualifications.slice(3);

  selectedCredential = null
  isMoreOptionsVisible = false;

  showMoreButton: boolean = false;


  visibleSpecialities = [];
  hiddenSpecialities = [];
  // selectedSpeciality: number | null = null;

  // Controls visibility
  isSpecialityOptionsVisible = false;
  showSpecialityMoreButton = false;

  selectCredential(id: number) {
    if (this.selectedCredential == id) {
      this.selectedCredential = null
    }
    else {
      this.selectedCredential = id;
    }

  }

  showMoreOptions() {
    this.isMoreOptionsVisible = true;
    this.showMoreButton = false
    // this.slideTransform = 'translateX(0)';
  }

  hideMoreOptions() {
    this.isMoreOptionsVisible = false;
    this.showMoreButton = true
  }

  selectedSpeciality: string | null = null;
  suggestionsSpeciality1: any[] = [];

  // selectSpeciality(suggestion: any, index: number) {
  //   ;
  //   this.selectedSpeciality=suggestion
  //   this.searchName = suggestion.name; // Set selected value in input
  //   this.suggestionsSpeciality = []; // Clear the list to close dropdown
  //   this.selectedIndex = -1; // Reset index
  // }
  selectSpeciality(suggestion: any, index: number) {
    this.selectedSpeciality = suggestion;
    this.searchName = suggestion.name;
    this.suggestionsSpeciality = [];
    this.selectedIndex = null;
  }
  selectedIndex1: number | null = null;
  showSpecialityOptions() {
    this.isSpecialityOptionsVisible = true;
    this.showSpecialityMoreButton = false
  }

  hideSpecialityOptions() {
    this.isSpecialityOptionsVisible = false;
    this.showSpecialityMoreButton = true
  }

  suggestions: any[] = [];
  suggestionsSpeciality: any[] = [];
  onSpecialityChange(event: any): void {
    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getSpecialitySearch(query).subscribe((response: any) => {
        this.suggestionsSpeciality = response;
        this.selectedIndex = null; // Reset index on new list
      });
    } else {
      this.suggestionsSpeciality = [];
      this.selectedIndex = null;
    }
  }

  selectedIndex: number | null = null;

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.suggestionsSpeciality.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.selectedIndex === null || this.selectedIndex >= this.suggestionsSpeciality.length - 1) {
        this.selectedIndex = 0;
      } else {
        this.selectedIndex++;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.selectedIndex === null || this.selectedIndex <= 0) {
        this.selectedIndex = this.suggestionsSpeciality.length - 1;
      } else {
        this.selectedIndex--;
      }
    } else if (event.key === 'Enter' && this.selectedIndex !== null) {
      this.selectSpeciality(this.suggestionsSpeciality[this.selectedIndex], this.selectedIndex);
    }
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

  scrollToSelected() {
    setTimeout(() => {
      const selectedItem = document.querySelector('.selected-suggestion');
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  selectSuggestion(suggestion: any, index: number): void {
    this.selectedIndex1 = index;
    this.location = suggestion.address;
    this.suggestions = [];
    this.selectedIndex1 = null;
  }

  onAddressChange(event: any): void {
    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getAddressSearch(query).subscribe((response: any) => {
        this.suggestions = response;
        this.selectedIndex1 = null; // Reset selected index when suggestions change
      });
    } else {
      this.suggestions = [];
    }
  }



}
