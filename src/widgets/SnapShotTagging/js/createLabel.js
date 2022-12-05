/**
 * 创建标签
 */
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer;
class AddLable {
  constructor() {
    this.viewer = null;
    this.label = null;
    this.data = [];
    agFeatureLayer = new AgFeatureLayer(CIM.viewer);
  }
  initialize(viewer, _labelObj) {
    this.viewer = viewer;
    let x = _labelObj.position.x;
    let y = _labelObj.position.y;
    let z = _labelObj.position.z;
    var position = _labelObj.position//new Cesium.Cartesian3(x, y, z);
    this.label = agFeatureLayer.addEntity({
      position: position,
      id: `label-${_labelObj.id}`,
      billboard: {
        width: 150,
        height: 150,
        image: this.createCanvas(150, 150, _labelObj.style.bgColor, {text: _labelObj.name, color: _labelObj.style.color, size: 25}),//pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 168).toDataURL(),//picture,
        scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e5, 0.3),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        // pixelOffset: new Cesium.Cartesian2(100, 0),
        // disableDepthTestDistance: Number.POSITIVE_INFINITY,  //解决受视角变化引起遮掩
      },
      otherInfo: _labelObj
    });
  }
  createCanvas(_width, _height, _themeColor, _fontStyle) {
    var mycanvas = document.createElement("canvas")
    mycanvas.width = _width
    mycanvas.height = _height
    let labelBoxHeight = _height/4 //标注牌匾外框高度
    mycanvas.style.border = "1px solid"
    var ctx = mycanvas.getContext("2d")
    ctx.strokeStyle = _themeColor
    ctx.fillStyle = _themeColor

    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(_width-10, 0)
    ctx.lineTo(_width-10, 0)
    ctx.lineTo(_width, 10)
    ctx.lineTo(_width, labelBoxHeight)
    ctx.lineTo(0, labelBoxHeight)
    ctx.closePath()
    ctx.fill()
    
    ctx.fillRect(_width/2-2, labelBoxHeight, 2, _height*4/5 - 15)
    ctx.arc(_width/2-1, _height-4, 4, 0, 2*Math.PI)
    ctx.fill()
    
    ctx.save()
    ctx.fillStyle = _fontStyle.color
    ctx.font = _fontStyle.size + "px sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(_fontStyle.text, _width/2, labelBoxHeight/2);

    ctx.beginPath()
    ctx.fillStyle = "orange"
    ctx.moveTo(0, labelBoxHeight-10)
    ctx.lineTo(10, labelBoxHeight)
    ctx.lineTo(0, labelBoxHeight)
    ctx.closePath()
    ctx.fill()

    return mycanvas
  }
  dispose() {
    agFeatureLayer.removeAll();
  }
}

export default new AddLable();