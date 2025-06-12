import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/Services/admin.service';
import { AuthService } from 'src/app/Services/auth.service';
import { NotificationService } from 'src/app/Services/notification.service';
import { ProviderService } from 'src/app/Services/provider.service';
import * as _ from 'lodash';
import { getErrorMessage } from 'src/app/utils/httpResponse';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { noWhitespaceValidator } from 'src/app/shared/validators/no-whitespace-validator';
@Component({
  selector: 'app-conditions-symptoms',
  templateUrl: './conditions-symptoms.component.html',
  styleUrls: ['./conditions-symptoms.component.css']
})
export class ConditionsSymptomsComponent implements OnInit {
  specializationForm: FormGroup;
  loading: boolean = false;
  specializationData: any[] = [];
  conditionForm: FormGroup;
  hovering: boolean = false;
  condtionListData: any;
  filteredItems = []
  searchTerm = '';
  sortColumn: string = '';
  // sortOrder: string = 'asc';
  sortOrder: 'asc' | 'desc' = 'asc';
  _ = _;
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  roles: {
    id: number,
    numOfUsers: number,
    name: string,
    status: string
  }[] = [];

  constructor(private router: Router,
    private providerService: ProviderService,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private adminService: AdminService,
    private modalService: NgbModal


  ) {

  }

  ngOnInit() {

    this.conditionForm = this.fb.group({
      specialtyId: ['', Validators.required],
      conditionName: ['', [
        Validators.required,
        Validators.pattern(/.*\S.*/)  // Ensures at least one non-whitespace character
      ]],
      id: ['0']

    });
    this.specializationForm = this.fb.group({
      id: [],
      name: ['', [Validators.required, Validators.pattern(/\S+/)]],
      inHomePage: [null],
      serviceCategoryId: [null, Validators.required]
    });

    this.getSpeciality();
    this.getConditionList();
    this.getSpecializationList();

    this.getServiceCategories();
  }

  filterItems() {
    this.getSpecializationList();
  }



