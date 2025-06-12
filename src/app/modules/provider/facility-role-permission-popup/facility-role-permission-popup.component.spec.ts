import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityRolePermissionPopupComponent } from './facility-role-permission-popup.component';

describe('FacilityRolePermissionPopupComponent', () => {
  let component: FacilityRolePermissionPopupComponent;
  let fixture: ComponentFixture<FacilityRolePermissionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityRolePermissionPopupComponent]
    });
    fixture = TestBed.createComponent(FacilityRolePermissionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
