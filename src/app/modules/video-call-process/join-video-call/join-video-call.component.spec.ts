import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinVideoCallComponent } from './join-video-call.component';

describe('JoinVideoCallComponent', () => {
  let component: JoinVideoCallComponent;
  let fixture: ComponentFixture<JoinVideoCallComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JoinVideoCallComponent]
    });
    fixture = TestBed.createComponent(JoinVideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
