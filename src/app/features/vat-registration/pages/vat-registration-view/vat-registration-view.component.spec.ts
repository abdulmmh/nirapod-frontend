import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegistrationViewComponent } from './vat-registration-view.component';

describe('VatRegistrationViewComponent', () => {
  let component: VatRegistrationViewComponent;
  let fixture: ComponentFixture<VatRegistrationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatRegistrationViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatRegistrationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
