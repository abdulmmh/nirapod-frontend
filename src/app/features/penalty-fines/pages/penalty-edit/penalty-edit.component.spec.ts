import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyEditComponent } from './penalty-edit.component';

describe('PenaltyEditComponent', () => {
  let component: PenaltyEditComponent;
  let fixture: ComponentFixture<PenaltyEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PenaltyEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltyEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
