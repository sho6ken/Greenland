import { NetBuf, NetCmd, NetConnOpt, NetEvent, NetHandler, NetHint, NetObj, NetReq, NetSocket, NetState } from "./network";

/**
 * 連線節點
 */
export class NetNode {
    /**
     * 連線狀態
     */
    private _state: NetState = NetState.Closed;

    /**
     * socket
     */
    private _socket: NetSocket = null;

    /**
     * socket是否準備完成
     */
    private _readied: boolean = false;

    /**
     * 數據處理
     */
    private _handler: NetHandler = null;

    /**
     * 介面顯示
     */
    private _hint: NetHint = null;

    /**
     * 請求列表
     */
    private _requests: NetReq[] = [];

    /**
     * 協議監聽列表
     */
    private _listeners = new Map<NetCmd, NetObj[]>();

    /**
     * 連線參數
     */
    private _connOpt: NetConnOpt = null;

    /**
     * 剩餘重連次數
     */
    private _count: number = 0;

    /**
     * 心跳計時器
     */
    private _beatTimer: number = -1;

    /**
     * 斷線計時器
     */
    private _disconnTimer: number = -1;

    /**
     * 重連計時器
     */
    private _reconnTimer: number = -1;

    /**
     * 初始化
     * @param handler 數據處理
     * @param hint 介面顯示
     */
    public init(socket: NetSocket, handler: NetHandler, hint?: NetHint): void {
        this._socket = socket;
        this._handler = handler;
        this._hint = hint;
    }

    /**
     * 連線
     * @param opt 連線參數
     */
    public connect(opt: NetConnOpt): boolean {
        let addr = opt.addr;

        if (this._state != NetState.Closed) {
            console.warn(`net node start conn to ${addr} failed, state illegal`);
            return false;
        }

        this._state = NetState.Connecting;
        this.setSocket();

        console.log(`net node start conn to ${addr}`);

        if (!this._socket.connect(opt)) {
            console.error(`net node start conn to ${addr} failed, socket conn err`);
            this._hint?.connecting(false);

            return false;
        }

        this._connOpt = opt;
        this._count = opt.count;

        return true;
    }

    /**
     * 配置socket
     */
    private setSocket(): void {
        if (!this._readied) {
            this._readied = true;

            this._socket.message = this.onMessage.bind(this);
            this._socket.connected = this.onConnected.bind(this);
            this._socket.error = this.onError.bind(this);
            this._socket.closed = this.onClosed.bind(this);
        }
    }

    /**
     * 發送訊息
     * @param cmd 協議編號
     * @param buf 數據內容
     */
    public send(cmd: NetCmd, buf: NetBuf): boolean {
        switch (this._state) {
            // 已連線
            case NetState.Connected:
                this._socket.send(JSON.stringify({ cmd: cmd, data: buf }));
                return true;

            // 連線中或是重送中
            case NetState.Connecting:
            case NetState.Resending:
                this._requests.push({ cmd: cmd, buf: buf, ans: null });
                return true;

            // 其他
            default:
                console.error(`net node send ${cmd} failed, socket conn err`);
                return false;
        }
    }

    /**
     * 發送請求
     * @param cmd 協議編號
     * @param buf 數據內容
     * @param ans 完成時回調
     * @param hint 是否需介面提示
     */
    public request(cmd: NetCmd, buf: NetBuf, ans: NetObj, hint: boolean = false): boolean {
        if (this._state == NetState.Connected) {
            this.send(cmd, buf);
        }

        this._requests.push({ cmd: cmd, buf: buf, ans: ans });

        hint && this._hint?.requesting(true);

        return true;
    }

    /**
     * 發送唯一請求
     * @param cmd 協議編號
     * @param buf 數據內容
     * @param ans 完成時回調
     * @param hint 是否需介面提示
     */
    public unique(cmd: NetCmd, buf: NetBuf, ans: NetObj, hint: boolean = false): boolean {
        for (const elm of this._requests) {
            if (elm.cmd == cmd) {
                console.warn(`net node unique ${cmd} failed, it's repeat`);
                return false;
            }
        }

        this.request(cmd, buf, ans, hint);
    }

