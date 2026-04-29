import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegStepIdentityComponent } from './reg-step-identity.component';

describe('RegStepIdentityComponent', () => {
  let component: RegStepIdentityComponent;
  let fixture: ComponentFixture<RegStepIdentityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegStepIdentityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegStepIdentityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
