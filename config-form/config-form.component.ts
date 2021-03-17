import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators} from "@angular/forms";
import {PublicReportService, TableDataInterface} from "../public-report.service";
import {InterfaceAppRequest, InterfaceAppServiceRegister} from "../../../app.interface";
import {NgxSpinnerService} from "ngx-spinner";
import {NotifierService} from "angular-notifier";
import {Subscription} from "rxjs";
import {IndicatorTablesComponent, SelectedInterface} from "./indicator-tables/indicator-tables.component";
import {ConfigFormInterface} from "./config-form.interface";
import {MatCalendarCellClassFunction} from "@angular/material/datepicker";
import {DataChartService} from '../data-chart/data-chart.service';
import {DynamicFieldDirective} from "../../dynamic-fields/dynamic-field/dynamic-field.directive";
import {AppHelperComponent} from "../../../core/app.helper.component";

@Component({
    selector: 'app-config-form',
    templateUrl: './config-form.component.html',
    styleUrls: ['./config-form.component.css']
})
export class ConfigFormComponent implements OnInit {

    @Output() submit = new EventEmitter<ConfigFormInterface>();
    @ViewChild('reportsSelectTree', {static: false}) reportsSelectTreeRef;

    /**
     * Форма
     */
    public form: FormGroup;

    public indicatorSettings: SelectedInterface;

    /**
     * Подписка на изменение показателей
     */
    private changeIndicators$: Subscription;

    public showForm = false;

    public formParams: {
        showIndicatorsSettings: boolean,
        indicatorsForSelector: {
            data_type?: string
            id?: string
            is_chart?: number
            is_map?: number
            is_table?: number
            name?: string
            unit_name?: string
        }[],
        showTableSettings: boolean,
        showChartSettings: boolean,
        showMapSettings: boolean,
    } = {
        showIndicatorsSettings: false,
        indicatorsForSelector: [],
        showTableSettings: false,
        showChartSettings: false,
        showMapSettings: false,
    };

    /**
     * Справочники для формы
     */
    public registers: {
        indicators?: InterfaceAppServiceRegister[];
        subjects?: InterfaceAppServiceRegister[];
        report_statuses?: InterfaceAppServiceRegister[];
        reports?: InterfaceAppServiceRegister[];
    } = {
        indicators: [],
        subjects: [],
        report_statuses: [],
        reports: []
    };

