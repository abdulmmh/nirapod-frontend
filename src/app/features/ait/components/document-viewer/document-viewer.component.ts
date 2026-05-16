import { Component, Input } from '@angular/core';
import { AitDocument } from '../../models/ait.model';

@Component({
  selector: 'app-document-viewer',
  template: `
    <div class="document-viewer">
      <div class="viewer-header" *ngIf="document">
        <h4>{{ document.fileName }}</h4>
        <p class="viewer-meta">
          {{ formatFileSize(document.fileSize) }} • {{ document.fileType }} • {{ formatDate(document.uploadedAt) }}
        </p>
      </div>

      <div class="viewer-placeholder">
        <i class="ti ti-file"></i>
        <p>Document preview not available in browser</p>
        <p class="hint" *ngIf="document">{{ document.fileName }}</p>
        <button class="btn-download" title="Download document">
          <i class="ti ti-download"></i> Download
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --color-accent-primary: #0066cc;
      --color-background-secondary: #f9f9f9;
      --color-border: #e0e0e0;
      --color-text-primary: #1a1a1a;
      --color-text-secondary: #666;
      --color-text-muted: #999;
      --spacing-md: 16px;
      --spacing-lg: 24px;
    }

    .document-viewer {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .viewer-header {
      margin-bottom: var(--spacing-lg);
      flex-shrink: 0;
    }

    .viewer-header h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-xs) 0;
      word-break: break-word;
    }

    .viewer-meta {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .viewer-placeholder {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--color-background-secondary);
      border: 2px dashed var(--color-border);
      border-radius: 8px;
      text-align: center;
    }

    .viewer-placeholder i {
      font-size: 48px;
      color: var(--color-text-secondary);
      opacity: 0.3;
      margin-bottom: var(--spacing-md);
    }

    .viewer-placeholder p {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .hint {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: var(--spacing-md);
      font-style: italic;
    }

    .btn-download {
      background-color: var(--color-accent-primary);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background-color 0.3s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: var(--spacing-lg);
    }

    .btn-download:hover {
      background-color: #0052a3;
    }
  `]
})
export class DocumentViewerComponent {
  @Input() document: AitDocument | null = null;

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
