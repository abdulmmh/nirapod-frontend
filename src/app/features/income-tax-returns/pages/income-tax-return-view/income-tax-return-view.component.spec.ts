import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxReturnViewComponent } from './income-tax-return-view.component';

describe('IncomeTaxReturnViewComponent', () => {
  let component: IncomeTaxReturnViewComponent;
  let fixture: ComponentFixture<IncomeTaxReturnViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxReturnViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxReturnViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
