import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxViewComponent } from './income-tax-view.component';

describe('IncomeTaxViewComponent', () => {
  let component: IncomeTaxViewComponent;
  let fixture: ComponentFixture<IncomeTaxViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
