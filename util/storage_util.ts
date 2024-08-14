import { sys } from "cc";
import { EncryptUtil } from "./encrypt_util";
import { PREVIEW } from "cc/env";

/**
 * 本地存儲
 */
export class StorageUtil  {
    /**
     * 密鑰
     */
    private static _secret: string = "";

    /**
     * 初始化
     * @param secret 密鑰
     */
    public static init(secret: string): void {
        this._secret = EncryptUtil.toMD5(secret);
    }

    /**
     * 是否需要加解密
     */
    private static isEncrypt(): boolean {
        return !PREVIEW && this._secret != null && this._secret.length > 0;
    }

    /**
     * 清除所有資料
     */
    public static clear(): void {
        sys.localStorage.clear();
    }

    /**
     * 刪除資料
     */
    public static remove(key: string): void {
        if (!key || key.length <= 0) {
            console.error(`remove storage failed, key is null`);
            return;
        }

        // 編輯器顯示明文
        if (!PREVIEW) {
            key = EncryptUtil.toMD5(key);
        }

        sys.localStorage.removeItem(key);
    }

    /**
     * 儲存資料
     */
    public static save(key: string, value: any): void {
        if (!key || key.length <= 0) {
            console.error(`save storage failed, key is null`);
            return;
        }

        // 空值刪除此鍵
        if (!value) {
            this.remove(key);
            return;
        }

        switch (typeof value) {
            // 函式
            case "function":
                console.error(`save storage ${key} failed, value is func`);
                return;

            // json
            case "object":
                try {
                    value = JSON.stringify(value);
                }
                catch (e) {
                    console.error(`save storage ${key} failed, parse exception`, e);
                    return;
                }

                break;
        }

        // 編輯器顯示明文
        if (!PREVIEW) {
            key = EncryptUtil.toMD5(key);
        }

        // 需要加密
        if (this.isEncrypt()) {
            value = EncryptUtil.toAes(value, this._secret);
        }

        sys.localStorage.setItem(key, value);
    }

    /**
     * 讀取資料
     * @param defValue 無此資料時的回傳值
     */
    private static load(key: string, defValue: any = ""): string {
        if (!key || key.length <= 0) {
            console.error(`load storage failed, key is null`);
            return defValue;
        }

        // 編輯器顯示明文
        if (!PREVIEW) {
            key = EncryptUtil.toMD5(key);
        }

        let value = sys.localStorage.getItem(key);

        // 需要解密
        if (value && this.isEncrypt()) {
            value = EncryptUtil.fromAes(value, this._secret);
        }

        return value ?? defValue;
    }

    /**
     * 讀number
     * @param defValue 無此資料時的回傳值
     */
    public static loadNum(key: string, defValue: number = 0): number {
        return Number(this.load(key, defValue));
    }

    /**
     * 讀boolean
     * @param defValue 無此資料時的回傳值
     */
    public static loadBool(key: string, defValue: boolean = false): boolean {
        return Boolean(this.load(key, defValue));
    }

    /**
     * 讀string
     * @param defValue 無此資料時的回傳值
     */
    public static loadStr(key: string, defValue: string = ""): string {
        return String(this.load(key, defValue));
    }

    /**
     * 讀json
     * @param defValue 無此資料時的回傳值
     */
    public static loadJson(key: string, defValue: object = {}): any {
        return JSON.parse(this.load(key, defValue));
    }
}