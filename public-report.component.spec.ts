import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicReportComponent } from './public-report.component';

describe('PublicReportComponent', () => {
  let component: PublicReportComponent;
  let fixture: ComponentFixture<PublicReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
