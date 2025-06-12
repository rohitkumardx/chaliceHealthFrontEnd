
import { Component, OnInit } from '@angular/core';
import { AddMedicationComponent } from '../add-medication/add-medication.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { ProviderProfileComponent } from '../../admin/provider-profile/provider-profile.component';

@Component({
  selector: 'app-patient-prescription',
  templateUrl: './patient-prescription.component.html',
  styleUrls: ['./patient-prescription.component.css']
})
export class PatientPrescriptionComponent implements OnInit {

  loading: boolean = false;
  prescription: any[] = [];
  currentPrescription: any[] = [];
  pastPrescription: any[] = [];
  selectedTab: string = '';
  filteredPrescription: any[] = [];
  filteredCurrentPrescription: any[] = [];
  filteredPastPrescription: any[] = [];
  _ = _;
  
  paginator: { pageNumber: number; pageSize: number; totalCount: number; totalPages: number } = {
    pageNumber: 1,
    pageSize: 5,
    totalCount: 0,
    totalPages: 0
  };
  filteredItems = []
  searchTerm: string = '';
  sortColumn: string = '';
  sortOrder: string = 'asc';
  roles: {
    id: number;
    numOfUsers: number;
    name: string;
    status: string;
  }[] = [];

  constructor(
    private modalService: NgbModal,
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getPrescriptionByUserId();
  //  this.getCurrentMedicationByUserId();
    //this.getPastMedicationByUserId();
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getPrescriptionByUserId();
  }

  sortCurrentMedicationData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getCurrentMedicationByUserId();
  }

  sortPastMedicationData(column: string) {
    if (this.sortColumn === column) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.getPastMedicationByUserId();
  }

  getFirstNCharacters(text: string, wordLimit: number): number {
    const words = text?.split(' ');
    const firstWords = words?.slice(0, wordLimit).join(' ');
    return firstWords?.length || 0;
  }

