import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AitDocument } from '../../models/ait.model';
import { API_ENDPOINTS } from '../../../../core/constants/api.constants';
import { ToastService } from '../../../../shared/toast/toast.service';
@Component({
    selector: 'app-document-viewer',
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.css'],
})
export class DocumentViewerComponent {
    @Input() document: AitDocument | null = null;
    @Input() aitId: number = 0;         // ✅ parent থেকে pass করতে হবে

    isDownloading = false;

    constructor(
        private http: HttpClient,
        private toast: ToastService,
    ) {}

    downloadDocument(): void {
        if (!this.document?.id || !this.aitId) return;

        this.isDownloading = true;
        this.http.get(
            API_ENDPOINTS.AITS.DOCUMENTS.DOWNLOAD(this.aitId, this.document.id),
            { responseType: 'blob' }
        ).subscribe({
            next: (blob) => {
                const url    = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href     = url;
                anchor.download = this.document?.fileName ?? `document-${this.document?.id}`;
                anchor.click();
                URL.revokeObjectURL(url);
                this.isDownloading = false;
            },
            error: (err) => {
                this.isDownloading = false;
                this.toast.error(
                    err.status === 404 ? 'File not found on server.' : 'Download failed.'
                );
            },
        });
    }

    formatFileSize(bytes: number): string {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    }
}