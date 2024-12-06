import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewsoapnotesComponent } from './viewsoapnotes.component';

describe('ViewsoapnotesComponent', () => {
  let component: ViewsoapnotesComponent;
  let fixture: ComponentFixture<ViewsoapnotesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewsoapnotesComponent]
    });
    fixture = TestBed.createComponent(ViewsoapnotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
