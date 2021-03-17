import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppService } from '../../app.service';

export interface TableDataInterface {
    id: number;
    name: number;
    is_table: number;
    is_chart: number;
    is_map: number;
}

@Injectable({
  providedIn: 'root'
})
export class PublicReportService extends AppService {
  className: string = 'PublicReportService';

  url: string = '/report/public_report'

  /**
     * Получение пользователей системы
     * @param data данные
     */
  public getLists(data: any): Observable<any> {
    return this.http.post<any>(this.serverUrl + this.url + '/fetch_table_data', data, this.httpOptions);
  }
    /**
     * Получение показателей
     * @param data
     */
  public getFactorData(data: any) {
    return this.http.post<any>(this.serverUrl + '/report/public_report/get_indicators', '', this.httpOptions);
  }

    /**
     * Формирование отчёта
     * @param data
     * @param isExcel - формировать отчет в эксель
     */
  public formReportData(data: Array<string|number|boolean>|object) {
        return this.http.post<any>(this.serverUrl + '/report/public_report/formReportData', data, this.httpOptions);
    }
}
