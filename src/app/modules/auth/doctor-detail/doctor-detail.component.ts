




















































import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { customEmailValidator } from '../login/login.component';
import { getErrorMessage } from 'src/app/utils/httpResponse'; 
import { PatientService } from 'src/app/Services/patient.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-doctor-detail',
  templateUrl: './doctor-detail.component.html',
  styleUrls: ['./doctor-detail.component.css']
})
export class DoctorDetailComponent implements OnInit {
  // Footer
 serviceData: any;
  userInfo: any;
  loading: boolean = false;
  communityForm: FormGroup; 


  // Doctor Detail
    selectedService: string | null = null;
  selectedServiceType: string = '';
  isMobile: boolean = false;
  @Output() dialogClosed = new EventEmitter<void>();
  @Input() bookingId: any;
  @Input() patientId: any; 
  userId: any;
  providerData: any;

  constructor(private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private globalModalService: GlobalModalService, 
    private providerService: ProviderService,
    private patientService: PatientService,
    private route: ActivatedRoute, 
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

    // Doctor Detail
      this.route.queryParams.subscribe((parama: any) => {
      this.userId = parama.userId;
    });

    this.getProviderProfileData();
    this.selectedService = 'telehealth';

    this.isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
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


  // Doctor Detail
  
  redirectToDoctorProfile(id: string): void {
    this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });

  }

  selectService(serviceType: string) {
    this.selectedService = serviceType;
  }

  redirectToBookAppointment(providerProfileId: any, id: string, date: any, time: any, serviceType: string): void {

    const data: any = {}
      ;
    const formattedTime = this.convertTimeTo24HrFormat(time);

    data.date = date;
    data.time = formattedTime;
    data.serviceType = this.selectedService
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
        // serviceType: serviceType,
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

  getBadgeClass(index: number): string {
    const badgeColors = ['bg-primary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info'];
    return badgeColors[index % badgeColors.length]; // Loop through colors
  }


  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.stateName) return item?.stateName || '';

    // Extract country (assuming the last part after the last comma is the country)
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];

    return `${item.stateName}, ${country}`;
  }

  getProviderProfileData() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Offset in ms
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // Remove 'Z'

    // Split into date and time
    const [datePart, timeWithMs] = localISOTime.split('T');
    const timePart = timeWithMs.split('.')[0];
    this.patientService.getProviderProfileData(this.userId,datePart,timePart).subscribe(
      (response: any) => {
        if (!response) return;
        const formatAvailabilities = (availabilities: any[]) => {
          return availabilities.map(slot => {
            if (typeof slot.startTime === 'string' && slot.startTime.includes(':')) {
              const [hoursStr, minutes] = slot.startTime.split(':');
              const hours = parseInt(hoursStr, 10);
              const suffix = hours >= 12 ? 'PM' : 'AM';
              const hour12 = hours % 12 || 12;
              slot.startTime = `${hour12}:${minutes} ${suffix}`;
            }
            return slot;
          }) || [];
        };

        const processDoctor = (doctor: any) => ({
          ...doctor,
          profilePicturePath: doctor.profilePicturePath ? environment.fileUrl + doctor.profilePicturePath : undefined,
          date: doctor.availabilities?.[0]?.date,
          availabilities: formatAvailabilities(doctor.availabilities || [])
        });

        this.providerData = Array.isArray(response) ? response.map(processDoctor) : processDoctor(response);

        console.log("Provider profile data:", this.providerData);
      },
      (error: any) => console.error("Error fetching provider data:", error)
    );
  }


  goBack() {
    this.router.navigate(['/doctor-search'],);
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
 

  // getFutureSlots(availabilities: any[]) {
  //   return availabilities.filter(slot => this.isFutureSlot(slot.date, slot.startTime));
  // }
}

