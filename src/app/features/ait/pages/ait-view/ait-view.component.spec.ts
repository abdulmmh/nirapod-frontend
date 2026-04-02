import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AitViewComponent } from './ait-view.component';

describe('AitViewComponent', () => {
  let component: AitViewComponent;
  let fixture: ComponentFixture<AitViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AitViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AitViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
