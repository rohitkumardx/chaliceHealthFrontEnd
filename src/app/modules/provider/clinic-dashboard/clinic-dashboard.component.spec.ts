import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicDashboardComponent } from './clinic-dashboard.component';

describe('ClinicDashboardComponent', () => {
  let component: ClinicDashboardComponent;
  let fixture: ComponentFixture<ClinicDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClinicDashboardComponent]
    });
    fixture = TestBed.createComponent(ClinicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
