import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxableProductListComponent } from './taxable-product-list.component';

describe('TaxableProductListComponent', () => {
  let component: TaxableProductListComponent;
  let fixture: ComponentFixture<TaxableProductListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxableProductListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxableProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
