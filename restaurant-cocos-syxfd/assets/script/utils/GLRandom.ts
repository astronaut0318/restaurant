export default class GL {
    private min: number = 0;
    private max: number = 0;
    private fenpei = null;
    /**
     * 构造函数
     * @param {object} opt
     * @param {number} opt.min 最小整数值
     * @param {number} opt.max 最大整数值
     * @param {Map} opt.fenpei 自定义概率 
     */
    constructor({ min, max, fenpei = new Map() }) {
        this.min = min;
        this.max = max;
        this.fenpei = fenpei;
    }

    /**
     * 可分配百分比
     */
    get baifenbi() {
        return (1 - this.peizhi) / (this.max - this.min - this.fenpei.size);
    }

    /**
     * 匹配百分比
     */
    get peizhi() {
        let result = 0;
        for (let i of this.fenpei.values()) {
            if (0 < i && i < 1) result += i;
        }
        return result;
    }


    /**
     * 随机数
     * @returns {number} [min,max)
     */
    random() {
        let t = 0, r = Math.random();
        for (let i = this.min; i < this.max; i++) {
            this.fenpei.has(i) ? t += this.fenpei.get(i) : t += this.baifenbi;
            if (t > r) return i;
        }
        return null;
    }
}