import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxReturnListComponent } from './income-tax-return-list.component';

describe('IncomeTaxReturnListComponent', () => {
  let component: IncomeTaxReturnListComponent;
  let fixture: ComponentFixture<IncomeTaxReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxReturnListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
