import { Role } from '../../../core/constants/roles.constants';
import { DashboardSnapshotService, clearDashboardSnapshots } from './dashboard-snapshot.service';

describe('DashboardSnapshotService', () => {
  let snapshots: DashboardSnapshotService;
  const officer = { id: 1, email: 'officer@nirapod.example', role: Role.TAX_OFFICER, token: 'must-not-be-stored' };
  beforeEach(() => { sessionStorage.clear(); snapshots = new DashboardSnapshotService(); });
  afterEach(() => sessionStorage.clear());

  it('restores each section synchronously without storing the session token', () => {
    snapshots.write(officer, '', 'taxpayers', [{ fullName: 'Demo taxpayer' }]);
    const cached = snapshots.read(officer);
    expect(cached.taxpayers?.data[0].fullName).toBe('Demo taxpayer');
    expect(cached.taxpayers?.savedAt).toBeGreaterThan(0);
    expect(sessionStorage.getItem(sessionStorage.key(0)!)).not.toContain(officer.token);
  });

  it('isolates users, roles, and default versus explicitly selected years', () => {
    snapshots.write(officer, '', 'taxpayers', [{ fullName: 'Private' }]);
    expect(snapshots.read({ ...officer, id: 2 })).toEqual({});
    expect(snapshots.read({ ...officer, role: Role.TAXPAYER })).toEqual({});
    expect(snapshots.read(officer, '2026-27')).toEqual({});
    expect(snapshots.read(null)).toEqual({});
  });

  it('expires sections after fifteen minutes instead of showing indefinitely stale data', () => {
    const now = Date.now();
    const clock = spyOn(Date, 'now').and.returnValue(now);
    snapshots.write(officer, '', 'zones', []);
    clock.and.returnValue(now + 15 * 60 * 1000);
    expect(snapshots.read(officer)).toEqual({});
  });

  it('ignores malformed and invalid cached data', () => {
    snapshots.write(officer, '', 'zones', []);
    const key = sessionStorage.key(0)!;
    sessionStorage.setItem(key, '{invalid');
    expect(snapshots.read(officer)).toEqual({});
    sessionStorage.setItem(key, JSON.stringify({ stats: { savedAt: Date.now(), data: {} } }));
    expect(snapshots.read(officer)).toEqual({});
    sessionStorage.setItem(key, JSON.stringify({
      taxpayers: { savedAt: Date.now(), data: [null] },
      years: { savedAt: Date.now(), data: [{}] },
      charts: { savedAt: Date.now(), data: { vatChart: [{value: 'invalid'}], paymentChart: [] } },
    }));
    expect(snapshots.read(officer)).toEqual({});
  });

  it('keeps at most eight snapshots and only clears dashboard-owned storage', () => {
    const now = Date.now();
    spyOn(Date, 'now').and.returnValue(now);
    for (let i = 0; i < 10; i++) snapshots.write(officer, String(i), 'zones', []);
    expect(sessionStorage.length).toBe(8);
    expect(snapshots.read(officer, '0')).toEqual({});
    sessionStorage.setItem('unrelated', 'keep');
    clearDashboardSnapshots();
    expect(sessionStorage.length).toBe(1);
    expect(sessionStorage.getItem('unrelated')).toBe('keep');
  });

  it('evicts the least recently written year independently of storage enumeration order', () => {
    const realKey = sessionStorage.key.bind(sessionStorage);
    spyOn(Storage.prototype, 'key').and.callFake(index => realKey(sessionStorage.length - 1 - index));
    for (let i = 0; i < 8; i++) snapshots.write(officer, String(i), 'zones', []);
    snapshots.write(officer, '0', 'zones', []);
    snapshots.write(officer, '8', 'zones', []);
    expect(snapshots.read(officer, '0').zones).toBeDefined();
    expect(snapshots.read(officer, '1')).toEqual({});
    expect(snapshots.read(officer, '8').zones).toBeDefined();
    expect(sessionStorage.length).toBe(8);
  });

  it('tolerates disabled storage', () => {
    spyOn(Storage.prototype, 'getItem').and.throwError('disabled');
    expect(snapshots.read(officer)).toEqual({});
    expect(() => snapshots.write(officer, '', 'zones', [])).not.toThrow();
  });
});