  sortList(data: any[]): any[] {
    if (!this.sortColumn) return data;
    return _.orderBy(data, [this.sortColumn], [this.sortOrder]);
  }
  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.specializationData = this.sortList(this.specializationData);
  }

  submitForm() {

    if (this.specializationForm.invalid) {
      this.specializationForm.markAllAsTouched();
      return;
    }

    const obj = {
      name: this.specializationForm.value.name,
      serviceCategoryId: Number(this.specializationForm.value.serviceCategoryId),
      inHomePage: this.specializationForm.value.inHomePage,
      id: Number(this.specializationForm.value.id)
    }
    debugger;
    this.loading = true;

    this.adminService.postSpecializationData(obj).subscribe((res) => {
      if (this.specializationForm.value.id == null) {
        this.notificationService.showSuccess("Doctor Specialization Added successfully");
      }
      else {
        this.notificationService.showSuccess("Doctor Specialization Updated successfully");
      }
      this.getSpecializationList();
      this.specializationForm.reset();
      this.loading = false;
    },
      (error: any) => {
        this.loading = false;
        this.notificationService.showDanger(getErrorMessage(error));

      }
    );
  }


  getSpecializationList() {
    this.loading = true;
    this.adminService.getSpecializationData(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {

      if (data.items.length > 0) {
        this.roles = _.get(data, 'items');
        this.paginator = {
          ...this.paginator,
          pageNumber: _.get(data, 'pageNumber'),
          totalCount: _.get(data, 'totalCount'),
          totalPages: _.get(data, 'totalPages'),
        };
        this.specializationData = data.items
        if (data && data.items && Array.isArray(data.items)) {
          this.specializationData = data.items;
          this.filteredItems = [...this.specializationData];
        }
      }
      this.loading = false
      this.specializationData = data.items
      console.log("This is list", this.specializationData)
    }, (error) => {
      this.loading = false
      console.error("Error fetching upcoming appointments:", error);
    })
  }








  getSpecializationById(id: number) {
    // ✅ Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.adminService.getSpecialityEdit(id).subscribe((data) => {
      debugger
      console.log("This is form edit", data);
      this.specializationForm.patchValue(data);
    })
  }



  deleteSpecialization(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Speciality'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getSpecializationList();
    });
  }


  onPageChange(page: number) {
    this.paginator.pageNumber = page;
    this.getSpecializationList();
  }


  // Dropdown
  inHomePage: number;
  selectedHomePageLabel: any;

  onPaymentOptionChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.inHomePage = Number(selectedValue); // Convert string to number
    this.selectedHomePageLabel = this.getSelectedPaymentLabel(this.inHomePage);
  }
  getSelectedPaymentLabel(value: number): string {
    const option = this.paymentOptions.find(option => option.value === value);
    return option ? option.label : '';  // Return the label if found, else return an empty string
  }
  paymentOptions = [
    { label: 'True', value: 1 },
    { label: 'False', value: 0 },
  ];


  // Dropw serviceCategory


  serviceCategories: any[] = [];
  selectedServiceCategoryId: number | null = null;

  getServiceCategories() {
    this.adminService.getServiceCategoriesData().subscribe({
      next: (res: any) => {
        this.serviceCategories = res;
      },
      error: (err) => {
        console.error('Error fetching service categories', err);
      }
    });
  }





  onSettingsChange(event: any) {

    const selectedIndex = event.index;
  }

  selectedSpecialityItems = []
  checkedSpecialityIds = []
  checkboxChangeOfSpeciality(event: any, name: string, specialtyId: string) {

    if (event.target.checked) {
      this.selectedSpecialityItems.push(name);
      this.checkedSpecialityIds.push(specialtyId);
    } else {
      const index = this.selectedSpecialityItems.indexOf(name);
      if (index !== -1) {
        this.selectedSpecialityItems.splice(index, 1);
        this.checkedSpecialityIds.splice(index, 1);
      }
    }
    this.conditionForm.get('specialtyId').setValue(this.checkedSpecialityIds)
    this.updateValidationForSpeciality();
  }

  updateValidationForSpeciality() {
    if (this.selectedSpecialityItems.length > 0) {
      this.conditionForm.get('specialtyId').setErrors(null);
    } else {
      this.conditionForm.get('specialtyId').setErrors({ 'required': true });
    }
  }

  getDropdownWidth(): number {
    const button = document.getElementById('multiSelectDropdown');
    if (button) {
      return button.offsetWidth;
    }
    return 0;
  }

  deleteItem(id: any) {
    const modalRef = this.modalService.open(DeletePopupComponent, {
      backdrop: 'static',
      size: 'md',
      centered: true
    });
    modalRef.componentInstance.deletePropertyId = id
    modalRef.componentInstance.deleteProperty = 'Condition'
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getConditionList();
    });
  }

  loading1: boolean = false;

  submitData() {
    this.loading1 = true;

    const obj = {
      id: this.conditionForm.value.id,
      specialtyId: this.conditionForm.value.specialtyId,
      conditionName: this.conditionForm.value.conditionName,
    }
    this.adminService.postCondition(obj).subscribe((data) => {
      if (this.conditionForm.value.id == 0) {
        this.getConditionList();
        this.conditionForm.reset();
        this.notificationService.showSuccess("Condition added successfully");
        this.loading1 = false;
      }
      else {
        this.getConditionList();
        this.conditionForm.reset();
        this.notificationService.showSuccess("Condition Updated successfully");
        this.loading1 = false;
      }

    }, (error) => {

      // this.loading1 = false;
      this.notificationService.showDanger(getErrorMessage(error));
      this.loading1 = false;
    });


    // this.adminService.postCondition().subscribe

  }

  speciality: any
  getSpeciality() {
    this.providerService.getSpeciality().subscribe((response: any) => {
      this.speciality = response
      console.log("speciality list :", this.speciality)

    })
  }
  getConditionList() {
    this.adminService.getCondition(this.searchTerm, this.paginator.pageNumber, this.paginator.pageSize, this.sortColumn, this.sortOrder).subscribe((data: any) => {
      this.condtionListData = data.items;
      this.loading = false;

      if (data && data.items && Array.isArray(data.items)) {
        this.condtionListData = data.items;
        this.filteredItems = [...this.condtionListData];
      } else {
        this.condtionListData = []; // Ensure it's an empty array if no data
      }

      this.roles = _.get(data, 'items', []);
      this.paginator = {
        ...this.paginator,
        pageNumber: _.get(data, 'pageNumber'),
        totalCount: _.get(data, 'totalCount'),
        totalPages: _.get(data, 'totalPages'),
      };

    }, (error) => {
      this.loading = false;
      this.condtionListData = []; // Ensure no data is displayed on error
      this.notificationService.showDanger(getErrorMessage(error));
    })
  }
  editCondition(id) {
    // ✅ Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.adminService.getCondtionById(id).subscribe((data) => {

      console.log(data);
      this.conditionForm.patchValue(data);
    })
  }
}
