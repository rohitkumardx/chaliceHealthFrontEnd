import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';
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
export enum Category {
  AllCategories = 0,
  PrimaryCare = 1,
  UrgentCare = 2,
  MentalHealth = 3,
  SpecialtyCare = 4,
  TelemedicineVisits = 5,
  LabTestsAndImaging = 6,
  PrescriptionRefills = 7,
  ChronicCareManagement = 8
}
@Component({
  selector: 'app-listing-category',
  templateUrl: './listing-category.component.html',
  styleUrls: ['./listing-category.component.css']
})
export class ListingCategoryComponent {
  _ = _;
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
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
  serviceData: any;
  userInfo: any;
  doctorServiceData: any;
  currentIndex = 0;
  communityForm: FormGroup;
  service: any
  role: boolean = false;
  serviceObject: any
  slideWidth: number = 0;
  totalSlides: number = 0;
  slideWidth2: number = 0;
  totalSlides2: number = 0;
  constructor(
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private providerService: ProviderService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private fb: FormBuilder,
  ) { }
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  ngOnInit() {
    this.communityForm = this.fb.group({
      email: ['', [Validators.required, customEmailValidator()]],
    });
    this.notificationService.scrollToTop();
    this.route.queryParams.subscribe(params => {
      this.serviceObject = params;
      console.log(this.serviceObject);
      if (this.searchTerm1) {
        this.getimmunizationList();
      }
      this.getLanguages();
    });
    if (this.serviceObject.serviceId == 7 || this.serviceObject.serviceId == 0) {
      if (this.serviceObject.serviceId == 0) {

        this.selectedCategory = 0;
        this.loading = true;
        const requestBody = {

        }
        this.authService.serviceFilter(requestBody, this.paginator.pageNumber, this.paginator.pageSize).subscribe(
          (data: any) => {
            this.loading = false;
            this.doctorServiceData = null
            console.log("This is service data ", data);
            if (data.items.length > 0) {
              this.roles = _.get(data, 'items');
              this.paginator = {
                ...this.paginator,
                pageNumber: _.get(data, 'pageNumber'),
                totalCount: _.get(data, 'totalCount'),
                totalPages: _.get(data, 'totalPages'),
              };
          
              if (data && data.items && Array.isArray(data.items)) {
                  this.doctorServiceData = data.items.map((doctor) => {
              return {
                ...doctor,
                profilePicturePath: doctor?.profilePicturePath
                  ? environment.fileUrl + doctor.profilePicturePath
                  : undefined
              };
            });
              }
            }
          

            this.getServicesById(this.selectedCategory);
          },
          (error) => {
            console.error("Error fetching doctor list:", error);
          }
        );
      }
      else {
        this.selectedCategory = 7;
        this.getimmunizationList()
      }


    }
    else {
      this.authService.selectedService.subscribe((serviceData: any) => {
        this.service = serviceData;
        console.log("This is demo", this.service);
        this.selectedCategory = serviceData.serviceCategoryId
        this.getServiceData(serviceData.serviceCategoryId)
      })
    }
    this.userInfo = this.authService.getUserInfo();
    if (this.userInfo) {
      let acctType = this.userInfo.accountType;
      if (acctType == "Patient") {
        this.role = true;
      }
    }
    this.getServices();
  }
  loading: boolean = false;
  searchTerm1: string = '';
  searchTerm: string = '';
  findADoctor: any = [];
  searchTimeout: any;
  filterData: any = {};
  getimmunizationList() {
debugger
    clearTimeout(this.searchTimeout); // Prevent multiple API calls
    // this.searchTimeout = setTimeout(() => {

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
    if (this.location && this.location.trim() !== '') {
      this.filterData.Address = this.location.trim();
    } else {
      delete this.filterData.Address;
    }
    if (this.selectedCategory == 0) {
      if (this.selectedVisit != null) {
        var telehealth = this.selectedVisit.includes('telehealth');
        var officeVisit = this.selectedVisit.includes('in office');
        var inHomeVisit = this.selectedVisit.includes('in home');
      }
      const requestBody = {
        Name: this.searchTerm,
        gender: this.filterData.gender,
        languageIds: this.filterData.LanguageIds,
        telehealthVisit: telehealth,
        officeVisit: officeVisit,
        inHomeVisit: inHomeVisit,
        address: this.filterData.Address,
        ConditionName: this.searchTerm1

      }
      this.loading = true;
      this.authService.serviceFilter(requestBody, this.paginator.pageNumber, this.paginator.pageSize).subscribe(
        (data: any) => {
          this.selectedCategory1 = false;
          this.loading = false;
          this.doctorServiceData = null
                  if (data.items.length > 0) {
              this.roles = _.get(data, 'items');
              this.paginator = {
                ...this.paginator,
                pageNumber: _.get(data, 'pageNumber'),
                totalCount: _.get(data, 'totalCount'),
                totalPages: _.get(data, 'totalPages'),
              };
          
              if (data && data.items && Array.isArray(data.items)) {
                  this.doctorServiceData = data.items.map((doctor) => {
              return {
                ...doctor,
                profilePicturePath: doctor?.profilePicturePath
                  ? environment.fileUrl + doctor.profilePicturePath
                  : undefined
              };
            });
              }
            }

          this.getServicesById(this.selectedCategory);
        },
        (error) => {
          console.error("Error fetching doctor list:", error);
        }
      );
    }
    else {
      if (this.selectedVisit != null) {
        var telehealth = this.selectedVisit.includes('telehealth');
        var officeVisit = this.selectedVisit.includes('in office');
        var inHomeVisit = this.selectedVisit.includes('in home');
      }
      const requestBody = {
        Name: this.filterData.name,
        serviceCategories: this.selectedCategory,
        gender: this.filterData.gender,
        languageIds: this.filterData.LanguageIds,
        telehealthVisit: telehealth,
        officeVisit: officeVisit,
        inHomeVisit: inHomeVisit,
        address: this.filterData.Address,
        ConditionName: this.searchTerm1
      };
      this.loading = true;
      this.authService.serviceFilter(requestBody, this.paginator.pageNumber, this.paginator.pageSize).subscribe(
        (data: any) => {
          this.selectedCategory1 = true;
          this.loading = false;
          this.doctorServiceData = null
                if (data.items.length > 0) {
              this.roles = _.get(data, 'items');
              this.paginator = {
                ...this.paginator,
                pageNumber: _.get(data, 'pageNumber'),
                totalCount: _.get(data, 'totalCount'),
                totalPages: _.get(data, 'totalPages'),
              };
          
              if (data && data.items && Array.isArray(data.items)) {
                  this.doctorServiceData = data.items.map((doctor) => {
              return {
                ...doctor,
                profilePicturePath: doctor?.profilePicturePath
                  ? environment.fileUrl + doctor.profilePicturePath
                  : undefined
              };
            });
    
              }
            }
        console.log("this is serv",this.doctorServiceData)
          this.getServicesById(this.selectedCategory);
        },
        (error) => {
          console.error("Error fetching doctor list:", error);
        }
      );
    }




    // }, 500);
  }
  selectedVisit: string | null = null;
  toggleVisit(visit: string): void {

    if (this.selectedVisit === visit) {
      this.selectedVisit = null;
    } else {
      this.selectedVisit = visit;
    }
  }
  states: any[] = [];
  getState() {
    this.patientService.getState().subscribe(
      (data: any) => {
        this.states = data.items;
      }
    );
  }

