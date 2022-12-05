/**
 * Class Color 颜色类
 */
class Color {
	constructor() {
		this.color = null;
	}
	/**
	 * 支持以下颜色值：
	 *  #000
	 *  #fff000
	 *  [105, 180, 105, 60 ]
	 *  rgba(0,1,3,0.5)
	 *  rgb(0,0,0)
	 * @param {string} name 颜色值，string || array 默认#000
	 * @returns {Color} 返回cesium的Color值
	 */
	getColor(name = '#000') {
		if (Array.isArray(name)) {
			this.color = Cesium.Color.fromBytes(...name);
		} else if (typeof name == 'string' && name.constructor == String) {
			this.color = Cesium.Color.fromCssColorString(name);
		} else {
			this.color = name;
		}
		return this.color;
	}

	/**
	 * 常用字符串颜色，转换成cesium的Color
	 * @param {object} jsonObject entity
	 * @returns {object} jsonObject entity
	 */
	checkColor(jsonObject) {
		let checkArr = [
			'fillColor',
			'outlineColor',
			'backgroundColor',
			'Color',
			'material',
		];
		for (let o in jsonObject) {
			for (let j in jsonObject[o]) {
				if (checkArr.indexOf(j) > -1) {
					let color = jsonObject[o][j];
					jsonObject[o][j] = this.getColor(color);
				}
			}
		}
		return jsonObject;
	}

	/**
	 * 释放资源
	 */
	dispose() {
		this.color = null;
	}
}

export default Color;
