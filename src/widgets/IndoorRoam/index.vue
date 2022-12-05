<template>
  <div class="firstView-control infoBox">
    <div class="firstView-Panel">
      <div class="first-div">移动速度:</div>
      <div class="first-div">
        <a-button type="primary" icon="minus" size="small" @click="speedReduce"></a-button>
      </div>
      <div class="first-div" id="speed">{{speed}}X</div>
      <div class="first-div">
        <a-button type="primary" icon="plus" size="small" @click="speedAdd"></a-button>
      </div>
      <div class="first-div">
        <a-checkbox :checked="isLockViewPoint" style="color: #fff;" @change="bindLockViewPoint">固定视点</a-checkbox>
      </div>
      <div class="first-div">
        <a-checkbox :checked="isOpenGravity" style="color: #fff;" @change="bindOpenGravity">重力</a-checkbox>
      </div>
      <div class="first-div">
        <a-checkbox :checked="isEyeViewer" style="color: #fff;" @change="bindEyeViewer">人眼视角</a-checkbox>
      </div>
      <div class="first-div">
        <!-- <a-checkbox :checked="isOpenGravity" style="color: #fff;" @change="bindOpenGravity">点击漫游</a-checkbox> -->
      </div>
      <div class="first-div">
        <a-button type="primary" size="small" @click="location">定位</a-button>
      </div>
      <div class="first-div">
        <a-button type="primary" size="small" @click="backCamera">返回视角</a-button>
      </div>
      <div class="first-div">
        <a-button type="primary" size="small" @click="onclose">关闭</a-button>
      </div>
    </div>
    <div style="overflow: hidden;width: 100%;">
      <br />
      <p>鼠标左键拖动改变位置，右键改变视角，或者用W,S,A,D,Q,E移动</p>
    </div>
    <div class="mouseStopDiv" v-show="curMouseMove==true">
      <a-icon type="plus" class="mouse" />
    </div>

    <!-- <div class="tileItems" style="float: left;">
        <div class="tileItem_tip">倾斜角</div>
        <div>
          <span>100</span>
          <span>90</span>
          <span>80</span>
          <span>70</span>
          <span>60</span>
        </div>
    </div>-->
  </div>
</template>
<script>
import agCamera from "@/sdk/camera/camera";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import camera from "@/sdk/camera/camera"

import coordinate from "@/sdk/maths/coordinate";
var viewer = null;
var handler = null;
var pickerHelper = null;

