import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSymptomComponent } from './patient-symptom.component';

describe('PatientSymptomComponent', () => {
  let component: PatientSymptomComponent;
  let fixture: ComponentFixture<PatientSymptomComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientSymptomComponent]
    });
    fixture = TestBed.createComponent(PatientSymptomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
