import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignChatComponent } from './assign-chat.component';

describe('AssignChatComponent', () => {
  let component: AssignChatComponent;
  let fixture: ComponentFixture<AssignChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssignChatComponent]
    });
    fixture = TestBed.createComponent(AssignChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
