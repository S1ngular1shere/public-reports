import {Component, DoCheck, Input, OnInit} from '@angular/core';
import {PublicReportService} from "../public-report.service";
import {formatDate} from "@angular/common";
import {DataTableAgg} from "./data-table.agg";

@Component({
    selector: 'app-data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit, DoCheck {

    @Input() report;
    public data = [];
    public layers;
    public headerRows;
    public unitIds;
    public columns;
    private regions: Array<({
        name: string;
        id: string;
        key_right: string;
        type: string;
        key_left: string;
        population: null
    })>;
    period_from: Date;
    period_to: Date;
    parameters: {
        kind: string;
        subjects: number[];
        period_from: string;
        statuses: string[];
        indicators: number[];
        type: string;
        regions: any[];
        period_to: string
    };

    private snapshot = null;

    constructor(
        public appService: PublicReportService
    ) {

    }

    ngOnInit(): void {
        let snapshot = JSON.stringify(this.report);
        if (snapshot != this.snapshot) {
            this.createTable(JSON.parse(snapshot));
            this.snapshot = snapshot;
        }

    }

    ngDoCheck() {
        let snapshot = JSON.stringify(this.report);
        if (snapshot != this.snapshot) {
            this.createTable(JSON.parse(snapshot));
            this.snapshot = snapshot;
        }
    }

    createTable(table) {
        this.layers = table.metadata.layers;
        this.columns = table.metadata.columns;
        this.regions = table.metadata.regions;

        this.layers[0].unshift({
            "id": 'main',
            "name": this.appService.language_dictionary.report_areas,
            "width": 1,
            "height": this.layers.length
        });

        this.headerRows = this.layers.map(lay => {
            let ids = [];
            lay.map(l => l.id).forEach(id => ids.push('c_' + id));
            return ids;
        });


        this.columns.unshift({
            "id": 'main',
            "factor_unit_name": "",
        });

        this.unitIds = this.columns.map(c => 'u_' + c.id);


        this.regions.sort((a, b) => {
            let indexA = ((+a.key_right) - (+a.key_left)) == 1 ? a.key_left : a.key_right;
            let indexB = ((+b.key_right) - (+b.key_left)) == 1 ? b.key_left : b.key_right;
            return Number(indexA) > Number(indexB) ? 1 : -1;
        });

        this.regions.filter((r) => table.metadata.params.indicators.includes(+r.id))

        let type = table.metadata.params.type;
        let kind = table.metadata.params.kind;
        this.parameters = Object.assign({}, table.metadata.params);
        this.parameters.regions = this.regions;

        this.data = [];

        if (type == 'region') {
            let middleAgg = new DataTableAgg();
            let summaryAgg = new DataTableAgg();

            for (let region of table.metadata.regions) {
                let object = {};
                let leaf = (+region.key_right) - (+region.key_left) != 1;

                if (leaf === false) {
                    let rowData = table.data[region.id.toString()];

                    if (rowData) {
                        for (let column of table.metadata.columns) {
                            object['u_' + column.id] = {
                                value: rowData[column.id.toString()] || '-',
                                bold: false
                            };
                            middleAgg.add(column.id, rowData[column.id.toString()] || null);
                            summaryAgg.add(column.id, rowData[column.id.toString()] || null);
                        }

                        object['u_main'] = {
                            value: region.name,
                            bold: leaf
                        };

                        this.data.push(object);
                    }
                } else {
                    for (let column of table.metadata.columns) {
                        object['u_' + column.id] = {
                            value: kind == 'sum' ? middleAgg.sum(column.id) : middleAgg.avg(column.id),
                            bold: true
                        };
                    }
                    object['u_main'] = {
                        value: region.name,
                        bold: leaf
                    };
                    middleAgg.reset();
                    this.data.push(object);
                }
            }
            // Итого:
            let object = {};

            for (let column of table.metadata.columns) {
                object['u_' + column.id] = {
                    value: kind == 'sum' ? summaryAgg.sum(column.id) : summaryAgg.avg(column.id),
                    bold: true
                };
            }

            object['u_main'] = {
                value: this.appService.language_dictionary.system_sum,
                bold: true
            };

            this.data.push(object);
        } else { // В разрезе периодов
            let middleAgg = new DataTableAgg();
            let summaryAgg = new DataTableAgg();

            for (let schedulerDate of table.data) {
                let date = new Date(schedulerDate.date);
                let objectDate = {};
                this.data.push(objectDate);

                for (let item of schedulerDate.items) {
                    let region = this.regions.find((r) => r.id == item.subject_id);
                    let object = {};

                    for (let column of table.metadata.columns) {
                        object['u_' + column.id] = {
                            value: item.values[column.id.toString()] || '-',
                            bold: false
                        };
                        middleAgg.add(column.id, item.values[column.id.toString()] || null);
                        summaryAgg.add(column.id, item.values[column.id.toString()] || null);
                    }
                    object['u_main'] = {
                        value: region.name,
                        bold: false
                    };
                    this.data.push(object);
                }

                for (let column of table.metadata.columns) {
                    objectDate['u_' + column.id] = {
                        value: kind == 'sum' ? middleAgg.sum(column.id) : middleAgg.avg(column.id),
                        bold: true
                    };
                }

                objectDate['u_main'] = {
                    value: formatDate(date, 'dd.MM.y', 'ru'),
                    bold: true
                };

                middleAgg.reset();
            }

            let object = {};

            for (let column of table.metadata.columns) {
                object['u_' + column.id] = {
                    value: kind == 'sum' ? summaryAgg.sum(column.id) : summaryAgg.avg(column.id),
                    bold: true
                };
            }

            object['u_main'] = {
                value: this.appService.language_dictionary.system_sum,
                bold: true
            };

            this.data.push(object);
        }
    }

}
