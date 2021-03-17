import {Injectable} from '@angular/core';

type aggType = 'min' | 'avg' | 'max';

interface aggParams {
    type: aggType,
    color?: string,
    indicators?: [any],
    colors?: Map<string, string>
}

@Injectable({
    providedIn: 'root'
})
export class DataChartService {
    constructor() {
    }

    private aggDictionary = new Map([
        ['avg', 'Ср.'],
        ['min', 'Мин.'],
        ['max', 'Макс.']
    ]);

    /**
     * Подготовка данных для отрисовки ср/мин/макс значения по показателю
     * @param columnsData
     * @param params
     */
    public prepareAggData(columnsData: Array<[any] | {}>, params: aggParams): Array<any> {
        let annotations: Array<object> = [];

        if (Array.isArray(columnsData)) {
            for (let [i, cData] of columnsData.entries()) {
                let avg_val: string | number = 0;
                let indicatorName: string = params.indicators[i]?.name;
                let indicatorColor: string = [...params.colors][i][1]

                if (typeof DataChartService[params.type] == 'function') {
                    avg_val = DataChartService[params.type](cData);
                }

                annotations.push({
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: avg_val,
                    borderColor: indicatorColor,
                    borderWidth: 4,
                    borderDash: [4, 4],
                    borderDashOffset: 5,
                    label: {
                        enabled: true,
                        fontColor: 'white',
                        content: `${this.aggDictionary.get(params.type)}  ${indicatorName}` ?? ''
                    }
                });
            }
        }

        if (annotations.length != 0) {
            return annotations;
        }

        if (<object>columnsData) {
            for (let item in columnsData) {
                let avg_val: string | number = 0;
                let indicatorName: string = params.indicators.find(i => i.id == item)?.name;
                let indicatorColor: string = params.colors.get(item) ?? '';

                if (typeof DataChartService[params.type] == 'function') {
                    avg_val = DataChartService[params.type](columnsData[item]);
                }

                annotations.push({
                    type: 'line',
                    drawTime: 'afterDatasetsDraw',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: avg_val,
                    borderWidth: 2,
                    borderColor: indicatorColor,
                    borderDash: [4, 4],
                    borderDashOffset: 5,
                    label: {
                        enabled: true,
                        fontColor: 'white',
                        content: `${this.aggDictionary.get(params.type)} ${indicatorName}` ?? ''
                    },
                    onMouseover: function (e) {
                        let curVal = this.options.value;
                        let chart = this.chartInstance;
                        let curObj = chart.options.annotation.annotations.find(obj => obj.value === curVal);
                        curObj.label.content = 'full';
                        this.chartInstance.update();
                    },
                    onMouseout: function (e) {
                        let curVal = this.options.value;
                        let chart = this.chartInstance;
                        let curObj = chart.options.annotation.annotations.find(obj => obj.value === curVal);
                        curObj.label.content = 'min';
                        this.chartInstance.update();
                    }
                });
            }
        }

        return annotations;
    }

    /**
     * Получение ср. значения
     */
    private static avg(data: [any] | {}): number {
        if (<object>data) {
            return Object.values(data).filter(v => v).reduce((acc, cv) => +acc + +cv) / Object.keys(data).length;
        }

        if (Array.isArray(data)) {
            return data.filter(v => v).reduce((acc, cv) => +acc + +cv) / data.length;
        }
    }

    /**
     * Получение мин. значения
     */
    private static min(data: [number] | {}): number {
        return Math.min(...Object.values(data));
    }

    /**
     * Получение макс. значения
     */
    private static max(data: [number] | {}): number {
        return Math.max(...Object.values(data));
    }


    /**
     * Получение рандомного цвета в формате HEX
     */
    public static getRandomColorForAgg(): string {
        let letters = '0123456789ABCDEF'.split('');
        let color = '#';

        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }

        if (color == '#ffffff ') {
            this.getRandomColorForAgg();
        }

        return color;
    }
}

