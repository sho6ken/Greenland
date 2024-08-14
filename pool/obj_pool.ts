import { Node } from "cc";
import { Singleton } from "../single/singleton";

/**
 * 物件池
 */
export class ObjPool<TK, TV> implements Singleton {
    /**
     * 名稱
     */
    public get name(): string { return this.constructor.name; }

    /**
     * 生成物件方式
     */
    private _creator: (...params: any[]) => TV = null;

    /**
     * 物件池
     */
    protected _pool = new Map<TK, TV[]>();

    /**
     * 初始化
     * @param creator 生成物件方式
     */
    public init(creator: (...params: any[]) => TV): void {
        this._creator = creator;
    }

    /**
     * 釋放池中所有物件
     */
    public free(): void {
        this.clear();
        this._creator = null;
    }

    /**
     * 清除全部物件
     */
    public clear(): void {
        Array.from(this._pool.keys()).forEach(key => this.clearOne(key), this);
        this._pool.clear();
    }

    /**
     * 清除單一物件
     */
    public clearOne(key: TK): void {
        if (!key) {
            console.error(`clear pool ${this.name} failed, key is null`);
            return;
        }

        let src = this._pool.get(key);

        if (!src) {
            console.error(`clear pool ${this.name} failed, container ${key} not found`);
            return;
        }

        for (let elm of src) {
            (elm as Node)?.destroy();
            elm = null;
        }

        src = [];
        this._pool.delete(key);
    }

    /**
     * 物件數量
     */
    public size(key: TK): number {
        return this._pool.get(key)?.length ?? 0;
    }

    /**
     * 取得物件
     */
    public get(key: TK): TV {
        if (!key) {
            console.error(`pool ${this.name} get failed, key is null`);
            return null;
        }

        let src = this._pool.get(key);

        if (!src || src.length <= 0) {
            return null;
        }

        return src.shift();
    }

    /**
     * 取得物件
     * @param params 生成參數
     * @summary 當取不到物件時, 會使用this._creator生成新物件
     */
    public fetch(key: TK, ...params: any[]): TV {
        if (!key) {
            console.error(`pool ${this.name} fetch failed, key is null`);
            return null;
        }

        let obj = this.get(key);

        if (obj) {
            return obj;
        }

        if (!this._creator) {
            console.error(`pool ${this.name} fetch ${key} obj failed, creator is null`);
            return null;
        }

        obj = this._creator(...params);

        return obj;
    }

    /**
     * 回收物件
     * @param key 
     * @param value 
     */
    public recycle(key: TK, value: TV): boolean {
        if (!key) {
            console.error(`pool ${this.name} recycle failed, key is null`);
            return false;
        }

        if (!value) {
            console.error(`pool ${this.name} recycle failed, ${key} obj is null`);
            return false;
        }

        let src = this._pool.get(key);

        if (!src) {
            src = [];
            this._pool.set(key, src);
        }

        // 重複回收
        if (src.indexOf(value) != -1) {
            console.warn(`pool ${this.name} recycle failed, ${key} obj repeat`);

            (value as Node)?.destroy();
            value = null;

            return true;
        }

        (value as Node)?.removeFromParent();
        src.push(value);

        return true;
    }

    /**
     * 打印資訊
     */
    public dump(): void {
        console.group(`pool ${this.name}`);

        this._pool.forEach((src, key) => {
            console.log(`container ${key} have ${src.length} obj`);
        }, this);

        console.groupEnd();
    }
}