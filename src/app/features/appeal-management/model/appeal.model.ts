export interface Appeal {
  id:                 number;
  appealNo:           string;
  auditCaseId:        number;
  demandNoticeId?:    number;
  assessmentId?:      number;
  taxpayerId:         number;
  tinNumber:          string;
  taxpayerName:       string;
  appealType:         string;
  groundsText:        string;
  reliefSought?:      string;
  supportingEvidence?:string;
  demandedAmount?:    number;
  disputedAmount?:    number;
  acceptedAmount?:    number;
  filedAt:            string;
  filedBy:            string;
  deadline?:          string;
  hearingDate?:       string;
  hearingVenue?:      string;
  hearingNotes?:      string;
  decidedAt?:         string;
  decidedBy?:         string;
  decision?:          string;
  decisionNotes?:     string;
  reliefGranted?:     number;
  status:             string;
  assignedTo?:        string;
  remarks?:           string;
  createdAt:          string;
}

export interface AppealCreateRequest {
  auditCaseId:        number;
  demandNoticeId?:    number;
  assessmentId?:      number;
  appealType?:        string;
  groundsText:        string;
  reliefSought?:      string;
  supportingEvidence?:string;
  disputedAmount?:    number;
  deadline?:          string;
  remarks?:           string;
}

export interface AppealDecisionRequest {
  decision:       string;
  decisionNotes?: string;
  reliefGranted?: number;
  acceptedAmount?:number;
}

export interface AppealHearingRequest {
  hearingDate?:  string;
  hearingVenue?: string;
  hearingNotes?: string;
  assignedTo?:   string;
}
