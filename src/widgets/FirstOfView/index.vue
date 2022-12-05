<template>
  <div class="firstView-control infoBox">
    <div class="firstView-Panel">
      <div class="position-div">
        <a-button type="primary" class="button" @click="location" style="vertical-align: top">定位</a-button>
        <div style="display: inline-block;"  v-show="!showViewType">
          <p> 1、点击定位按钮 </p>
          <br>
          <p> 2、点击地图选定位视点 </p>
          <br>
          <p> 3、更多操作查看右上角帮助</p>
        </div>
        <p v-show="showViewType">
          移动步长：<a-input-number size="small" class="moveStepSty" v-model="moveStep" :step="0.2" :min="0"></a-input-number> 米
        </p>
        <p v-show="showViewType" style="margin-left: 30px;">
          转角速度：
          <a-button icon="minus" size="small" @click="speedReduce"></a-button>
          <span style="display: inline-block; width: 40px; text-align: center"> {{speed}}X  </span>
          <a-button icon="plus" size="small" @click="speedAdd"></a-button>
        </p>
        <p v-show="showViewType" style="margin-left: 30px;">
          左键滑动速度
          <a-button icon="minus" size="small" @click="speedReduce('mouseSpeed')"></a-button>
          <span style="display: inline-block; width: 35px; text-align: center"> {{mouseSpeed}}  </span>
          <a-button icon="plus" size="small" @click="speedAdd('mouseSpeed')"></a-button>
        </p>
        <div class="viewTypeSty">
          <!-- <a-radio-group v-model="viewType" @change="viewTypeChange" v-show="showViewType">
            <a-radio :style="radioStyle" value="isLockViewPoint">固定视点</a-radio>
            <a-radio :style="radioStyle" value="isOpenGravity">重力</a-radio>
            <a-radio :style="radioStyle" value="isEyeViewer">人眼视角</a-radio>
          </a-radio-group> -->
          <a-checkbox-group id="checkboxGroup" v-model="viewType" :options="viewTypeOptions" @change="viewTypeChange" v-show="showViewType" >
            <span slot="label" slot-scope="{ name }" style="color: #fff">{{ name }}</span>
        </a-checkbox-group>
        </div>
      </div>
      <div style="padding-top: 25px">
        <a-popover placement="topRight" v-model="tipVisible" trigger="click">
          <template slot="content">
            <h3>鼠标操作：</h3>
            <p style="padding: 0px 10px 0px 10px;">固定视点模式：鼠标右键改变视角方向</p>
            <p style="padding: 0px 10px 0px 10px;">非固定视点模式：鼠标左键拖动改变位置，右键改变视角</p>
            <p style="padding: 0px 10px 0px 10px; color: orange">注：鼠标操作幅度越大，行动幅度越大</p>
            <h3>键盘操作：</h3>
            <ul class="keyTipsSty">
              <li v-for="(item, index) in keyTips" :key="index.key">
                <div v-for="itm in item" :key="itm.key">
                  <p :style="{color: itm.color}">{{itm.key}}</p>
                  <p>{{itm.label}}</p>
                </div>
              </li>
            </ul>
          </template>
          <a-icon type="question-circle" class="questionIcon" />
        </a-popover>
        <a-button @click="backCamera" style="margin-right: 10px;">返回初始视角</a-button>
        <a-button type="danger" @click="onCancle">关闭</a-button>
      </div>
    </div>
    <div class="mouseStopDiv" v-show="curMouseMove==true">
      <a-icon type="plus" class="mouse" />
    </div>
  </div>
</template>
<script>
import agCamera from "@/sdk/camera/camera";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import camera from "@/sdk/camera/camera"
import coordinate from "@/sdk/maths/coordinate";
import agMath from "@/sdk/maths/math";
var viewer = null;
var pickerHelper= null;

