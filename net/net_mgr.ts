import { Singleton } from "../single/singleton";
import { NetNode } from "./net_node";
import { NetBuf, NetCmd, NetConnOpt, NetObj } from "./network";

/**
 * 連線管理
 */
export class NetMgr implements Singleton {
    /**
     * 名稱
     */
    public get name(): string { return this.constructor.name; }

    /**
     * 不做釋放
     */
    public get hold(): boolean { return true; }

    /**
     * 頻道
     */
    private _channels = new Map<number, NetNode>();

    /**
     * 初始化
     */
    public init(): void {}

    /**
     * 
     */
    public free(): void {
        Array.from(this._channels.keys()).forEach(key => this.remove(key), this);; 
        this._channels.clear();
    }

    /**
     * 清理
     */
    public clear(): void {}

    /**
     * 新增頻道
     */
    public add(node: NetNode, id: number = 0): boolean {
        if (this._channels.has(id)) {
            console.error(`net mgr add failed, channel ${id} repeat`);
            return false;
        }

        this._channels.set(id, node);

        return true;
    }

    /**
     * 移除頻道
     */
    public remove(id: number = 0): boolean {
        if (!this._channels.has(id)) {
            console.error(`net mgr remove failed, channel ${id} not found`);
            return false;
        }

        let channel = this._channels.get(id);
        channel = null;

        return this._channels.delete(id);
    }

    /**
     * 開始連線
     * @param opt 連線參數
     */
    public connect(opt: NetConnOpt, id: number = 0): boolean {
        let channel = this._channels.get(id);

        if (!channel) {
            console.error(`net mgr connect to ${opt.addr} failed, channel ${id} not found`);
            return false;
        }

        return channel.connect(opt);
    }

    /**
     * 發送訊息
     * @param cmd 協議編號
     * @param buf 數據內容
     */
    public send(cmd: NetCmd, buf: NetBuf, id: number = 0): boolean {
        let channel = this._channels.get(id);

        if (!channel) {
            console.error(`net mgr send ${cmd} failed, channel ${id} not found`);
            return false;
        }

        return channel.send(cmd, buf);
    }

    /**
     * 發送請求
     * @param cmd 協議編號
     * @param buf 數據內容
     * @param ans 完成時回調
     * @param hint 是否需介面提示
     */
    public request(cmd: NetCmd, buf: NetBuf, ans: NetObj, hint: boolean = false, id: number = 0): boolean {
        let channel = this._channels.get(id);

        if (!channel) {
            console.error(`net mgr request ${cmd} failed, channel ${id} not found`);
            return false;
        }

        return channel.request(cmd, buf, ans, hint);
    }

    /**
     * 發送唯一請求
     * @param cmd 協議編號
     * @param buf 數據內容
     * @param ans 完成時回調
     * @param hint 是否需介面提示
     */
    public unique(cmd: NetCmd, buf: NetBuf, ans: NetObj, hint: boolean = false, id: number = 0): boolean {
        let channel = this._channels.get(id);

        if (!channel) {
            console.error(`net mgr unique ${cmd} failed, channel ${id} not found`);
            return false;
        }

        return channel.unique(cmd, buf, ans, hint);
    }
}