import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMessageComponent } from './group-message.component';

describe('GroupMessageComponent', () => {
  let component: GroupMessageComponent;
  let fixture: ComponentFixture<GroupMessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupMessageComponent]
    });
    fixture = TestBed.createComponent(GroupMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
