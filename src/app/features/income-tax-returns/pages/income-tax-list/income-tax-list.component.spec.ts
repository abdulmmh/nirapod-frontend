import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeTaxListComponent } from './income-tax-list.component';

describe('IncomeTaxListComponent', () => {
  let component: IncomeTaxListComponent;
  let fixture: ComponentFixture<IncomeTaxListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncomeTaxListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomeTaxListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
