import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalAppealListComponent } from './portal-appeal-list.component';

describe('PortalAppealListComponent', () => {
  let component: PortalAppealListComponent;
  let fixture: ComponentFixture<PortalAppealListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalAppealListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalAppealListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