toggleShowMore(item: any, field: 'MedicationName' | 'DrugName', event: Event): void {
  event.preventDefault();
  const key = `showFull${field}`;
  item[key] = !item[key];
}

 
  filterPrescriptions() {
    const searchTermLower = this.searchTerm.toLowerCase();
  
    // Filter based on the drug name
    this.filteredPrescription = this.prescription.filter((item) =>
      item.medicationName.toLowerCase().includes(searchTermLower)
    );
  }
  redirectToDoctorProfile(id: string): void {
    this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
  }
  viewProviderProfile(id: any) {
    
    const modalRef = this.modalService.open(ProviderProfileComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.providerId = id;
  modalRef.componentInstance.dialogClosed.subscribe(() => {
    this.getPrescriptionByUserId();
  });
   
  }
  formatFrequencyType(frequency: string): string {
    return frequency ? frequency.replace(/([a-z])([A-Z])/g, '$1 $2') : '--------';
  }
  getPrescriptionByUserId() {
    this.loading = true; // Show loading state
    this.patientService.getPrescriptionByUserId(this.searchTerm,this.paginator.pageNumber,this.paginator.pageSize,this.sortColumn,this.sortOrder ).subscribe(
        (data: any) => {
          
          if (data && data.items) {
            this.roles = _.get(data, 'items');
            this.paginator = {
              ...this.paginator,
              pageNumber: _.get(data, 'pageNumber'),
              totalCount: _.get(data, 'totalCount'),
              totalPages: _.get(data, 'totalPages'),
            };
            this.prescription = data.items
            if (data && data.items && Array.isArray(data.items)) {
              this.prescription = data.items;
              this.filteredItems = [...this.prescription];
            }
          }
          
          console.log('prescription data', this.prescription );
          this.loading = false;
        },
        (error) => {
          console.error("Error fetching prescription data:", error);
          this.prescription = [];
          this.filteredPrescription = [];
          this.loading = false;
        }
      );
  }

  filterCurrentMedications() {
    const searchTermLower = this.searchTerm.toLowerCase();
  
    // Filter the currentPrescription array by drugName
    this.filteredCurrentPrescription = this.currentPrescription.filter((item) =>
      item.drugName.toLowerCase().includes(searchTermLower)
    );
  
  }

  getCurrentMedicationByUserId() {
    this.loading = true; // Show loading state
    this.currentPrescription = []; // Reset the prescription array
  
    this.patientService.getCurrentMedicationByUserId( this.searchTerm, 
      this.paginator.pageNumber, 
      this.paginator.pageSize, 
      this.sortColumn, 
      this.sortOrder
      )
      .subscribe(
        (data: any) => {
          if (data && data.items) {
            this.roles = _.get(data, 'items');
            this.paginator = {
              ...this.paginator,
              pageNumber: _.get(data, 'pageNumber'),
              totalCount: _.get(data, 'totalCount'),
              totalPages: _.get(data, 'totalPages'),
            };
            this.currentPrescription = data.items
            if (data && data.items && Array.isArray(data.items)) {
              this.currentPrescription = data.items;
              this.filteredItems = [...this.currentPrescription];
            }
          }
          this.loading = false; // Hide loading state
        },
        (error) => {
          console.error("Error fetching current medication data:", error);
          this.currentPrescription = [];
          this.filteredCurrentPrescription = [];
          this.loading = false; // Hide loading state on error
        }
      );
  }

  filterPastMedications() {
    const searchTermLower = this.searchTerm.toLowerCase();
    // Filter the pastPrescription array by drugName
    this.filteredPastPrescription = this.pastPrescription.filter((item) =>
      item.drugName.toLowerCase().includes(searchTermLower)
    );
  }
  

  getPastMedicationByUserId() {
    this.loading = true; // Show loading state
    this.pastPrescription = []; // Reset the prescription array
    this.patientService
      .getPastMedicationByUserId(this.searchTerm,
        this.paginator.pageNumber, 
        this.paginator.pageSize, 
        this.sortColumn, 
        this.sortOrder
      )
      .subscribe(
        (data: any) => {
          // Ensure response exists and is structured as expected
          if (data && data.items) {
            this.roles = _.get(data, 'items');
            this.paginator = {
              ...this.paginator,
              pageNumber: _.get(data, 'pageNumber'),
              totalCount: _.get(data, 'totalCount'),
              totalPages: _.get(data, 'totalPages'),
            };
            this.pastPrescription = data.items
            if (data && data.items && Array.isArray(data.items)) {
              this.pastPrescription = data.items;
              this.filteredItems = [...this.pastPrescription];
            }
          }
          this.loading = false; 
        },
        (error) => {
          console.error("Error fetching past medication data:", error);
          this.pastPrescription = [];
          this.filteredPastPrescription = [];
          this.loading = false; // Hide loading state on error
        }
      );
  }
  

  openAddMedicationPopUp() {
    // this.modalService.open(AddMedicationComponent, {
    //   backdrop: 'static',
    //   size: 'lg',
    //   centered: true
    // });

    const modalRef = this.modalService.open(AddMedicationComponent, {
      backdrop: 'static',
      size: 'lg',
      centered: true,
    });
    modalRef.componentInstance.dialogClosed.subscribe(() => {
      this.getCurrentMedicationByUserId();
    });
  }

  onTabChange(event: any) {
    const selectedIndex = event.index;
    this.paginator = {
      pageNumber: 1,
      pageSize: 5,
      totalCount: 0,
      totalPages: 0
    };

    if (selectedIndex === 0) {
      this.selectedTab = 'Prescription';
      this.getPrescriptionByUserId();
    } else if (selectedIndex === 1) {
      this.selectedTab = 'Medication';
      this.getCurrentMedicationByUserId();
    }
    else if (selectedIndex === 2) {
      this.selectedTab = 'Past Medication';
      this.getPastMedicationByUserId();
    }
  }
}
