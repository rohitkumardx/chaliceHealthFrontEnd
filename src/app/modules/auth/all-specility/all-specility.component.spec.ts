import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSpecilityComponent } from './all-specility.component';

describe('AllSpecilityComponent', () => {
  let component: AllSpecilityComponent;
  let fixture: ComponentFixture<AllSpecilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllSpecilityComponent]
    });
    fixture = TestBed.createComponent(AllSpecilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
