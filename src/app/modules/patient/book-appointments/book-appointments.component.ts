import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { race } from 'rxjs';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { PatientService } from 'src/app/Services/patient.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { environment } from 'src/environments/environment';
import { EditSlotModelComponent } from '../edit-slot-model/edit-slot-model.component';
import { CancellationPolicyComponent } from '../cancellation-policy/cancellation-policy.component';
import { ViewCancellationComponent } from '../view-cancellation/view-cancellation.component';

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
  appointmentId: any
  meetingType: any
  selectedFee: string | null = null;
  loading: boolean = false
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private authService: AuthService,
    private notificationService: NotificationService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) { }



  ngOnInit() {
    if (!localStorage.getItem('book-appointment-page')) {
      localStorage.setItem('book-appointment-page', 'true');
      window.location.reload();
    } else {
      localStorage.removeItem('book-appointment-page');
    }

    this.appointmentForm = this.fb.group({
      prefix: ['1', Validators.required],
      relationshipType: [''],
      fullName: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      meetingType: ['', Validators.required],
      document: [''],
      reasonForVisit: ['', [Validators.required, Validators.pattern(/\S+/)]],
      email: [{ value: '' }, [Validators.required, Validators.email]],
    });

    this.route.queryParams.subscribe((params: any) => {
      this.meetingType = params['meetingType'];
      this.appointmentId = params['appointmentId'];
      this.providerProfileId = params['providerProfileId'];
      this.slotId = params['slotId'];
      this.receivedData = JSON.parse(params['data']);

      if (this.meetingType) {
        const meetingTypeValue = this.getMeetingTypeValue(this.meetingType);

        if (meetingTypeValue) {
          this.appointmentForm.patchValue({ meetingType: meetingTypeValue });
          this.appointmentForm.get('meetingType')?.disable(); // <-- Disable the field
          this.setConsultationFee(meetingTypeValue);
        }
      }


    });

    // Get user info
    const userInfo = this.authService.getUserInfo();
    this.userId = userInfo.userId;

    // Call necessary methods after initializing form
    this.getServicePrices();
    this.onPrefixChange();
    this.formatDateAndTime();
    this.getBookAppointmentByUserId();
  }



  // Function to map service type to radio button value
  getMeetingTypeValue(serviceType: string): number {

    switch (serviceType) {

      case 'teleHealth': return 1;
      case 'Office Visit': return 2;
      case 'Home Visit': return 3;
      default: return 1;
    }
  }

  redirectToCancellation() {
    const modalRef = this.modalService.open(ViewCancellationComponent, {
      backdrop: true,
      size: 'lg',
      centered: true
    });
    // Pass data to modal
    // modalRef.componentInstance.scrollToId = 'cancellation-policy';
  }



  getServicePrices() {
    this.patientService.getServicePrice(this.providerProfileId).subscribe((response: any) => {

      this.servicePrice = response;
      if (this.servicePrice.telehealthVisitPrice) {
        const selectedService = this.receivedData.serviceType;

        if (selectedService) {

          this.appointmentForm.get('meetingType').setValue(this.getMeetingTypeValue(selectedService))
        }
        this.setConsultationFee(1);
      } else if (this.servicePrice.officeVisitPrice) {
        const selectedService = this.receivedData.serviceType;

        if (selectedService) {

          this.appointmentForm.get('meetingType').setValue(this.getMeetingTypeValue(selectedService))
        }
        this.setConsultationFee(2);
      } else if (this.servicePrice.inHomeVisitPrice) {
        const selectedService = this.receivedData.serviceType;

        if (selectedService) {

          this.appointmentForm.get('meetingType').setValue(this.getMeetingTypeValue(selectedService))
        }
        this.setConsultationFee(3);
      }
    })
  }



  formatDate: any
  formatTime: any
  formatDateAndTime() {


    const [year, month, day] = this.receivedData.date.split('-').map(Number);
    const receivedDate = new Date(year, month - 1, day);

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
          console.log("get booking data", data)

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

    if (this.appointmentId) {
      if (this.appointmentForm.valid) {

        this.loading = true;
        const appointmentForm = this.appointmentForm.value;
        appointmentForm.PatientId = this.userId;
        appointmentForm.ProviderId = this.providerProfileId;
        appointmentForm.AvailabilitySlotId = this.slotId;
        appointmentForm.PatientFamilyMemberId = this.patientFamilyMemberId ?? 0;
        appointmentForm.BookAppointmentId = this.appointmentId;
        const [year, month, day] = this.receivedData.date.split("-");
        const [hour, minute, second] = this.receivedData.time.split(":");
        // Step 1: Create Date in local time
        const localDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );
        // Step 2: Format timezone offset
        const offsetMinutes = localDate.getTimezoneOffset(); // e.g., -330 for +05:30
        const absOffset = Math.abs(offsetMinutes);
        const offsetHours = Math.floor(absOffset / 60)
          .toString()
          .padStart(2, "0");
        const offsetMins = (absOffset % 60).toString().padStart(2, "0");
        const offsetSign = offsetMinutes <= 0 ? "+" : "-";
        const offsetStr = `${offsetSign}${offsetHours}:${offsetMins}`;
        // Step 3: Format full DateTimeOffset string
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formattedDateTime = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}${offsetStr}`;
        console.log("✅ Final DateTimeOffset to send:", formattedDateTime);
        // Step 4: Set to API-bound model
        appointmentForm.AppointmentDateTime = formattedDateTime;
        appointmentForm.AppointmentDateTime = formattedDateTime
        const formData = new FormData();
        Object.keys(appointmentForm).forEach(key => {
          formData.append(key, appointmentForm[key]?.toString());
        });
        this.patientService.rescheduleAppointment(formData).subscribe(
          (res) => {
            this.notificationService.showSuccess("Appointment rescheduled successfully.");
            this.loading = false;
            this.router.navigate(['/patient/dashboard'])
          },
          (error) => {
            this.notificationService.showDanger(getErrorMessage(error));
            this.loading = false;
          }
        );
      } else {
        this.notificationService.showDanger('Form is invalid. Please fill all the required fields correctly.');
        this.appointmentForm.markAllAsTouched();
      }
    } else {
      if (this.appointmentForm.valid) {
        this.loading = true;
        const appointmentForm = this.appointmentForm.value;
        appointmentForm.PatientId = this.userId;
        appointmentForm.ProviderId = this.providerProfileId;
        appointmentForm.AvailabilitySlotId = this.slotId;
        appointmentForm.PatientFamilyMemberId = this.patientFamilyMemberId ?? 0;
        const [year, month, day] = this.receivedData.date.split("-");
        const [hour, minute, second] = this.receivedData.time.split(":");

        // Step 1: Create Date in local time
        const localDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          Number(hour),
          Number(minute),
          Number(second)
        );

        // Step 2: Format timezone offset
        const offsetMinutes = localDate.getTimezoneOffset(); // e.g., -330 for +05:30
        const absOffset = Math.abs(offsetMinutes);
        const offsetHours = Math.floor(absOffset / 60)
          .toString()
          .padStart(2, "0");
        const offsetMins = (absOffset % 60).toString().padStart(2, "0");
        const offsetSign = offsetMinutes <= 0 ? "+" : "-";
        const offsetStr = `${offsetSign}${offsetHours}:${offsetMins}`;

        // Step 3: Format full DateTimeOffset string
        const pad = (n: number) => n.toString().padStart(2, "0");
        const formattedDateTime = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}${offsetStr}`;

        console.log("✅ Final DateTimeOffset to send:", formattedDateTime);

        // Step 4: Set to API-bound model
        appointmentForm.AppointmentDateTime = formattedDateTime;
        const formData = new FormData();
        Object.keys(appointmentForm).forEach(key => {
          formData.append(key, appointmentForm[key]?.toString());
        });
        this.patientService.postBookAppointment(formData).subscribe(
          (response: any) => {
            this.loading = false;
            const paymentData = {
              BookAppointmentId: response.bookingId,
              Amount: Number(this.selectedFee)
            };

            this.patientService.paymentGateway(paymentData).subscribe(
              (paymentRes: any) => {
                this.loading = true;
                window.location.href = paymentRes.url;
              },
              (paymentError: any) => {
                this.notificationService.showDanger(getErrorMessage(paymentError));
                this.loading = false;
              }
            );
          },
          (error: any) => {
            this.notificationService.showDanger(getErrorMessage(error));
            this.loading = false;
          }
        );
      } else {
        this.notificationService.showDanger('Form is invalid. Please fill all the required fields correctly.');
        this.appointmentForm.markAllAsTouched();
      }
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
  amountBreakdown: any;

  selectedServiceType: string = '';


  setConsultationFee(meetingType: number): void {
    switch (meetingType) {
      case 1:
        this.selectedFee = this.servicePrice.telehealthVisitPrice;
        this.amountBreakdown = this.servicePrice.telehealthVisitServicePriceResponse;
        this.selectedServiceType = 'Telehealth'; // ✅ Store the selected service type
        break;
      case 2:
        this.selectedFee = this.servicePrice.officeVisitPrice;
        this.amountBreakdown = this.servicePrice.officeVisitServicePriceResponse;
        this.selectedServiceType = 'Office Visit'; // ✅ Store the selected service type
        break;
      case 3:
        this.selectedFee = this.servicePrice.inHomeVisitPrice;
        this.amountBreakdown = this.servicePrice.inHomeVisitServicePriceResponse;
        this.selectedServiceType = 'Home Visit'; // ✅ Store the selected service type
        break;
      default:
        this.selectedFee = null;
        this.selectedServiceType = ''; // Reset if nothing is selected
    }
  }

  bookNewSlot() {
    const modalRef = this.modalService.open(EditSlotModelComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.patientId = this.providerProfileId;

    // Listen for the emitted event
    modalRef.componentInstance.saveDataEvent.subscribe((receivedData: any) => {
      console.log('Received data:', receivedData);

      // You can now access the slotId and data from receivedData
      const slotId = receivedData.slotId;
      const data = JSON.parse(receivedData.data);  // If you stringify the data in the modal, parse it here
      this.slotId = receivedData.slotId;
      this.receivedData = JSON.parse(receivedData.data);
      console.log('Slot ID:', slotId);
      console.log('Date:', data.date);
      console.log('Time:', data.time);
      this.formatDateAndTime();

      // Handle the received data as needed
      // For example, refresh your list or update the UI
    });
  }
  isHovered = false; // To track the hover state
  onHover(state: boolean): void {
    this.isHovered = state;
  }

}
