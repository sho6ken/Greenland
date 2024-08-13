import { Asset, assetManager, AssetManager, LightingStage } from "cc";
import { Singleton } from "../single/singleton";
import { BundleLoader, FolderLoader, LocalLoader } from "./asset_loader";

/**
 * 資源資訊
 */
export interface AssetInfo {
    /**
     * 資源
     */
    asset: Asset;

    /**
     * 常駐不釋放
     */
    hold?: boolean;

    /**
     * 釋放時間
     */
    expire?: number;
}

/**
 * 資源管理
 */
export class AssetMgr implements Singleton {
    /**
     * 名稱
     */
    public get name(): string { return this.constructor.name; }

    /**
     * 常駐不釋放
     */
    public get hold(): boolean { return true; }

    /**
     * 已加載bundle
     */
    private _bundles = new Map<string, AssetManager.Bundle>();

    /**
     * 使用中資源
     */
    private _assets = new Map<string, AssetInfo>();

    /**
     * 現在時間
     */
    private get _now(): number { return Date.now() / 1000; }

    /**
     * 取得逾期時間
     */
    private get _expire(): number { return this._now + (5 * 60); }

    /**
     * 初始化
     */
    public init(): void {}

    /**
     * 釋放
     */
    public free(): void {
        this._assets.forEach(elm => elm.asset = null);
        this._assets.clear();

        this._bundles.forEach(elm => {
            elm.releaseAll();
            assetManager.removeBundle(elm);
        });

        this._bundles.clear();
    }

    /**
     * 清理
     * @param params 
     */
    public clear(): void {
        let keys = [];

        this._assets.forEach((info, key) => {
            if (!info.hold && info.expire < this._now) {
                info.asset = null;
                keys.push(key);
            }
        });

        keys.forEach(elm => this._assets.delete(elm), this);
    }

    /**
     * 打印資訊
     */
    public dump(): void {
        console.group(this.name);

        console.table(this._bundles.keys());
        console.table(this._assets.keys());

        console.groupEnd();
    }

    /**
     * 將資源加入列表
     * @param path 加載路徑
     * @param asset 資源
     * @param hold 常駐不釋放
     */
    private add<T extends Asset>(path: string, asset: T, hold: boolean): void {
        if (!path || path.length <= 0) {
            console.error(`add asset failed, path is null`);
            return;
        }

        this._assets.set(path, { asset: asset, hold: hold, expire: hold ? null : this._expire });
    }

    /**
     * 加載資源
     * @param type 資源種類
     * @param path 加載路徑
     * @param hold 常駐不釋放
     * @param bundle 包名
     */
    public async loadLocal<T extends Asset>(type: { prototype: T }, path: string, hold: boolean = true, bundle?: string): Promise<T> {
        // 已在別處加載
        if (this._assets.has(path)) {
            return await this.doLoadLocal(path) as T;
        }

        console.time(path);

        this.add(path, null, true);  // 佔位

        try {
            await this.loadBundle(bundle);

            bundle && await this.loadBundle(bundle);

            let asset = await LocalLoader.load(<any>type, path, bundle);
            this.add(path, asset, hold);  // 正式資源
        }
        catch (err) {
            this._assets.delete(path);
        }

        console.timeEnd(path);
    }

    /**
     * 實作加載
     * @param path 加載路徑
     * @summary 為了解決同個資源同時重複加載問題
     */
    private async doLoadLocal(path: string): Promise<Asset> {
        return await new Promise((resolve, reject) => {
            let info = null;

            do {
                info = this._assets.get(path);

                // 此鍵因加載失敗而被刪除
                if (!info) {
                    reject();
                }
            }
            while (!info.asset);

            resolve(info.asset);
        });
    }

    /**
     * 加載bundle
     * @param name 包名
     * 
     */
    private async loadBundle(name: string): Promise<void> {
        if (!name || name.length <= 0) {
            console.error(`load bundle failed, name is null`);
            return;
        }

        if (this._bundles.has(name)) {
            return;
        }

        console.time(name);

        this._bundles.set(name, null);  // 佔位
        let bundle = await BundleLoader.load(name)
        this._bundles.set(name, bundle);

        console.timeEnd(name);
    }

    /**
     * 加載資料夾
     * @param type 資源種類
     * @param path 加載路徑
     * @param hold 常駐不釋放
     * @param bundle 包名
     */
    public async loadFolder<T extends Asset>(type: { prototype: T }, path: string, hold: boolean = true, bundle?: string): Promise<void> {
        console.time(path);

        bundle && await BundleLoader.load(bundle);

        let src = await FolderLoader.load(<any>type, path, bundle);
        src.forEach(elm => this.add(path, elm.asset, hold), this);

        console.timeEnd(path);
    }
}