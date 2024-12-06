import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDocumentsComponent } from './patient-documents.component';

describe('PatientDocumentsComponent', () => {
  let component: PatientDocumentsComponent;
  let fixture: ComponentFixture<PatientDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PatientDocumentsComponent]
    });
    fixture = TestBed.createComponent(PatientDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
