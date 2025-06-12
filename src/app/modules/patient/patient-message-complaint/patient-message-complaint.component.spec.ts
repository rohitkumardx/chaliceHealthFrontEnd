import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientMessageComplaintComponent } from './patient-message-complaint.component';

describe('PatientMessageComplaintComponent', () => {
  let component: PatientMessageComplaintComponent;
  let fixture: ComponentFixture<PatientMessageComplaintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientMessageComplaintComponent]
    });
    fixture = TestBed.createComponent(PatientMessageComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
