import { FsmCtrl } from "./fsm_ctrl";

/**
 * 狀態機狀態
 */
export abstract class FsmState {
    /**
     * 編號
     */
    abstract get id(): number;

    /**
     * 控制器
     */
    protected _ctrl: FsmCtrl<any> = null;

    /**
     * 運行時間
     */
    private _ttl: number = 0;

    /**
     * 運行時間
     */
    public get ttl(): number { return this._ttl; }

    /**
     * 初始化
     * @param ctrl 控制器
     */
    public init(ctrl: FsmCtrl<any>): void {
        this._ctrl = ctrl;
    }

    /**
     * 關閉
     */
    public close(): void {
        this._ctrl = null;
    };

    /**
     * 更新
     * @summary 當前為此狀態時才會執行
     */
    public onUpdate(dt: number): void {
        this._ttl += dt;
    }

    /**
     * 進入狀態
     */
    public onEnter(...params: any[]): void {
        this._ttl = 0;
    }

    /**
     * 離開狀態
     */
    public onLeave(): void {}

    /**
     * 變更狀態
     * @param id 狀態編號
     * @param params 傳遞參數
     */
    protected changeState(id: number, ...params: any[]): void {
        this._ctrl.change(id, params);
    }
}