    /**
     * Подсвечивать даты
     * @param cellDate
     * @param view
     */
    dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
        return '';
    };

    constructor(
        private formBuilder: FormBuilder,
        public appService: PublicReportService,
        public spinner: NgxSpinnerService,
        public notifier: NotifierService
    ) {

    }

    ngOnInit(): void {
        this.getRegisters()
    }

    /**
     * Получение справочников
     */
    getRegisters() {
        this.spinner.show();
        this.appService.getRegisters(
            ['subjects', 'indicators', 'report_statuses']
        ).toPromise().then((result: InterfaceAppRequest) => {
            this.spinner.hide();

            if (result && result.is_error == false) {
                this.registers = Object.assign({}, result.data);
                this.createForm({});
            } else {
                this.notifier.notify('error', result.message);
            }

            this.showForm = true;
        }).catch((e) => {
            this.spinner.hide();
            this.notifier.notify('error', this.appService.language_dictionary.system_no_connection_with_system);
        });
    }

    /**
     * Создание формы.
     * @param data
     */
    createForm(data: { subjects?: any; }) {
        this.form = this.formBuilder.group({
            subjects: [[], [Validators.required]],
            indicators: [[], [Validators.required]],
            statuses: [["draft", "moderation", "reject", "approved"], [Validators.required]],
            reports: [null, [this.reqPeriodOrReports('reports')]],
            tableType: ['region', [Validators.required]],
            chartHistogramKind: ['sum'],
            chartPeriodKind: ['sum'],
            isRegionMap: [false, []],
            regionMapKind: ['sum'],
            isChart: [false, []],
            isRecalc: [false, []],
            isTable: [true, []],
            chartHistogram: [false, []],
            chartReflectOnHistogramAvg: [false, []],
            chartReflectOnChartMin: [false, []],
            chartReflectOnChartAvg: [false, []],
            chartReflectOnChartMax: [false, []],
            periodChart: [false, []],
            byRegionContext: [[], []],
            tableTypeRegion: ['sum', []],
            tableTypePeriod: ['sum', []],
            reports_date_min: [null, [this.reqPeriodOrReports('reports_date_min')]],
            reports_date_max: [null, [this.reqPeriodOrReports('reports_date_max')]],
            reports_date: [null, [this.reqPeriodOrReports('reports_date')]],
            reportPeriodType: ['reports', [Validators.required]],
        });

        this.changeIndicators$ = this.form.get('indicators').valueChanges.subscribe(this.getIndicatorPeriods.bind(this))
    }

    /**
     * Валидация периодов и отчетов
     * @param field
     */
    reqPeriodOrReports(field): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const reportPeriodType = control.parent?.value.reportPeriodType;

            if (reportPeriodType) {
                // отчеты
                if (field == 'reports') {
                    const reports = control.value;
                    if (reportPeriodType == 'reports') {
                        return (!reports) ? {'required': true} : null
                    }
                    return null;
                }
                // календарь
                if (field == 'reports_date_min') {
                    const reports_date_min = control.parent.value.reports_date_min;
                    if (reportPeriodType == 'period') {
                        return (reports_date_min) ? null : {'required': true}
                    }
                    return null;
                }

                if (field == 'reports_date_max') {
                    const reports_date_max = control.parent.value.reports_date_max;
                    if (reportPeriodType == 'period') {
                        return (reports_date_max) ? null : {'required': true}
                    }
                    return null;
                }

                if (field == 'reports_date') {
                    return null;
                }

                return {'required': true};
            } else {
                return null;
            }
        }
    }

    /**
     * Получение периодов показателей
     */
    getIndicatorPeriods(indicatorId) {
        this.spinner.show();
        this.appService.getRegisters(
            [`indicator_periods(${indicatorId})`]
        ).toPromise().then((result: InterfaceAppRequest) => {
            this.spinner.hide();

            if (result && result.is_error == false) {
                if (result.data[`indicator_periods(${indicatorId})`][0]) {
                    let metadata = result.data[`indicator_periods(${indicatorId})`][0]._metadata;
                    this.formParams.showIndicatorsSettings = !metadata.has_folder_children;
                    this.registers.reports = result.data[`indicator_periods(${indicatorId})`];
                    // Коррекция значений
                    if (this.form.value.reports?.length > 0) {
                        let newValues = [];

                        for (let oldValue of this.form.value.reports) {
                            for (let report of this.registers.reports) {
                                if (report.id == oldValue) {
                                    newValues.push(report.id);
                                }
                            }
                        }

                        this.form.controls.reports.patchValue(newValues, {onlySelf: true});
                    }

                    if (this.reportsSelectTreeRef) {
                        this.reportsSelectTreeRef.setOptions({
                            treeData: this.registers.reports
                        });
                    }

                    if (this.formParams.showIndicatorsSettings) {
                        if (metadata.has_children) {
                            this.formParams.indicatorsForSelector = metadata.properties;
                        } else {
                            this.formParams.indicatorsForSelector = [{
                                name: metadata.factor_name,
                                data_type: 'digit',
                                id: metadata.factor_id,
                                unit_name: metadata.factor_unit_name,
                                is_chart: 1,
                                is_map: 1,
                                is_table: 1
                            }];
                        }
                        this.formParams.showTableSettings = false;
                    } else {
                        this.formParams.showTableSettings = true;
                    }
                } else {
                    this.notifier.notify('error', this.appService.language_dictionary.report_not_found_reports);
                }
            } else {
                this.notifier.notify('error', result.message);
            }
        }).catch((e) => {
            this.spinner.hide();
            this.notifier.notify('error', this.appService.language_dictionary.system_no_connection_with_system);
        });
    }

    selectIndicator(selected: SelectedInterface) {
        setTimeout(() => {
            this.formParams.showTableSettings = !!selected.table.length;
            this.formParams.showChartSettings = !!selected.chart.length;
            this.formParams.showMapSettings = !!selected.map.length;
            this.indicatorSettings = selected;
        })
    }

    getValue(): ConfigFormInterface {
        let value = Object.assign({}, this.form.value);
        let result = {
            indicators: value.indicators,
            subjects: value.subjects,
            statuses: value.statuses,
            export: false,
            reportsPeriod: {
                from: undefined,
                to: undefined
            },
            table: undefined,
            chartRegion: undefined,
            chartPeriod: undefined,
            map: undefined
        };

        // Установка дат отчетов
        if (value.reports?.length > 0) {
            let min = value.reports.reduce((a, b) => a < b ? a : b);
            let max = value.reports.reduce((a, b) => a > b ? a : b);
            result.reportsPeriod = {
                'from': ((y, m, d) => {
                    return {y, m, d}
                    // @ts-ignore
                })(...min.split('-')),
                'to': ((y, m, d) => {
                    return {y, m, d}
                    // @ts-ignore
                })(...max.split('-'))
            };
        } else {
            result.reportsPeriod = {
                'from': {
                    'y': this.form.value.reports_date_min?.year(),
                    'm': this.form.value.reports_date_min?.month() + 1,
                    'd': this.form.value.reports_date_min?.date()
                },
                'to': {
                    'y': this.form.value.reports_date_max?.year(),
                    'm': this.form.value.reports_date_max?.month() + 1,
                    'd': this.form.value.reports_date_max?.date()
                }
            };
        }

        if (this.formParams.showIndicatorsSettings) {
            result.table = {
                show: !!(value.isTable && this.indicatorSettings.table.length),
                indicators: this.indicatorSettings.table,
                kind: value.tableType == 'period' ? value.tableTypePeriod : value.tableTypeRegion,
                type: value.tableType
            };

            result.chartPeriod = {
                show: !!(value.periodChart && this.indicatorSettings.chart.length),
                indicators: this.indicatorSettings.chart,
                kind: value.chartHistogramKind,
                type: 'period',
                chartReflectOnHistogramAvg: value.chartReflectOnHistogramAvg,
                chartReflectOnChartMin: value.chartReflectOnChartMin,
                chartReflectOnChartAvg: value.chartReflectOnChartAvg,
                chartReflectOnChartMax: value.chartReflectOnChartMax
            };

            result.chartRegion = {
                show: !!(value.chartHistogram && this.indicatorSettings.chart.length),
                indicators: this.indicatorSettings.chart,
                kind: value.chartHistogramKind,
                type: 'region',
                chartReflectOnHistogramAvg: value.chartReflectOnHistogramAvg
            };

            result.map = {
                show: !!(value.isRegionMap && this.indicatorSettings.map.length),
                indicators: this.indicatorSettings.map,
                kind: value.regionMapKind,
                type: 'region'
            };

        } else {
            result.table = {
                show: !!(value.isTable && value.indicators.length),
                indicators: value.indicators,
                kind: value.tableType == 'period' ? value.tableTypePeriod : value.tableTypeRegion,
                type: value.tableType
            };
            result.chartPeriod = {show: false};
            result.chartRegion = {show: false};
            result.map = {show: false};
        }

        return result;
    }

    generateReport() {
        if (this.form.valid) {
            this.submit.emit(this.getValue());
        } else {
            AppHelperComponent.validateAllFormFields(this.form);
        }
    }

    exportTableToExcel() {
        if (this.form.valid) {
            this.submit.emit({...this.getValue(), export: true});
        } else {
            AppHelperComponent.validateAllFormFields(this.form);
        }
    }
}
