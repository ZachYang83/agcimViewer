/*
 * @Author: your name
 * @Date: 2020-12-22 13:48:17
 * @LastEditTime: 2021-01-19 17:25:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agcimViewer\src\widgets\SunshineSimulation\index.js
 */
import clock from './js/clock';
var _this;
class SunshineSimulation {
	constructor() {
		this.viewer = null;
	}
	init(vm, viewer) {
		_this = this;
		_this.viewer = viewer;
		_this.mapActive(viewer);

		if (_this.clock) {
			clearInterval(_this.clock._interval);
			delete _this.clock;
		}
		_this.clock = new clock({
			el: 'clock',
			hour: 'timeHour',
			day: 'timeDay',
			skin: require('./js/clock.svg'),
			time: new Date().getTime(),
		});

		_this.clock.on('time-change', function(time) {
			vm.time = time;
			viewer.clock.currentTime = Cesium.JulianDate.fromDate(
				new Date(time)
			);
		});

		_this.set3dTileShadow(1); //设置3dtiles显示shadow
	}
	set3dTileShadow(isShow) {
		var arr = CIM.layerTree._aglayers;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i]._primitives.length > 0) {
				arr[i]._primitives[0].shadows = isShow;
			}
		}
	}
	updateTimebyEnvirment(vm) {
		_this.clock.mode = 'manual';
		var setdate = Cesium.JulianDate.toDate(CIM.viewer.clock.currentTime);
		setdate.setMonth(vm.month - 1);
		setdate.setDate(vm.day);
		_this.clock.time = setdate.getTime();
		CIM.viewer.clock.currentTime = Cesium.JulianDate.fromDate(
			new Date(setdate.getTime())
		);
	}
	mapActive(viewer) {
		viewer.scene.globe.enableLighting = true;
		viewer.shadows = true;
		viewer.shadowMap.softShadows = true;
		viewer.shadowMap.size = 131072;
		viewer.shadowMap.darkness = 0.6;
	}
	remove() {
		let viewer = this.viewer;
		viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
		if (_this.clock) {
			clearInterval(_this.clock._interval);
			delete _this.clock;
		}
		viewer.scene.globe.enableLighting = false;
		viewer.shadows = false;
		_this.set3dTileShadow(0);
	}
}
export default new SunshineSimulation();
