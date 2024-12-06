// import { Component, OnInit } from '@angular/core';
// import { AddMedicationComponent } from '../add-medication/add-medication.component';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { AuthService } from 'src/app/Services/auth.service';
// import { PatientService } from 'src/app/Services/patient.service';

// @Component({
//   selector: 'app-patient-prescription',
//   templateUrl: './patient-prescription.component.html',
//   styleUrls: ['./patient-prescription.component.css']
// })
// export class PatientPrescriptionComponent implements OnInit {

//   loading: boolean = false;
//   prescription: any[] = [];
//   currentPrescription: any[] = [];
//   pastPrescription: any[] = [];
//   selectedTab: string = '';
//   filteredPrescription: any[] = [];
//   filteredCurrentPrescription: any[] = [];
//   filteredPastPrescription: any[] = [];

//   paginator = {
//     pageNumber: 1,
//     pageSize: 5,
//     totalCount: 0,
//     totalPages: 0
//   };
//   searchTerm: string = '';
//   sortColumn: string = '';
//   sortOrder: string = 'asc';
//   roles: {
//     id: number;
//     numOfUsers: number;
//     name: string;
//     status: string;
//   }[] = [];

//   constructor(
//     private modalService: NgbModal,
//     private authService: AuthService,
//     private patientService: PatientService
//   ) {}

//   ngOnInit() {
//     this.getPrescriptionByUserId();
//     this.getCurrentMedicationByUserId();
//     this.getPastMedicationByUserId();
//   }

//   filterPrescriptions() {
//     const searchTermLower = this.searchTerm.toLowerCase();
  
//     // Filter based on the drug name
//     this.filteredPrescription = this.prescription.filter((item) =>
//       item.medicationName.toLowerCase().includes(searchTermLower)
//     );
//   }
//   getPrescriptionByUserId() {
//     this.loading = true; // Show loading state
  
//     this.patientService
//       .getPrescriptionByUserId(
//         this.searchTerm,
//         this.paginator.pageNumber,
//         this.paginator.pageSize,
//         this.sortColumn,
//         this.sortOrder
//       )
//       .subscribe(
//         (data: any) => {
//           if (data && data.items) {
//             this.prescription = data.items;
//             this.filteredPrescription = [...this.prescription]; // Initialize filteredPrescription
//             this.paginator = {
//               ...this.paginator,
//               pageNumber: data.pageNumber || this.paginator.pageNumber,
//               totalCount: data.totalCount || 0,
//               totalPages: data.totalPages || 0,
//             };
//           }
//           this.loading = false;
//         },
//         (error) => {
//           console.error("Error fetching prescription data:", error);
//           this.prescription = [];
//           this.filteredPrescription = [];
//           this.loading = false;
//         }
//       );
//   }

//   filterCurrentMedications() {
//     const searchTermLower = this.searchTerm.toLowerCase();
  
//     // Filter the currentPrescription array by drugName
//     this.filteredCurrentPrescription = this.currentPrescription.filter((item) =>
//       item.drugName.toLowerCase().includes(searchTermLower)
//     );
  
//   }

//   getCurrentMedicationByUserId() {
//     this.loading = true; // Show loading state
//     this.currentPrescription = []; // Reset the prescription array
  
//     this.patientService.getCurrentMedicationByUserId( this.searchTerm, 
//       this.paginator.pageNumber, 
//       this.paginator.pageSize, 
//       this.sortColumn, 
//       this.sortOrder
//       )
//       .subscribe(
//         (response: any) => {
//           // Ensure response exists and is structured as expected
//           if (response && response.items) {
//             this.currentPrescription = response.items; // Assign fetched data to the prescription array
//             this.filteredCurrentPrescription = [...this.currentPrescription]; // Initialize the filtered list

//             // Update paginator details
//             this.paginator = {
//               ...this.paginator,
//               pageNumber: response.pageNumber || this.paginator.pageNumber,
//               totalCount: response.totalCount || 0,
//               totalPages: response.totalPages || 0,
//             };
  
