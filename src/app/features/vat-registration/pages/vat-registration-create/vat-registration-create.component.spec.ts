import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegistrationCreateComponent } from './vat-registration-create.component';

describe('VatRegistrationCreateComponent', () => {
  let component: VatRegistrationCreateComponent;
  let fixture: ComponentFixture<VatRegistrationCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatRegistrationCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatRegistrationCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
