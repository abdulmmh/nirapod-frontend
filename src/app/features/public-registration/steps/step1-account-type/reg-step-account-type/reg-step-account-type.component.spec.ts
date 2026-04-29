import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStepAccountTypeComponent } from './reg-step-account-type.component';

describe('RegStepAccountTypeComponent', () => {
  let component: RegStepAccountTypeComponent;
  let fixture: ComponentFixture<RegStepAccountTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegStepAccountTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegStepAccountTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
