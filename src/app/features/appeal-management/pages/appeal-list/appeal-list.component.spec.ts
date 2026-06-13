import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppealListComponent } from './appeal-list.component';

describe('AppealListComponent', () => {
  let component: AppealListComponent;
  let fixture: ComponentFixture<AppealListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppealListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppealListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
