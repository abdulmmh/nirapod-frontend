import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegistrationSuccessComponent } from './vat-registration-success.component';

describe('VatRegistrationSuccessComponent', () => {
  let component: VatRegistrationSuccessComponent;
  let fixture: ComponentFixture<VatRegistrationSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatRegistrationSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatRegistrationSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
