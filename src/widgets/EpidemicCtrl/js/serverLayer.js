import agPointLayer from "@/sdk/layer/pointLayer";
import cesLayer from "@/sdk/layer/cesLayer.js";
import agCamera from "@/sdk/camera/camera.js";

class ServerLayer {
    constructor() {
        this.defaultColor = new Cesium.Color(255, 255, 255);
        this._wfsLayerUrl = "http://192.168.3.203:8080/geoserver/agcim/ows?service=WFS";
        this.viewer = null;
    }
    /**
     * 添加小区图层
     * @param {*} typeName 
     * @param {*} filter 
     */
    addCommunityLayer(typeName, filter) {
        let viewer = this.viewer;
        cesLayer.addWFSLayer(
            this._wfsLayerUrl,
            "epidmicCtrlLayer",
            "agcim:" + typeName,
            {
                cql_filter: filter
            },
            function (dataSource) {
                agPointLayer.addFromDataSource(viewer, dataSource);
            }
        );
    }

    /**
     * 根据数据来添加节点
     * @param {*} dataSource 
     */
    addCommunityLayerByPoints(dataSource){
        agPointLayer.addFromDataSource(viewer, dataSource);
    }
    /**
     * 移除小区图层
     */
    removeCommunityLayer(){
        agPointLayer.removeAll( this.viewer);
    }

    setExtractWithColor(entities, colorHash, heigthHash) {
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let properties = entity.properties;
            let ProvinceNa = properties.ProvinceNa._value;
            let code = Number(properties.Code._value);
            let color = colorHash[code];
            let height = heigthHash[code] || 0;
            if (!color) {
                color = this.defaultColor;
                height = 0;
            }
            entity.polygon.material = color;
            entity.polygon.outline = true;
            entity.label = {
                text: "999999",
                font: "30pt Source Han Sans CN", //字体样式
                fillColor: Cesium.Color.BLACK, //字体颜色
                backgroundColor: Cesium.Color.AQUA, //背景颜色
                showBackground: true, //是否显示背景颜色
                style: Cesium.LabelStyle.FILL, //label样式
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.CENTER, //垂直位置
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT //水平位置
                // pixelOffset:new Cesium.Cartesian2(10,0)            //偏移
            };
            entity.polygon.extrudedHeight = height;
        }
    }
    /**
     * 定位到中国范围
     */
    setViewportOfProvince() {
        agCamera.setCameraByRectangle(
            this.viewer,
            73.50114210012788,
            6.323625505013069,
            135.08851148002088,
            53.56090105044318
        );
    }
}
export default new ServerLayer();