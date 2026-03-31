import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TinViewComponent } from './tin-view.component';

describe('TinViewComponent', () => {
  let component: TinViewComponent;
  let fixture: ComponentFixture<TinViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TinViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TinViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
