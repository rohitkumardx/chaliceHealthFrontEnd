import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCallProcessComponent } from './video-call-process.component';

describe('VideoCallProcessComponent', () => {
  let component: VideoCallProcessComponent;
  let fixture: ComponentFixture<VideoCallProcessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VideoCallProcessComponent]
    });
    fixture = TestBed.createComponent(VideoCallProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
