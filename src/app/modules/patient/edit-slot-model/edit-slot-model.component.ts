import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PatientService } from 'src/app/Services/patient.service';
 
@Component({
  selector: 'app-edit-slot-model',
  templateUrl: './edit-slot-model.component.html',
  styleUrls: ['./edit-slot-model.component.css']
})
export class EditSlotModelComponent implements OnInit {
  @Output() saveDataEvent = new EventEmitter<any>();  // EventEmitter to send data to the parent
  chunkedAvailabilities: any;
  slotData: any;
 showMore: boolean = false;
  providerProfileId: any;
  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute,
    private activeModal: NgbActiveModal,
  ) {
  }
  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.providerProfileId = parama.providerProfileId;
    });
    this.getStartDate();
  }
  loading: boolean = false;
  currentDate: any
  getStartDate() {
    this.loading = true;
    const currentDate = new Date();
    const startDate = this.formatDate(currentDate);
    this.currentDate = startDate
    // const endDate = this.formatDate(new Date(currentDate.setDate(currentDate.getDate() + 3)));
    const endDate = null;
    this.startDate = startDate;
    this.endDate = endDate;
    this.getAvailabilitySlot();
  }
  startDate: any
  endDate: any
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
      this.loading=false;
      this.slotData = data;
      const validAvailabilities = this.slotData.availabilities.filter((a: any) => a.slots && a.slots.length > 0);
      validAvailabilities.forEach((a: any) => {
        a.limitedSlots = a.slots.slice(0, 3);
      });
      this.chunkedAvailabilities = this.chunkArray(validAvailabilities, 4);
      console.log("Chunked valid availabilities:", this.chunkedAvailabilities);
    });
}
  chunkArray(arr: any[], chunkSize: number) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
  fillMissingDates(startDate: string, endDate: string, availabilities: any[]) {
    const filledAvailabilities: any[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const formattedDate = this.formatDate(current);
      const availability = availabilities.find(a => a.date === formattedDate);
      if (availability) {
        filledAvailabilities.push(availability);
      } else {
        filledAvailabilities.push({
          date: formattedDate,
          slots: null,
          limitedSlots: null
        });
      }
      current.setDate(current.getDate() + 1);
    }
 
    return filledAvailabilities;
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add leading zero if needed
    const day = date.getDate().toString().padStart(2, '0'); // Add leading zero if needed
    return `${year}-${month}-${day}`;
  }
  currentIndex: number = 0;
  maxSlides: number = 4;
 
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
  closePopup() {
    this.activeModal.close();
  }
  saveData(slotId: any, date: any, time: any) {
    const data: any = {};
    data.date = date;
    data.time = time;
    // Create an object to send both slotId and the stringified data
    const emitData = {
      slotId: slotId,
      data: JSON.stringify(data)  // stringifying the data if needed
    };
    // Emit the combined data
    this.saveDataEvent.emit(emitData);
    // Close the modal
    this.activeModal.close();
  }
  toggleShowMore() {
    this.showMore = !this.showMore;
 
    // Toggle between showing top 3 or all slots for all availabilities
    this.slotData.availabilities.forEach((availability: any) => {
      availability.limitedSlots = this.showMore ? availability.slots : availability.slots.slice(0, 3);
    });
  }
  hasSlots(availabilityGroup: any[]): boolean {
    return availabilityGroup.some(availability => availability.limitedSlots && availability.limitedSlots.length > 0);
  }
}
 
 