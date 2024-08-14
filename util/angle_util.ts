import { Vec2 } from "cc";

/**
 * 角度
 */
export class AngleUtil {
    /**
     * 角度轉弧度
     * @param angle 
     */
    public static toRadian(angle: number): number {
        return angle * Math.PI / 180;
    }

    /**
     * 弧度轉角度
     * @param radian 
     */
    public static toAngle(radian: number): number {
        return radian * 180 / Math.PI;
    }

    /**
     * 角度取sin值
     * @param angle 
     */
    public static angleSin(angle: number): number {
        return Math.sin(this.toRadian(angle));
    }

    /**
     * 角度取cos值
     * @param angle 
     */
    public static angleCos(angle: number): number {
        return Math.cos(this.toRadian(angle));
    }

    /**
     * 兩向量取夾角
     * @param v1 
     * @param v2 
     */
    public static vecAngle(v1: Vec2, v2: Vec2): number {
        return this.toAngle(v2.signAngle(v1));
    }
}