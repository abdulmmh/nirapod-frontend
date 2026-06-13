import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalAppealDetailComponent } from './portal-appeal-detail.component';

describe('PortalAppealDetailComponent', () => {
  let component: PortalAppealDetailComponent;
  let fixture: ComponentFixture<PortalAppealDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalAppealDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalAppealDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
