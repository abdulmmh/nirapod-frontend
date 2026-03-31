import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundCreateComponent } from './refund-create.component';

describe('RefundCreateComponent', () => {
  let component: RefundCreateComponent;
  let fixture: ComponentFixture<RefundCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
