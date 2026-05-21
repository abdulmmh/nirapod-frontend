import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortalAuditDetailComponent } from './portal-audit-detail.component';

describe('PortalAuditDetailComponent', () => {
  let component: PortalAuditDetailComponent;
  let fixture: ComponentFixture<PortalAuditDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PortalAuditDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PortalAuditDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
