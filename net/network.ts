/**
 * 數據類型
 */
export type NetBuf = string | ArrayBufferLike | Blob | ArrayBufferView;

/**
 * 協議編號
 */
export type NetCmd = string;

/**
 * 協議事件
 */
export type NetEvent = (cmd: NetCmd, buf: NetBuf) => void;

/**
 * 連線物件
 */
export interface NetObj {
    /**
     * 調用對象
     */
    target: any;

    /**
     * 回調事件
     */
    event: NetEvent;
}

/**
 * 協議請求
 */
export interface NetReq {
    /**
     * 編號
     */
    cmd: NetCmd;

    /**
     * 數據
     */
    buf: NetBuf;

    /**
     * 完成回調
     */
    ans: NetObj;
}

/**
 * 數據處理
 */
export interface NetHandler {
    /**
     * 數據是否合法
     */
    isLegal(buf: NetBuf): boolean;

    /**
     * 取得心跳包
     */
    getBeat(): { cmd: NetCmd, buf: NetBuf }
}

/**
 * 連線參數
 */
export interface NetConnOpt {
    /**
     * 連線位置
     */
    addr: string;

    /**
     * 重連次數
     */
    count: number;
}

/**
 * socket接口
 */
export interface NetSocket {
    /**
     * 收到訊息
     */
    message: (buf: NetBuf) => void;

    /**
     * 連線成功 
     */
    connected: (event: any) => void;

    /**
     * 發生錯誤 
     */
    error: (event: any) => void;

    /**
     * 連線中斷
     */
    closed: (event: any) => void;

    /**
     * 連線
     * @param opt 連線參數
     */
    connect(opt: NetConnOpt): boolean;

    /**
     * 發送訊息
     * @param buf 數據內容
     */
    send(buf: NetBuf): boolean;

    /**
     * 發起斷線
     * @param code 錯誤代碼
     * @param reason 錯誤原因
     */
    close(code?: number, reason?: string): void;
}

/**
 * 連線狀態
 */
export enum NetState {
    Closed,      // 已斷線
    Connecting,  // 連線中
    Connected,   // 已連線
    Resending,   // 訊息重送中
}

/**
 * 連線提示
 * @summary 介面提示接口
 */
export interface NetHint {
    /**
     * 連線中
     */
    connecting(value: boolean): void;

    /**
     * 重連中
     */
    reconnecting(value: boolean): void;

    /**
     * 請求中
     */
    requesting(value: boolean): void;
}