  selectedGender: string | null = null;

  toggleGender(gender: string) {
    this.selectedGender = this.selectedGender === gender ? null : gender;
  }

  languages: any[] = [];
  getLanguages() {
    this.providerService.getLanguages().subscribe((response: any) => {
      this.languages = response.items

    })
  }

  selectedLanguages = [];
  toggleLanguage(language: string): void {
    const index = this.selectedLanguages.indexOf(language);
    if (index > -1) {
      this.selectedLanguages.splice(index, 1);
    } else {
      this.selectedLanguages.push(language);
    }
  }
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
  clearFilters() {
  
    this.selectedGender = '';
    this.selectedVisit = null;
    this.selectedLanguages = [];
    this.location = '';
    this.searchTerm = '';
    this.languages.forEach(lang => lang.selected = false);
    this.getLanguages();
    this.getState();
    this.selectedCategory = 0;
    // Call applyFilters after a short delay to ensure state reset is reflected
    setTimeout(() => {
      this.loading = true;

      this.authService.serviceForDefault().subscribe((data: any) => {
          this.getimmunizationList();
        this.selectedCategory1 = false;
        this.loading = false;
        this.doctorServiceData = data.map((doctor) => {
          return {
            ...doctor,
            profilePicturePath: doctor?.profilePicturePath
              ? environment.fileUrl + doctor.profilePicturePath
              : undefined
          };
        });

        console.log("This is list of doctor", this.doctorServiceData);
      });
    }, 100);
  }


  // Function to toggle more times
  toggleShowMore(doctor: any) {
    doctor.showMoreTimes = !doctor.showMoreTimes;
  }

  getSpecialistNames(specialist: any[]) {
    console.log("This", specialist);
    return specialist;
  }

