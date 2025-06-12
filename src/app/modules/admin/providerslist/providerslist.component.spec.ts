import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderslistComponent } from './providerslist.component';

describe('ProviderslistComponent', () => {
  let component: ProviderslistComponent;
  let fixture: ComponentFixture<ProviderslistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderslistComponent]
    });
    fixture = TestBed.createComponent(ProviderslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
