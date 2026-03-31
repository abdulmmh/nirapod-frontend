import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundEditComponent } from './refund-edit.component';

describe('RefundEditComponent', () => {
  let component: RefundEditComponent;
  let fixture: ComponentFixture<RefundEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
