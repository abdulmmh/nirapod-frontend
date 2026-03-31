import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxpayerViewComponent } from './taxpayer-view.component';

describe('TaxpayerViewComponent', () => {
  let component: TaxpayerViewComponent;
  let fixture: ComponentFixture<TaxpayerViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxpayerViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxpayerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
