import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageComplaintComponent } from './message-complaint.component';

describe('MessageComplaintComponent', () => {
  let component: MessageComplaintComponent;
  let fixture: ComponentFixture<MessageComplaintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessageComplaintComponent]
    });
    fixture = TestBed.createComponent(MessageComplaintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
