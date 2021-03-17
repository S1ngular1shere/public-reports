import {AfterViewInit, Component, DoCheck, Input, OnInit, ViewChild} from '@angular/core';
import {PublicReportService} from '../public-report.service';
import {ChartInterface} from '../public-report.component';
import {formatDate} from '@angular/common';
import * as annotations from 'chartjs-plugin-annotation';
import {BaseChartDirective} from 'ng2-charts';
import {NotifierService} from 'angular-notifier';
import {DataChartService} from './data-chart.service';
import {start} from 'repl';

@Component({
    selector: 'app-data-chart',
    templateUrl: './data-chart.component.html',
    styleUrls: ['./data-chart.component.css']
})
export class DataChartComponent implements OnInit, DoCheck {
    @ViewChild(BaseChartDirective) chartComponent: BaseChartDirective;
    @Input() report;
    @Input() type;
    @Input() title;
    private snapshot: string;
    public data: ChartInterface;
    customLegendData: any;
    parameters: any;

    constructor(
        public appService: PublicReportService,
        public dataChartService: DataChartService
    ) {
        BaseChartDirective.registerPlugin(annotations);
    }

    ngOnInit(): void {
        let snapshot = JSON.stringify(this.report);
        if (snapshot != this.snapshot) {
            this.configure(JSON.parse(snapshot));
            this.snapshot = snapshot;
        }
    }

    ngDoCheck() {
        let snapshot = JSON.stringify(this.report);
        if (snapshot != this.snapshot) {
            this.configure(JSON.parse(snapshot));
            this.snapshot = snapshot;
        }
    }

    configure(report) {
        this.customLegendData = [];
        let palette:Map<string,string> = new Map([]);

        for (let item of report?.metadata?.indicators) {
            palette.set(item.id, DataChartService.getRandomColorForAgg());
        }

        //График по регионам
        if (report.metadata.params.type == 'region') {
            let chartColumnsNames = report.data.categories.map(
                elem => report.metadata.regions.find(item => item.id == elem)?.name
            );

            this.data = {};
            this.data.options = {
                responsive: true,
            };

            if (report.metadata.params?.reflect_on_histogram_avg && report.data.columnsData.length !== 0) {
                this.data.options.annotation = {
                    drawTime: 'afterDraw',
                    events: ['click', 'mouseenter', 'mouseleave'],
                    annotations: this.dataChartService.prepareAggData(report.data.columnsData, {
                        type: 'avg',
                        colors: palette,
                        indicators: report.metadata.indicators
                    })
                };
            }

            this.data.labels = chartColumnsNames;
            this.data.type = 'bar';
            this.data.plugins = {};
            this.data.data = report.data.columnsData.map((item: string[], index) => {
                return {
                    label: report.metadata.indicators[index].name,
                    data: item.map((i): number => Number(i))
                };
            });
        //График по периодам
        } else {
            let isColumnsDataEmpty = report.data.columnsData.length == 0;
            let chartColumnsNames = report.data.categories.map(
                elem => formatDate(new Date(elem), 'dd.MM.y', 'ru'),
            );


            this.data = {};
            this.data.options = {
                responsive: true,
                annotation: {
                    drawTime: 'afterDraw',
                    events: ['click', 'mouseover', 'mouseout'],
                    annotations: []
                },
            };


            if (report.metadata.params?.reflect_on_chart_min && !isColumnsDataEmpty) {
                this.data.options.annotation.annotations = this.data.options.annotation.annotations.concat(this.dataChartService.prepareAggData(report.data.columnsData, {
                    type: 'min',
                    colors: palette,
                    indicators: report.metadata.indicators
                }));
            }

            if (report.metadata.params?.reflect_on_chart_avg && !isColumnsDataEmpty) {
                this.data.options.annotation.annotations = this.data.options.annotation.annotations.concat(this.dataChartService.prepareAggData(report.data.columnsData, {
                    type: 'avg',
                    colors: palette,
                    indicators: report.metadata.indicators
                }));
            }

            if (report.metadata.params?.reflect_on_chart_max && !isColumnsDataEmpty) {
                this.data.options.annotation.annotations = this.data.options.annotation.annotations.concat(this.dataChartService.prepareAggData(report.data.columnsData, {
                    type: 'max',
                    colors: palette,
                    indicators: report.metadata.indicators
                }));
            }

            this.data.labels = chartColumnsNames;
            this.data.type = this.type;
            this.data.legend = true;
            this.data.plugins = {};
            this.data.data = Object.entries(report.data.columnsData).map(([fid, value]: [string, any]) => {
                return {
                    label: report.metadata.indicators.find(i => i.id == fid)?.name,
                    data: Object.entries(value).map(i => Number(i[1]))
                };
            });
        }

        this.parameters = report.metadata.params;
        this.parameters.regions = report.metadata.regions;
    }


}
