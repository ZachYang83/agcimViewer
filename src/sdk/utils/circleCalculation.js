import coordinate from "@/sdk/maths/coordinate.js"
export default {
    /**
     * @author: 张瀚
     * @description: 三点坐标求圆心和半径（平面）
     * @param {*} x1 第一个点的x和y
     * @param {*} y1
     * @param {*} x2
     * @param {*} y2
     * @param {*} x3
     * @param {*} y3
     * @return {*} 如果计算失败会返回undefined
     */
    threePointGetCircle(x1, y1, x2, y2, x3, y3) {
        let e = 2 * (x2 - x1);
        let f = 2 * (y2 - y1);
        let g = x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1;
        let a = 2 * (x3 - x2);
        let b = 2 * (y3 - y2);
        let c = x3 * x3 - x2 * x2 + y3 * y3 - y2 * y2;
        let x = (g * b - c * f) / (e * b - a * f)
        let y = (a * g - c * e) / (a * f - b * e)
        let r = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1))
        if (isNaN(x) || x == Infinity || x == -Infinity) {
            return undefined
        }
        return {
            x,
            y,
            r
        }
    },
    /**
     * @lastUpdateBy : 张瀚
     * @description: 三点坐标求圆心和半径（平面）
     * @param {*} cartesian1
     * @param {*} cartesian2
     * @param {*} cartesian3
     * @return {*}
     */
    threePointGetCircleByCartestian(cartesian1,cartesian2,cartesian3){
        let c1 = coordinate.cartesian3ToCartographic(cartesian1,"Degrees")
        let c2 = coordinate.cartesian3ToCartographic(cartesian2,"Degrees")
        let c3 = coordinate.cartesian3ToCartographic(cartesian3,"Degrees")
        return this.threePointGetCircle(c1.lng,c1.lat,c2.lng,c2.lat,c3.lng,c3.lat)
    },
    /**
     * @author: 张瀚
     * @description: 求圆上某一点的坐标（平面）
     * @param {*} x
     * @param {*} y
     * @param {*} r
     * @param {*} angle 角度，0-360度
     * @param {*} digits 位数，最多保留几位小数
     * @return {*}
     */
    getPointInCircle(x, y, r, angle,digits = 5) {
        let hd = angle * Math.PI / 180
        let i =  Math.pow(10,digits)
        return {
            x: x + r * (Math.round(Math.cos(hd) * i)) / i,
            y: y + r * (Math.round(Math.sin(hd) * i)) / i
        }
    }
}