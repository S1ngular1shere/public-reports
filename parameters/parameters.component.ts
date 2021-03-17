import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {PublicReportService} from "../public-report.service";

@Component({
    selector: 'app-parameters',
    templateUrl: './parameters.component.html',
    styleUrls: ['./parameters.component.css']
})
export class ParametersComponent implements OnInit, DoCheck {
    @Input() params: {
        kind: string;
        subjects: number[];
        period_from: string;
        statuses: string[];
        indicators: number[];
        type: string;
        regions: any[];
        period_to: string
    };
    public period_from: Date;
    public period_to: Date;
    public type_name: string;
    public kind_name: string;
    public regions: any[];

    constructor(
        public appService: PublicReportService
    ) {
    }

    ngOnInit(): void {
        this.render();
    }

    ngDoCheck(): void {
        this.render();
    }

    render() {
        if(this.params){
            let _l = this.appService.language_dictionary;
            this.period_from = new Date(this.params.period_from);
            this.period_to = new Date(this.params.period_to);
            this.type_name = this.params.type == 'region' ? _l.field_report_type_region : _l.field_report_type_period;
            if(this.params.type !== 'region'){
                this.kind_name = this.params.kind == 'avg' ? _l.summarizing_data_region : _l.averaging_data_region;
            }else{
                this.kind_name = this.params.kind == 'avg' ? _l.averaging_data_period : _l.summarizing_data_period;
            }
            this.regions = this.params.regions;
        }else{
            this.period_from = this.period_to = this.type_name = this.kind_name = this.regions = null;
        }
    }

}
