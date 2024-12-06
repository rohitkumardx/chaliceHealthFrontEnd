import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-profile',
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css']
})


export class ViewProfileComponent implements OnInit {

  profileData: any;
  slotData: any;
  providerProfileId: any;
  profilePicturePath: any;
  languages: any;
  videoIntroName: any;
  showMore: boolean = false;
  chunkedAvailabilities: any[][] = [];
  // showMore: { [key: string]: boolean } = {};
  sanitizedVideoUrl: SafeResourceUrl;
  userInfo: any

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if (!localStorage.getItem('view-doctor-profile-page')) {
      localStorage.setItem('view-doctor-profile-page', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('doctor-search-page');

      this.route.queryParams.subscribe((parama: any) => {
        this.providerProfileId = parama.providerProfileId;
      });
      this.getStartDate()
      this.getProviderProfileList();
      this.getAvailabilitySlot()
      this.userInfo = this.authService.getUserInfo()
    }
  }

  hasSlots(availabilityGroup: any[]): boolean {
    debugger
    return availabilityGroup.some(availability => availability.limitedSlots && availability.limitedSlots.length > 0);
  }

  currentDate: any
  getStartDate() {
    const currentDate = new Date();

    const startDate = this.formatDate(currentDate);
    this.currentDate = startDate
    const endDate = this.formatDate(new Date(currentDate.setDate(currentDate.getDate() + 3)));


    this.startDate = startDate;
    this.endDate = endDate;
  }

  chunkArray(arr: any[], chunkSize: number) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
  previousSlots() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    start.setDate(start.getDate() - 4);
    end.setDate(end.getDate() - 4);

    // Convert back to 'YYYY-MM-DD' format if needed
    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];

    this.getAvailabilitySlot()
  }
  nextSlots() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    start.setDate(start.getDate() + 4);
    end.setDate(end.getDate() + 4);

    // Convert back to 'YYYY-MM-DD' format if needed
    this.startDate = start.toISOString().split('T')[0];
    this.endDate = end.toISOString().split('T')[0];
    this.getAvailabilitySlot()
  }
  formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0);
  
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toUpperCase();
  }

  goBack(): void {
    window.history.back(); 
  }
  
  startDate: any
  endDate: any
  getAvailabilitySlot() {

    this.patientService.getAvailabilitySlot(this.providerProfileId, this.startDate, this.endDate).subscribe((data: any) => {
      this.slotData = data;
      console.log(" slot data: ", this.slotData);
      this.slotData.availabilities.forEach((availability: any) => {
        availability.limitedSlots = availability.slots.slice(0, 3);
      });

      const filledAvailabilities = this.fillMissingDates(this.startDate, this.endDate, this.slotData.availabilities);
      this.chunkedAvailabilities = this.chunkArray(filledAvailabilities, 4);
      console.log("Filtered slot data: ", this.chunkedAvailabilities);
    });
  }



  fillMissingDates(startDate: string, endDate: string, availabilities: any[]) {
    const filledAvailabilities: any[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    // Loop through each day between startDate and endDate
    while (current <= end) {
      const formattedDate = this.formatDate(current);

      // Find availability for the current date
      const availability = availabilities.find(a => a.date === formattedDate);

      if (availability) {
        // If availability exists for the date, add it to the filled list
        filledAvailabilities.push(availability);
      } else {
        // If no availability, insert a placeholder with null values
        filledAvailabilities.push({
          date: formattedDate,
          slots: null,
          limitedSlots: null
        });
      }

      // Move to the next day
      current.setDate(current.getDate() + 1);
    }

    return filledAvailabilities;
  }
  // Method to toggle 'See more'/'See less' for all availabilities
  toggleShowMore() {
    this.showMore = !this.showMore;

    // Toggle between showing top 3 or all slots for all availabilities
    this.slotData.availabilities.forEach((availability: any) => {
      availability.limitedSlots = this.showMore ? availability.slots : availability.slots.slice(0, 3);
    });
  }
  redirectToBookAppointment(id: string, date: any, time: any): void {
    const data: any = {}
    data.date = date
    data.time = time
    if (this.userInfo){
    //   const profileUrl = this.router.createUrlTree(['/patient/book-appointment'], { queryParams: { providerProfileId: this.providerProfileId, slotId: id, data: JSON.stringify(data) } }).toString();
    // window.open(profileUrl, '_blank');
    this.router.navigate(['/patient/book-appointment'], {
      queryParams: { providerProfileId: this.providerProfileId, slotId: id, data: JSON.stringify(data) }
    });
    }
    else {
     // this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal',providerProfileId: this.providerProfileId, slotId: id, data: JSON.stringify(data) } });

     this.router.navigate(['/signup'], {
      queryParams: { request: 'PatientPortal', providerProfileId: this.providerProfileId, slotId: id, data: JSON.stringify(data) }
    });
    }

  }


  // Helper method to format date as YYYY-MM-DD
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    return `${year}-${month}-${day}`;
  }


  getProviderProfileList() {
    this.patientService.getProviderProfileList(this.providerProfileId).subscribe((data: any) => {
      this.profileData = data;

      // Profile picture logic
      if (this.profileData?.profilePicturePath) {
        this.profileData.profilePicturePath = environment.fileUrl + this.profileData.profilePicturePath;
      } else {
        this.profileData.profilePicturePath = undefined;
      }
      if (this.profileData?.videoIntroName) {

        const videoId = this.extractYouTubeVideoId(this.profileData.videoIntroName);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      }
      else {
        this.profileData.videoIntroName = undefined
      }
    }, (error) => {
      console.error('Error fetching provider data:', error);
    });
  }
  getLicensedStates(): string {
    return this.profileData.licensedState
      .map(state => state.licensedStateNames)
      .join(', ');
  }
  extractYouTubeVideoId(url: string): string {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    return videoIdMatch ? videoIdMatch[1] : '';
  }
}
