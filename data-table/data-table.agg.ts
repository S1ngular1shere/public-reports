export class DataTableAgg {

    private data = {};

    reset() {
        this.data = {};
    }

    add(id: string, value: number | string) {
        if (typeof value !== 'undefined' && value !== null) {
            if (!this.data[id]) {
                this.data[id] = {
                    value: Number(value),
                    count: 1
                }
            } else {
                this.data[id].value += Number(value);
                this.data[id].count++;
            }
        }
    }

    sum(id: string): number {
        if (this.data[id]) {
            return this.data[id].value;
        } else {
            return 0
        }
    }

    avg(id: string): number {
        if (this.data[id]) {
            return this.data[id].value / this.data[id].count;
        } else {
            return 0
        }
    }

}
