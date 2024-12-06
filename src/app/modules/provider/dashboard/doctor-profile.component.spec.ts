import { ComponentFixture, TestBed } from '@angular/core/testing';

import { dashboard } from './doctor-profile.component';

describe('DoctorProfileComponent', () => {
  let component: dashboard;
  let fixture: ComponentFixture<dashboard>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [dashboard]
    });
    fixture = TestBed.createComponent(dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
