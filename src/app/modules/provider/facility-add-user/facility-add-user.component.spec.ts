import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityAddUserComponent } from './facility-add-user.component';

describe('FacilityAddUserComponent', () => {
  let component: FacilityAddUserComponent;
  let fixture: ComponentFixture<FacilityAddUserComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityAddUserComponent]
    });
    fixture = TestBed.createComponent(FacilityAddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
