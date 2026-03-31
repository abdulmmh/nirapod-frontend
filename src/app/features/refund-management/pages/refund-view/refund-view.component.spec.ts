import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundViewComponent } from './refund-view.component';

describe('RefundViewComponent', () => {
  let component: RefundViewComponent;
  let fixture: ComponentFixture<RefundViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
