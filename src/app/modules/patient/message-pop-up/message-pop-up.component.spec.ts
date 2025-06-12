import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagePopUpComponent } from './message-pop-up.component';

describe('MessagePopUpComponent', () => {
  let component: MessagePopUpComponent;
  let fixture: ComponentFixture<MessagePopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MessagePopUpComponent]
    });
    fixture = TestBed.createComponent(MessagePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
