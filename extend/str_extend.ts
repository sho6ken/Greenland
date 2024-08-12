/**
 * 字串擴展
 */
interface String {
    /**
     * 格式化
     * @example 
     * `{0}-{1}`.format(`a`, 9) -> a-9
     */
    format(...params: (string | number)[]): string;

    /**
     * 全部取代
     * @param passive 被取代
     * @param active 去取代
     */
    exchange(passive: string, active: string): string;
}

String.prototype.format = function(this: string, ...params: (string | number)[]): string {
    return this.replace(/\{(\d+)\}/g, (src, idx) => params[idx as string]);
}

String.prototype.exchange = function(this: string, passive: string, active: string): string {
    return this.replace(new RegExp(passive, `gm`), active);
}