import {NgModule} from '@angular/core';
import {PublicReportRoutingModule} from './public-report-routing.module';
import {PublicReportComponent} from './public-report.component';
import {GlobalModule} from '../../core/global.module';
import {DynamicFieldsModule} from '../dynamic-fields/dynamic-fields.module';
import {CommonModule} from '@angular/common';
import {CustomSortModule} from '../table/sort/custom.sort.module';
import {ChartsModule} from 'ng2-charts';
import {MapComponent} from './map/map.component';
import {ConfigFormComponent} from './config-form/config-form.component';
import {DataTableComponent} from './data-table/data-table.component';
import {DataChartComponent} from './data-chart/data-chart.component';
import {IndicatorTablesComponent} from './config-form/indicator-tables/indicator-tables.component';
import {ParametersComponent} from './parameters/parameters.component';

@NgModule({
    declarations: [PublicReportComponent, MapComponent, ConfigFormComponent, DataTableComponent, DataChartComponent, IndicatorTablesComponent, ParametersComponent],
    imports: [
        PublicReportRoutingModule,
        DynamicFieldsModule,
        GlobalModule,
        CustomSortModule,
        CommonModule,
        ChartsModule
    ]
})
export class PublicReportModule {
}