export default {
  name: "IndoorRoam",
  data() {
    return {
      checked: true,
      visible: true,
      speed: 1,
      _stepSize: 0.5,
      rangHeigth: 1.7,
      _pitchValue: -20,
      _isLocation: false,
      _startPosition: null,
      _endPosotion: null,
      _dragHandler: null,
      _keyDownHandler: null,
      isLockViewPoint: false,
      isOpenGravity: false,
      isEyeViewer: false,
      curMouseMove: false,
      _locationHandler: null,
      _originCameraInfo: null,
      _listenMouseMoveBind: null,
      _nextHeadingChangeDelta: 0,
      _locationCallback: null,
      isStart: false
    };
  },
  mounted() {
    this.Initialize();
  },
  methods: {
    Initialize() {
      viewer = CIM.viewer;
      pickerHelper = new PickerHelper(viewer);
      handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      this.setInputAction()
      this.setCameraController(false);
      this.bindKeyDown(viewer);
      this.isLockViewPoint = false;
      this.isOpenGravity = false;
      this.isEyeViewer = false;
      viewer.scene.pickTranslucentDepth = true;
    },
    // 点击减速按钮事件
    speedReduce() {
      var speed = this.speed;
      var speeds = [0.1, 0.2, 0.5, 0.8, 1, 1.5, 2, 2.5, 3, 5, 10];
      var t = speeds.indexOf(speed);
      if (t - 1 < 0) return;
      this.speed = speeds[t - 1];
    },
    // 点击增速按钮事件
    speedAdd() {
      var speed = this.speed;
      var speeds = [0.1, 0.2, 0.5, 0.8, 1, 1.5, 2, 2.5, 3, 5, 10];
      var t = speeds.indexOf(speed);
      if (t + 1 >= speeds.length) return;
      this.speed = speeds[t + 1];
      // _view.focus();
    },
    // 点击定位按钮事件
    location() {
      this._isLocation = true;
      this._originCameraInfo = {
        position: viewer.camera.position.clone(),
        heading: viewer.camera.heading,
        roll: viewer.camera.roll,
        pitch: viewer.camera.pitch
      }

    },
    //点击漫游
    clickAndRoam() {
      this._isClickAndRoam = true;
    },
    setInputAction() {

      if (handler == null || handler == undefined) {
        handler = new Cesium.ScreenSpaceEventHandler(CIM.viewer.canvas);
      }
      this.setInputActionLeftDown();
      this.setInputActionLeftUp();
      this.setInputActionRightDown();
      this.setInputActionRightUp();

    },
    //监听鼠标左键按下事件
    setInputActionLeftDown() {
      let _this = this;
      pickerHelper.on("LEFT_DOWN", function (event) {
        if (_this.curMouseMove == true) {
          return;
        }
        var position = viewer.scene.pickPosition(event.position);
        var cartographic = Cesium.Cartographic.fromCartesian(position);
        _this._startPosition = event.position;
        _this.isLeftDown = true;
        // _this.setInputActionMouseMove();
        // 点击定位按钮再点击地图时触发
        if (_this._isLocation == true) {
          _this._isLocation = false;
          _this.gotoCanmera(viewer, cartographic)

        }
      })
    },
    //监听鼠标左键弹起事件
    setInputActionLeftUp() {
      let _this = this;
      pickerHelper.on("LEFT_UP", function (event) {
        if (_this.curMouseMove == true) {
          return;
        }
        _this.isLeftDown = false;
        // pickerHelper.remove("MOUSE_MOVE");
        _this._endPosition = event.position;
        // 左键拖动改变事件
        _this.changePosition(viewer);
      })
    },
    setInputActionMouseMove() {
      let _this = this;
      _this.clientWidth = document.body.clientWidth;
      _this.clientHeight = document.body.clientHeight;
      _this.leftX = _this.clientWidth / 2 - 200 - 80;
      _this.rigthX = _this.clientWidth / 2 + 200 - 80;
      _this.topY = _this.clientHeight / 2 - 250;
      _this.bottomY = _this.clientHeight / 2 + 250;
      pickerHelper.on("MOUSE_MOVE", function (event) {
        if (_this.curMouseMove == true) {
          if (_this.leftX < event.endPosition.x && event.endPosition.x < _this.rigthX && _this.topY < event.endPosition.y && event.endPosition.y < _this.bottomY) {
            _this.isChangeAngle = false;

          } else {
            _this.isChangeAngle = true;
            // 左边
            if (event.endPosition.x < _this.leftX && event.endPosition.y > _this.topY && event.endPosition.y < _this.bottomY) {
              _this._startPosition = {};
              _this._startPosition.x = _this.leftX + (event.endPosition.x - _this.leftX) / 50;
              _this._startPosition.y = event.endPosition.y;
              _this._endPosition = {};
              _this._endPosition.x = _this.leftX;
              _this._endPosition.y = event.endPosition.y;
              _this.changeAngleType = "left";
            }
            // 右边
            if (event.endPosition.x > _this.rigthX && event.endPosition.y > _this.topY && event.endPosition.y < _this.bottomY) {
              _this._startPosition = {};
              _this._startPosition.x = _this.rigthX + (event.endPosition.x - _this.rigthX) / 50;
              _this._startPosition.y = event.endPosition.y;
              _this._endPosition = {};
              _this._endPosition.x = _this.rigthX;
              _this._endPosition.y = event.endPosition.y;
              _this.changeAngleType = "rigth";
            }
            // 上
            if (event.endPosition.y < _this.topY) {
              _this._startPosition = {};
              _this._startPosition.x = event.endPosition.x;
              _this._startPosition.y = _this.topY;
              _this._endPosition = {};
              _this._endPosition.x = event.endPosition.x;
              _this._endPosition.y = _this.topY - (event.endPosition.y - _this.topY) / 50;
              _this.changeAngleType = "up";
            }
            // 下
            if (event.endPosition.y > _this.bottomY) {
              _this._startPosition = {};
              _this._startPosition.x = event.endPosition.x;
              _this._startPosition.y = _this.bottomY;
              _this._endPosition = {};
              _this._endPosition.x = event.endPosition.x;
              _this._endPosition.y = _this.bottomY - (event.endPosition.y - _this.bottomY) / 50;
              _this.changeAngleType = "down";
            }
          }
          _this._curPosition = viewer.camera.position;
        }

      })
      _this.timer = setInterval(function () {
        if (!_this.curMouseMove) {
          clearInterval(_this.timer)
          _this.timer = undefined;
          return;
        }
        var pitch = Cesium.Math.toDegrees(viewer.camera.pitch);
        if ((pitch > 30 && _this.changeAngleType == "up") || (pitch < -60 && _this.changeAngleType == "down")) {
          return;
        }
        if (_this.curMouseMove == true && _this.isChangeAngle == true) {
          _this.changeAngle(viewer)
        }
      }, 10)
    },
    setInputActionRightDown() {
      let _this = this;
      pickerHelper.on("RIGHT_DOWN", function (event) {
        if (_this.curMouseMove == true) {
          return;
        }
        _this.isRigthDown = true;
        _this._curPosition = viewer.camera.position;
        // _this.setInputActionMouseMove();
        _this._startPosition = event.position;
      })
    },
    setInputActionRightUp() {
      let _this = this;
      pickerHelper.on("RIGHT_UP", function (event) {
        if (_this.curMouseMove == true) {
          return;
        }
        _this.isRigthDown = false;
        // _this.removeInputActionMouseMove();
        _this._endPosition = event.position;
        _this.changeAngle(viewer)
      })
    },
    /**改变视点位置***/
    changePosition: function (viewer) {
      var _this = this;
      var startPosition = this._startPosition;
      var endPosition = this._endPosition;
      var offsetX = (endPosition.x - startPosition.x) * 0.01;
      var offsetY = (endPosition.y - startPosition.y) * 0.01;
      var cartesian3 = viewer.camera.position;
      // 将相机坐标转换成投影坐标
      var cartesian = coordinate.cartesianToMercator(viewer, cartesian3);
      // 改变纵向
      var initialAngle = Cesium.Math.toDegrees(viewer.camera.heading);
      var angle = ((initialAngle * Math.PI) / 180);
      cartesian.x += offsetY * _this.speed * Math.sin(angle);
      cartesian.y += offsetY * _this.speed * Math.cos(angle);
      // 横向位置
      var initialAngle1 = 360 - Cesium.Math.toDegrees(viewer.camera.heading);
      var angle1 = ((initialAngle1 * Math.PI) / 180);
      cartesian.x -= offsetX * _this.speed * Math.cos(angle1);
      cartesian.y -= offsetX * _this.speed * Math.sin(angle1);
      // 将投影坐标转换成世界坐标
      var position = coordinate.mercatorToCartesian(viewer, cartesian);
      agCamera.setCamera(viewer, {
        position: position,
        heading: viewer.camera.heading,
        roll: viewer.camera.roll,
        pitch: viewer.camera.pitch
      })
    },
    /**改变视点角度***/
    changeAngle: function (viewer) {
      var startPosition = this._startPosition;
      var endPosition = this._endPosition;
      var offsetX = (endPosition.x - startPosition.x) * 0.03;
      var offsetY = (endPosition.y - startPosition.y) * 0.03;
      var pitch = viewer.camera.pitch + offsetY * Cesium.Math.toRadians(this.speed);
      var heading = viewer.camera.heading - offsetX * Cesium.Math.toRadians(this.speed);
      agCamera.setCamera(viewer, {
        position: viewer.camera.position,
        heading: heading,
        roll: viewer.camera.roll,
        pitch: pitch
      })
    },
    // 受重力影响下改变视点z值
    changeZValue(viewer, position) {
      if (this.isOpenGravity) {
        //将坐标转换成投影坐标 
        var cartesianS = coordinate.cartesianToMercator(viewer, position);
        var cartesianE = coordinate.cartesianToMercator(viewer, position);
        // 改变射线终点z值
        cartesianS.z += 1;
        cartesianE.z -= 100;
        // 将投影坐标转换成世界坐标
        var positionS = coordinate.mercatorToCartesian(viewer, cartesianS);
        var positionE = coordinate.mercatorToCartesian(viewer, cartesianE);
        // 计算射线方向
        var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(positionE, positionS, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // 创建射线
        var ray = new Cesium.Ray(positionS, direction);
        // var a = viewer.scene.pickFromRay(ray);
        var results = viewer.scene.drillPickFromRay(ray, 10);
        if (results && results.length) {
          position = results[0].position;

          if (this.isEyeViewer) {  //开启人眼视角
            var cartesian = coordinate.cartesianToMercator(viewer, position);
            cartesian.z += this.rangHeigth;
            position = coordinate.mercatorToCartesian(viewer, cartesian);
          }

          // for(var i=0;i<results.length;i++){
          //   if(i==0){
          //     viewer.entities.add({
          //         position: results[i].position,
          //         point: {
          //             pixelSize: 10,
          //             color: Cesium.Color.RED
          //         }
          //     });
          //   }
          // }
        }
      }
      return position;
    },
    // 点击时，人行视角定位
    gotoCanmera(viewer, cartographic) {
      var position = viewer.camera.position;
      var _rangHeigth = this.rangHeigth || 1.7;
      var _pitchValue = -2;
      if (cartographic) {
        if (cartographic.height < 0) {
          cartographic.height = 0
        }
        _rangHeigth += cartographic.height;
      } else {
        var cartographic = Cesium.Cartographic.fromCartesian(position);
      }
      var _cartographic = new Cesium.Cartographic(cartographic.longitude, cartographic.latitude, _rangHeigth);
      var _position = Cesium.Cartographic.toCartesian(_cartographic)
      var pitch = Cesium.Math.toRadians(_pitchValue);
      agCamera.setCamera(viewer, {
        position: _position,
        heading: viewer.camera.heading,
        roll: viewer.camera.roll,
        pitch: pitch
      })

    },
    /**点击固定视点按钮事件**/
    bindLockViewPoint() {
      this.isLockViewPoint = !this.isLockViewPoint;
    },
    /**点击重力按钮事件 **/
    bindOpenGravity() {
      this.isOpenGravity = !this.isOpenGravity;
    },
    /**点击人眼视觉按钮事件 **/
    bindEyeViewer() {
      this.isEyeViewer = !this.isEyeViewer;
      var scene = viewer.scene;
      if (this.isEyeViewer) {
        this.curMouseMove = true;
        this.setInputActionMouseMove();
        scene.screenSpaceCameraController.enableZoom = false;
      } else {
        this.clearEyeViewer();
        this.removeInputActionMouseMove();
        scene.screenSpaceCameraController.enableZoom = true;
      }
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = undefined;
      }
    },
    clearEyeViewer() {
      this.clearTimer();
      this.isEyeViewer = false;
      this.curMouseMove = false;
    },
    /**点击返回视角按钮事件**/
    backCamera() {
      if (this._originCameraInfo) {
        agCamera.setCamera(viewer, {
          position: this._originCameraInfo.position,
          heading: this._originCameraInfo.heading,
          roll: this._originCameraInfo.roll,
          pitch: this._originCameraInfo.pitch
        })
      }

    },
    /**
     * 绑定键盘按下事件
    * @param {*} viewer 地图viewer
    */
    bindKeyDown(viewer) {
      var _this = this;
      document.addEventListener("keydown", _this.addKeyDownListener,
        false
      );
    },
    /**
     * 监听键盘按下事件
    */
    addKeyDownListener(event) {
      event = event || window.event;
      var _this = this;
      var _view = viewer;
      // this.clearEyeViewer();
      if (_this.isLockViewPoint) {
        // 按下固定视角时
        switch (event.key) {
          case "s":
            event.stopPropagation();
            // ~低头事件
            if (Cesium.Math.toDegrees(_view.camera.pitch) > -90) {
              var pitch = _view.camera.pitch - Cesium.Math.toRadians(_this.speed)
              agCamera.setCamera(_view, {
                position: _view.camera.position,
                heading: _view.camera.heading,
                roll: _view.camera.roll,
                pitch: pitch
              })
            }
            break;
          case "w":
            event.stopPropagation();
            // ~抬头事件
            var pitch = _view.camera.pitch + Cesium.Math.toRadians(_this.speed)
            if (Cesium.Math.toDegrees(_view.camera.pitch) < 60) {
              agCamera.setCamera(_view, {
                position: _view.camera.position,
                heading: _view.camera.heading,
                roll: _view.camera.roll,
                pitch: pitch
              })
            }
            break;
          case "a":
            event.stopPropagation();
            // ~左转事件
            agCamera.setCamera(_view, {
              position: _view.camera.position,
              heading: _view.camera.heading - 1 * Cesium.Math.toRadians(_this.speed),
              roll: _view.camera.roll,
              pitch: _view.camera.pitch
            })
            break;
          case "d":
            // ~右转事件
            event.stopPropagation();
            agCamera.setCamera(_view, {
              position: _view.camera.position,
              heading: _view.camera.heading + 1 * Cesium.Math.toRadians(_this.speed),
              roll: _view.camera.roll,
              pitch: _view.camera.pitch
            })
            break;
          case "q":
            // 上移
            event.stopPropagation();
            _this._updatePosition(_view, "up");
            break;
          case "e":
            // 下移
            event.stopPropagation();
            _this._updatePosition(_view, "down");
            break;
        }
      } else {
        var _stepSize = 0.5;
        switch (event.key) {
          case "w":
            // 往前
            event.stopPropagation();
            _this._updatePosition(_view, "forward");

            break;
          case "s":
            // 往后
            event.stopPropagation();
            _this._updatePosition(_view, "back");
            break;
          case "a":
            // 往左
            event.stopPropagation();
            _this._updatePosition(_view, "left");
            break;
          case "d":
            // 往右
            event.stopPropagation();
            _this._updatePosition(_view, "rigth");
            break;
          case "q":
            // 往上
            event.stopPropagation();
            _this._updatePosition(_view, "up");
            break;
          case "e":
            //往下
            event.stopPropagation();
            _this._updatePosition(_view, "down");
            break;
        }
      }
    },
    // 非固定视点时,计算 键盘移动位置
    _updatePosition(_view, type) {
      var _this = this;
      var cartesian3 = _view.camera.position;
      var cartesian = coordinate.cartesianToMercator(_view, cartesian3);
      var multiple = 0.1;
      if (type == "left") {
        var initialAngle = 360 - Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x -= multiple * _this.speed * Math.cos(angle);
        cartesian.y -= multiple * _this.speed * Math.sin(angle);
      } else if (type == "rigth") {
        var initialAngle = 360 - Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x += multiple * _this.speed * Math.cos(angle);
        cartesian.y += multiple * _this.speed * Math.sin(angle);
      } else if (type == "up") {
        cartesian.z += multiple * _this.speed;
      } else if (type == "down") {
        cartesian.z -= multiple * _this.speed;
      } else if (type == "forward") {
        var initialAngle = Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x += multiple * _this.speed * Math.sin(angle);
        cartesian.y += multiple * _this.speed * Math.cos(angle);
      } else if (type == "back") {
        var initialAngle = Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x -= multiple * _this.speed * Math.sin(angle);
        cartesian.y -= multiple * _this.speed * Math.cos(angle);
      }
      var position = coordinate.mercatorToCartesian(_view, cartesian);

      if (type == "forward" || type == "back") {
        position = _this.changeZValue(_view, position);
      }
      agCamera.setCamera(_view, {
        position: position,
        heading: _view.camera.heading,
        roll: _view.camera.roll,
        pitch: _view.camera.pitch
      })
    },
    /**
     * 移除键盘按下事件
    */
    removeKeyDownListener() {
      var _this = this;
      document.removeEventListener("keydown", _this.addKeyDownListener,
        false);
    },
    /**
     * 设置控制相机操作事件，
    * @param {} isEnable true 或者 false
    */
    setCameraController(isEnable) {
        camera.setCameraController(viewer,{
         "enableRotate":isEnable,
         "enableTranslate":isEnable,
         "enableTilt":isEnable,
         "enableLook":isEnable,
         "enableZoom":true,
       })
    },
    removeInputActionLeftDown() {
      pickerHelper.remove("LEFT_DOWN");
    },
    removeInputActionLeftUp() {
      pickerHelper.remove("LEFT_UP");
    },
    removeInputActionMouseMove() {
      pickerHelper.remove("MOUSE_MOVE");
    },
    removeInputActionRigthDown() {
      pickerHelper.remove("RIGHT_DOWN");
    },
    removeInputActionRigthUp() {
      pickerHelper.remove("RIGHT_UP");
    },
    /**
     * 移除鼠标监听事件
    */
    removeScreenSpaceEvent() {
      this.removeInputActionLeftDown();
      this.removeInputActionLeftUp();
      this.removeInputActionMouseMove();
      this.removeInputActionRigthDown();
      this.removeInputActionRigthUp();
    },
    // 关闭事件
    onclose() {
      this.$store.state.mainBoxState = false;
      this.$options.parent.currentTabComponent = "";
      this.setCameraController(true);
      this.removeScreenSpaceEvent();
      this.removeKeyDownListener();
      viewer.scene.pickTranslucentDepth = true;
    },
  },
  destroyed() {
    this.onclose();
  }
};
</script>
<style src="./style.css" scoped></style>