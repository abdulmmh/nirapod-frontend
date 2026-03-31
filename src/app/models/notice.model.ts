export type NoticeStatus   = 'Unread' | 'Read' | 'Responded' | 'Expired' | 'Cancelled';
export type NoticeType     = 'General' | 'Tax Due' | 'Audit Notice' | 'Penalty Notice' | 'Compliance' | 'Refund Update' | 'System' | 'Reminder';
export type NoticePriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type NoticeTarget   = 'All Taxpayers' | 'Specific Taxpayer' | 'Tax Officers' | 'Auditors' | 'All Users';

export interface Notice {
  id: number;
  noticeNo: string;
  subject: string;
  body: string;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetType: NoticeTarget;
  tinNumber: string;
  taxpayerName: string;
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
  subject: string;
  body: string;
  noticeType: string;
  priority: string;
  targetType: string;
  tinNumber: string;
  taxpayerName: string;
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