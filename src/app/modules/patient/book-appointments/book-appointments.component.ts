import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-book-appointments',
  templateUrl: './book-appointments.component.html',
  styleUrls: ['./book-appointments.component.css']
})
export class BookAppointmentsComponent {
  appointmentForm!: FormGroup;
  showEditTimeFile: boolean;
  editProfilePicture: any;
  isLoading = false;
  providerProfileId: any;
  slotId: any;
  userId: any;
  patientId: any; 
  providerId: any;
  availabilitySlotId: any;
  patientFamilyMemberId: any;
  receivedData: any
  servicePrice: any
  selectedFee: string | null = null;
  loading : boolean = false



  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private route: ActivatedRoute,
  ) { }



  ngOnInit() {
    if (!localStorage.getItem('book-appointment-page')) {
      localStorage.setItem('book-appointment-page', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('book-appointment-page');
    }
    this.appointmentForm = this.fb.group({
      patientFamilyMemberId: ['0'],
      prefix: ['1', Validators.required],
      relationshipType: [''],
      fullName: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      meetingType: ['', Validators.required],
      document: [''],
      reasonForVisit: ['', Validators.required],
      email: ['', Validators.required]
    })
    this.route.queryParams.subscribe((params: any) => {
      this.providerProfileId = params['providerProfileId'];
      this.slotId = params['slotId'];
      this.receivedData = JSON.parse(params['data']);
    });



    const userInfo = this.authService.getUserInfo()
    this.userId = userInfo.userId
    this.getServicePrices();
    this.onPrefixChange();
    this.formatDateAndTime();
    this.getBookAppointmentByUserId()

  }
  getServicePrices() {
    this.patientService.getServicePrice(this.providerProfileId).subscribe((response: any) => {
      this.servicePrice = response
      if (this.servicePrice.telehealthVisitPrice) {
        this.appointmentForm.get('meetingType').setValue(1)
        this.setConsultationFee(1);
      } else if (this.servicePrice.officeVisitPrice) {
        this.appointmentForm.get('meetingType').setValue(2)
        this.setConsultationFee(2);
      } else if (this.servicePrice.inHomeVisitPrice) {
        this.appointmentForm.get('meetingType').setValue(3)
        this.setConsultationFee(3);
      }
    })
  }

  formatDate: any
  formatTime: any
  formatDateAndTime() {
    const receivedDate = new Date(this.receivedData.date);
    const formatDate = (date: Date): string => {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    const formatTime = (timeString: string): string => {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0);

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    const formattedDate = formatDate(receivedDate);
    const formattedTime = formatTime(this.receivedData.time);

    this.formatDate = formattedDate;
    this.formatTime = formattedTime;
  }



  onPrefixChange() {
    this.appointmentForm.get('relationshipType')?.disable();
    this.appointmentForm.get('prefix')?.valueChanges.subscribe((value) => {
      const relationshipTypeControl = this.appointmentForm.get('relationshipType');
      if (value === '1') {
        this.appointmentForm.get('relationshipType')?.disable();
        this.getBookAppointmentByUserId();

      } else if (value === '2') {
        this.appointmentForm.get('relationshipType')?.enable();
        relationshipTypeControl?.setValidators([Validators.required]);
      }
      relationshipTypeControl?.updateValueAndValidity();
    });
  }

  goBack(): void {
    window.history.back(); 
  }

  getBookAppointmentByUserId() {
    this.patientService.getBookAppointmentByUserId(this.userId).subscribe(
      (data: any) => {
        if (data) {
          debugger
          const dob = data.dob;
          const formattedDate = this.datePipe.transform(dob, 'yyyy-MM-dd');
          data.dob = formattedDate

          this.appointmentForm.patchValue({
            userId: this.userId,
            fullName: data.fullName,
            uniqueId: data.uniqueId,
            phoneNumber: data.phoneNumber,
            email: data.email,
            gender: data.gender,
            relationshipType: data.relationshipType,
            dob: data.dob,
          });

        }
      },
      (error) => {
        console.error('Error while fetching appointment:', error);
      }
    );
  }


  getBookAppointment() {

    this.patientService.getBookAppointment(this.userId, this.appointmentForm.value.relationshipType).subscribe(
      (data: any) => {

        if (data) {
          this.appointmentForm.patchValue({
            userId: this.userId,
            patientFamilyMemberId: data.id,
            fullName: data.fullName,
            uniqueId: data.uniqueId,
            phoneNumber: data.phoneNumber,
            email: data.email,
            gender: data.gender,
            relationshipType: data.relationshipType,
            dob: data.dob,
          });
        }

      },
      (error) => {
        this.appointmentForm.patchValue({
          fullName: '',
          gender: '',
          dob: '',
          email: ''
        });
        console.error('Error while fetching appointment:', error);
      }
    );
  }

  postBookAppointment() {
    if (this.appointmentForm.valid) {
      // Collect form data
      this.loading = true
      const appointmentForm = this.appointmentForm.value;
      // Add required properties 
      appointmentForm.PatientId = this.userId;
      appointmentForm.ProviderId = this.providerProfileId;
      appointmentForm.AvailabilitySlotId = this.slotId;
      appointmentForm.PatientFamilyMemberId = this.patientFamilyMemberId;
      appointmentForm.Date = this.receivedData.date;
      appointmentForm.StartTime = this.receivedData.time;
      const formData = new FormData();

      Object.keys(appointmentForm).forEach(key => {
        formData.append(key, appointmentForm[key]);
      });
      this.patientService.postBookAppointment(formData).subscribe(
        (response: any) => {
          this.loading
          let obj: any = {}
          obj.BookAppointmentId = response.bookingId
          obj.Amount = Number(this.selectedFee);
          this.patientService.paymentGateway(obj).subscribe((response: any) => {
            this.loading = false
            const returnUrl: string = response.url;
            window.location.href = returnUrl;
          })
        },
        (error: any) => {
          console.error('Post failed', error);
          this.notificationService.showDanger(getErrorMessage(error));
        }
      );
    } else {
      this.notificationService.showDanger('Form is invalid. Please fill all the required fields correctly.');
      this.appointmentForm.markAllAsTouched();
    }
  }


  onProfileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.appointmentForm.get(`document`).setValue(file)
    }
  }

  downloadFile(filePath: string): any {
    const downloadUrl = filePath;
    window.open(downloadUrl, '_blank');
  }

  deleteDocument(file) {
    // this.patientService.deletePatientProfle(file.userId).subscribe((data: any) => {
    //   this.editProfilePicture = null
    //   this.notificationService.showSuccess("Image deleted");
    // })
  }

  setConsultationFee(meetingType: number): void {
    switch (meetingType) {
      case 1:
        this.selectedFee = this.servicePrice.telehealthVisitPrice;
        break;
      case 2:
        this.selectedFee = this.servicePrice.officeVisitPrice;
        break;
      case 3:
        this.selectedFee = this.servicePrice.inHomeVisitPrice;
        break;
      default:
        this.selectedFee = null;
    }
  }

}
