import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegistrationPickerComponent } from './vat-registration-picker.component';

describe('VatRegistrationPickerComponent', () => {
  let component: VatRegistrationPickerComponent;
  let fixture: ComponentFixture<VatRegistrationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatRegistrationPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatRegistrationPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
