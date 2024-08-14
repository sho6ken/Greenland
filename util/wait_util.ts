import { Component } from "cc";

/**
 * 異步等待
 */
export class WaitUtil {
    /**
     * 毫秒
     */
    public static async waitMS(ms: number, cmpt?: Component): Promise<void> {
        cmpt ? await this.waitSec(ms / 1000, cmpt) : await new Promise(resolve => window.setTimeout(resolve, ms));
    }

    /**
     * 秒
     */
    public static async waitSec(sec: number, cmpt?: Component): Promise<void> {
        cmpt ? await new Promise(resolve => cmpt.scheduleOnce(resolve, sec)) : await this.waitMS(sec * 1000);
    }
}