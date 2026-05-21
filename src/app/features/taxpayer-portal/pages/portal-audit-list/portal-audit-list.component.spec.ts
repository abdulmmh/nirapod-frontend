import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalAuditListComponent } from './portal-audit-list.component';

describe('PortalAuditListComponent', () => {
  let component: PortalAuditListComponent;
  let fixture: ComponentFixture<PortalAuditListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalAuditListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalAuditListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
