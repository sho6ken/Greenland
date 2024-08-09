import { Logger } from "../log/logger";
import { SingleClass, Singleton } from "./singleton";

/**
 * 單例管理
 */
export class SingleMgr implements Singleton {
    /**
     * 實例
     */
    private _inst: SingleMgr = null;

    /**
     * 實例
     */
    public get inst(): SingleMgr { return this._inst || (this._inst = new SingleMgr()); }

    /**
     * 名稱
     */
    public get name(): string { return this.constructor.name; }

    /**
     * 常駐不釋放
     */
    public get hold(): boolean { return true; }

    /**
     * 單例列表
     */
    private _container = new Map<string, Singleton>();

    /**
     * 初始化
     */
    public init(): void {}

    /**
     * 取得類別單例
     */
    public get<T extends Singleton>(type: SingleClass<T>): T {
        let src = this._container;
        let name = type.name;

        return src.get(name) as T;
    }

    /**
     * 取得類別單例
     * @param params 建構參數
     * @summary 無實例時則會進行建構新實例
     */
    public fetch<T extends Singleton>(type: SingleClass<T>, ...params: any[]): T {
        let src = this._container;
        let name = type.name;

        if (src.has(name)) {
            return src.get(name) as T;
        }

        // 優先使用外部實例
        let inst = type.inst ?? new type();
        src.set(name, inst);

        Logger.trace(`single ${name} created`);
        inst.init(...params);

        return inst;
    }

    /**
     * 釋放全部單例
     */
    public free(): void {
        Array.from(this._container.keys()).forEach(key => this.doFree(key), this);
        this._container.clear();
    }

    /**
     * 釋放單一單例
     */
    public freeOne<T extends Singleton>(type: SingleClass<T>): boolean {
        return this.doFree(type.name);
    }

    /**
     * 實作釋放單例
     * @param key 
     */
    private doFree(key: string): boolean {
        let src = this._container;
        let elm = src.get(key);

        if (!elm) {
            console.warn(`free single ${key} failed, inst not found`);
            return false;
        }

        if (elm.hold) {
            console.warn(`free single ${key} failed, inst hold`);
            return false;
        }

        elm.free();
        elm = null;

        src.delete(key);
        Logger.trace(`free single ${key} succeed`);

        return true;
    }

    /**
     * 清理全部單例
     */
    public clear(): void {
        Array.from(this._container.keys()).forEach(key => this.doClear(key), this);
    }

    /**
     * 清理單一單例
     */
    public clearOne<T extends Singleton>(type: SingleClass<T>): void {
        this.doClear(type.name);
    }

    /**
     * 實作清理單例
     */
    public doClear(key: string): void {
        let elm = this._container.get(key);
        elm.clear();
    }
}