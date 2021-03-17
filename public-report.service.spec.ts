import { TestBed } from '@angular/core/testing';

import { PublicReportService } from './public-report.service';

describe('PublicReportService', () => {
  let service: PublicReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
