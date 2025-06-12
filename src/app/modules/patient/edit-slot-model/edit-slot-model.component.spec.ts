import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSlotModelComponent } from './edit-slot-model.component';

describe('EditSlotModelComponent', () => {
  let component: EditSlotModelComponent;
  let fixture: ComponentFixture<EditSlotModelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSlotModelComponent]
    });
    fixture = TestBed.createComponent(EditSlotModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
