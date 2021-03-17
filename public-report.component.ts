import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PublicReportService} from './public-report.service';
import {InterfaceAppServiceRegister, TreeNodeRegister} from '../../app.interface';
import {MatTableDataSource} from '@angular/material/table';
import {NotifierService} from 'angular-notifier';
import {NgxSpinnerService} from 'ngx-spinner';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {InterfaceSettingsTable} from '../table/table.interface';
import {AppHelperComponent} from '../../core/app.helper.component';
import {MatCalendarCellClassFunction} from '@angular/material/datepicker';
import {switchMap} from 'rxjs/operators';
import {FlatTreeControl} from '@angular/cdk/tree';
import {DatePipe} from "@angular/common";
import {MatExpansionPanel} from "@angular/material/expansion";
import {Label} from "ng2-charts/lib/base-chart.directive";
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';

export interface ChartInterface {
    options?: any,
    labels?: Label,
    type?: ChartType,
    legend?: boolean,
    plugins?: {},
    data?: ChartDataSets[]
}


@Component({
    selector: 'app-public-report',
    templateUrl: './public-report.component.html',
    styleUrls: ['./public-report.component.css']
})
export class PublicReportComponent implements OnInit {

    /**
     * Отчеты.
     */
    public reports: any = {};

    constructor(
        public  router: Router,
        public spinner: NgxSpinnerService,
        public appService: PublicReportService,
        public notifier: NotifierService
    ) {

    }

    ngOnInit(): void {

    }

    async onChangeParam(event: any) {
        this.spinner.show();
        try{
            if(event.export){
                let result = await this.appService.downloadService(event, '/report/public_report/formReportData').toPromise();
                AppHelperComponent.createAndDownloadBlobFile(
                    result.body,
                    {type: result.headers.get('content-type')},
                    AppHelperComponent.getHeaderFileName(result.headers)
                );
            }else{
                this.reports = await this.appService.formReportData(event).toPromise();

                for(let entity of ['table', 'chartRegion', 'chartPeriod', 'map']){
                    if(this.reports[entity]){
                        this.reports[entity].metadata.regions = this.reports.regions
                    }
                }
            }
        }catch (e) {
            this.reports = {};
        }
        this.spinner.hide();
    }
}

