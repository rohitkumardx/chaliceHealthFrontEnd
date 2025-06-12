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
  appointmentId: any
  meetingType: any
  clinicId: any
 
  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) { }
 
  ngOnInit() {
    if (!localStorage.getItem('view-doctor-profile-page')) {
      localStorage.setItem('view-doctor-profile-page', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('doctor-search-page');
      this.route.queryParams.subscribe((parama: any) => {
        this.providerProfileId = parama.providerProfileId;
        this.appointmentId = parama.appointmentId,
        this.meetingType = parama.meetingType,
        this.clinicId = parama.clinicId
      });
      this.getStartDate()
      this.getProviderProfileList();
      this.getAvailabilitySlot()
      this.userInfo = this.authService.getUserInfo()
      this.getOverallRating()
    }
  }
 
  navigateToMyPortal() {
 
    if (this.userInfo.accountType == "Patient") {
      this.router.navigate(['/patient/dashboard'], { queryParams: { request: 'PatientPortal' } });
    }
    if (this.userInfo.accountType == "Admin") {
      this.router.navigate(['/admin/dashboard'], { queryParams: { request: 'AdminPortal' } });
    }
    if (this.userInfo.accountType == "IndependentProvider") {
      this.router.navigate(['/provider/dashboard'], { queryParams: { request: 'ProviderPortal' } });
    }
    if (this.userInfo.accountType == "PrivatePractices" || this.userInfo.accountType == 'Facility') {
      this.router.navigate(['/provider/clinic-dashboard'], { queryParams: { request: 'ProviderPortal' } });
    }
  }
 
  hasSlots(availabilityGroup: any[]): boolean {
    return availabilityGroup.some(availability => availability.limitedSlots && availability.limitedSlots.length > 0);
  }
  selectedDate: Date = new Date(); // Default to today's date
  filteredAvailabilities: any[] = [];
 
  currentDate: any
  getStartDate() {
    const currentDate = new Date();
 
    const startDate = this.formatDate(currentDate);
    this.currentDate = startDate
    // const endDate = this.formatDate(new Date(currentDate.setDate(currentDate.getDate() + 3)));
const endDate=null;
 
    this.startDate = startDate;
    this.endDate = endDate;
  }
  onDateChange(event: any) {
   
    const selectedDate = event.value;
    if (selectedDate) {
      // this.selectedDate = selectedDate;
      const startDate = this.formatDate(selectedDate);
      this.currentDate = startDate
      const endDate = this.formatDate(new Date(selectedDate.setDate(selectedDate.getDate() + 3)));
 
 
      this.startDate = startDate;
      this.endDate = endDate;
      this.getAvailabilitySlot();
    }
  }
 
  // Helper function to chunk array into groups of 3 for the carousel
  chunkArray(array: any[], size: number) {
    return array.reduce((acc, _, i) =>
      i % size === 0 ? [...acc, array.slice(i, i + size)] : acc, []
    );
  }
 
  averageRating: any
  reviewCount : any
  ratingListData = []
  fullStars: number[] = [];
  emptyStars: number[] = [];
  hasHalfStar: boolean = false;
 
  getOverallRating() {
    this.patientService.getOverallRating(this.providerProfileId).subscribe((response: any) => {
      this.averageRating = response.averageRating
 
      this.reviewCount = response.reviewCount
      this.ratingListData = response.reviewsAndRatings
 
      const fullStarCount = Math.floor(this.averageRating);
      const hasHalfStar = this.averageRating % 1 >= 0.5;
      const emptyStarCount = 5 - fullStarCount - (hasHalfStar ? 1 : 0);
   
      this.fullStars = Array(fullStarCount).fill(0);
      this.hasHalfStar = hasHalfStar;
      this.emptyStars = Array(emptyStarCount).fill(0);
 
      this.ratingListData.forEach((item : any)=>{
        if(item.filePath){
          item.filePath = environment.fileUrl + item.filePath;
          } else {
            item.filePath = undefined;
          }
      })
    })
  }
  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-GB', options); // 'en-GB' ensures proper day-first format
  }
 
 
 
  currentIndex: number = 0;
  maxSlides: number =1000;
 
  previousSlots() {
    if (this.currentIndex > 0) { // Allow only if we haven't reached the limit
      this.currentIndex--; // Decrease the index
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
 
      start.setDate(start.getDate() - 4);
      end.setDate(end.getDate() - 4);
 
      this.startDate = start.toISOString().split('T')[0];
      this.endDate = end.toISOString().split('T')[0];
 
      this.getAvailabilitySlot(); // Fetch the new slot data
    }
  }
 
  nextSlots() {
   
    if (this.currentIndex < this.maxSlides - 1) { // Allow only if we haven't reached the limit
      this.currentIndex++; // Increase the index
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
 
      start.setDate(start.getDate() + 4);
      end.setDate(end.getDate() + 4);
 
      this.startDate = start.toISOString().split('T')[0];
      this.endDate = end.toISOString().split('T')[0];
 
      this.getAvailabilitySlot(); // Fetch the new slot data
    }
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
  // getAvailabilitySlot() {
  //   const now = new Date();
  //   const offset = now.getTimezoneOffset() * 60000; // Offset in ms
  //   const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1); // Remove 'Z'
     
  //   // Split into date and time
  //   const [datePart, timeWithMs] = localISOTime.split('T');
  //   const timePart = timeWithMs.split('.')[0];
  //   this.patientService.getAvailabilitySlot(this.providerProfileId, this.startDate, this.endDate,datePart,timePart).subscribe((data: any) => {
  //     this.slotData = data;
     
  //     console.log(" slot data: ", this.slotData);
  //     this.slotData.availabilities.forEach((availability: any) => {
  //       availability.limitedSlots = availability.slots.slice(0, 3);
  //     });
 
  //     const filledAvailabilities = this.fillMissingDates(this.startDate, this.endDate, this.slotData.availabilities);
  //     this.chunkedAvailabilities = this.chunkArray(filledAvailabilities, 4);
  //     console.log(this.chunkedAvailabilities);
  //   });
  // }
getAvailabilitySlot() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, -1);
 
  const [datePart, timeWithMs] = localISOTime.split('T');
  const timePart = timeWithMs.split('.')[0];
