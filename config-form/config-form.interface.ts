export interface ConfigFormInterface {
    indicators: Array<number>,
    subjects: Array<string>,
    statuses: Array<string>,
    export: boolean
    reportsPeriod: {
        from:Date,
        to:Date,
    }
    table: {
        show: boolean
        indicators?: Array<number>,
        type?: string
        kind?: string
    }
    chartPeriod: {
        show: boolean
        indicators?: Array<number>,
        type?: string
        kind?: string
    }
    chartRegion: {
        show: boolean
        indicators?: Array<number>,
        type?: string
        kind?: string
    }
    map: {
        show: boolean
        indicators?: Array<number>,
        type?: string
        kind?: string
    }
}
