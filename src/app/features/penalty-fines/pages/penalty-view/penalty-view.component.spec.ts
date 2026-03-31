import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PenaltyViewComponent } from './penalty-view.component';

describe('PenaltyViewComponent', () => {
  let component: PenaltyViewComponent;
  let fixture: ComponentFixture<PenaltyViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PenaltyViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PenaltyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
