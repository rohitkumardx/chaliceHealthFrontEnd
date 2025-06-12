import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintModalComponent } from './complaint-modal.component';

describe('ComplaintModalComponent', () => {
  let component: ComplaintModalComponent;
  let fixture: ComponentFixture<ComplaintModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ComplaintModalComponent]
    });
    fixture = TestBed.createComponent(ComplaintModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
