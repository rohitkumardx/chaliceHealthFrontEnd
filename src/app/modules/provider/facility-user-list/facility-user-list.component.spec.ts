import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacilityUserListComponent } from './facility-user-list.component';

describe('FacilityUserListComponent', () => {
  let component: FacilityUserListComponent;
  let fixture: ComponentFixture<FacilityUserListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityUserListComponent]
    });
    fixture = TestBed.createComponent(FacilityUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
