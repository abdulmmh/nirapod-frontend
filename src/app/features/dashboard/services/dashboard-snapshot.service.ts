import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { AuthUser } from '../../../models/auth-user.model';

const PREFIX = 'nirapod.dashboard.v1:';
const MAX_AGE_MS = 15 * 60 * 1000;
const MAX_SNAPSHOTS = 8;
const MAX_BYTES = 200_000;
const SECTIONS = ['stats', 'taxpayers', 'payments', 'charts', 'years', 'zones'] as const;

export type DashboardSection = typeof SECTIONS[number];
export interface DashboardSnapshotEntry { data: any; savedAt: number; }
export type DashboardSnapshot = Partial<Record<DashboardSection, DashboardSnapshotEntry>>;
type SnapshotUser = Pick<AuthUser, 'id' | 'email' | 'role'>;

function ownedKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  return keys;
}

/** A tab's dashboard data must not survive logout or a rejected session. */
export function clearDashboardSnapshots(): void {
  try { ownedKeys().forEach(key => sessionStorage.removeItem(key)); } catch { /* Storage may be disabled. */ }
}

@Injectable({ providedIn: 'root' })
export class DashboardSnapshotService {
  read(user: SnapshotUser | null, year = ''): DashboardSnapshot {
    if (!user) return {};
    try {
      const key = this.key(user, year);
      const raw = sessionStorage.getItem(key);
      if (!raw) return {};
      if (raw.length > MAX_BYTES) { sessionStorage.removeItem(key); return {}; }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        sessionStorage.removeItem(key); return {};
      }
      const result: DashboardSnapshot = {};
      const now = Date.now();
      for (const section of SECTIONS) {
        const entry = parsed[section];
        if (entry && Number.isFinite(entry.savedAt) && entry.savedAt <= now &&
            now - entry.savedAt < MAX_AGE_MS && this.validData(section, entry.data)) {
          result[section] = { data: entry.data, savedAt: entry.savedAt };
        }
      }
      if (!Object.keys(result).length) sessionStorage.removeItem(key);
      return result;
    } catch { return {}; }
  }

  write(user: SnapshotUser | null, year: string, section: DashboardSection, data: any): void {
    if (!user || !this.validData(section, data)) return;
    try {
      const key = this.key(user, year);
      const snapshot = this.read(user, year);
      snapshot[section] = { data, savedAt: Date.now() };
      // Storage.key() order is unspecified. Persist a sequence so eviction is
      // deterministic even when several snapshots are written in one millisecond.
      const existing = ownedKeys().map(storedKey => {
        let order = 0;
        try {
          const value = JSON.parse(sessionStorage.getItem(storedKey) || '{}')._order;
          if (Number.isSafeInteger(value) && value > 0 && value < Number.MAX_SAFE_INTEGER) order = value;
        } catch { /* Malformed snapshots are evicted before valid ones. */ }
        return { key: storedKey, order };
      });
      const order = Math.max(0, ...existing.map(item => item.order)) + 1;
      const raw = JSON.stringify({ ...snapshot, _order: order });
      if (raw.length > MAX_BYTES) return;
      sessionStorage.removeItem(key);
      const oldest = existing.filter(item => item.key !== key)
        .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
      while (oldest.length >= MAX_SNAPSHOTS) sessionStorage.removeItem(oldest.shift()!.key);
      sessionStorage.setItem(key, raw);
    } catch { /* Quota, disabled storage, or non-serializable data must not block rendering. */ }
  }

  clear(): void { clearDashboardSnapshots(); }

  private key(user: SnapshotUser, year: string): string {
    return PREFIX + JSON.stringify([API_BASE_URL, user.id, user.email, user.role, year]);
  }

  private validData(section: DashboardSection, data: any): boolean {
    if (section === 'stats') return data !== null && typeof data === 'object' && !Array.isArray(data) &&
      ['totalTaxpayers', 'totalRevenue', 'totalVatReturns', 'totalPayments', 'pendingAudits', 'pendingRefunds']
        .every(field => typeof data[field] === 'number' && Number.isFinite(data[field]));
    const object = (item: any) => item !== null && typeof item === 'object' && !Array.isArray(item);
    const finite = (item: any) => typeof item === 'number' && Number.isFinite(item);
    const chart = (items: any) => Array.isArray(items) && items.every(item =>
      object(item) && typeof item.label === 'string' && finite(item.value));
    if (section === 'charts') return object(data) && chart(data.vatChart) && chart(data.paymentChart);
    if (!Array.isArray(data)) return false;
    switch (section) {
      case 'years': return data.every(item => object(item) && typeof item.yearName === 'string' && typeof item.status === 'string');
      case 'taxpayers': return data.every(item => object(item) && typeof item.fullName === 'string');
      case 'payments': return data.every(item => object(item) && typeof item.taxpayerName === 'string' && finite(item.amount));
      case 'zones': return data.every(item => object(item) && typeof item.name === 'string' && finite(item.collection) && finite(item.target) && typeof item.color === 'string');
      default: return false;
    }
  }
}
