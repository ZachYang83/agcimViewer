/**
 *  class ColorRamp 色带
 */
class ColorRamp {
	constructor(samples) {
		let _samples = [
			{
				'0.2': 'rgba(35,164,235,1)',
				'0.3': 'rgba(28,235,168,1)',
				'0.4': 'rgba(15,255,0,1)',
				'0.6': 'rgba(255,255,0,1)',
				'0.8': 'rgba(255,126,0,1)',
				'0.95': 'rgba(255,73,0,1)',
				'1': 'rgba(243,55,17,1)',
			},
		];
		this.samples = samples || _samples;
		this._imageData = null;
	}
	/**
	 * 根据sample对象创建颜色值
	 * @param {number} index 色带条数组下标index
	 */
	buildFromSample(index) {
		var paletteCanvas = document.createElement('canvas');
		var paletteCtx = paletteCanvas.getContext('2d');
		var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
		var sample = this.samples[index];
		for (let key in sample) {
			gradient.addColorStop(key, sample[key]);
		}
		paletteCtx.fillStyle = gradient;
		paletteCtx.fillRect(0, 0, 256, 1);
		this._imageData = paletteCtx.getImageData(0, 0, 256, 1).data;
	}
	/**
	 * 获取颜色数组值
	 * @param {*} radio 0-1
	 * @param {*} colorAlpha 颜色透明度
	 * @returns {array} 颜色数组
	 */
	getColor(radio, colorAlpha) {
		var index = parseInt(radio * 255 * 4);
		var a = this._imageData[index + 3];
		if (colorAlpha) a = radio;
		return [
			this._imageData[index],
			this._imageData[index + 1],
			this._imageData[index + 2],
			a,
		];
	}
}

export default ColorRamp;
