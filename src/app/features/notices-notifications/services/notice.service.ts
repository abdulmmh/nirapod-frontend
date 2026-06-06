import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/core/constants/api.constants';
import { Notice } from 'src/app/models/notice.model';

@Injectable({ providedIn: 'root' })
export class NoticeService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Notice[]> {
    return this.http.get<Notice[]>(API_ENDPOINTS.NOTICES.LIST);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.NOTICES.DELETE(id));
  }

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      General: 'bi bi-info-circle-fill',
      'Tax Due': 'bi bi-cash-coin',
      'Audit Notice': 'bi bi-shield-fill-check',
      'Penalty Notice': 'bi bi-exclamation-triangle-fill',
      Compliance: 'bi bi-patch-check-fill',
      'Refund Update': 'bi bi-cash-stack',
      System: 'bi bi-gear-fill',
      Reminder: 'bi bi-bell-fill',
    };
    return map[type] ?? 'bi bi-bell-fill';
  }

  formatRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;

    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;

    const days = Math.floor(hrs / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
