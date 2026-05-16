import { Injectable } from '@angular/core';
import { AitRecord, AitDetailResponse, StatusHistoryEvent, AitDocument, DocumentRequest } from '../models/ait.model';

@Injectable({ providedIn: 'root' })
export class MockAitDataService {
  getMockRecords(): AitRecord[] {
    return [
      {
        id: 1,
        aitReferenceNo: 'AIT-ABC12345',
        taxpayerId: 101,
        taxpayerName: 'ABC Import Co.',
        importDutyRecordId: 501,
        importDutyRefNo: 'BOE-2026-001',
        hsCode: '8471.30.10',
        taxableValue: 50000,
        aitRate: 3,
        calculatedAitAmount: 1500,
        approvedAitAmount: 1500,
        status: 'APPROVED',
        createdAt: '2026-05-10T10:00:00',
        updatedAt: '2026-05-15T14:30:00',
      },
      {
        id: 2,
        aitReferenceNo: 'AIT-DEF67890',
        taxpayerId: 101,
        taxpayerName: 'ABC Import Co.',
        importDutyRecordId: 502,
        importDutyRefNo: 'BOE-2026-002',
        hsCode: '3916.20.00',
        taxableValue: 75000,
        aitRate: 3,
        calculatedAitAmount: 2250,
        status: 'PENDING',
        createdAt: '2026-05-12T09:15:00',
        updatedAt: '2026-05-14T11:20:00',
      },
      {
        id: 3,
        aitReferenceNo: 'AIT-GHI24680',
        taxpayerId: 101,
        taxpayerName: 'ABC Import Co.',
        importDutyRecordId: 503,
        importDutyRefNo: 'BOE-2026-003',
        hsCode: '7326.20.10',
        taxableValue: 100000,
        aitRate: 3,
        calculatedAitAmount: 3000,
        status: 'DRAFT',
        createdAt: '2026-05-16T08:00:00',
        updatedAt: '2026-05-16T08:00:00',
      },
    ];
  }

  getMockDetail(id: number): AitDetailResponse {
    const record = this.getMockRecords().find(r => r.id === id);
    if (!record) {
      return this.getEmptyDetail();
    }

    const detail: AitDetailResponse = {
      ...record,
      statusHistory: this.getMockStatusHistory(id),
      documents: this.getMockDocuments(id),
      pendingRequests: this.getMockPendingRequests(id),
    };
    return detail;
  }

  getMockStatusHistory(aitId: number): StatusHistoryEvent[] {
    return [
      {
        id: 1,
        fromStatus: 'SUBMITTED',
        toStatus: 'PENDING',
        changedBy: 'System',
        changedAt: '2026-05-14T11:20:00',
        changeReason: 'Auto-assigned to review queue',
      },
      {
        id: 2,
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',
        changedBy: 'Taxpayer User',
        changedAt: '2026-05-14T10:00:00',
        changeReason: 'AIT submitted by taxpayer',
      },
    ];
  }

  getMockDocuments(aitId: number): AitDocument[] {
    return [
      {
        id: 1,
        fileName: 'import_invoice.pdf',
        fileType: 'application/pdf',
        fileSize: 245678,
        uploadedBy: 'Taxpayer User',
        uploadedAt: '2026-05-14T09:30:00',
      },
      {
        id: 2,
        fileName: 'bill_of_entry.pdf',
        fileType: 'application/pdf',
        fileSize: 178945,
        uploadedBy: 'Taxpayer User',
        uploadedAt: '2026-05-14T09:45:00',
      },
    ];
  }

  getMockPendingRequests(aitId: number): DocumentRequest[] {
    return [
      {
        id: 1,
        requestType: 'INFO',
        requestedDocuments: 'Import license copy',
        requestReason: 'Required for verification',
        requestedBy: 'Officer User',
        deadline: '2026-05-20',
        status: 'PENDING',
      },
    ];
  }

  getMockPendingQueue(): AitRecord[] {
    return this.getMockRecords().filter(r => r.status === 'PENDING');
  }

  getMockMyQueue(): AitRecord[] {
    return this.getMockRecords().filter(r => ['PAID', 'UNDER_REVIEW', 'APPROVED'].includes(r.status));
  }

  private getEmptyDetail(): AitDetailResponse {
    return {
      id: 0,
      status: 'DRAFT',
      taxpayerId: 0,
      importDutyRecordId: 0,
      taxableValue: 0,
      aitRate: 0,
      calculatedAitAmount: 0,
      statusHistory: [],
      documents: [],
      pendingRequests: [],
    };
  }
}
