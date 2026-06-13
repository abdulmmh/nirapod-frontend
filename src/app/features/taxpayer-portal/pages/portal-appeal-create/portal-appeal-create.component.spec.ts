import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalAppealCreateComponent } from './portal-appeal-create.component';

describe('PortalAppealCreateComponent', () => {
  let component: PortalAppealCreateComponent;
  let fixture: ComponentFixture<PortalAppealCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalAppealCreateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalAppealCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