  redirectToDoctorProfile(id: string): void {
    ;
    this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
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
  benefits() {
    this.router.navigate(['/benefits']);
  }
  providerbenefits() {
    this.router.navigate(['/provider-benefit']);
  }


  categoryLabels: { [key: number]: string } = {
    [Category.PrimaryCare]: 'Primary Care',
    [Category.MentalHealth]: 'Mental Health',
    [Category.TelemedicineVisits]: 'Telemedicine Visits',
    [Category.PrescriptionRefills]: 'Prescription Refills',
    [Category.ChronicCareManagement]: 'Chronic Care Management',
    [Category.UrgentCare]: 'Urgent Care',
    [Category.SpecialtyCare]: 'Specialty Care',
    [Category.LabTestsAndImaging]: 'Lab Tests and Imaging'
  };

  leftCategories: number[] = [
    Category.PrimaryCare,
    Category.MentalHealth,
    Category.TelemedicineVisits,
    Category.PrescriptionRefills,
    Category.ChronicCareManagement
  ];

  rightCategories: number[] = [
    Category.UrgentCare,
    Category.SpecialtyCare,
    Category.LabTestsAndImaging
  ];

  selectedCategory: number | null = null;
  selectedCategory1: boolean = false;
  getServiceData(serviceCategoriesId) {
    
    this.loading = true;
    const obj = {
      serviceCategories: serviceCategoriesId
    }
    this.authService.serviceFilter(obj, this.paginator.pageNumber, this.paginator.pageSize).subscribe((data: any) => {
      this.loading = false;
             if (data.items.length > 0) {
              this.roles = _.get(data, 'items');
              this.paginator = {
                ...this.paginator,
                pageNumber: _.get(data, 'pageNumber'),
                totalCount: _.get(data, 'totalCount'),
                totalPages: _.get(data, 'totalPages'),
              };
          
              if (data && data.items && Array.isArray(data.items)) {
                  this.doctorServiceData = data.items.map((doctor) => {
              return {
                ...doctor,
                profilePicturePath: doctor?.profilePicturePath
                  ? environment.fileUrl + doctor.profilePicturePath
                  : undefined
              };
            });
              }
            }

      console.log("This is list of doctor", this.doctorServiceData);
    });
  }
  getServicesById(id) {

    this.authService.getServicesById(id).subscribe((data) => {
      this.service = null;
      this.service = data

      console.log("This is service data", this.service);
    })
  }
  getRatingPercentage(averageRating: number): number {
    return (averageRating / 5) * 100; // Convert to percentage
  }
  location: any;
  suggestions: any[] = [];
  onAddressChange(event: any): void {
    const query = event.target.value;
    if (query.length > 2) {
      this.providerService.getAddressSearch(query).subscribe((response: any) => {
        this.suggestions = response;
        this.selectedIndex1 = null; // Reset index on new suggestions
      });
    } else {
      this.suggestions = [];
      this.selectedIndex1 = null;
    }
  }

  selectedIndex1: number | null = null;

  selectSuggestion(suggestion: any, index: number): void {
    this.location = suggestion.address;
    this.suggestions = [];
    this.selectedIndex1 = null;
  }


  handleKeydown1(event: KeyboardEvent) {
    if (this.suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex1 =
        this.selectedIndex1 === null || this.selectedIndex1 >= this.suggestions.length - 1
          ? 0
          : this.selectedIndex1 + 1;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex1 =
        this.selectedIndex1 === null || this.selectedIndex1 <= 0
          ? this.suggestions.length - 1
          : this.selectedIndex1 - 1;
    } else if (event.key === 'Enter' && this.selectedIndex1 !== null) {
      this.selectSuggestion(this.suggestions[this.selectedIndex1], this.selectedIndex1);
    }
  }

  redirectToProviderDetail(userId: any) {
    if (this.role || this.userInfo == null) {
      this.router.navigate(['/doctor-detail'], {
        queryParams: { request: 'PatientPortal', userId: userId }
      });
    }

  }
  redirectToHeaderService() {

    this.router.navigate(['/listing-category'],
      {
        queryParams: { serviceId: 0 }
      }
    );
  }

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

  navigateToBlogContent() {
    this.router.navigate(['/blog-content']);
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








  // Select speciality and close dropdown
  selectSpeciality(suggestion: any, index: number) {
    this.selectedIndex1 = index;
    this.searchTerm1 = suggestion.name;
    this.suggestionsSpeciality = []; // Close the dropdown
    this.selectedIndex1 = null; // Reset index
  }

  // Handle keyboard navigation (Arrow Up, Arrow Down, Enter Key)
  handleKeydown(event: KeyboardEvent) {
    if (this.suggestionsSpeciality.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex1 = this.selectedIndex1 === null || this.selectedIndex1 >= this.suggestionsSpeciality.length - 1
        ? 0
        : this.selectedIndex1 + 1;
      this.scrollToSelected();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex1 = this.selectedIndex1 === null || this.selectedIndex1 <= 0
        ? this.suggestionsSpeciality.length - 1
        : this.selectedIndex1 - 1;
      this.scrollToSelected();
    } else if (event.key === 'Enter' && this.selectedIndex1 !== null) {
      this.selectSpeciality(this.suggestionsSpeciality[this.selectedIndex1], this.selectedIndex1);
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

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.suggestionsSpeciality1 = [];
      this.suggestions = [];
      this.selectedIndex = null;
    }
  }
}