import CryptoES from "crypto-es"

/**
 * 加解密
 */
export class EncryptUtil {
    /**
     * md5加密
     */
    public static toMD5(str: string): string {
        return CryptoES.MD5(str).toString();
    }

    /**
     * 
     * @returns iv(initialization vector)
     * @summary 一種固定長度的隨機數, 用於增強加密算法的安全性
     */
    public static getIV(str: string): CryptoES.lib.WordArray {
        return CryptoES.enc.Hex.parse(str);
    }

    /**
     * aes加密
     * @param iv this.getIV()
     */
    public static toAes(str: string, key?: string, iv?: CryptoES.lib.WordArray): string {
        return CryptoES.AES.encrypt(
            str,
            key,
            {
                iv: iv,
                format: this.formatter,
            }
        ).toString();
    }

    /**
     * aes解密
     * @param iv this.getIV()
     */
    public static fromAes(str: string, key?: string, iv?: CryptoES.lib.WordArray): string {
        const func = CryptoES.AES.decrypt(
            str,
            key,
            {
                iv: iv,
                format: this.formatter
            }
        );

        return func.toString(CryptoES.enc.Utf8);
    }

    /**
     * 
     */
    private static formatter = {
        /**
         * 
         */
        stringify: function(params: any) {
            const jsonObj: any = { ct: params.ciphertext.toString(CryptoES.enc.Base64) };

            if (params.iv) {
                jsonObj.iv = params.iv.toString();
            }

            if (params.salt) {
                jsonObj.s = params.salt.toString();
            }

            return JSON.stringify(jsonObj);
        },

        /**
         * 
         */
        parse: function(str: any) {
            const obj = JSON.parse(str);

            const params = CryptoES.lib.CipherParams.create(
                { ciphertext: CryptoES.enc.Base64.parse(obj.ct) }
            );

            if (obj.iv) {
                params.iv = CryptoES.enc.Hex.parse(obj.iv)
            }

            if (obj.s) {
                params.salt = CryptoES.enc.Hex.parse(obj.s)
            }

            return params;
        },
    };
}