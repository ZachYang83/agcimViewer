/**
 * Class TerrainFlatten 地形压平类
 */
import AgFeatureLayer from "@/sdk/layer/featureLayer"
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);
class TerrainFlatten {
  /**
   * Creates an instance of TerrainFlatten.
   * @param {object} options 地形压平相关参数
   * @param {viewer} options.viewer 地图视图对象
   * @param {object} options.tileset 压平模型
   * @param {array} options.positions 压平区域坐标数组
   * @param {number} options.flatHeight 压平高度
   * @param {number} options.offsetZ 3d-tiles距离地面的高度
   * @memberof TerrainFlatten
   */
  constructor(options) {
    this.viewer = options.viewer;
    this._initialize();
    this.tileset = options.tileset;
    this.positions = options.positions;
    this._flatHeight = options.flatHeight || 0;
    this._offsetZ = options.offsetZ;
    if (this.positions)
      this._preparePos(this.positions)
    if (this.localPosArr)
      this._prepareWorks();
  }
  /**
   * @description 初始化函数
   * @memberof TerrainFlatten
   * @private
   */
  _initialize() {
    Object.defineProperty(this, "tileset", {
      get: function () {
        return this._tileset;
      },
      set: function (tileset) {
        this._tileset = tileset;
        var matrix = new Cesium.Matrix4;
        Cesium.Matrix4.fromArray(tileset._root.transform, 0, matrix);
        Cesium.Matrix4.inverse(matrix, matrix);
        this.tileInverTransform = matrix;
      }
    });
    Object.defineProperty(this, "flatHeight", {
      get: function () {
        return this._flatHeight
      },
      set: function (flatHeight) {
        this._flatHeight = Number(flatHeight);
      }
    });
    this.vs = "attribute vec3 position;\r\nvarying vec2 depth;\r\nvoid main()\r\n{\r\nvec4 pos = vec4(position.xyz,1.0);\r\ndepth = pos.zw;\r\npos.z = 0.0;\r\ngl_Position = czm_projection*pos;\r\n}";
    this.fs = "#ifdef GL_FRAGMENT_PRECISION_HIGH\r\n    precision highp float;\r\n#else\r\n    precision mediump float;\r\n#endif\r\n\r\n#define OES_texture_float_linear\r\n\r\nvarying vec2 depth;\r\n\r\nvec4 packDepth(float depth)\r\n{\r\n    vec4 enc = vec4(1.0, 255.0, 65025.0, 16581375.0) * depth;\r\n    enc = fract(enc);\r\n    enc -= enc.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);\r\n    return enc;\r\n}\r\n\r\nvoid main()\r\n{\r\n    float fDepth = (depth.x / 5000.0)/2.0 + 0.5;\r\n    gl_FragColor = packDepth(fDepth);\r\n}";
  }
  /**
   * @description 开始压平
   * @memberof TerrainFlatten
   */
  analysis() {
    CIM.flat.tilesEditor.fbo = this.fbo;
    CIM.flat.tilesEditor.polygonBounds.push(this.polygonBounds);
    CIM.flat.tilesEditor.IsYaPing = true;
    CIM.flat.tilesEditor.height.push(this.minLocalPos.z + this.flatHeight);//压平高度
    agFeatureLayer.addPrimitive(this);
  }
  /**
   * @description 渲染更新函数，每一帧自动调用
   * @param {object} frameState
   * @memberof TerrainFlatten
   */
  update(frameState) {
    if (!this.drawed) {
      this.drawed = true;
      var context = frameState.context;
      this._passState = this._passState || new Cesium.PassState(context);
      this._passState.framebuffer = this.fbo;
      this._passState.viewport = new Cesium.BoundingRectangle(0, 0, 4096, 4096);
      var uniformState = context.uniformState;
      uniformState.updateCamera(this._camera);
      uniformState.updatePass(this.drawCommand.pass);
      this.drawCommand.framebuffer = this.fbo;
      this.drawCommand.execute(context, this._passState);
    }
  }
  /**
   * @description 构建压平区域坐标数组
   * @param {array} positions 笛卡尔坐标数组
   * @memberof TerrainFlatten
   * @private
   */
  _preparePos(positions) {
    if (positions && positions.length != 0) {
      var minPos, pushPositions = [], minHeight = 99999;
      for (let i = 0; i < positions.length; i++) {
        var cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        var height = cartographic.height;
        var pushPos = Cesium.Matrix4.multiplyByPoint(this.tileInverTransform, positions[i], new Cesium.Cartesian3);
        //处理3d-tiles离地面的高度
        if (this._offsetZ != undefined)
          pushPos.z += this._offsetZ;
        //组织压平的区域
        pushPositions.push(pushPos);
        if (height < minHeight) {
          minHeight = height;
          minPos = pushPos
        }
      }
      this.minHeight = minHeight;
      //设置压平区域最低点
      this.minLocalPos = minPos;
      this.localPosArr = pushPositions;
    }
  }
  /**
   * @description 准备工作
   * @memberof TerrainFlatten
   * @private
   */
  _prepareWorks() {
    this._createTexture();
    this._createCommand();
  }
  /**
   * @description 创建贴图纹理
   * @memberof TerrainFlatten
   * @private
   */
  _createTexture() {
    var context = this.viewer.scene.context;
    var colorTextures = new Cesium.Texture({
      context: context,
      width: 4096,
      height: 4096,
      pixelFormat: Cesium.PixelFormat.RGBA,
      pixelDatatype: Cesium.PixelDatatype.FLOAT,
      sampler: new Cesium.Sampler({
        wrapS: Cesium.TextureWrap.CLAMP_TO_EDGE,
        wrapT: Cesium.TextureWrap.CLAMP_TO_EDGE,
        minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
        magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
      })
    });
    var depthStencilTexture = new Cesium.Texture({
      context: context,
      width: 4096,
      height: 4096,
      pixelFormat: Cesium.PixelFormat.DEPTH_STENCIL,
      pixelDatatype: Cesium.PixelDatatype.UNSIGNED_INT_24_8
    });
    this.fbo = new Cesium.Framebuffer({
      context: context,
      colorTextures: [colorTextures],
      depthStencilTexture: depthStencilTexture,
      destroyAttachments: false
    });
    this._fboClearCommand = new Cesium.ClearCommand({
      color: new Cesium.Color(0, 0, 0, 0),
      framebuffer: this.fbo
    });
  }
  /**
   * @description 创建渲染命令
   * @memberof TerrainFlatten
   * @private
   */
  _createCommand() {
    var context = this.viewer.scene.context;
    var polygon = this._createPolygonGeometry();
    var camera = this._createCamera();
    var shaderProgram = Cesium.ShaderProgram.fromCache({
      context: context,
      vertexShaderSource: this.vs,
      fragmentShaderSource: this.fs,
      attributeLocations: {
        position: 0
      }
    });
    //将压平区域转抽象为顶点
    var vertexArr = Cesium.VertexArray.fromGeometry({
      context: context,
      geometry: polygon,
      attributeLocations: shaderProgram._attributeLocations,
      bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
      interleave: true
    });
    var renderState = new Cesium.RenderState;
    renderState.depthTest.enabled = false;
    renderState.depthRange.near = -1e6;
    renderState.depthRange.far = 1e6;
    var rect = Cesium.BoundingRectangle.fromPoints(this.localPosArr, new Cesium.BoundingRectangle);
    camera.frustum.left = rect.x;
    camera.frustum.top = rect.y + rect.height;
    camera.frustum.right = rect.x + rect.width;
    camera.frustum.bottom = rect.y;
    this._camera = camera;
    this.polygonBounds = new Cesium.Cartesian4(camera.frustum.left, camera.frustum.bottom, camera.frustum.right, camera.frustum.top);
    console.log(this.polygonBounds);
    this.drawCommand = new Cesium.DrawCommand({
      boundingVolume: polygon.boundingVolume,
      primitiveType: Cesium.PrimitiveType.TRIANGLES,
      vertexArray: vertexArr,
      shaderProgram: shaderProgram,
      renderState: renderState,
      pass: Cesium.Pass.CESIUM_3D_TILE,
    })
  }
  /**
   * @description 创建多边形geometry
   * @memberof TerrainFlatten
   * @return polygon
   * @private
   */
  _createPolygonGeometry() {
    var polygon = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(this.localPosArr),
      perPositionHeight: true
    });
    return Cesium.PolygonGeometry.createGeometry(polygon);
  }
  /**
   * @description 创建相机
   * @returns camera
   * @memberof TerrainFlatten
   * @private
   */
  _createCamera() {
    return {
      viewMatrix: Cesium.Matrix4.IDENTITY,
      inverseViewMatrix: Cesium.Matrix4.IDENTITY,
      frustum: new Cesium.OrthographicOffCenterFrustum,
      positionCartographic: new Cesium.Cartographic,
      positionWC: new Cesium.Cartesian3,
      directionWC: Cesium.Cartesian3.UNIT_Z,
      upWC: Cesium.Cartesian3.UNIT_Y,
      rightWC: Cesium.Cartesian3.UNIT_X,
      viewProjectionMatrix: Cesium.Matrix4.IDENTITY
    }
  }
  /**
   * @description 移除压平
   * @memberof TerrainFlatten
   */
  remove() {
    if (this.viewer) {
      agFeatureLayer.removeAll();
      delete this.viewer;
    }
  }
  /**
   * @description 释放资源
   * @memberof TerrainFlatten
   */
  destroy() {
    CIM.flat.resetTilesEditor();
    delete this._tileset;
    delete this.tileInverTransform;
    delete this.drawCommand;
    delete this._passState;
    delete this.polygonBounds;
    delete this._fboClearCommand;
    delete this.fbo;
    delete this.localPosArr;
    delete this.minHeight;
    delete this.minLocalPos;
    delete this.positions;
    delete this._camera;
    delete this._external;
    delete this.drawed;
  }
}
export default TerrainFlatten;