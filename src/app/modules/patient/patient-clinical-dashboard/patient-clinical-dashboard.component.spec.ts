import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientClinicalDashboardComponent } from './patient-clinical-dashboard.component';

describe('PatientClinicalDashboardComponent', () => {
  let component: PatientClinicalDashboardComponent;
  let fixture: ComponentFixture<PatientClinicalDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientClinicalDashboardComponent]
    });
    fixture = TestBed.createComponent(PatientClinicalDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
