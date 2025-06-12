import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { ClinicService } from 'src/app/Services/clinic.service';
import { GlobalModalService } from 'src/app/Services/global-modal.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { getErrorMessage } from 'src/app/utils/httpResponse';

export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const inputDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - inputDate.getFullYear();
    const monthDiff = today.getMonth() - inputDate.getMonth();
    const dayDiff = today.getDate() - inputDate.getDate();

    const isOldEnough =
      age > minAge || (age === minAge && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

    return isOldEnough ? null : { minAge: true };
  };
}

export function phonePatternValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const valid = /^\(\d{3}\)-\d{3}-\d{4}$/.test(value);
    return valid ? null : { 'invalidPhonePattern': { value } };
  };
}


enum Gender {
  Male = 1,
  Female = 2,
  Other = 3
}
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {

  selectedItems: any[] = [];
  selectedRole: any[] = [];
  checkedLanguageIds: any[] = [];
  userForm!: FormGroup;
  loading: boolean;
  hovering: boolean = false;
  states: any;
  userId: any;



  roleData: any[];

  userList = []
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private route: ActivatedRoute,
    private globalModalService: GlobalModalService,
    private authServise: AuthService,

  ) { }
  ngOnInit() {
    this.route.queryParams.subscribe((parama: any) => {
      this.userId = parama.userId;
    });


    this.userForm = this.fb.group({
      firstName: ['',[Validators.required, Validators.pattern(/\S+/)]],
      middleName: [''],
      lastName: ['',[Validators.required, Validators.pattern(/\S+/)]],
      gender: ['', Validators.required],
      id: [null],
      dateOfBirth: ['', [Validators.required, minAgeValidator(18)]], 
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.required, phonePatternValidator()]],

      roleId: ['', Validators.required]
    })
    // this.activatedRoute.queryParams.subscribe((parama: any) => {
    //   this.providerId = parama.providerId
    // });
    this.getRoleDropDown();

    // if (this.userId) {
    //   this.userForm.get('email')?.disable()
    // }


  }


  // Enum to bind to the gender dropdown
  genders = Object.keys(Gender)
    .filter(key => (Number(key))) // Filter out numeric keys
    .map(key => ({
      name: key,
      value: Gender[key as keyof typeof Gender]
    }));
  // Enum bind to the profile dropdown

  columnClass = 'col-4';

  formatPhoneNumber(event: any): void {
    const input = event.target as HTMLInputElement;
    const formattedValue = this.globalModalService.formatPhoneNumberForDisplay(input.value);
    this.userForm.get('phoneNumber')?.setValue(formattedValue);
  }


  submitProvider() {
    if (this.userForm.invalid) {
      this.notificationService.markFormGroupTouched(this.userForm);
      this.loading = false;
      this.notificationService.showDanger('Please fill all the required fields correctly.');
      return;
    }
    const userForm = this.userForm.value;
    if (userForm.phoneNumber !== undefined && userForm.phoneNumber !== null && userForm.phoneNumber !== undefined && userForm.phoneNumber !== null) {
      userForm.phoneNumber = userForm.phoneNumber.replace(/\D/g, '');

    }

    this.loading = true;
    const userInfo = this.authServise.getUserInfo()
    userForm.userAdminId = userInfo.userId
    if (this.userId) {
      userForm.userId = this.userId
    }
    this.adminService.postAdminStaff(userForm).subscribe((data) => {
      if (this.userId) {
        this.notificationService.showSuccess('An email has been sent to the user to set their password')
      }
      else {
        this.notificationService.showSuccess('User Information updated successfully.')
      }

      this.loading = false;
      this.router.navigate(['/admin/userList']);

    },
      (error) => {
        this.notificationService.showDanger(getErrorMessage(error));
        this.loading = false;
      })
  }

  getEditUserById() {
    this.adminService.getEditUserById(this.userId).subscribe((data: any) => {
      console.log(data);
      const formattedPhone = this.globalModalService.formatPhoneNumberForDisplay(data.phoneNumber);
      data.phoneNumber = formattedPhone;
      const genderEnumValue = Gender[data.gender as keyof typeof Gender];
      if (data.dateOfBirth) {
        const dob = new Date(data.dateOfBirth);
        const formattedDate = dob.toISOString().split('T')[0];
        data.dateOfBirth = formattedDate;
      }
      // const languageIds = [];
      // data.userRoles.forEach((item) => {
      //   languageIds.push(item.id);
      // });
      // this.roleData.forEach((item) => {
      //   if (languageIds.includes(item.id)) {
      //     item.checked = true;
      //     this.selectedRole.push(item.roleName);
      //     this.checkedLanguageIds.push(item.id);  
      //     this.userForm.get('roles').setValue(this.checkedLanguageIds);
      //   }
      // });
      this.userForm.patchValue({
        ...data,
        gender: genderEnumValue
      });
    });
  }
  getRoleDropDown() {
    this.adminService.getRoleListDropdown().subscribe((data: any) => {
      this.roleData = data.items;
      if (this.userId) {
        this.getEditUserById();
      }
    });
  }
  checkboxChangeForRole(event: any, roleName: string, Id: string) {
   
    if (event.target.checked) {
      this.selectedRole.push(roleName);
      this.checkedLanguageIds.push(Id)
        ;
    } else {
      const index = this.selectedRole.indexOf(roleName);
      if (index !== -1) {
        this.selectedRole.splice(index, 1);
        this.checkedLanguageIds.splice(index, 1);
      }
    }
    this.userForm.get('roles').setValue(this.checkedLanguageIds)
    // this.updateLanguarValidation();
  }

  updateLanguarValidation() {
    if (this.selectedItems.length > 0) {
      this.userForm.get('roles').setErrors(null);
    } else {
      this.userForm.get('roles').setErrors({ 'required': true });
    }
  }
  getDropdownWidth(): number {
    const button = document.getElementById('multiSelectDropdown');
    if (button) {
      return button.offsetWidth;
    }
    return 0;
  }
}
