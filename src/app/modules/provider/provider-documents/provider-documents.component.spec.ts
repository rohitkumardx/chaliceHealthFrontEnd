import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderDocumentsComponent } from './provider-documents.component';

describe('ProviderDocumentsComponent', () => {
  let component: ProviderDocumentsComponent;
  let fixture: ComponentFixture<ProviderDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderDocumentsComponent]
    });
    fixture = TestBed.createComponent(ProviderDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
