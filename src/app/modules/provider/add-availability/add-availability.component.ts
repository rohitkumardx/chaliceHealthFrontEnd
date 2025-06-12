import { Component, Inject, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';


@Component({
  selector: 'app-add-availability',
  templateUrl: './add-availability.component.html',
  styleUrls: ['./add-availability.component.css']
})
export class AddAvailabilityComponent {

  availabilityForm!: FormGroup;
  isLoading: boolean = false;
  userId: any;
  errorMessage: string | null = null;

  @Input() data: any
  @Input() createNew: any
  @Input() bookedDetails: any
  @Input() providerId: any

  loading: boolean = false
  loading1: boolean = false

  @Output() dialogClosed = new EventEmitter<void>();

  appointmentDetails: any;
  age: number = 0;

  timeSlots: string[] = [];
  constructor(
    public activeModel: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private providerService: ProviderService,
  ) { }

  ngOnInit() {
    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      frequency: ['6', Validators.required],
      weekDay: this.fb.array([], Validators.required),
    })
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    this.patchAvailablility();
    if (this.bookedDetails) {
      this.getAppointmentDetails()
    }
    this.generateTimeOptions();
    this.generateTimeSlots();
    this.patchTime()
  }
  addOneHour(startTime) {
    let [hours, minutes] = startTime.match(/\d+/g).map(Number);
    const isPM = startTime.toLowerCase().includes("pm");

    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    // Add one hour
    hours = (hours + 1) % 24;

    const newPeriod = hours >= 12 ? "PM" : "AM";
    const newHours = hours % 12 || 12;

    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${newHours}:${formattedMinutes} ${newPeriod}`;
  }

  updateWeekDay() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const dateString = this.availabilityForm.value.date;
    const dateObj = new Date(dateString);

    this.weekday = daysOfWeek[dateObj.getDay()];

  }

  patchTime() {
    let startTime = this.createNew.startTime;

    startTime = startTime.replace(/\s+/g, ' ').trim();

    if (startTime.length >= 4) {
      startTime = startTime.slice(0, -2).trim() + ':00 ' + startTime.slice(-2).trim();
    }

    const formattedEndTime = this.addOneHour(startTime);

    this.availabilityForm.patchValue({
      startTime: startTime,
      endTime: formattedEndTime,
    });

  }



  endTimeOptions: { label: string; value: string }[] = [];

  generateTimeOptions(): void {
    const start = new Date();
    start.setHours(0, 0, 0, 0); // Start at 12:00 AM

    for (let i = 0; i < 48; i++) {
      const hours = start.getHours();
      const minutes = start.getMinutes();
      const isAM = hours < 12;

      const label = `${this.formatTime(hours, minutes)} ${isAM ? 'AM' : 'PM'}`;
      const value = `${this.formatTime(hours, minutes)} ${isAM ? 'AM' : 'PM'}`;

      this.endTimeOptions.push({ label, value });

      start.setMinutes(start.getMinutes() + 15);
    }
  }


  formatTime(hours: number, minutes: number): string {
    const adjustedHours = hours % 12 || 12; // Convert to 12-hour format
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${adjustedHours}:${paddedMinutes}`;
  }


  // getAppointmentDetails() {
  //   this.providerService.getAppointmentDetails(this.bookedDetails).subscribe((response: any) => {
  //    this.appointmentDetails = response

  //    const [hours, minutes, seconds] = this.appointmentDetails.time.split(':').map(Number);
  //    const date = new Date();
  //    date.setHours(hours, minutes, seconds);
  //    this.appointmentDetails.time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  //   })
  // }
  getAppointmentDetails() {

    this.providerService.getAppointmentDetails(this.bookedDetails, this.providerId).subscribe((response: any) => {
      this.appointmentDetails = response;

      // Format time
      const [hours, minutes, seconds] = this.appointmentDetails.time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds);
      this.appointmentDetails.time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

      // Calculate age
      this.calculateAge(new Date(this.appointmentDetails.dob));
    });
  }

  calculateAge(dob: Date) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    this.age = age;
  }


  modalClose() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }

  onCheckboxChange(event: any) {
    const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;
    if (event.target.checked) {
      weekDayArray.push(this.fb.control(event.target.value));
    } else {
      const index = weekDayArray.controls.findIndex(x => x.value === event.target.value);
      weekDayArray.removeAt(index);
    }
  }
  closePopup() {
    this.activeModel.close();
    this.dialogClosed.emit();
  }
  isChecked(day: string): boolean {
    const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;
    return weekDayArray.controls.some(ctrl => ctrl.value === day);
  }
  // allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // toggleSelectAll(event: any) {
  //   const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;

  //   if (event.target.checked) {

  //     this.allDays.forEach(day => {
  //       if (!weekDayArray.controls.some(ctrl => ctrl.value === day)) {
  //         weekDayArray.push(this.fb.control(day));
  //       }
  //     });
  //   } else {

  //     this.allDays.forEach(day => {
  //       const index = weekDayArray.controls.findIndex(ctrl => ctrl.value === day);
  //       if (index >= 0) {
  //         weekDayArray.removeAt(index);
  //       }
  //     });
  //   }
  // }

  weekday: any
  patchAvailablility() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (this.createNew != null) {
      this.availabilityForm.get('date').setValue(this.createNew.date)

      const dateString = this.createNew.date;
      const dateObj = new Date(dateString);

      this.weekday = daysOfWeek[dateObj.getDay()];

      const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;
      weekDayArray.clear();
      weekDayArray.push(this.fb.control(this.createNew.day));
    }
    if (this.createNew == null && this.bookedDetails == null) {
      this.availabilityForm.get('date').setValue(this.data.date)
      this.availabilityForm.get('startTime').setValue(this.data.data.startTime)
      this.availabilityForm.get('endTime').setValue(this.data.data.endTime)
      this.availabilityForm.get('frequency').setValue(this.data.frequency)

      const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;
      weekDayArray.clear();
      weekDayArray.push(this.fb.control(this.data.weekDay));

      const dateString = this.data.date;
      const dateObj = new Date(dateString);

      this.weekday = daysOfWeek[dateObj.getDay()];
      // this.data.weekDay.forEach((day: string) => {
      //   weekDayArray.push(this.fb.control(day));
      // });
    }

  }
  convertTo24HourFormat(time: string): string {

    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }


  saveAvailability() {
    this.isLoading = true;
    if (this.availabilityForm.valid) {
      const availabilityForm = this.availabilityForm.value;
      this.loading = true;
      availabilityForm.availability = [];

      const newStartTime = this.convertTo24HourFormat(availabilityForm.startTime) + ':00';;
      const newEndTime = this.convertTo24HourFormat(availabilityForm.endTime) + ':00';;

      const timeSlotExists = availabilityForm.availability.some(slot =>
        slot.date === availabilityForm.date &&
        slot.startTime === newStartTime &&
        slot.endTime === newEndTime
      );

      if (!timeSlotExists) {
        availabilityForm.availability.push({
          date: availabilityForm.date,
          startTime: newStartTime,
          endTime: newEndTime
        });
      }

      availabilityForm.userId = this.providerId;
      const now = new Date();

      const pad = (n: number) => n.toString().padStart(2, '0');

      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());

      availabilityForm.currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

      this.providerService.PostAvailability(availabilityForm).subscribe(
        (response: any) => {
          this.isLoading = false;
          this.notificationService.showSuccess("Availability added successfully");
          this.modalClose();
        },
        (error: any) => {
          this.isLoading = false;
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.isLoading = false;
      this.notificationService.showDanger('Form is invalid. Please fill all required fields correctly.');
      this.availabilityForm.markAllAsTouched();
    }
  }

  removeAvailability(date: any) {
    this.loading1 = true
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
    this.providerService.deleteAvailability(date).subscribe((response: any) => {
      this.loading1 = false
      this.notificationService.showSuccess(`Availability removed successfully for ${formattedDate}`);
      this.modalClose()
    })
  }
  generateTimeSlots(): void {
    const interval = 15;
    const startHour = 0;
    const endHour = 24;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        this.timeSlots.push(this.formatTime1(hour, minute));
      }
    }

  }

  formatTime1(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    return `${formattedHour}:${formattedMinute} ${period}`;
  }

  setTime(controlName: string, time: string) {
    this.availabilityForm.get(controlName)?.setValue(time);
  }

}
