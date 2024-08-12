import { SingleMgr } from "../single/single_mgr";
import { Singleton } from "../single/singleton";
import { EventBridge } from "./event_bridge";
import { EventType } from "./event_type";

/**
 * 事件管理
 */
export class EventMgr implements Singleton {
    /**
     * 名稱
     */
    public get name(): string { return this.constructor.name; }

    /**
     * 常駐不釋放
     */
    public get hold(): boolean { return true; }

    /**
     * 事件列表
     * @param obj 所屬類別
     * @param cb 回調函式
     * @param once 是否只觸發一次
     */
    private _events = new Map<EventType, { obj: Object, cb: Function, once: boolean }[]>();

    /**
     * 初始化
     */
    public init(): void {
        let that = this;

        // 註冊
        EventBridge.register = function(obj: Object): void {
            let src = EventBridge.classify.get(obj.constructor);

            if (!src) {
                console.error(`event bridge register failed, ${obj.constructor.name} not found`);
                return;
            }

            src.forEach(elm => that.add(obj, elm.type, obj[elm.cb], elm.once));
        };

        // 註銷
        EventBridge.unregister = function(obj: Object): void {
            let src = EventBridge.classify.get(obj.constructor);

            if (!src) {
                console.error(`event bridge unregister failed, ${obj.constructor.name} not found`);
                return;
            }

            src.forEach(elm => {
                let src2 = that._events.get(elm.type);

                src2 && Array.from(src2).forEach(elm2 => {
                    elm2.obj == obj && that.remove(elm2.obj, elm.type, elm2.cb);
                });
            });
        };
    }

    /**
     * 釋放
     */
    public free(): void {
        EventBridge.register = null;
        EventBridge.unregister = null;

        EventBridge.classify.forEach(elm => elm = []);
        EventBridge.classify.clear();

        this.clear();
    }

    /**
     * 清理
     */
    public clear(): void {
        this._events.forEach(elm => elm = []);
        this._events.clear();
    }

    /**
     * 加入事件
     * @param obj 所屬類別
     * @param type 事件種類
     * @param cb 回調函式
     * @param once 是否只觸發一次
     */
    private add(obj: Object, type: EventType, cb: Function, once: boolean): void {
        let src = this._events.get(type);

        if (!src) {
            src = [];
            this._events.set(type, src);
        }

        src.push({ obj: obj, cb: cb, once: once });
    }

    /**
     * 移除事件
     * @param obj 所屬類別
     * @param type 事件種類
     * @param cb 回調函式
     */
    private remove(obj: Object, type: EventType, cb: Function): void {
        let src = this._events.get(type);

        if (!src) {
            return;
        }

        let idx = src.findIndex(elm => { return elm.obj == obj && elm.cb == cb; });
        idx != -1 && src.splice(idx, 1);

        src.length <= 0 && this._events.delete(type);
    }

    /**
     * 觸發事件
     * @param type 事件種類
     * @param params 事件參數
     */
    public emit(type: EventType, ...params: any[]): void {
        let src = this._events.get(type);

        if (!src) {
            return;
        }

        Array.from(src).forEach(elm => {
            // 實作觸發
            elm.cb.apply(elm.obj, ...params);

            // 刪除單次觸發
            this.remove(elm.obj, type, elm.cb);
        }, this);
    }

    /**
     * 打印資訊
     */
    public dump(): void {
        console.group(this.name);

        this._events.forEach((elm, type) => {
            console.group(type);
            console.table(elm);
            console.groupEnd();
        });

        console.groupEnd();
    }
}

/**
 * 在cocos開始前啟動事件管理
 */
SingleMgr.inst.fetch(EventMgr);