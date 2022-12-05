import agFeatureLayer from "./featureLayer";
import axiosWraper from "@/views/js/net/axiosWraper"

/**
 *  Class  TileLayer 瓦片图层
 */
class TileLayer extends agFeatureLayer {
    constructor(viewer) {
        super(viewer);
        this._viewer = viewer;
    }
    /**
     * 添加图层
     * @param {object} layer 图层
     */
    add(layer) {
        return this.addImagery(layer);
    }
    /**
     * 获取图例
     * @param {function} successHandler 回调函数
     */
    getLegendData(successHandler) {
        if (this._imageryLayers.length == 0)
            return null;
        let _this = this;
        var agMetaData = this._imageryLayers[0].agMetaData || this.agMetaData;
        if (agMetaData) {
            axiosWraper.getData('/agsupport-rest/agsupport/stylemanager/findById', {
                'id': agMetaData.styleManagerId
            }).then(function (data) {
                if (data.success && data.content) {
                    let json = JSON.parse(data.content.information);
                    successHandler(json, _this);
                }
            })
            return true;
        }
        return null;
    }
}
export default TileLayer