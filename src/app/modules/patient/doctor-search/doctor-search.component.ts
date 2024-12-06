import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-doctor-search',
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.css']
})
export class DoctorSearchComponent {
  doctorData: any;
  filterForm: FormGroup
  selectedGender: string | null = null;
  selectedAvailability: string | null = null; // Holds the currently selected gender
  selectedVisit: string | null = null; // Holds the currently selected visit type
  specialities: any
  states: any[] = [];
  loading: boolean = false;
  qualifications: any[] = [];
  selectedState: string | null = null; // Hold selected specialty
  searchName: any

  InHomeVisit: boolean = false
  OfficeVisit: boolean = false
  TelehealthVisit: boolean = false
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private providerService: ProviderService,
    private patientService: PatientService,
  ) { }

  ngOnInit(): void {

    if (!localStorage.getItem('doctor-search-page')) {
      localStorage.setItem('doctor-search-page', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('doctor-search-page');

      this.getSpeciality();
      this.getState();
      this.getCredentials();
      this.getLanguages()

    }

    this.filterForm = this.fb.group({
      credentials: [''],
      state: [''],
    })

    this.applyFilters()

  }
  searchTerm: string = '';
  filteredSpecialities: any[] = [];
  selectedSpecialities: any[] = [];
  languages: any


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
        this.qualifications = data.items;


        this.visibleQualifications = this.qualifications.slice(0, 4); 
        this.hiddenQualifications = this.qualifications.slice(4); 
        this.showMoreButton = true

      },
      (error) => {
        console.error("Error fetching qualifications:", error);
      }
    );
  }
  clearFilters() {
    this.filterForm.reset();

    this.selectedSpecialities = [];
    this.searchTerm = '';
    this.filteredSpecialities = [...this.specialities];

    this.selectedGender = '';
    this.selectedVisit = '';
    this.selectedAvailability = '';
    debugger
    this.languages.forEach(lang => lang.selected = false);

    this.getLanguages()
    // window.location.reload();

    this.applyFilters();
  }

  filterData: any = {};
  applyFilters() {
    this.loading = true
    this.filterData.InHomeVisit = false,
      this.filterData.OfficeVisit = false,
      this.filterData.TelehealthVisit = false

    if (this.filterForm.value.credentials != "") {
      this.filterData.QualificationIds = this.filterForm.value.credentials;
    }
    if (this.filterForm.value.state != "") {
      this.filterData.StateIds = this.filterForm.value.state;
    }
    if (this.searchName != '') {
      this.filterData.FirstName = this.searchName;
    } else if (this.searchName === '') {
      delete this.filterData.FirstName;
    }
    if (this.selectedVisit === 'telehealth') {
      this.filterData.TelehealthVisit = true;
    } else if (this.selectedVisit === 'in office') {
      this.filterData.OfficeVisit = true;
    }
    else if (this.selectedVisit === 'in home') {
      this.filterData.InHomeVisit = true;
    }
    else if (this.selectedVisit === null) {
      this.filterData.InHomeVisit = false;
      this.filterData.OfficeVisit = false;
      this.filterData.TelehealthVisit = false;
    }
    if (this.selectedGender === 'male') {
      this.filterData.gender = 'Male';
    } else if (this.selectedGender === 'female') {
      this.filterData.gender = 'Female';
    } else if (this.selectedGender == 'any') {
      delete this.filterData.gender;
    }

    if (this.selectedLanguages.length > 0) {
      this.filterData.LanguageIds = this.selectedLanguages
    } else if (this.selectedLanguages.length == 0) {
      delete this.filterData.LanguageIds;
    }


    if (this.selectedSpecialities.length > 0) {
      this.filterData.SpecialistIds = this.selectedSpecialities.map(speciality => speciality.id);
    } else if (this.selectedLanguages.length == 0) {
      delete this.filterData.LanguageIds;
    }
    this.patientService.getFilteredProviderList(this.filterData).subscribe(
      (data: any) => {
        this.loading = false
        this.doctorData = data;

        this.doctorData.forEach((doctor: any) => {

          if (doctor?.profilePicturePath) {
            doctor.profilePicturePath = environment.fileUrl + doctor.profilePicturePath;
          } else {
            doctor.profilePicturePath = undefined;
          }

          if (doctor.availabilities.length > 0) {
            if (doctor.availabilities && doctor.availabilities.length > 5) {
              doctor.availabilities = doctor.availabilities.slice(0, 5);
            }

            doctor.date = doctor.availabilities[0].date
            doctor.availabilities = doctor.availabilities.map((slot: any) => {
              debugger

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
        console.log('doctor', this.doctorData)
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
      this.filteredSpecialities = this.specialities;
    })
  }

  getProviderList() {
    this.patientService.getProviderList().subscribe((data: any) => {
      this.doctorData = data;
      this.doctorData.forEach((doctor: any) => {

        if (doctor.availabilitySlots && doctor.availabilitySlots.length > 5) {
          doctor.availabilitySlots = doctor.availabilitySlots.slice(0, 5);
        }


        doctor.availabilitySlots = doctor.availabilitySlots.map((slot: any) => {
          debugger

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
    if (this.selectedGender === gender) {
      this.selectedGender = null;
    } else {
      this.selectedGender = gender;
    }
  }
  redirectToDoctorProfile(id: string): void {
    this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
  }




  toggleAvailability(availability: string): void {
    debugger
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

  selectedCredential: any
  isMoreOptionsVisible = false;
  slideTransform = 'translateX(0)';
  showMoreButton:  boolean = false;


  selectCredential(id: number) {
     this.selectedCredential = id;
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
}