debugger
  this.patientService.getAvailabilitySlot(this.providerProfileId, this.startDate, this.endDate, datePart, timePart)
    .subscribe((data: any) => {
      debugger
      this.slotData = data;
 
      console.log("Raw slot data:", this.slotData);
 
      // Only keep availabilities with non-empty slots
      const validAvailabilities = this.slotData.availabilities.filter((a: any) => a.slots && a.slots.length > 0);
 
      // Limit to 3 slots per day
      validAvailabilities.forEach((a: any) => {
        a.limitedSlots = a.slots.slice(0, 3);
      });
 
      // No fillMissingDates here
      this.chunkedAvailabilities = this.chunkArray(validAvailabilities, 4);
      console.log("Chunked valid availabilities:", this.chunkedAvailabilities);
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
  redirectToBookAppointment(id: string, date: any, time: any, appointmentId: any, meetingType: any): void {
    const data: any = {}
   
    data.date = date
    data.time = time
    if (this.userInfo) {
      this.router.navigate(['/patient/book-appointment'], {
        queryParams: { providerProfileId: this.providerProfileId, appointmentId: this.appointmentId, meetingType: this.meetingType, slotId: id, data: JSON.stringify(data) }
      });
    }
    else {
      // this.router.navigate(['/signup'], { queryParams: { request: 'PatientPortal',providerProfileId: this.providerProfileId, slotId: id, data: JSON.stringify(data) } });
      const obj ={
        providerProfileId:this.providerProfileId,
        id:id,
        data: data
      }
     
      this.authService.setAppointmentInfo(obj);
      this.router.navigate(['/login'], {
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
      console.log('data',this.profileData)
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
 

 