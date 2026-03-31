import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegistrationEditComponent } from './vat-registration-edit.component';

describe('VatRegistrationEditComponent', () => {
  let component: VatRegistrationEditComponent;
  let fixture: ComponentFixture<VatRegistrationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatRegistrationEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatRegistrationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
