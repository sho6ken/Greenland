import { EventBridge } from "./event_bridge";
import { EventDefine, EventType } from "./event_type";

/**
 * 類別註冊/註銷事件特性
 * @param on 觸發註冊事件的函式名
 * @param off 觸發註銷事件的函式名
 * @summary 非cc.component使用時, 須自定義註冊與註銷的函式
 */
export function eventClass(on: string = "onEnable", off: string = "onDisable"): Function {
    return function(self: any): void {
        if (!on) {
            console.warn(`attribute event class ${self.name} failed, on is null`);
            return;
        }

        let func = self.prototype[on];

        // 將原始函式替換
        self.prototype[on] = function(): void {
            EventBridge.register(this);
            func.call(this);
        }

        if (!off) {
            console.warn(`attribute event class ${self.name} failed, off is null`);
            return;
        }

        func = self.prototype[off];

        // 將原始函式替換
        self.prototype[off] = function(): void {
            EventBridge.unregister(this);
            func.call(this);
        }
    }
}

/**
 * 函式監聽事件特性
 * @param type 事件種類
 * @param once 是否只觸發單次
 */
export function eventFunc(type: EventType, once: boolean = false): Function {
    return function(self: any, name: string, desc: PropertyDescriptor): void {
        let src = EventBridge.classify.get(self.constructor);

        if (!src) {
            src = [];
            EventBridge.classify.set(self.constructor, src);
        }

        src.push({ type: type, cb: name, once: once });
    }
}

/**
 * 變數異動時觸發事件特性
 * @param type 事件種類
 * @summary 事件回調(新值, 舊值)
 * @summary 將原變數名改為getter與setter, 並在異動時觸發事件
 */
export function eventVar(type: EventType): Function {
    return function(self: any, name: string): void {
        // 刪除原變數
        delete self[name];

        let field = `_${name}`;

        // 新增異名私有變數
        Object.defineProperty(self, field, {
            writable: true,
            enumerable: true,
            configurable: true,
        });

        // getter
        let getter = function(this: any): any {
            return this[field];
        }

        // setter
        let setter = function(this: any, value: any): void {
            let old = this[field];

            if (value != old) {
                this[field] = value;

                // 觸發事件
                let target = typeof type == "string" ? type : EventDefine[type];
                EventBridge.emit(target, value, old);
            }
        }

        // 新增同名getter與setter
        Object.defineProperty(self, name, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true,
        });
    }
}