import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatRegistrationListComponent } from './vat-registration-list.component';

describe('VatRegistrationListComponent', () => {
  let component: VatRegistrationListComponent;
  let fixture: ComponentFixture<VatRegistrationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VatRegistrationListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VatRegistrationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
