import { EventType } from "./event_type";

/**
 * 事件橋接
 */
export class EventBridge {
    /**
     * 註冊
     * @param obj 所屬類別
     */
    public static register: (obj: Object) => void = null;

    /**
     * 註銷
     * @param obj 所屬類別
     */
    public static unregister: (obj: Object) => void = null;

    /**
     * 紀錄各類別對應的事件
     * @param type 事件類別
     * @param cb 回調函式名稱
     * @param once 是否只觸發一次
     */
    public static classify = new Map<Function, { type: EventType, cb: string, once: boolean }[]>();
}