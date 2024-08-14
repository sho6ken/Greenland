import { AudioClip, AudioSource, Tween } from "cc";
import { WaitUtil } from "../util/wait_util";
import { AudioCtrl } from "./audio_ctrl";

/**
 * 音樂控制
 */
export class BgmAudio extends AudioCtrl {
    /**
     * 音量
     */
    private _vol: number = 1;

    /**
     * 音量
     */
    public get vol(): number { return this._vol; }

    /**
     * 音量
     */
    public set vol(value: number) { this.setVol(value.limit(0, 1)); }

    /**
     * 緩動
     */
    private _tween: Tween<number> = null;

    /**
     * 初始化
     * @param player 播放元件
     * @param vol 音量
     */
    public init(player: AudioSource, vol: number = 1): void {
        super.init(player, vol);
        this._player.loop = true;
    }

    /**
     * 播放
     * @param audio 音源
     * @param fadeOut 停止漸變秒
     * @param fadeIn 播放漸變秒
     */
    public async play(audio: AudioClip, fadeOut: number = 0, fadeIn: number = 0): Promise<void> {
        await this.stop(fadeOut);

        this._player.clip = audio;
        this._player?.play();

        await this.fadeVol(fadeIn, 0, 1);
    }

    /**
     * 停止
     * @param fade 漸變秒
     */
    public async stop(fade: number = 0): Promise<void> {
        await this.fadeVol(fade, 1, 0);
        super.stop();
    }

    /**
     * 設定音量
     * @param vol 音量
     */
    private setVol(vol: number): void {
        this._vol = vol;
        this._player.volume = vol;
    }

    /**
     * 音量漸變
     * @param sec 秒數
     * @param from 開始值
     * @param to 結束值
     */
    private async fadeVol(sec: number, from: number, to: number): Promise<void> {
        this._tween?.stop();
        let rate = from;

        // 更新
        const execute = function(): void {
            this._player.volume = (this._vol * rate).limit(0, 1);
        }.bind(this);

        if (sec > 0) {
            this._tween = new Tween(rate);
            this._tween.to(sec, to, { onUpdate: execute() });
            this._tween.start();

            await WaitUtil.waitSec(sec);
        }
        else {
            rate = to;
            execute();
        }
    }
}