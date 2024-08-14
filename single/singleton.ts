/**
 * 單例介面
 */
export interface Singleton {
    /**
     * 名稱
     */
    name: string;

    /**
     * 常駐不釋放
     */
    hold?: boolean;

    /**
     * 初始化
     */
    init(...params: any[]): any;

    /**
     * 釋放
     */
    free(...params: any[]): any;

    /**
     * 清理
     * @param params 
     */
    clear(...params: any[]): any;
}

/**
 * 單例類別
 * @summary 限制單例類別必須具備以下功能
 */
export interface SingleClass<T extends Singleton> {
    /**
     * 功能
     */
    name: string;

    /**
     * 實例
     * @summary 當實例已在其他地方建立, 則使用此實例並跳過創建, 通常用在cc.component的單例
     */
    inst?: T;

    /**
     * 建構子
     */
    new(): T;
}