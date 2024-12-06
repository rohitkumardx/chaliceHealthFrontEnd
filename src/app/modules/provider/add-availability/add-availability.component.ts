import { DatePipe } from '@angular/common';
import { Component, Inject, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  userId: any;
  errorMessage: string | null = null;

  @Input() data: any
  @Input() createNew: any
  @Input() bookedDetails: any

  loading: boolean = false
  loading1: boolean = false

  @Output() dialogClosed = new EventEmitter<void>();

  appointmentDetails : any;
  age: number = 0;

  constructor(
    public activeModel: NgbActiveModal,
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private providerService: ProviderService,
  ) { }

  ngOnInit(): void {
    this.availabilityForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      frequency: ['', Validators.required],
      weekDay: this.fb.array([], Validators.required),
    })
    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId

    this.patchAvailablility();
    if (this.bookedDetails) {
      this.getAppointmentDetails()
    }

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
    this.providerService.getAppointmentDetails(this.bookedDetails).subscribe((response: any) => {
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
  closePopup(){
    this.activeModel.close();
    this.dialogClosed.emit();
 }
  isChecked(day: string): boolean {
    const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;
    return weekDayArray.controls.some(ctrl => ctrl.value === day);
  }
  allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  toggleSelectAll(event: any) {
    const weekDayArray: FormArray = this.availabilityForm.get('weekDay') as FormArray;

    if (event.target.checked) {

      this.allDays.forEach(day => {
        if (!weekDayArray.controls.some(ctrl => ctrl.value === day)) {
          weekDayArray.push(this.fb.control(day));
        }
      });
    } else {

      this.allDays.forEach(day => {
        const index = weekDayArray.controls.findIndex(ctrl => ctrl.value === day);
        if (index >= 0) {
          weekDayArray.removeAt(index);
        }
      });
    }
  }
  patchAvailablility() {
    if (this.createNew != null) {
      this.availabilityForm.get('date').setValue(this.createNew.date)
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
      // this.data.weekDay.forEach((day: string) => {
      //   weekDayArray.push(this.fb.control(day));
      // });
    }

  }
  saveAvailability() {
    debugger
    if (this.availabilityForm.valid) {
      const availabilityForm = this.availabilityForm.value;
      this.loading = true
      availabilityForm.availability = []

      const newStartTime = availabilityForm.startTime + ':00';
      const newEndTime = availabilityForm.endTime + ':00';

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
      //  availabilityForm.userId = 8;
      availabilityForm.userId = this.userId;

      console.log('Form Data:', availabilityForm);

      this.providerService.PostAvailability(availabilityForm).subscribe(
        (response: any) => {

          this.loading = false
          this.notificationService.showSuccess("Availability added successfully");
          this.modalClose()
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
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
}
