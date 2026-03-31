import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxpayerCreateComponent } from './taxpayer-create.component';

describe('TaxpayerCreateComponent', () => {
  let component: TaxpayerCreateComponent;
  let fixture: ComponentFixture<TaxpayerCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxpayerCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxpayerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
