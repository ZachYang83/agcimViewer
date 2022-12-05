

/*
 * @author: pwz（潘文周）
 * @description: 用于显示建筑popup信息
 */
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import TurfHelper from "@/sdk/utils/turfHelper"
import coordinate from "@/sdk/maths/coordinate";


class BuildingPopupHelper {
    constructor(viewer) {
        this.viewer = viewer;
        this.agFeatureLayer = new AgFeatureLayer(viewer);
        this._popupClump = {};
    }
    infoPopup(option, height = 200) {
        if (this._popupClump[option.id]) return
        //取建筑底面中点
        let label = {
            text: "",
            font: "16px Helvetica",
            pixelOffset: new Cesium.Cartesian2(0, 0),
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#52c41a"),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }
        label = Object.assign({}, label, option)
        let globPosition = coordinate.changePointHeight(option.position, height)
        var polyline = {
            positions: [option.position, globPosition],
            material: Cesium.Color.GREEN,
            width: 2,
        };
        let entity = this.agFeatureLayer.addEntity({
            label,
            position: globPosition,
            polyline
        });
        if (!this._popupClump[option.id]) {
            this._popupClump[option.id] = entity;
        }
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述
     * @param {*} feature geojson对象
     * @param {*} option 
     * @return {*}
     */
    buildingCenterPopup(feature, option, height) {
        let position = TurfHelper.getCenter(feature).cartesian3;
        option.position = position;
        option.id = feature.id
        this.infoPopup(option, height);
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 清除指定的popup
     * @param {*} feature
     * @return {*}
     */
    removePopup(feature) {
        if (this._popupClump[feature.id]) {
            this.agFeatureLayer.removeEntity(this._popupClump[feature.id])
            this._popupClump[feature.id] = null;
        }
    }
    /**
  * @author: pwz（潘文周） 
  * @description: 方法描述 清除所有高亮
  * @param {*}
  * @return {*}
  */
    remove() {
        this._popupClump = {};
        this.agFeatureLayer.removeAll();//删除多边形的高亮样式     
    }

}
export default BuildingPopupHelper;