    /**
     * 主動斷線
     * @param code 錯誤碼
     * @param reason 斷線原因
     */
    public close(code?: number, reason?: string): void {
        console.warn(`net node close by ${code}:${reason}`);

        this.clearTimers();

        this._socket.message = null;
        this._socket.connected = null;
        this._socket.error = null;
        this._socket.closed = null;

        this._listeners.forEach(elm => elm = []);
        this._listeners.clear();

        this._requests = [];

        this._readied = false;
        this._state = NetState.Closed;

        this._hint?.connecting(false);
        this._hint?.reconnecting(false);
        this._hint?.requesting(false);
    }

    /**
     * 收訊處理
     * @param buf 數據內容
     */
    private onMessage(buf: NetBuf): void {
        if (!this._handler.isLegal(buf)) {
            console.warn(`net node rcv illegal msg`, buf);
            return;
        }

        this.resetDisconn();
        this.resetBeat();

        let cmd = JSON.parse(buf as string).cmd;

        // 刪除對應的請求
        for (const idx in this._requests) {
            let elm = this._requests[idx];

            if (elm.cmd == cmd) {
                elm.ans.event.call(elm.ans.target, cmd, buf);
                this._requests.splice(Number(idx), 1);

                break;
            }
        }

        this._hint?.requesting(this._requests.length > 0);

        // 監聽回調
        let listener = this._listeners.get(cmd)
        listener?.forEach(elm => elm.event.call(elm.target, cmd, buf));
    }

    /**
     * 連線成功處理
     */
    private onConnected(event: any): void {
        console.log(`net node conn to ${this._connOpt.addr} succeed`);

        this.clearTimers();

        this._count = this._connOpt.count;
        this._state = NetState.Resending;

        this._hint?.connecting(false);
        this._hint?.reconnecting(false);

        let len = this._requests.length;
        this._hint?.requesting(len > 0);

        // 重連後訊息重送
        if (len > 0) {
            console.log(`net node start resend, size is ${len}`);
            this._requests.forEach(elm => this.send(elm.cmd, elm.buf), this);
        }

        this._state = NetState.Connected;
    }

    /**
     * 連線失敗處理
     */
    private onError(event: any): void {
        console.error(`net node on err`, event);
    }

    /**
     * 連線中斷處理
     */
    private onClosed(event: any): void {
        // 重連中
        if (this._reconnTimer != -1) {
            return;
        }

        this.clearTimers();

        // 重連次數用盡
        if (this._count <= 0) {
            console.warn(`net node close by reconn count run out`);
            this._state = NetState.Closed;

            return;
        }

        this._hint?.reconnecting(true);

        // 實作重連
        this._reconnTimer = window.setTimeout(() => {
            this._state = NetState.Closed;

            if (this._count <= 0) {
                console.warn(`net node run out of reconn count`);
                this.clearTimers();

                return;
            }

            console.log(`net node start reconn to ${this._connOpt.addr}, leave ${this._count}`);

            this._count--;
            this._socket.close();

            this.connect(this._connOpt);
        }, 5 * 1000);
    }

    /**
     * 註冊監聽
     * @param cmd 協議編號
     * @param event 協議事件
     * @param target 回調對象
     */
    public register(cmd: NetCmd, event: NetEvent, target?: any): void {
        if (!this._listeners.has(cmd)) {
            this._listeners.set(cmd, []);
        }

        this._listeners.get(cmd).push({ target: target, event: event });
    }

    /**
     * 重設心跳計時器
     */
    private resetBeat(): void {
        window.clearTimeout(this._beatTimer);

        this._beatTimer = window.setTimeout(() => {
            let { cmd, buf } = this._handler.getBeat();
            this.send(cmd, buf);
        }, 30 * 1000);
    }

    /**
     * 重設斷線計時器
     */
    private resetDisconn(): void {
        window.clearTimeout(this._disconnTimer);
        this._disconnTimer = window.setTimeout(() => this._socket.close(), 60 * 1000);
    }

    /**
     * 清空所有計時器
     */
    private clearTimers(): void {
        window.clearTimeout(this._beatTimer);
        this._beatTimer = -1;

        window.clearTimeout(this._disconnTimer);
        this._disconnTimer = -1;

        window.clearTimeout(this._reconnTimer);
        this._reconnTimer = -1;
    }
}