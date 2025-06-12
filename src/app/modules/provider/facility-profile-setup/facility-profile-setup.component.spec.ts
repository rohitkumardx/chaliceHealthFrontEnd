import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityProfileSetupComponent } from './facility-profile-setup.component';

describe('FacilityProfileSetupComponent', () => {
  let component: FacilityProfileSetupComponent;
  let fixture: ComponentFixture<FacilityProfileSetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityProfileSetupComponent]
    });
    fixture = TestBed.createComponent(FacilityProfileSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
