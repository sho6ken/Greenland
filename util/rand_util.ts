/**
 * 隨機
 */
export class RandUtil {
    /**
     * 隨機整數
     * @param max 不含
     * @param min 含
     */
    public static randInt(max: number, min: number = 0): number {
        max = Math.floor(max);
        min =  Math.ceil(min);

        return Math.floor(this.randFloat(max, min));
    }

    /**
     * 隨機浮點數
     * @param max 不含
     * @param min 含
     */
    public static randFloat(max: number, min: number = 0): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * 是否在隨機百分比內
     * @param value 不含
     */
    public static randRate(value: number): boolean {
        return this.randFloat(100) < value;
    }

    /**
     * 隨機權重
     * @param weights 權重列表
     * @returns weights索引
     */
    public static randWeight(weights: number[]): number {
        if (!weights || weights.length <= 0) {
            console.error(`rand weight failed, weights are null`);
            return -1;
        }

        let len = weights.length;
        let sum = 0;

        weights.forEach(elm => {
            if (elm <= 0) {
                console.error(`rand weight failed, weight ${elm} illegal`);
                return -1;
            }

            sum += elm;
        });

        let rand = this.randFloat(sum);
        let curr = 0;

        for (let i = 0; i < len; i++) {
            curr += weights[i];

            if (curr > rand) {
                return i
            }
        }

        return len - 1;
    }

    /**
     * 亂數種子
     * @returns 0~1
     */
    public static randSeed(value: number): number {
        if (value == 0) {
            console.warn(`rand seed is null`);
            value = Date.now();
        }

        return (value * 16807) % 2147483647 / 2147483647;
    }
}