//             console.log("Current prescription data:", this.currentPrescription);
//           } else {
//             console.warn("No current medication data found.");
//           }
//           this.loading = false; // Hide loading state
//         },
//         (error) => {
//           console.error("Error fetching current medication data:", error);
//           this.currentPrescription = [];
//           this.filteredCurrentPrescription = [];
//           this.loading = false; // Hide loading state on error
//         }
//       );
//   }

//   filterPastMedications() {
//     const searchTermLower = this.searchTerm.toLowerCase();
  
//     // Filter the pastPrescription array by drugName
//     this.filteredPastPrescription = this.pastPrescription.filter((item) =>
//       item.drugName.toLowerCase().includes(searchTermLower)
//     );
//   }
  

//   getPastMedicationByUserId() {
//     this.loading = true; // Show loading state
//     this.pastPrescription = []; // Reset the prescription array
  
//     this.patientService
//       .getPastMedicationByUserId(this.searchTerm,
//         this.paginator.pageNumber, 
//         this.paginator.pageSize, 
//         this.sortColumn, 
//         this.sortOrder
//       )
//       .subscribe(
//         (response: any) => {
//           // Ensure response exists and is structured as expected
//           if (response && response.items) {
//             this.pastPrescription = response.items; // Assign fetched data to the prescription array
//             this.filteredPastPrescription = [...this.pastPrescription]; // Initialize the filtered list

  
//             // Update paginator details
//             this.paginator = {
//               ...this.paginator,
//               pageNumber: response.pageNumber || this.paginator.pageNumber,
//               totalCount: response.totalCount || 0,
//               totalPages: response.totalPages || 0,
//             };
  
//             console.log("Past prescription data:", this.pastPrescription);
//           } else {
//             console.warn("No past medication data found.");
//           }
//           this.loading = false; // Hide loading state
//         },
//         (error) => {
//           console.error("Error fetching past medication data:", error);
//           this.pastPrescription = [];
//           this.filteredPastPrescription = [];
//           this.loading = false; // Hide loading state on error
//         }
//       );
//   }
  

//   openAddMedicationPopUp() {
//     this.modalService.open(AddMedicationComponent, {
//       backdrop: 'static',
//       size: 'lg',
//       centered: true
//     });
//   }

//   onTabChange(event: any) {
//     const selectedIndex = event.index;
//     this.paginator = {
//       pageNumber: 1,
//       pageSize: 5,
//       totalCount: 0,
//       totalPages: 0
//     };

//     if (selectedIndex === 0) {
//       this.selectedTab = 'Prescription';
//       this.getPrescriptionByUserId();
//     } else if (selectedIndex === 1) {
//       this.selectedTab = 'Medication';
//       this.getCurrentMedicationByUserId();
//     }
//   }
// }



import { Component, OnInit } from '@angular/core';
import { AddMedicationComponent } from '../add-medication/add-medication.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { PatientService } from 'src/app/Services/patient.service';
import * as _ from 'lodash';

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
  
  paginator = {
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
    private patientService: PatientService
  ) {}

  ngOnInit() {
    this.getPrescriptionByUserId();
    this.getCurrentMedicationByUserId();
    this.getPastMedicationByUserId();
  }

  filterPrescriptions() {
    const searchTermLower = this.searchTerm.toLowerCase();
  
    // Filter based on the drug name
    this.filteredPrescription = this.prescription.filter((item) =>
      item.medicationName.toLowerCase().includes(searchTermLower)
    );
  }
  getPrescriptionByUserId() {
    this.loading = true; // Show loading state
  
    this.patientService.getPrescriptionByUserId(this.searchTerm,this.paginator.pageNumber,this.paginator.pageSize,this.sortColumn,this.sortOrder ).subscribe(
        (data: any) => {
          debugger
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
      windowClass: 'custom-modal'
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
