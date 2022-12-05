import AgFeatureLayer from "./featureLayer";
import axiosWraper from "@/views/js/net/axiosWraper"
/**
 *  Class 3DTilesLayer  3d tiles图层
 */
class Ag3DTilesLayer extends AgFeatureLayer {
  /**
   * @constructor
   * @param {Object} viewer 
   */
  constructor(viewer) {
    super(viewer);
    this.viewer = viewer;
    this._tileVisibleCallback = undefined
    this._customShader = undefined
  }
  /** 
   * 添加一个网络的服务，可以检测代理情况
   * @param {string} url 
   * @param {Object} option 常规的tileset的选项
   * @return {Object} 返回tileset对象
   */
  add(url, tileSetOption, styleId) {
    var nurl = axiosWraper.getProxyUrl(url);
    var option = {
      url: nurl,
      //最大的屏幕空间误差，数值越大，需要靠的越近才渲染下一级,性能压力也会越小，默认16
      maximumScreenSpaceError: 16,
      //最大使用的GPU内存量(MB)，内存不够的话会主动释放一部分视野外的,默认512
      maximumMemoryUsage: 2048,
      //关闭阴影
      shadows: Cesium.ShadowMode.ENABLED,
      //是否预加载镜头移动目的地上的瓦片
      preloadFlightDestinations: true,
      //先渲染子叶
      preferLeaves: true,
      //跳过一些细节内容，启用这个后面的几个配置才有效
      skipLevelOfDetail: true,
      //只请求所需渲染的内容，开启可以极大的提升性能,会跳过所有中间级别直接到最后效果，需要精确控制则用后面两个参数
      immediatelyLoadDesiredLevelOfDetail: true,
      //指定要跳过的最小误差，用于精确控制跳过范围
      skipScreenSpaceErrorFactor: 10000,
      //要跳过的级别，会跳过此级别以内的，用于精确控制跳过范围
      skipLevels: 100,
      //预加载可见节点的相邻节点
      loadSiblings: true,
      //全屏渲染后才会清晰化房屋
      dynamicScreenSpaceError: true,
      //摄像头停止移动后多少秒开始加载新数据,0代表立刻
      foveatedTimeDelay: 0.1,
    };
    if (tileSetOption) {
      for (var name in tileSetOption) {
        option[name] = tileSetOption[name];
      }
    }
    var item = new Cesium.Cesium3DTileset(option);
    super.addPrimitive(item);
    if (styleId) {
      this.setConfigStyle(item, styleId);
    }
    return item;
  }

  /**
   * 加载默认的样式
   * @param {Object} tileset 
   * @param {string} url 
   */
  loadDefaultStyle(tileset, url) {
    var prm = axiosWraper.getData(axiosWraper.getSibleFileUrl(url, "tileset.config.json"));
    prm.then(function (data) {
      if (data.tileStyle) {
        var style = new Cesium.Cesium3DTileStyle(data.tileStyle);
        tileset.style = style;
      }
    })
  }
  /**
   * 设置后台配置的样式
   * @param {object} tileset tileset
   * @param {string} styleId 样式id
   */
  setConfigStyle(tileset, styleId) {
    let _t = this;
    var prm = axiosWraper.getData('/agsupport-rest/agsupport/stylemanager/findById', {
      'id': styleId
    });
    prm.then(function (data) {
      if (data.success && data.content && data.content.information) {
        let str = data.content.information;
        if (str.indexOf("{") == 0) {
          var style = new Cesium.Cesium3DTileStyle(JSON.parse(str));
          tileset.style = style;
        } else {
          tileset.style = null;
          _t.setCustomShader(tileset, str);
        }
      }
    })
  }
  /**
   * 初始化事件方法
   * @private
   */
  _initVisibleEvent(tileset) {
    if (!this._tileVisibleCallback) {
      this._tileVisibleCallback = tileset.tileVisible.addEventListener(
        this._updateTile,
        this
      )
    }
  }

  /**
   * 更新瓦片
   * @param tile
   * @private
   */
  _updateTile(tile) {
    let content = tile.content
    for (let i = 0; i < content.featuresLength; i++) {
      let feature = content.getFeature(i)
      let model = feature.content._model
      // sets properties
      if (this._properties && this._properties.length) {
        this._properties.forEach(property => {
          if (
            feature.hasProperty(property['key']) &&
            feature.getProperty(property['key']) === property['keyValue']
          ) {
            feature.setProperty(
              property['propertyName'],
              property['propertyValue']
            )
          }
        })
      }
      // sets customShader
      if (
        this._customShader &&
        model &&
        model._sourcePrograms &&
        model._rendererResources
      ) {
        Object.keys(model._sourcePrograms).forEach(key => {
          let program = model._sourcePrograms[key]
          model._rendererResources.sourceShaders[
            program.fragmentShader
          ] = this._customShader
        })
        model._shouldRegenerateShaders = true
      }
    }
  }
  /**
   * 设置FShader样式
   * @param customShader
   * @returns {Tileset}
   */
  setCustomShader(tileset, customShader) {
    this._customShader = customShader
    this._initVisibleEvent(tileset)
    return this
  }
  /**
   * 设置对象的位置
   * @param {object} tileset tileset
   * @param {number} latitude 纬度
   * @param {number} longitude 经度
   * @param {number} height 高度
   */
  setPosition(tileset, latitude, longitude, height) {
    // 模型加载完毕后的回调
    tileset.readyPromise
      .then(function (tileset) {
        //agFeatureLayer.addPrimitive(tileset)
        // 1、旋转
        let hpr = new Cesium.Matrix3();
        // new Cesium.HeadingPitchRoll(heading, pitch, roll)
        // heading围绕负z轴的旋转。pitch是围绕负y轴的旋转。Roll是围绕正x轴的旋转
        let hprObj = new Cesium.HeadingPitchRoll(Math.PI, Math.PI, Math.PI);

        //  Cesium.Matrix3.fromHeadingPitchRoll （headingPitchRoll，result）
        hpr = Cesium.Matrix3.fromHeadingPitchRoll(hprObj, hpr);
        // 2、平移
        // 2.3储存平移的结果
        let modelMatrix = Cesium.Matrix4.multiplyByTranslation(
          // 2.1从以度为单位的经度和纬度值返回Cartesian3位置
          // 2.2计算4x4变换矩阵
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
          ),
          new Cesium.Cartesian3(),
          new Cesium.Matrix4()
        );
        /// 3、应用旋转
        // Cesium.Matrix4.multiplyByMatrix3 （矩阵，旋转，结果）
        Cesium.Matrix4.multiplyByMatrix3(modelMatrix, hpr, modelMatrix);
        tileset._root.transform = modelMatrix;
      })
      .otherwise(function (error) {
        console.log(error);
      });
  }
}
export default Ag3DTilesLayer;