import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpDoctorsComponent } from './follow-up-doctors.component';

describe('FollowUpDoctorsComponent', () => {
  let component: FollowUpDoctorsComponent;
  let fixture: ComponentFixture<FollowUpDoctorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FollowUpDoctorsComponent]
    });
    fixture = TestBed.createComponent(FollowUpDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
