import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityRolePermissionComponent } from './facility-role-permission.component';

describe('FacilityRolePermissionComponent', () => {
  let component: FacilityRolePermissionComponent;
  let fixture: ComponentFixture<FacilityRolePermissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityRolePermissionComponent]
    });
    fixture = TestBed.createComponent(FacilityRolePermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
