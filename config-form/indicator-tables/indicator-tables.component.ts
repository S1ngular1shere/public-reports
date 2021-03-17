import {Component, Input, OnInit, Output, EventEmitter, OnDestroy, DoCheck} from '@angular/core';
import {PublicReportService, TableDataInterface} from "../../public-report.service";
import {SelectionModel} from "@angular/cdk/collections";
import {Subscription} from "rxjs";
import {delay, startWith} from "rxjs/operators";

export interface SelectedInterface {
    table: Array<string>,
    chart: Array<string>,
    map: Array<string>
}

@Component({
    selector: 'app-indicator-tables',
    templateUrl: './indicator-tables.component.html',
    styleUrls: []
})
export class IndicatorTablesComponent implements OnInit, OnDestroy, DoCheck {

    /**
     * Данные для таблицы
     */
    @Input() data: TableDataInterface[];

    private dataSnapshot: string;

    @Output() selected = new EventEmitter<SelectedInterface>();

    public columns: any[];

    /**
     * селекторы для показателей (чекбоксы, радиокнопки)
     */
    public selectionMap = new SelectionModel(false, []);
    public selectionChart = new SelectionModel(true, []);
    public selectionTable = new SelectionModel(true, []);

    public selectMap$: Subscription;
    public selectChart$: Subscription;
    public selectTable$: Subscription;

    /**
     * Отображаемые колонки
     */
    displayedColumns: Array<string> = ['unit_name', 'name', 'is_table', 'is_chart', 'is_map'];

    constructor(
        public appService: PublicReportService,
    ) {
    }

    ngOnInit(): void {
        this.columns = [
            {
                'id': 'is_table',
                'name': this.appService.language_dictionary.display_on_table,
                'select': this.selectionTable
            },
            {
                'id': 'is_chart',
                'name': this.appService.language_dictionary.display_on_chart,
                'select': this.selectionChart
            },
            {
                'id': 'is_map',
                'name': this.appService.language_dictionary.display_on_map,
                'select': this.selectionMap
            },
            {
                'id': 'name',
                'name': this.appService.language_dictionary.system_characteristic
            },
            {
                'id': 'unit_name',
                'name': this.appService.language_dictionary.unit_units
            }
        ];
        let emitSelect = () => {
            console.log('emit');
            this.selected.emit({
                table: this.selectionTable.selected,
                chart: this.selectionChart.selected,
                map: this.selectionMap.selected
            });
        };
        this.selectMap$ = this.selectionTable.changed.subscribe(emitSelect);
        this.selectChart$ = this.selectionChart.changed.subscribe(emitSelect);
        this.selectTable$ = this.selectionMap.changed.subscribe(emitSelect);
        console.log('ngOnInit', this.data);
        this.updateCheckboxes();
    }

    ngDoCheck(): void {
        console.log('ngDoCheck');
        if (this.dataSnapshot !== JSON.stringify(this.data)) {
            console.log('clear');
            this.selectionTable.clear();
            this.selectionChart.clear();
            this.selectionMap.clear();
            this.updateCheckboxes()
        }
    }

    updateCheckboxes() {
        console.log('refresh', this.data);
        for (let item of this.data) {
            if (item.is_table) {
                this.selectionTable.select(item.id);
            }
            if (item.is_chart) {
                this.selectionChart.select(item.id);
            }
            /*if(item.is_map){
                this.selectionMap.select(item.id);
            }*/
        }
        this.dataSnapshot = JSON.stringify(this.data);
    }

    ngOnDestroy(): void {
        this.selectMap$?.unsubscribe();
        this.selectChart$?.unsubscribe();
        this.selectTable$?.unsubscribe();
    }

}
