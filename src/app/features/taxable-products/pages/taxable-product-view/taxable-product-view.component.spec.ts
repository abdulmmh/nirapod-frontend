import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxableProductViewComponent } from './taxable-product-view.component';

describe('TaxableProductViewComponent', () => {
  let component: TaxableProductViewComponent;
  let fixture: ComponentFixture<TaxableProductViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxableProductViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxableProductViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
