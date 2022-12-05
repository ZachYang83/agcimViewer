/**
 * class PickerHelper
 */

class PickerHelper {
  constructor(viewer) {
    this.viewer = viewer;
    this._handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  }
  /**
   * @author: 张瀚
   * @description: 添加指定类型事件
   * @param {ScreenSpaceEventType[eventType]} eventType 事件的类型
   * @param {Function} handler 回调方法
   * @param {Number} moveInterval 鼠标移动事件的触发间隔毫秒数，变化超过间隔才会触发,可以极大节省性能并且提高有效帧率,默认0为不限制，建议为接近1000/屏幕刷新率的较小值
   * @return {*} 
   */
  on(eventType, handler, moveInterval = 10) {
    //针对鼠标移动事件做特殊处理
    if (eventType == 'MOUSE_MOVE') {
      this._addIntervalToMouseMove(handler, moveInterval)
      return this
    }
    if (eventType == "LEFT_DOUBLE_CLICK") {
      //移除系统默认的左键双击事件
      this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }
    this._handler.setInputAction(
      handler,
      Cesium.ScreenSpaceEventType[eventType]
    )
    //方便链式设置多个监听事件
    return this
  }
  /**
   * @author: 张瀚
   * @description: 针对鼠标移动事件触发太频繁导致的问题做优化，减少事件触发频率
   * @param {*} handler
   * @param {*} moveInterval 
   * @private
   */
  _addIntervalToMouseMove(handler, moveInterval = 10) {
    let lastMoveTime
    this._handler.setInputAction(event => {
      //针对鼠标移动时间做处理，减少触发频率，只有坐标改变或者间隔超过预设间隔才会触发
      if (moveInterval != 0) {
        //控制触发频率
        let now = Date.now()
        if (lastMoveTime && now - lastMoveTime < moveInterval) {
          return
        }
        lastMoveTime = now
      }
      handler(event)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }
  /**
   * 移除指定类型事件
   * @param {string} eventType 事件的类型，同cesium
   */
  remove(eventType) {
    if (!this._handler) return;
    this._handler.removeInputAction(Cesium.ScreenSpaceEventType[eventType]);
  }
  /**
   * 关闭事件
   */
  off() {
    if (this._handler.isDestroyed()) return;
    this._handler.destroy();
  }
  /**
   * @lastUpdateBy : 杨志坚
   * @description: 方法描述
   * @param {*} event 鼠标事件回调参数
   * @param {*} exclude 禁止鼠标拾取的对象数组
   * @param {number} limit 限制pick的数量,默认100
   * @return {Promise} resolve(result)
   *     result.screenPoint:屏幕笛卡尔2坐标
   *     result.groundPoint:射线和地面所交点的笛卡尔3坐标
   *     result.results:拾取的模型及坐标点
   */
  hitTest(event, exclude, limit = 100) {
    return new Promise((resolve, reject) => {
      let screenPoint = event.position || event.endPosition;
      let ray = this.viewer.camera.getPickRay(screenPoint);
      let posArr = this.viewer.scene.drillPickFromRay(ray, limit, exclude);
      if (posArr.length == 0) {
        reject()
        return
      }
      resolve({
        screenPoint,
        groundPoint: posArr.pop().position,
        results: posArr
      })
    })
  }
  /**
   * @deprecated 合并到hitTest
   * 获取鼠标拾取对象
   * @param {cartesian2} windowPosition 鼠标拾取屏幕点
   * @return {object} pickedFeature实体对象
   */
  getPickObject(windowPosition) {
    return this.viewer.scene.pick(windowPosition);
  }

  /**
   * @deprecated 合并到hitTest
   * 获取鼠标拾取点笛卡尔坐标，包括椭球体表面、模型表面
   * @param {object} pickedFeature 鼠标拾取对象
   * @param {string} entityName 鼠标拾取对象name
   * @param {cartesian2} windowPosition 鼠标拾取屏幕点
   * @return {cartesian3} 笛卡尔坐标
   */
  getPointByPick(pickedFeature, entityName, windowPosition) {
    var cartesian;
    if (!pickedFeature || (pickedFeature.id && pickedFeature.id.name == entityName)) {
      cartesian = this.getPositionByRay(windowPosition);
    } else {
      cartesian = this.getPickPosition(windowPosition);
    }
    return cartesian;
  }

  /**
   * @deprecated 合并到hitTest
   * 获取鼠标拾取点椭球体表面的笛卡尔坐标
   * 当加载DEM时获取的坐标误差较大
   * @param {cartesian2} windowPosition 鼠标拾取屏幕点
   * @return {cartesian3} 笛卡尔坐标
   */
  getPositionByEllipsoid(windowPosition) {
    return this.viewer.camera.pickEllipsoid(
      windowPosition,
      this.viewer.scene.globe.ellipsoid
    )
  }
  /**
   * @deprecated 合并到hitTest
   * 获取鼠标拾取点笛卡尔坐标
   * 获取的椭球体表面坐标误差较大
   * @param {cartesian2} windowPosition 鼠标拾取屏幕点
   * @return {cartesian3} 笛卡尔坐标
   */
  getPickPosition(windowPosition) {
    var cartesian = this.viewer.scene.pickPosition(windowPosition);
    return cartesian;
  }

  /**
   * 设置鼠标光标样式
   * @param {string} type 光标样式
   */
  setCursor(type) {
    this.viewer._element.style.cursor = type;
  }
  /**
   * @author: 张瀚
   * @description: 获取更精确的鼠标处笛卡尔坐标，根据在模型表面还是地面上选择不同的方式。
   * 注意：对于entity最边缘的一个像素，有可能会穿模，也即是虽然pick到了对象，但是实际上取点是视线连线和地面的交点，这是精确度的问题，暂时不知道怎么处理。
   * @param {*} windowPositionOrEvent 屏幕笛卡尔2坐标或者鼠标回调事件
   * @return {*} 笛卡尔坐标
   */
  getPreciseCartesian(windowPositionOrEvent) {
    //判断传入的是屏幕笛卡尔坐标2还是鼠标回调事件，如果是屏幕坐标就直接用，是鼠标事件就需要获取屏幕坐标
    let windowPosition = 'x' in windowPositionOrEvent ? windowPositionOrEvent : windowPositionOrEvent.position || windowPositionOrEvent.endPosition
    if (this.viewer.scene.pickPositionSupported && this.viewer.scene.drillPick(windowPosition, 1, 1, 1).length > 0) {
      //拾取模型上坐标,有可能是undefined的，如果对象是没有深度的例如point的话。
      return this.viewer.scene.pickPosition(windowPosition)
    }
    //通过射线拾取地面坐标
    return this.getPositionByRay(windowPosition)
  }
  /**
   * @author: 张瀚
   * @description: 通过射线获取鼠标拾取点椭球体表面的笛卡尔坐标,当加载DEM时，利用该方法获取的坐标更精确
   * @param {Cartesian2} windowPositionOrEvent 屏幕笛卡尔2坐标或者鼠标回调事件
   * @return {cartesian3}
   */
  getPositionByRay(windowPositionOrEvent) {
    //判断传入的是屏幕笛卡尔坐标2还是鼠标回调事件，如果是屏幕坐标就直接用，是鼠标事件就需要获取屏幕坐标
    let windowPosition = 'x' in windowPositionOrEvent ? windowPositionOrEvent : windowPositionOrEvent.position || windowPositionOrEvent.endPosition
    var scene = this.viewer.scene
    var ray = this.viewer.camera.getPickRay(windowPosition)
    return scene.globe.pick(ray, scene)
  }
  /**
   * @lastUpdateBy : 张瀚
   * @description: 移除所有类型的监听事件，也可以顺便帮助重置鼠标到默认，方便重用而不需要重新创建
   * @param {*} resetCursor 是否要重置鼠标，默认true
   * @return {*}
   */
  reset(resetCursor = true) {
    for (let type in Cesium.ScreenSpaceEventType) {
      this._handler.removeInputAction(Cesium.ScreenSpaceEventType[type]);
    }
    if (resetCursor) {
      this.setCursor("default")
    }
  }
  /**
   * @lastUpdateBy : 张瀚
   * @description: 执行一次鼠标选取坐标点操作，用于替代使用频率非常高的代码块，且方便使用await形成读起来更加通顺的代码。使用后会移除添加的两三个事件（左键单击/双击、移动（如果有）、右键单击）。
   * @param {Boolean 可选} isLeftDoubleClick 默认true代表左键双击选中结束操作，false代表左键单击结束操作。鼠标右键是取消。
   * @param {Function 可选} moveCallback 如果传了此方法，鼠标每次移动时会触发，获取当前鼠标处的Cartesian3坐标和event事件。
   * @return {Promise} resolve和reject都会返回一个对象，字段：
   * - position：Cartesian3坐标
   * - event：鼠标事件
   */
  pickOnce(isLeftDoubleClick = true, moveCallback) {
    //一定会有右键取消事件
    let typeList = ["RIGHT_CLICK"]
    //根据参数决定是左键完成选取还是左键双击完成选取
    typeList.push(isLeftDoubleClick ? "LEFT_DOUBLE_CLICK" : "LEFT_CLICK")
    //根据是否有回调决定是否添加移动事件
    if (moveCallback) {
      typeList.push("MOUSE_MOVE")
    }
    return new Promise((resolve, reject) => {
      typeList.forEach((type, index) => {
        switch (index) {
          case 0:
            //右键取消
            this.on(type, event => {
              reject({
                position: this.getPreciseCartesian(event),
                event
              })
              typeList.forEach(type => this.remove(type))
            })
            break
          case 1:
            //确认事件，可能是左键单击也可能是左键双击
            this.on(type, event => {
              resolve({
                position: this.getPreciseCartesian(event),
                event
              })
              typeList.forEach(type => this.remove(type))
            })
            break
          case 2:
            //鼠标移动事件，可能是没有的，如果没传回调的话
            this.on(type, event => {
              moveCallback(this.getPreciseCartesian(event), event)
            })
            break
        }
      })
    })
  }
  /**
   * @author: 潘文周 
   * @description: 在某点垂直方向做射线拾取(静态方法)
   * @param {cartesian3} startPoint 起点
   * @param {*} option 
   * @return {*} 笛卡尔坐标
   */
  static verticalDrillPickFromRay(viewer, startPoint, option = {}) {
    let areaCartographic = Cesium.Cartographic.fromCartesian(startPoint);
    let endPoint = Cesium.Cartesian3.fromRadians(areaCartographic.longitude, areaCartographic.latitude, 100);
    return PickerHelper.axisDrillPickFromRay(viewer, startPoint, endPoint, option)
  }
  /**
  * @author: 潘文周
  * @description: 连接起点和终点做射线拾取 (静态方法)
  * @param {cartesian3} startPoint 起点
  * @param {cartesian3} endPoint 终点
  * @param {*} option 
  * @return {*} 笛卡尔坐标
  */
  static axisDrillPickFromRay(viewer, startPoint, endPoint, option = {}) {
    var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(startPoint, endPoint, new Cesium.Cartesian3()), new Cesium.Cartesian3());
    var ray = new Cesium.Ray(endPoint, direction);
    return viewer.scene.drillPickFromRay(ray, option.limit, option.objectsToExclude, option.width);
  }

}
export default PickerHelper