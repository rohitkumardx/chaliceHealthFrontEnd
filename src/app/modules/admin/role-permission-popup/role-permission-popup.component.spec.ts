import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePermissionPopupComponent } from './role-permission-popup.component';

describe('RolePermissionPopupComponent', () => {
  let component: RolePermissionPopupComponent;
  let fixture: ComponentFixture<RolePermissionPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RolePermissionPopupComponent]
    });
    fixture = TestBed.createComponent(RolePermissionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
