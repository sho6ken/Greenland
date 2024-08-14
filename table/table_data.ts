import { Singleton } from "../single/singleton";

/**
 * 資料表結構
 */
export interface TableStruct {
    // 編號
    id: number;

    // /**
    //  * 
    //  * @param data 單筆資料的json
    //  */
    // constructor(data: any) {
    //     this.id = data.id;
    //     // TODO: 實作類別決定如何填寫資料結構內容, 因為數值有時會需進行2次處理
    // }
}

/**
 * 資料表
 */
export abstract class TableData<T extends TableStruct> implements Singleton {
    /**
     * 名稱
     */
    public get name(): string { return this.constructor.name; }

    /**
     * 不做釋放
     */
    public get hold(): boolean { return true; }

    /**
     * 加載路徑
     */
    public abstract get path(): string;

    /**
     * 加載包名
     */
    public abstract get bundle(): string;

    /**
     * 資料內容
     */
    protected _data: Map<number, T> = new Map();

    /**
     * 初始化
     * @param data 整張表的json
     */
    public init(data: any): void {
        if (data) {
            let len = data.length;

            for (let i = 0; i < len; i++) {
                let id = data[i].id;

                if (this._data.has(id)) {
                    console.warn(`data table ${this.name} init failed, pkey ${id} repeat`);
                    continue;
                }

                this._data.set(id, this.generate(data));
            }
        }
    }

    /**
     * 釋放
     */
    public free(): void {
        this.clear();
    }

    /**
     * 清理
     */
    public clear(): void {
        this._data.forEach(elm => elm = null);
        this._data.clear();
    }

    /**
     * 生成單筆資料內容
     * @param data 單筆資料的json
     */
    protected abstract generate(data: any): T /*{
        return new TableStruct(data);
    }*/

    /**
     * 取得單筆資料
     */
    public get(id: number): T {
        return this._data.get(id);
    }

    /**
     * 打印資訊
     */
    public dump(): void {
        console.group(this.name);
        console.table(this._data.values());
        console.groupEnd();
    }
}