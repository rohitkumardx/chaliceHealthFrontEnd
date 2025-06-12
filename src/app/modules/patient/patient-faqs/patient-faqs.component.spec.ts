import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFaqsComponent } from './patient-faqs.component';

describe('PatientFaqsComponent', () => {
  let component: PatientFaqsComponent;
  let fixture: ComponentFixture<PatientFaqsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientFaqsComponent]
    });
    fixture = TestBed.createComponent(PatientFaqsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
