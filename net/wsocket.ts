import { NetBuf, NetConnOpt, NetSocket } from "./network";

/**
 * web socket
 */
export class WSocket implements NetSocket {
    /**
     * 收到訊息
     */
    public message: (buf: NetBuf) => void = null;

    /**
     * 連線成功 
     */
    public connected: (event: any) => void = null;

    /**
     * 發生錯誤 
     */
    public error: (event: any) => void = null;

    /**
     * 連線中斷
     */
    public closed: (event: any) => void = null;

    /**
     * socket
     */
    private _socket: WebSocket = null;

    /**
     * 連線
     * @param opt 連線參數
     */
    public connect(opt: NetConnOpt): boolean {
        let addr = opt.addr;

        if (this._socket && this._socket.readyState == WebSocket.CONNECTING) {
            console.warn(`ws start conn failed, ws is connecting`);
            return false;
        }

        this._socket = new WebSocket(new URL(addr));
        this._socket.binaryType = "arraybuffer";

        this._socket.onmessage = (event) => this.message(event.data);
        this._socket.onopen = this.connected;
        this._socket.onerror = this.error;
        this._socket.onclose = this.closed;

        console.log(`ws start conn to ${addr}`);

        return true;
    }

    /**
     * 發送訊息
     * @param buf 數據內容
     */
    public send(buf: NetBuf): boolean {
        if (!this._socket || this._socket.readyState != WebSocket.OPEN) {
            console.error(`ws send failed, ws is null`);
            return false;
        }

        this._socket.send(buf);

        return true;
    }

    /**
     * 發起斷線
     * @param code 錯誤代碼
     * @param reason 錯誤原因
     */
    public close(code?: number, reason?: string): void {
        console.log(`ws close by ${code}:${reason}`);
        this._socket?.close(code, reason);
    }
}