/**
 * js常用的方法
 * @namespace CommonUitls
 */
class CommonUitls {
    /**
     * 转码
     * @function str2Unicode
     * @memberof CommonUitls
     * @param {string} str 字符串
     */
    str2Unicode(str) {
        var es = [];
        for (var i = 0; i < str.length; i++)
            es[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
        return "\\u" + es.join("\\u");
    }
    /**
     * 获取当前时间
     * @function str2Unicode
     * @memberof CommonUitls 
     */
    getCurrentData() {
        return new Date().toLocaleDateString();
    }
    /**
     * 数字转百分数，保留n位小数
     * @param {number} number 传入的小数
     * @param {number} n 默认n=2
     */
    toPercent(number, n = 2) {
        var str = Number(number * 100).toFixed(n);
        str += '%';
        return str;
    }

     /**
     * 判断是否是数字
     * @param {number} val 要判断的值
     * @return {boolean} 是否为数字
     */
    isNumber(val) {
        // isNaN()函数会把空串、空格、以及NUll按照0来处理
        if (val === "" || val == null) {
            return false;
        }
        if (!isNaN(val)) {
            return true;
        }
        else {
            return false;
        }
    }


}
export default new CommonUitls();