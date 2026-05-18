export type NoticeStatus   = 'Unread' | 'Read' | 'Responded' | 'Expired' | 'Cancelled';
export type NoticeType     = 'General' | 'Tax Due' | 'Audit Notice' | 'Penalty Notice' | 'Compliance' | 'Refund Update' | 'System' | 'Reminder';
export type NoticePriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type NoticeTarget   = 'All Taxpayers' | 'Specific Taxpayer' | 'Tax Officers' | 'Auditors' | 'All Users';

export interface Notice {
  id: number;
  noticeNo: string;
  taxpayerId: number;
  taxpayerName: string;
  tinNumber: string;
  subject: string;
  body: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetType: NoticeTarget;
  issuedBy: string;
  issuedDate: string;
  dueDate: string;
  readDate: string;
  responseDate: string;
  responseNote: string;
  attachmentName: string;
  status: NoticeStatus;
}

export interface NoticeCreateRequest {
  taxpayerId: number | null;
  subject: string;
  body: string;
  noticeType: string;
  priority: string;
  targetType: string;
  issuedBy: string;
  issuedDate: string;
  dueDate: string;
  attachmentName: string;
}

export interface NoticeListResponse {
  data: Notice[];
  total: number;
  page: number;
}
