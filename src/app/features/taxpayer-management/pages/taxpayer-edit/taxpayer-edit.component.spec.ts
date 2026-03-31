import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxpayerEditComponent } from './taxpayer-edit.component';

describe('TaxpayerEditComponent', () => {
  let component: TaxpayerEditComponent;
  let fixture: ComponentFixture<TaxpayerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxpayerEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxpayerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
