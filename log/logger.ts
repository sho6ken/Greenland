import { PREVIEW } from "cc/env";

/**
 * 日誌種類
 * @summary 使用2進位制遞增編號, 1, 2, 4, 8, 16, 32...
 */
export enum LogType {
    Trace = 1,    // 標準
    Network = 2,  // 網路
}

/**
 * 日誌配置
 * @param type 對齊日誌種類的編號
 * @param title 打印提示
 * @param color 打印顏色
 */
const LogConf: { [type: number]: { title: string, color: string } } = {
    1: { title: "trace", color: "color:#000000" },
    2: { title: "network", color: "color:#ee7700" },
};

/**
 * 日誌
 * @summary 可設定旗標, 依旗標決定那些內容可以打印
 */
export class Logger {
    /**
     * 旗標
     * @summary 依2進位制處理
     * @summary 編輯器預設全開
     */
    private static _flags: number = PREVIEW ? Number.MAX_SAFE_INTEGER : 0;

    /**
     * 設定旗標
     * @param types 開放打印的種類
     */
    public static setFlags(...types: LogType[]): void {
        this._flags = 0;
        types && types.forEach(type => this._flags |= type, this);
    }

    /**
     * 此種類是否需打印
     */
    private static opened(type: LogType): boolean {
        return (this._flags & type) != 0;
    }

    /**
     * 打印
     * @param type 種類
     * @param msg 訊息
     * @param hint 提示
     */
    private static print(type: LogType, msg: any, hint: string = ""): void {
        if (!this.opened(type)) {
            return;
        }

        let conf = LogConf[type];

        console.log(
            "%c[%s][%s][%s]%s:%o", 
            conf.color, 
            this.getTimeStr(), 
            conf.title, 
            this.getCallStack(), 
            hint, 
            msg
        );
    }

    /**
     * 取得腳本調用路徑
     */
    private static getCallStack(): string {
        let err = new Error();
        let contents = err.stack?.split(`\n`);

        for (const elm of contents) {
            let slices = elm.substring(7).split(` `);

            if (slices.length >= 2 && elm.indexOf(this.name) == -1) {
                return slices[0];
            }
        }

        return "";
    }

    /**
     * 取得時間字串
     * @returns 24:60:60:999
     */
    private static getTimeStr(): string {
        let res = "";

        /**
         * 將時間字段加入回傳結果中
         * @param count 位數
         * @param split 分段符號
         */
        const func = function(time: number, count: number, split: string = "") {
            res += (Array(3).join(`0`) + time).slice(-count) + split;
        }

        let date = new Date();
        func(date.getHours(), 2, `:`);
        func(date.getMinutes(), 2, `:`);
        func(date.getSeconds(), 2, `:`);
        func(date.getMilliseconds(), 3);

        return res;
    }

    /**
     * 打印標準日誌
     * @param msg 訊息
     * @param hint 提示
     */
    public static trace(msg: any, hint: string = ""): void {
        this.print(LogType.Trace, msg, hint);
    }

    /**
     * 打印網路日誌
     * @param msg 訊息
     * @param hint 提示
     */
    public static network(msg: any, hint: string = ""): void {
        this.print(LogType.Network, msg, hint);
    }
}