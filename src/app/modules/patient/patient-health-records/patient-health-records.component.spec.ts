import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientHealthRecordsComponent } from './patient-health-records.component';

describe('PatientHealthRecordsComponent', () => {
  let component: PatientHealthRecordsComponent;
  let fixture: ComponentFixture<PatientHealthRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientHealthRecordsComponent]
    });
    fixture = TestBed.createComponent(PatientHealthRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
