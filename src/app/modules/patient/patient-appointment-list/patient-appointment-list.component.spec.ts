import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAppointmentListComponent } from './patient-appointment-list.component';

describe('PatientAppointmentListComponent', () => {
  let component: PatientAppointmentListComponent;
  let fixture: ComponentFixture<PatientAppointmentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientAppointmentListComponent]
    });
    fixture = TestBed.createComponent(PatientAppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