export default {
  name: "FirstOfView",
  data() {
    return {
      checked: true,
      visible: true,
      speed: 1,
      mouseSpeed: 1.5,
      _stepSize: 0.5,
      rangHeigth: 1.7,
      _pitchValue: -20,
      _isLocation: false,
      _startPosition: null,
      _endPosition: null,
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
      isStart: false,
      flag: {
        heading: 0,
        pitch: 0,
        w: 0,
        a: 0,
        s: 0,
        d: 0,
        up: 0,
        down: 0,
        vUp: 0,
        vDown: 0,
        vLeft: 0,
        vRight: 0,
      },
      myReq: null,
      maxPitch: Cesium.Math.toRadians(90),
      minPitch: Cesium.Math.toRadians(-90),
      maxMultiple: 5,
      visionStep: 0,
      moveStep: 0.2,
      isLeftDown: false,
      isRightDown: false,
      viewType: [],
      showViewType: false,
      radioStyle: {
        color: '#fff'
      },
      viewTypeOptions: [
        {name: '固定视点', value: 'isLockViewPoint'},
        {name: '人眼视角', value: 'isEyeViewer'}
      ],
      keyTips: [
        [
          {key: 'Q', label: '左转', color: 'orange'},
          {key: 'W', label: '前进/仰视', color: 'blue'},
          {key: 'E', label: '右转', color: 'orange'},
        ],
        [
          {key: 'A', label: '向左', color: 'blue'},
          {key: 'S', label: '后退/俯视', color: 'blue'},
          {key: 'D', label: '向右', color: 'blue'},
        ],
        [
          {key: 'Z', label: '上升', color: 'purple'},
          {key: 'X', label: '开关固定视点', color: 'red'},
          {key: 'C', label: '下降', color: 'purple'},
        ]
      ],
      tipVisible: false,
      direction: null,
      canChange: false,
      timer2: null
    };
  },
  watch: {
    viewType(newVal, oldVal) {
      this.viewTypeChange(newVal)
    }
  },
  mounted() {
    this.Initialize();
  },
  methods: {
    Initialize() {
      viewer = CIM.viewer;
      pickerHelper = new PickerHelper(viewer);
      this.maxMultiple = 5;
      this.mouseSpeed = 1.5;
      //视角每帧转动的角度
      this.visionStep = 0.1;
      //视角每帧移动步长
      this.moveStep = 0.2;
      this.viewTypeChange([])
      this.showViewType = false;
      this.viewType = [];
      this.setCameraController(false);
      this.bindKeyDown(viewer); //绑定键盘事件
      viewer.scene.pickTranslucentDepth = true;

      this.clientWidth = document.body.clientWidth;
      this.clientHeight = document.body.clientHeight;
      this.leftX = this.clientWidth / 2 - 200;
      this.rigthX = this.clientWidth / 2 + 200 - 80;
      this.topY = this.clientHeight / 2 - 250;
      this.bottomY = this.clientHeight / 2 + 80;
    },
    viewTypeChange(e){
      this.clearEyeViewer();
      this.removeScreenSpaceEvent();
      this.setInputAction();
      this.curMouseMove = false;
      if (e.length === 1 && e.indexOf("isLockViewPoint") > -1) {
        this.bindLockViewPoint();
      }else if (e.length === 1 && e.indexOf("isEyeViewer") > -1) {
        this.bindEyeViewer();
      }else if(e.length > 1){ //固定视点、人眼视点全选
        this.bindEyeViewer();
      }
      
    },
    updateCamera() {
        this.myReq = requestAnimationFrame(() => {
            if(this.viewType === "isEyeViewer"){
              this.updateCamera()
              return;
            }
            let camera = viewer.camera
            let heading = camera.heading, pitch = camera.pitch, position
            //计算新的方向
            heading += this.flag.heading
            if (this.flag.vLeft) {
                heading -= Cesium.Math.toRadians(this.flag.vLeft)
                this.flag.vLeft = 0
            }
            if (this.flag.vRight) {
                heading += Cesium.Math.toRadians(this.flag.vRight)
                this.flag.vRight = 0
            }
            //计算新的俯仰角
            if (this.flag.pitch) {
                pitch += this.flag.pitch
            }
            if (this.flag.vUp) {
                pitch += Cesium.Math.toRadians(this.flag.vUp)
                this.flag.vUp = 0
            }
            if (this.flag.vDown) {
                pitch -= Cesium.Math.toRadians(this.flag.vDown)
                this.flag.vDown = 0
            }
            //视角有最大最小值
            pitch = Math.min(pitch,this.maxPitch)
            pitch = Math.max(pitch,this.minPitch)
            //计算新的位置
            let cartesian = coordinate.cartesianToMercator(viewer, camera.positionWC)
            let initialAngle, angle
            if (this.flag.w || this.flag.s || this.flag.a || this.flag.d) {
                initialAngle = Cesium.Math.toDegrees(camera.heading);
                angle = Cesium.Math.toRadians(initialAngle);
            }
            //计算前进距离
            if (this.flag.w) {
                cartesian.x += this.flag.w * Math.sin(angle);
                cartesian.y += this.flag.w * Math.cos(angle);
                this.flag.w = 0
            }
            //计算后退距离
            if (this.flag.s) {
                cartesian.x -= this.flag.s * Math.sin(angle);
                cartesian.y -= this.flag.s * Math.cos(angle);
                this.flag.s = 0
            }
            //左右移动的需要调整参数
            initialAngle = 360 - initialAngle
            angle = Cesium.Math.toRadians(initialAngle);
            //计算向左移动距离
            if (this.flag.a) {
                cartesian.x -= this.flag.a * Math.cos(angle);
                cartesian.y -= this.flag.a * Math.sin(angle);
                this.flag.a = 0
            }
            //计算向右移动距离
            if (this.flag.d) {
                cartesian.x += this.flag.d * Math.cos(angle);
                cartesian.y += this.flag.d * Math.sin(angle);
                this.flag.d = 0
            }
            position = coordinate.mercatorToCartesian(viewer, cartesian)
            //计算是否需要调整高度
            let temp
            if (this.flag.down || this.flag.up) {
                temp = coordinate.cartesian3ToCartographic(position, "Degrees")
            }
            //计算上升距离
            if (this.flag.up) {
                temp.alt += this.flag.up
                this.flag.up = 0
            }
            //计算下降距离
            if (this.flag.down) {
                temp.alt -= this.flag.down
                //不能低于最低视角
                temp.alt = Math.max(temp.alt,this.minVisionHeight)
                this.flag.down = 0
            }
            if (temp) {
                position = coordinate.cartographicToCartesian3(temp)
            }
            agCamera.setCamera(viewer, {
              position: position,
              heading: heading,
              roll: 0,
              pitch: pitch,
            });
            this.updateCamera()
        })
    },
    // 点击减速按钮事件
    speedReduce(type) {
      var speed = type ? this.mouseSpeed : this.speed;
      var speeds = [0.1, 0.2, 0.5, 0.8, 1, 1.5, 2, 2.5, 3, 5, 10];
      var t = speeds.indexOf(speed);
      if (t - 1 < 0) return;
      if (type) {
        this.mouseSpeed = speeds[t - 1];
        return;
      }
      this.speed = speeds[t - 1];
    },
    mouseSpeedReduce() {

    },
    // 点击增速按钮事件
    speedAdd(type) {
      var speed = type ? this.mouseSpeed : this.speed;
      var speeds = [0.1, 0.2, 0.5, 0.8, 1, 1.5, 2, 2.5, 3, 5, 10];
      var t = speeds.indexOf(speed);
      if (t + 1 >= speeds.length) return;
      if (type) {
        this.mouseSpeed = speeds[t + 1];
        return;
      }
      this.speed = speeds[t + 1];
      // _view.focus();
    },
    // 点击定位按钮事件
    location() {
      this._isLocation = true;
      this.viewType = []
      this._originCameraInfo = {
        position: viewer.camera.position.clone(),
        heading: viewer.camera.heading,
        roll: viewer.camera.roll,
        pitch: viewer.camera.pitch,
      };
      this.setInputAction();
    },
    //点击漫游
    clickAndRoam() {
      this._isClickAndRoam = true;
    },
    setInputAction() {
      this.setInputActionLeftDown();
      this.setInputActionLeftUp();
      this.setInputActionRightDown();
      this.setInputActionRightUp();
      this.setInputActionMove();
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
        // 点击定位按钮再点击地图时触发
        if (_this._isLocation == true) {
          _this._isLocation = false;
          _this.showViewType = true;
          _this.gotoCanmera(viewer, cartographic);
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
        _this._startPosition = event.position
      });
    },
    setInputActionMove() {
      pickerHelper.on('MOUSE_MOVE', this.lockViewAndGravityMouseMove)
    },
    lockViewAndGravityMouseMove(event) {
        if(this.isRightDown && (this.viewType.indexOf("isLockViewPoint") > -1 || !this.viewType.length)){ //固定视点 左键拖动不做操作
          viewer.scene.screenSpaceCameraController.enableTranslate = true;
          //右键按下时鼠标移动，视角移动
          if (!this._startPosition) {
              return
          }
          this.nowPosition = event.endPosition
          let dx = this.nowPosition.x - this._startPosition.x
          let dy = this.nowPosition.y - this._startPosition.y
          //鼠标拖动幅度越大越快,100以内不动
          let xp = Math.floor(Math.abs(dx) / 100)
          xp = Math.min(xp, this.maxMultiple)
          let yp = Math.floor(Math.abs(dy) / 100)
          yp = Math.min(yp, this.maxMultiple)
          //计算视角移动
          this.flag.heading = Cesium.Math.toRadians(dx > 0 ? this.visionStep : -this.visionStep) * xp
          this.flag.pitch = Cesium.Math.toRadians(dy > 0 ? -this.visionStep : this.visionStep) * yp
        }else if(this.isLeftDown && !this.viewType.length) {  //右键拖动
          this._endPosition = event.endPosition;
          // 左键按住拖动改变事件
          this.changePosition(viewer);
        }else{
          //监听鼠标位置
          let _this = this
          if (_this.canChange == true) {
            if (
              _this.leftX < event.endPosition.x &&
              event.endPosition.x < _this.rigthX &&
              _this.topY < event.endPosition.y &&
              event.endPosition.y < _this.bottomY
            ) {
              _this.isChangeAngle = false;
            } else {
              _this.isChangeAngle = true;
              // 左边
              if (
                event.endPosition.x < _this.leftX &&
                event.endPosition.y > _this.topY &&
                event.endPosition.y < _this.bottomY
              ) {
                _this._startPosition = {};
                _this._startPosition.x =
                  _this.leftX + (event.endPosition.x - _this.leftX) / 50;
                _this._startPosition.y = event.endPosition.y;
                _this._endPosition = {};
                _this._endPosition.x = _this.leftX;
                _this._endPosition.y = event.endPosition.y;
                _this.changeAngleType = "left";
              }
              // 右边
              if (
                event.endPosition.x > _this.rigthX &&
                event.endPosition.y > _this.topY &&
                event.endPosition.y < _this.bottomY
              ) {
                _this._startPosition = {};
                _this._startPosition.x =
                  _this.rigthX + (event.endPosition.x - _this.rigthX) / 50;
                _this._startPosition.y = event.endPosition.y;
                _this._endPosition = {};
                _this._endPosition.x = _this.rigthX;
                _this._endPosition.y = event.endPosition.y;
                _this.changeAngleType = "rigth";
              }
              if (_this.isChangeAngle == true) {
                _this.changeAngle(viewer);
              }
            }
          }
        }
    },
    setInputActionMouseMove() {
      let _this = this;
      _this.isChangeAngle = false;
      pickerHelper.on("MOUSE_MOVE", function (event) {
        if (_this.curMouseMove == true) {
          if (
            _this.leftX < event.endPosition.x &&
            event.endPosition.x < _this.rigthX &&
            _this.topY < event.endPosition.y &&
            event.endPosition.y < _this.bottomY
          ) {
            _this.isChangeAngle = false;
          } else {
            _this.isChangeAngle = true;
            // 左边
            if (
              event.endPosition.x < _this.leftX &&
              event.endPosition.y > _this.topY &&
              event.endPosition.y < _this.bottomY
            ) {
              _this._startPosition = {};
              _this._startPosition.x =
                _this.leftX + (event.endPosition.x - _this.leftX) / 50;
              _this._startPosition.y = event.endPosition.y;
              _this._endPosition = {};
              _this._endPosition.x = _this.leftX;
              _this._endPosition.y = event.endPosition.y;
              _this.changeAngleType = "left";
            }
            // 右边
            if (
              event.endPosition.x > _this.rigthX &&
              event.endPosition.y > _this.topY &&
              event.endPosition.y < _this.bottomY
            ) {
              _this._startPosition = {};
              _this._startPosition.x =
                _this.rigthX + (event.endPosition.x - _this.rigthX) / 50;
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
              _this._endPosition.y =
                _this.topY - (event.endPosition.y - _this.topY) / 10;
              _this.changeAngleType = "up";
            }
            // 下
            if (event.endPosition.y > _this.bottomY) {
              _this._startPosition = {};
              _this._startPosition.x = event.endPosition.x;
              _this._startPosition.y = _this.bottomY;
              _this._endPosition = {};
              _this._endPosition.x = event.endPosition.x;
              _this._endPosition.y =
                _this.bottomY - (event.endPosition.y - _this.bottomY) / 10;
              _this.changeAngleType = "down";
            }
          }
          _this._curPosition = viewer.camera.position;
        }
      });
      if(_this.timer){
        clearInterval(_this.timer);
      }
      _this.timer = setInterval(function () {
        if (!_this.curMouseMove) {
          clearInterval(_this.timer);
          _this.timer = undefined;
          return;
        }
        var pitch = Cesium.Math.toDegrees(viewer.camera.pitch);
        if (
          (pitch > 30 && _this.changeAngleType == "up") ||
          (pitch < -60 && _this.changeAngleType == "down")
        ) {
          return;
        }
        if (_this.curMouseMove == true && _this.isChangeAngle == true) {
          _this.changeAngle(viewer);
        }
      }, 10);
    },
    setInputActionRightDown() {
      let _this = this;
      pickerHelper.on("RIGHT_DOWN", (event)=>{
        if (_this.curMouseMove == true) {
          return;
        }
        if(this.viewType.indexOf("isLockViewPoint") > -1 || !this.viewType.length){
          //鼠标右键按下
          this._startPosition = event.position
        }
        // 鼠标右键控制重力功能左右转、俯仰动
        this.isRightDown = true
      })
    },
    setInputActionRightUp() {
      pickerHelper.on('RIGHT_UP', event => {
        if (this.curMouseMove == true) {
          return;
        }
          //鼠标右键抬起
          this.flag.heading = 0
          this.flag.pitch = 0
          this._startPosition = event.position
          this.isRightDown = false
      })
      /*
      let _this = this;
      pickerHelper.on("RIGHT_UP", function (event) {
        if (_this.curMouseMove == true) {
          return;
        }
        _this.isRigthDown = false;
        // _this.removeInputActionMouseMove();
        _this._endPosition = event.position;
        _this.changeAngle(viewer);
      });
      */
    },
    /**改变视点位置***/
    changePosition: function (viewer) {
      var _this = this;
      var startPosition = this._startPosition;
      var endPosition = this._endPosition;
      var offsetX = (endPosition.x - startPosition.x) * 0.0001 * this.mouseSpeed;
      var offsetY = (endPosition.y - startPosition.y) * 0.001 * this.mouseSpeed;
      var cartesian3 = viewer.camera.position;
      // 将相机坐标转换成投影坐标
      var cartesian = coordinate.cartesianToMercator(viewer, cartesian3);
      // 改变纵向
      var initialAngle = Cesium.Math.toDegrees(viewer.camera.heading);
      var angle = (initialAngle * Math.PI) / 180;
      cartesian.x += offsetY * _this.moveStep * Math.sin(angle);
      cartesian.y += offsetY * _this.moveStep * Math.cos(angle);
      // 横向位置
      var initialAngle1 = 360 - Cesium.Math.toDegrees(viewer.camera.heading);
      var angle1 = (initialAngle1 * Math.PI) / 180;

      if (offsetX>0 && offsetX>_this.moveStep) {
        offsetX = _this.moveStep;
      }
      if (offsetX<0 && Math.abs(offsetX)>_this.moveStep) { 
        offsetX = -_this.moveStep;
      }
      cartesian.x -= offsetX * Math.cos(angle1);
      cartesian.y -= offsetX * Math.sin(angle1);

      // 将投影坐标转换成世界坐标
      var position = coordinate.mercatorToCartesian(viewer, cartesian);
      agCamera.setCamera(viewer, {
        position: position,
        heading: viewer.camera.heading,
        roll: viewer.camera.roll,
        pitch: viewer.camera.pitch,
      });
    },
    /**改变视点角度***/
    changeAngle: function (viewer) {
      var startPosition = this._startPosition;
      var endPosition = this._endPosition;
      var offsetX = (endPosition.x - startPosition.x) * 0.05;
      var offsetY = (endPosition.y - startPosition.y) * 0.05;
      var pitch =
        viewer.camera.pitch + offsetY * Cesium.Math.toRadians(this.speed);
      var heading =
        viewer.camera.heading - offsetX * Cesium.Math.toRadians(this.speed);
      agCamera.setCamera(viewer, {
        position: viewer.camera.position,
        heading: heading,
        roll: viewer.camera.roll,
        pitch: pitch,
      });
    },
    // 受重力影响下改变视点z值
    changeZValue(viewer, position) {
      if (this.viewType.indexOf("isOpenGravity") > -1) {
        //将坐标转换成投影坐标
        var cartesianS = coordinate.cartesianToMercator(viewer, position);
        var cartesianE = coordinate.cartesianToMercator(viewer, position);
        // 改变射线终点z值
        cartesianS.z += 1;
        cartesianE.z -= 100;
        // 将投影坐标转换成世界坐标
        var positionS = coordinate.mercatorToCartesian(
          viewer,
          cartesianS
        );
        var positionE = coordinate.mercatorToCartesian(
          viewer,
          cartesianE
        );
        // 计算射线方向
        var direction = Cesium.Cartesian3.normalize(
          Cesium.Cartesian3.subtract(
            positionE,
            positionS,
            new Cesium.Cartesian3()
          ),
          new Cesium.Cartesian3()
        );
        // 创建射线
        var ray = new Cesium.Ray(positionS, direction);
        // var a = viewer.scene.pickFromRay(ray);
        var results = viewer.scene.drillPickFromRay(ray, 10);
        if (results && results.length) {
          position = results[0].position;

          if (this.viewType.indexOf("isEyeViewer") > -1) {
            //开启人眼视角
            var cartesian = coordinate.cartesianToMercator(
              viewer,
              position
            );
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
          cartographic.height = 0;
        }
        _rangHeigth += cartographic.height;
      } else {
        var cartographic = Cesium.Cartographic.fromCartesian(position);
      }
      var _cartographic = new Cesium.Cartographic(
        cartographic.longitude,
        cartographic.latitude,
        _rangHeigth
      );
      var _position = Cesium.Cartographic.toCartesian(_cartographic);
      var pitch = Cesium.Math.toRadians(_pitchValue);
      agCamera.setCamera(viewer, {
        position: _position,
        heading: viewer.camera.heading,
        roll: viewer.camera.roll,
        pitch: pitch,
      });
      this.updateCamera()
    },
    /**点击固定视点按钮事件**/
    bindLockViewPoint() {
      this.setCameraController(false);
    },
    /**点击重力按钮事件 **/
    bindOpenGravity() {
      this.setCameraController(false);
    },
    /**点击人眼视觉按钮事件 **/
    bindEyeViewer() {
      var scene = viewer.scene;
      if (this.viewType.indexOf("isEyeViewer") > -1) {
        this.curMouseMove = true;
        this.setInputActionMouseMove();
        scene.screenSpaceCameraController.enableZoom = false;
      }
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = undefined;
      }
    },
    clearEyeViewer() {
      this.clearTimer();
      this.isChangeAngle = false;
      this.curMouseMove = false;
    },
    /**点击返回初始视角按钮事件**/
    backCamera() {
      if (this._originCameraInfo) {
        agCamera.setCamera(viewer, {
          position: this._originCameraInfo.position,
          heading: this._originCameraInfo.heading,
          roll: this._originCameraInfo.roll,
          pitch: this._originCameraInfo.pitch,
        });
      }
      /* 初始视角高度如果大于200， 禁用固定视点、重力、人眼功能 */
      if(viewer.camera.positionCartographic.height.toFixed(1) > 200){
        this.setCameraController(false);
        cancelAnimationFrame(this.myReq)
        this.showViewType = false;
        this.removeScreenSpaceEvent();
        this.clearEyeViewer();
      }
    },
    /**
     * 绑定键盘按下事件
     * @param {*} viewer 地图viewer
     */
    bindKeyDown(viewer) {
      var _this = this;
      document.addEventListener("keydown", _this.addKeyDownListener, false);
      
      document.addEventListener("keyup", (event)=>{
        if(event.key === "w") {
          this.canChange = false
          clearInterval(_this.timer2);
        }
      });
    },
    /**
     * 监听键盘按下事件
     */
    addKeyDownListener(event) {
      event = event || window.event;
      var _this = this;
      var _view = viewer;
      if (_this.viewType.indexOf("isLockViewPoint") > -1) {
        // 按下固定视角时
        switch (event.key) {
          case "x":
            _this.viewType.forEach((item, index)=>{
              if(item === "isLockViewPoint") {
                _this.viewType.splice(index, 1)
              }
            })
            break;
          case "s":
            event.stopPropagation();
            // ~低头事件
            if (Cesium.Math.toDegrees(_view.camera.pitch) > -90) {
              var pitch =
                _view.camera.pitch - Cesium.Math.toRadians(_this.speed);
              agCamera.setCamera(_view, {
                position: _view.camera.position,
                heading: _view.camera.heading,
                roll: _view.camera.roll,
                pitch: pitch,
              });
            }
            break;
          case "w":
            event.stopPropagation();
            // ~抬头事件
            var pitch = _view.camera.pitch + Cesium.Math.toRadians(_this.speed);
            if (Cesium.Math.toDegrees(_view.camera.pitch) < 60) {
              agCamera.setCamera(_view, {
                position: _view.camera.position,
                heading: _view.camera.heading,
                roll: _view.camera.roll,
                pitch: pitch,
              });
            }
            break;
          case "q":
            event.stopPropagation();
            // ~左转事件
            agCamera.setCamera(_view, {
              position: _view.camera.position,
              heading:
                _view.camera.heading - 1 * Cesium.Math.toRadians(_this.speed),
              roll: _view.camera.roll,
              pitch: _view.camera.pitch,
            });
            break;
          case "e":
            // ~右转事件
            event.stopPropagation();
            agCamera.setCamera(_view, {
              position: _view.camera.position,
              heading:
                _view.camera.heading + 1 * Cesium.Math.toRadians(_this.speed),
              roll: _view.camera.roll,
              pitch: _view.camera.pitch,
            });
            break;
          case "z":
            // 上移
            event.stopPropagation();
            _this._updatePosition(_view, "up");
            break;
          case "c":
            // 下移
            event.stopPropagation();
            _this._updatePosition(_view, "down");
            break;
        }
      } else {
        var _stepSize = 0.5;
        switch (event.key) {
          case "x":
            _this.viewType.push("isLockViewPoint")
            break;
          case "v":
            /* 处于人眼模式下，视点会自动移动，按下Alt键锁定视点 */
            if (_this.viewType.indexOf("isEyeViewer") > -1) {
              if(_this.timer) {
                clearInterval(_this.timer);
                _this.timer = undefined
              }else{
                this.setInputActionMouseMove()
              }
            }
            break;
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
          case "z":
            // 往上
            event.stopPropagation();
            _this._updatePosition(_view, "up");
            break;
          case "c":
            //往下
            event.stopPropagation();
            _this._updatePosition(_view, "down");
            break;
          case "q":
            event.stopPropagation();
            // ~左转事件
            agCamera.setCamera(_view, {
              position: _view.camera.position,
              heading:
                _view.camera.heading - 1 * Cesium.Math.toRadians(_this.speed),
              roll: _view.camera.roll,
              pitch: _view.camera.pitch,
            });
            break;
          case "e":
            // ~右转事件
            console.log("这里不执行嘛")
            event.stopPropagation();
            agCamera.setCamera(_view, {
              position: _view.camera.position,
              heading:
                _view.camera.heading + 1 * Cesium.Math.toRadians(_this.speed),
              roll: _view.camera.roll,
              pitch: _view.camera.pitch,
            });
            break;
        }
      }
    },
    // 非固定视点时,计算 键盘移动位置
    _updatePosition(_view, type) {
      var _this = this;
      var cartesian3 = _view.camera.position;
      var cartesian = coordinate.cartesianToMercator(_view, cartesian3);
      var multiple = 1; //0.1;
      if (type == "left") {
        var initialAngle = 360 - Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x -= multiple * _this.moveStep * Math.cos(angle);
        cartesian.y -= multiple * _this.moveStep * Math.sin(angle);
      } else if (type == "rigth") {
        var initialAngle = 360 - Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x += multiple * _this.moveStep * Math.cos(angle);
        cartesian.y += multiple * _this.moveStep * Math.sin(angle);
      } else if (type == "up") {
        cartesian.z += multiple * _this.moveStep;
      } else if (type == "down") {
        cartesian.z -= multiple * _this.moveStep;
      } else if (type == "forward") {
        this.canChange = true
        this.isChangeAngle = true
        this.myTimer()
        var initialAngle = Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x += multiple * _this.moveStep * Math.sin(angle);
        cartesian.y += multiple * _this.moveStep * Math.cos(angle);
      } else if (type == "back") {
        var initialAngle = Cesium.Math.toDegrees(_view.camera.heading);
        var angle = Cesium.Math.toRadians(initialAngle);
        cartesian.x -= multiple * _this.moveStep * Math.sin(angle);
        cartesian.y -= multiple * _this.moveStep * Math.cos(angle);
      }
      var position = coordinate.mercatorToCartesian(_view, cartesian);

      if (type == "forward" || type == "back") {
        // position = _this.changeZValue(_view, position);
      }
      agCamera.setCamera(_view, {
        position: position,
        heading: _view.camera.heading,
        roll: _view.camera.roll,
        pitch: _view.camera.pitch,
      });
    },
    myTimer() {
      let _this = this
      clearInterval(_this.timer2);
      _this.timer2 = setInterval(function () {
        if (!_this.canChange) {
          clearInterval(_this.timer2);
          _this.timer2 = undefined;
          return;
        }
        var pitch = Cesium.Math.toDegrees(viewer.camera.pitch);
        if (
          (pitch > 30 && _this.changeAngleType == "up") ||
          (pitch < -60 && _this.changeAngleType == "down")
        ) {
          return;
        }
        if (_this.canChange == true && _this.isChangeAngle == true) {
          _this.changeAngle(viewer);
        }
      }, 10);
    },
    /**
     * 移除键盘按下事件
     */
    removeKeyDownListener() {
      var _this = this;
      document.removeEventListener("keydown", _this.addKeyDownListener, false);
      
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
         "enableZoom":isEnable,
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
    onCancle(){
      this.onclose();
      this.$emit("close", { code: "FirstOfView" });
    },
    onclose() {
      this.clearEyeViewer();
      cancelAnimationFrame(this.myReq);
      this.setCameraController(true);
      this.removeScreenSpaceEvent();
      this.removeKeyDownListener();
      viewer.scene.pickTranslucentDepth = true;
    },
  },
  destroyed() {
    this.onclose();
  },
};
</script>
<style src="./style.css" scoped></style>