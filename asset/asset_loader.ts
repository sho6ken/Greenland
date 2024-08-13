import { Asset, assetManager, AssetManager, resources } from "cc";

/**
 * 本地加載
 */
export class LocalLoader {
    /**
     * 加載
     * @param type 資源種類
     * @param path 加載路徑
     * @param bundle 包名
     * @summary 未填包名則由resources讀取
     * @summary 如為bundle內資源, 需先行調用BundleLoader.load(), 等加載bundle完畢後才可使用此函式
     */
    public static async load<T extends Asset>(type: typeof Asset, path: string, bundle?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            let loader = bundle ? assetManager.getBundle(bundle) : resources;

            if (!loader) {
                console.error(`load local ${path} failed, bundle ${bundle} not found`);
                return;
            }

            loader.load(path, type, (err, asset) => {
                if (err) {
                    console.error(`load local ${path} failed, bundle is ${bundle}`, err);
                    reject(err);
                }

                resolve(asset as T);
            });
        });
    }
}

/**
 * bundle加載
 */
export class BundleLoader {
    /**
     * 加載
     * @param name 包名
     */
    public static async load(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
                if (err) {
                    console.error(`load bundle ${name} failed`, err);
                    reject(err);
                }

                resolve(bundle);
            });
        });
    }
}

/**
 * 資料夾加載
 */
export class FolderLoader {
    /**
     * 加載
     * @param type 資源種類
     * @param path 加載路徑
     * @param bundle 包名
     * @summary 未填包名則由resources讀取
     * @summary 如為bundle內資源, 需先行調用BundleLoader.load(), 等加載bundle完畢後才可使用此函式
     */
    public static async load<T extends Asset>(type: typeof Asset, path: string, bundle?: string): Promise<{ path: string, asset: T }[]> {
        return new Promise((resolve, reject) => {
            let loader = bundle ? assetManager.getBundle(bundle) : resources;

            if (!loader) {
                console.error(`load folder ${path} failed, bundle ${bundle} not found`);
                return;
            }

            loader.loadDir(path, type, (err, assets) => {
                if (err) {
                    console.error(`load folder ${path} failed, bundle is ${bundle}`, err);
                    reject(err);
                }

                let info = loader.getDirWithPath(path, type);
                let res = [];

                assets.forEach((asset, idx) => {
                    res.push({ path: info[idx].path, asset: asset as T });
                });

                return res;
            });
        });
    }
}