import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStepReviewComponent } from './reg-step-review.component';

describe('RegStepReviewComponent', () => {
  let component: RegStepReviewComponent;
  let fixture: ComponentFixture<RegStepReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegStepReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegStepReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
