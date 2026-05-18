import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RefundService } from './refund.service';

describe('RefundService', () => {
  let service: RefundService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RefundService],
    });
    service = TestBed.inject(RefundService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/v1/refunds/my for getMyRefunds', () => {
    service.getMyRefunds({ page: 0, size: 10 }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/v1/refunds/my'));
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 });
  });

  it('should call POST /api/v1/refunds for create', () => {
    const payload: any = { refundType: 'INCOME_TAX', fiscalYearId: 1, sources: [], requestedAmount: 10000, bankDetails: {} };
    service.create(payload).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/api/v1/refunds') && !r.url.includes('/my'));
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
