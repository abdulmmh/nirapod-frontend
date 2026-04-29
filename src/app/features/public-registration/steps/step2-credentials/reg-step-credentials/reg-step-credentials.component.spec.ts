import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStepCredentialsComponent } from './reg-step-credentials.component';

describe('RegStepCredentialsComponent', () => {
  let component: RegStepCredentialsComponent;
  let fixture: ComponentFixture<RegStepCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegStepCredentialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegStepCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
