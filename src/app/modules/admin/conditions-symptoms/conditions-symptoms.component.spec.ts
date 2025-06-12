import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsSymptomsComponent } from './conditions-symptoms.component';

describe('ConditionsSymptomsComponent', () => {
  let component: ConditionsSymptomsComponent;
  let fixture: ComponentFixture<ConditionsSymptomsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConditionsSymptomsComponent]
    });
    fixture = TestBed.createComponent(ConditionsSymptomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
