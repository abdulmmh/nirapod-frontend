import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { API_ENDPOINTS } from '../constants/api.constants';
import { Notice } from '../../models/notice.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

    private _unreadCount$ = new BehaviorSubject<number>(0);
    unreadCount$ = this._unreadCount$.asObservable();

    private pollSub?: Subscription;

    constructor(
        private http: HttpClient,
        private auth: AuthService,
    ) {}

    // ── 30 সেকেন্ড পর পর unread count refresh করো ───────────────────────
    startPolling(): void {
        if (this.pollSub) return;   // already polling
        this.pollSub = interval(30_000)
            .pipe(startWith(0), switchMap(() => this.fetchUnreadCount()))
            .subscribe(count => this._unreadCount$.next(count.count));
    }

    stopPolling(): void {
        this.pollSub?.unsubscribe();
        this.pollSub = undefined;
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    private fetchUnreadCount() {
        return this.http.get<{ count: number }>(
            API_ENDPOINTS.NOTICES.UNREAD_COUNT
        );
    }

    // ── Notices লোড করো ──────────────────────────────────────────────────
    getMyNotices() {
        return this.http.get<Notice[]>(API_ENDPOINTS.NOTICES.LIST);
    }

    markAsRead(id: number) {
        return this.http.patch(API_ENDPOINTS.NOTICES.READ(id), {});
    }

    // Count manually refresh করো (যেমন notice page থেকে ফিরলে)
    refresh(): void {
        this.fetchUnreadCount()
            .subscribe(r => this._unreadCount$.next(r.count));
    }
}