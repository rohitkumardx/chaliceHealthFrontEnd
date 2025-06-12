import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from 'src/app/Services/patient.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-follow-up-doctors',
  templateUrl: './follow-up-doctors.component.html',
  styleUrls: ['./follow-up-doctors.component.css']
})
export class FollowUpDoctorsComponent implements OnInit{
  doctors:any;
  constructor(private patientService:PatientService,
      private router: Router,
  ){

  }
  ngOnInit(): void {
     this.getFollowUpDoctor();
  }
  getFollowUpDoctor(){
    this.patientService.followUpWithDoctorByPatient().subscribe((data)=>{
     this.doctors=data
     this.doctors.map((item)=>{
      if (item?.profilePicturePath) {
        item.profilePicturePath = environment.fileUrl + item.profilePicturePath;
      } else {
        item.profilePicturePath = undefined;
      }
     })

     console.log("This is doctor data",this.doctors);
    })
  }
  getStateAndCountry(item: any): string {
    if (!item?.address || !item?.stateName) return item?.stateName || '';
    const addressParts = item.address.split(',').map(part => part.trim());
    const country = addressParts[addressParts.length - 1];
    return `${item.stateName}, ${country}`;
  } 
  getSpecialistNames(specialists: any[]): string {
    return specialists.map(s => s.specialistNames).join(', ');
  }
  redirectToDoctorProfile(id: string): void {
    this.router.navigate(['/patient/view-profile'], { queryParams: { providerProfileId: id } });
  }
}
