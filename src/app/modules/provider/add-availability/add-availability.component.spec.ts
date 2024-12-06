import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAvailabilityComponent } from './add-availability.component';

describe('AddAvailabilityComponent', () => {
  let component: AddAvailabilityComponent;
  let fixture: ComponentFixture<AddAvailabilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAvailabilityComponent]
    });
    fixture = TestBed.createComponent(AddAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
