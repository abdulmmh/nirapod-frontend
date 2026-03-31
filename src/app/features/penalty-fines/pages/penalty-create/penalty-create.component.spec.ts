import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyCreateComponent } from './penalty-create.component';

describe('PenaltyCreateComponent', () => {
  let component: PenaltyCreateComponent;
  let fixture: ComponentFixture<PenaltyCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PenaltyCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
