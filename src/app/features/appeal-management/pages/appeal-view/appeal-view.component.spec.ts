import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppealViewComponent } from './appeal-view.component';

describe('AppealViewComponent', () => {
  let component: AppealViewComponent;
  let fixture: ComponentFixture<AppealViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppealViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppealViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
