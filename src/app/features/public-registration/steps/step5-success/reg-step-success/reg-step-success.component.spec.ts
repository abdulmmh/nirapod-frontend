import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStepSuccessComponent } from './reg-step-success.component';

describe('RegStepSuccessComponent', () => {
  let component: RegStepSuccessComponent;
  let fixture: ComponentFixture<RegStepSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegStepSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegStepSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
