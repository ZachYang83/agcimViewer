import MovePrompt from "./movePrompt";
class CreatePolygon {
	constructor(viewer, style) {
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = viewer;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.polygon = null;
		this.polyline = null;
		this.positions = [];
		this.linePositions = [];
		this.style = style;
		this.state = 0; //1为新增 2为编辑 0为清除
		this.gonPointArr = [];
		this.modifyPoint = null;
		this.movePush = false;
		//初始化鼠标提示框
		this.prompt = new MovePrompt("containCesium");
		this.type = "polygon";
	}

	start(callBack) {
		var that = this;
		if (!this.handler) {
			this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		}
		if(!this.prompt){
			this.prompt = new MovePrompt("containCesium");
		}
		this.handler.setInputAction(function (evt) { //单机开始绘制
			var cartesian = that.getCatesian3FromPX(evt.position, that.viewer, []);
			if (!cartesian) return;
			if (that.movePush) {
				that.positions.pop();
				that.movePush = false;
			}
			that.positions.push(cartesian);
			var point = that.createPoint(cartesian);
			point.wz = that.positions.length - 1;
			that.gonPointArr.push(point);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) { //移动时绘制面

			if (that.positions.length < 1) {
				that.prompt.updatePrompt(evt.endPosition, "单击开始绘制");
				return;
			}
			that.prompt.updatePrompt(evt.endPosition, "双击结束，右键取消上一步");
			var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, []);
			if (that.positions.length >= 1) {
				if (!that.movePush) {
					that.positions.push(cartesian);
					that.movePush = true;
				} else {
					that.positions[that.positions.length - 1] = cartesian;
				}
				if (that.positions.length == 2) {
					if (!Cesium.defined(that.polyline)) {
						that.polyline = that.createPolyline();
					}
				}
				if (that.positions.length == 3) {
					if (!Cesium.defined(that.polygon)) {
						that.polygon = that.createPolygon(that.style);
						that.polygon.isFilter = true;
						that.polygon.objId = that.objId;
						if (that.polyline) that.polyline.show = false;
					}
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			if (!that.polyline && !that.polygon) return;
			that.positions.splice(that.positions.length - 2, 1);
			that.viewer.entities.remove(that.gonPointArr.pop());
			if (that.positions.length == 2) {
				if (that.polygon) {
					that.viewer.entities.remove(that.polygon);
					that.polygon = null;
					if (that.polyline) that.polyline.show = true;
				}
			}
			if (that.positions.length == 1) {
				if (that.polyline) {
					that.viewer.entities.remove(that.polyline);
					that.polyline = null;
				}
				that.prompt.updatePrompt(evt.endPosition, "单击开始绘制");
				that.positions = [];
				that.movePush = false;
			}

		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

		this.handler.setInputAction(function (evt) { //双击结束绘制
			if (!that.polygon) {
				return;
			}
			that.state = 1;
			that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
			that.viewer.trackedEntity = undefined;
			that.positions.pop();
			that.viewer.entities.remove(that.gonPointArr.pop());
			if (that.handler) {
				that.handler.destroy();
				that.handler = null;
			}
			that.movePush = false;
			if (that.prompt) {
				that.prompt.destroy();
				that.prompt = null;
			}
			if (callBack) callBack(that.polyline);
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}

	createByPositions(lnglatArr, callBack) {
		if (!lnglatArr) return;
		var positions = that.getCatesian3FromPX.lnglatArrToCartesianArr(lnglatArr);
		if (!positions) return;
		this.polygon = this.createPolygon();
		this.positions = positions;
		callBack(this.polygon);
		for (var i = 0; i < positions.length; i++) {
			var point = this.createPoint(positions[i]);
			point.isFilter = true;
			point.wz = this.gonPointArr.length;
			this.gonPointArr.push(point);
		}
		this.state = 1;
		this.polygon.objId = this.objId;
	}
	startModify() {
		if (this.state != 1 && this.state != 2) return; //表示还没绘制完成
		if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		var that = this;
		for (var i = 0; i < that.gonPointArr.length; i++) {
			var point = that.gonPointArr[i];
			if (point) point.show = true;
		}
		this.modifyHandler.setInputAction(function (evt) {
			var pick = that.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				if (!pick.id.objId)
					that.modifyPoint = pick.id;
				that.forbidDrawWorld(true);
			} else {
				for (var i = 0; i < that.gonPointArr.length; i++) {
					var point = that.gonPointArr[i];
					if (point) point.show = false;
				}
				if (that.modifyHandler) {
					that.modifyHandler.destroy();
					that.modifyHandler = null;
				}
				that.state = 2;
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		this.modifyHandler.setInputAction(function (evt) { //移动时绘制面
			if (that.positions.length < 1 || !that.modifyPoint) return;
			var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.polygon, that.modifyPoint]);
			if (cartesian) {
				that.modifyPoint.position.setValue(cartesian);
				that.modifyPosition = cartesian;  // todo 鼠标弹起时，cartecsian值为undefined 时用
				that.positions[that.modifyPoint.wz] = cartesian;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		this.modifyHandler.setInputAction(function (evt) {
			that.forbidDrawWorld(false);
			if (!that.modifyPoint) return;
			var cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.polygon, that.modifyPoint]);
			if (!cartesian && that.modifyPosition){
				cartesian = that.modifyPosition;
			};
			that.modifyPoint.position.setValue(cartesian);
			that.positions[that.modifyPoint.wz] = cartesian;
			that.modifyPoint = null;
			that.modifyPosition = null;
			that.forbidDrawWorld(false);
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
	}
	endModify(callback) {
		for (var i = 0; i < this.gonPointArr.length; i++) {
			var point = this.gonPointArr[i];
			if (point) point.show = false;
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		this.state = 2;
		if (callback) callback(this.polygon);
	}
	createPoint(position) {
		if (!position) return;
		return this.viewer.entities.add({
			position: position,
			point: {
				pixelSize: 5,
				color: Cesium.Color.YELLOW,
				outlineWidth: 2,
				outlineColor: Cesium.Color.DARKRED,
				disableDepthTestDistance: Number.POSITIVE_INFINITY
			},
			show: false
		});
	}
	createPolygon() {
		var that = this;
		var polygonObj = {
			polygon: {
				hierarchy: new Cesium.CallbackProperty(function () {
					return new Cesium.PolygonHierarchy(that.positions)
				}, false),
				heightReference: this.style.heightReference,
				show: true,
				fill: this.style.fill || true,
				material: this.style.material || Cesium.Color.WHITE,
				width: this.style.width || 3,
				outlineColor: this.style.outlineColor || Cesium.Color.BLACK,
				outlineWidth: this.style.outlineWidth || 1,
				outline: this.style.outline  || false
			}
		}
		if (!this.style.heightReference) {
			// polygonObj.polygon.height = 0; // 不贴地 必设
			polygonObj.polygon.perPositionHeight = true; // 启用点的真实高度
		}
		return this.viewer.entities.add(polygonObj);
	}
	createPolyline() {
		var that = this;
		return this.viewer.entities.add({
			polyline: {
				positions: new Cesium.CallbackProperty(function () {
					return that.positions
				}, false),
				clampToGround: this.style.clampToGround == undefined ? false : true,
				material: Cesium.Color.RED,
				width: 3
			}
		});
	}
	getPositions() {
		return this.positions;
	}
	getLnglats() {
		return cCesium.caratesianArrToLnglatArr(this.positions);
	}
	getAttr() {
		if (!this.polygon) return;
		var obj = {};
		var polygon = this.polygon.polygon;
		obj.fill = polygon.fill._value;
		obj.outline = polygon.outline._value;
		obj.outlineWidth = polygon.outlineWidth._value;
		obj.outlineColor = polygon.outlineColor._value;
		obj.clampToGround = line.clampToGround._value;
		obj.color = line.material.color._value;
		return obj;
	}
	remove() {
		if (this.polygon) {
			this.state = 0;
			this.viewer.entities.remove(this.polygon);
			this.polygon = null;
		}
	}
	setVisible(vis) {
		this.polygon.show = vis;
	}
	forbidDrawWorld(isForbid) {
		this.viewer.scene.screenSpaceCameraController.enableRotate = !isForbid;
		this.viewer.scene.screenSpaceCameraController.enableTilt = !isForbid;
		this.viewer.scene.screenSpaceCameraController.enableTranslate = !isForbid;
		this.viewer.scene.screenSpaceCameraController.enableInputs = !isForbid;
	}
	destroy() {
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		if (this.polygon) {
			this.viewer.entities.remove(this.polygon);
			this.polygon = null;
		}
		if (this.polyline) {
			this.viewer.entities.remove(this.polyline);
			this.polyline = null;
		}
		this.positions = [];
		// this.style = null;
		if (this.modifyPoint) {
			this.viewer.entities.remove(this.modifyPoint);
			this.modifyPoint = null;
		}
		for (var i = 0; i < this.gonPointArr.length; i++) {
			var point = this.gonPointArr[i];
			this.viewer.entities.remove(point);
		}
		this.gonPointArr = [];
		this.state = 0;
		if (this.prompt){
			this.prompt.destroy();
			this.prompt = undefined;
		} 
	}
	getCatesian3FromPX(px, viewer) {
		var picks = viewer.scene.drillPick(px);
		viewer.scene.render();
		var cartesian;
		var isOn3dtiles = false;
		for (var i = 0; i < picks.length; i++) {
			if ((picks[i] && picks[i].primitive) && picks[i].primitive instanceof Cesium.Cesium3DTileset) { //模型上拾取
				isOn3dtiles = true;
				break;
			}
		}
		if (isOn3dtiles) {
			cartesian = viewer.scene.pickPosition(px);
		} else {
			var ray = viewer.camera.getPickRay(px);
			if (!ray) return null;
			cartesian = viewer.scene.globe.pick(ray, viewer.scene);
		}
		return cartesian;
	}
	getEditAttr() {
		//设置可编辑的属性
		// 面的颜色
		var color = this.polygon.polygon.material.color._value;
		var colorAlpha = color.alpha;
		color = cUtil.color2rgba(color);
		color = cTool.rgba2hex(color);
		// 是否有边
		var outlineColor = this.polygon.polygon.outlineColor._value;
		outlineColor = cUtil.color2rgba(outlineColor);
		outlineColor = cTool.rgba2hex(outlineColor);
		return {
			color: color,
			colorAlpha: colorAlpha,
			//outline: this.polygon.polygon.outline === undefined ? false : true,
			//outlineColor: outlineColor,
			//outlineWidth: this.polygon.polygon.outlineWidth,
			// height: this.polygon.polygon.height,
			//extrudedHeight: this.polygon.polygon.extrudedHeight,
			//heightReference: this.polygon.polygon.heightReference._value == 1 ? true : false //是否贴地
		}
	}
	setColor(val, alpha) {
		if (!val) return;
		if (!alpha) alpha = this.polygon.polygon.material.color._value.alpha;
		if (this.polygon) {
			this.polygon.polygon.material.color = Cesium.Color.fromCssColorString(val).withAlpha(alpha);
		}
	}
	setOutline(val) {
		if (this.polygon) {
			this.polygon.polygon.height = 0;
			this.polygon.polygon.outline = val;
		}
	}
	setOutlineColor(val) {
		if (!val) return;
		if (this.polygon) {
			this.polygon.polygon.height = 0;
			this.polygon.polygon.outline = true;
			this.polygon.polygon.outlineColor = Cesium.Color.fromCssColorString(val);
		}
	}
	setHeight(val) {
		if (this.polygon) this.polygon.polygon.height = val;
	}
	setExtrudedHeight(val) {
		if (this.polygon) this.polygon.polygon.extrudedHeight = val;
	}
	setHeightReference(val) {
		var heightReference = (val == 1 ? Cesium.HeightReference.CLAMP_TO_GROUND : Cesium.HeightReference.NONE);
		if (this.polygon) this.polygon.polygon.heightReference = heightReference;
	}
	setOutlineWidth(val) {
		if (this.polygon) {
			this.polygon.polygon.height = 0;
			this.polygon.polygon.outline = true;
			this.polygon.polygon.outlineWidth = val;
		}
	}
	setColorAlpha(val) {
		if (!val) return;
		var color = this.polygon.polygon.material.color._value;
		color.alpha = 1; //防止变白
		color = cUtil.color2rgba(color);
		color = cTool.rgba2hex(color);
		this.setColor(color, val);
	}

}

export default CreatePolygon;
