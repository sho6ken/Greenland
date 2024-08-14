import { AudioClip, AudioSource } from "cc";
import { AudioCtrl } from "./audio_ctrl";

/**
 * 音效控制
 */
export class SfxAudio extends AudioCtrl {
    /**
     * 初始化
     * @param player 播放元件
     * @param vol 音量
     */
    public init(player: AudioSource, vol: number = 1): void {
        super.init(player, vol);
        this._player.loop = false;
    }

    /**
     * 播放
     */
    public play(audio: AudioClip): void {
        if (this.paused) {
            return;
        }

        this._player.playOneShot(audio);
    }
}