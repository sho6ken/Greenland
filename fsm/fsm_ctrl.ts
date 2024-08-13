import { FsmState } from "./fsm_state";

/**
 * 狀態機控制
 * @param T 狀態機所有者
 */
export class FsmCtrl<T extends Object> {
    /**
     * 名稱
     */
    private _name: string = null;

    /**
     * 名稱
     */
    public get name(): string { return this._name; }

    /**
     * 狀態機持有者
     */
    private _owner: T = null; 

    /**
     * 狀態機齒有者
     */
    public get owner(): T { return this._owner; }

    /**
     * 狀態列表
     */
    private _states = new Map<number, FsmState>();

    /**
     * 當前狀態
     */
    private _currState: FsmState = null;

    /**
     * 是否在運行中
     */
    public get running(): boolean { return this._currState != null; }

    /**
     * 當前狀態運行時間
     */
    private _currTtl: number = 0;

    /**
     * 當前狀態運行時間
     */
    public get currTtl(): number { return this._currTtl; }

    /**
     * 創建狀態機
     * @param name 名稱
     * @param owner 狀態機持有者
     * @param states 狀態列表
     */
    public static createFsm<T extends Object>(name: string, owner: T, ...states: FsmState[]): FsmCtrl<T> {
        if (!name || name.length <= 0) {
            console.error(`create fsm failed, name is null`);
            return;
        }

        if (!owner) {
            console.error(`create fsm ${name} failed, owner is null`);
            return;
        }

        if (!states || states.length <= 0) {
            console.error(`create fsm ${name} failed, states are null`);
            return;
        }

        let fsm = new FsmCtrl<T>();
        fsm._name = name;
        fsm._owner = owner;

        states.forEach(elm => {
            if (!elm) {
                console.error(`create fsm ${name} failed, state is null`);
                return;
            }

            let id = elm.id;

            if (fsm._states.has(id)) {
                console.error(`create fsm ${name} failed, state ${id} repeat`);
                return;
            }

            fsm._states.set(id, elm);
            elm.init(fsm);
        });

        return fsm;
    }

    /**
     * 關閉
     */
    public close(): void {
        this._owner = null;
        this._currState = null;

        this._states.forEach(elm => elm.close());
        this._states.clear();
    }

    /**
     * 更新
     * @param dt 
     */
    public update(dt: number): void {
        this._currTtl += dt;
        this._currState?.onUpdate(dt);
    }

    /**
     * 開始狀態
     * @param id 狀態編號
     * @param params 傳遞參數
     */
    public start(id: number, ...params: any[]): void {
        if (this.running) {
            console.error(`start fsm ${this.name} failed, it's running`);
            return;
        }

        this.doChange(id, params);
    }

    /**
     * 變更狀態
     * @param id 狀態編號
     * @param params 傳遞參數
     */
    public change(id: number, ...params: any[]): void {
        if (!this.running) {
            console.error(`change fsm ${this.name} failed, it's stop`);
            return;
        }

        this.doChange(id, params);
    }

    /**
     * 變更狀態
     * @param id 狀態編號
     * @param params 傳遞參數
     */
    private doChange(id: number, ...params: any[]): void {
        if (!this._states.has(id)) {
            console.error(`change fsm ${this.name} failed, state ${id} not found`);
            return;
        }

        let state = this._states.get(id);

        if (!state) {
            console.error(`change fsm ${this.name} failed, state ${id} is null`);
            return;
        }

        this._currTtl = 0;

        this._currState?.onLeave();
        this._currState = state;
        this._currState.onEnter(...params);
    }
}