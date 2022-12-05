import agCamera from "@/sdk/camera/camera";
import agFeatureLayer from "@/sdk/layer/featureLayer";

class searchBase extends agFeatureLayer {
    constructor() {
        super(CIM.viewer);
        this._viewer = CIM.viewer;
    }
    /**
     * 加定位点
     * @param {Object} item 
     */
    location(o) {

    }
    /**
     * 加精确点详情
     * @param {Object} item 
     */
    locationDetail(item) {
        let position = item.location;
        this.flyTo(position);
    }

    flyTo(position) {
        agCamera.setCameraByPosition(this._viewer, position);
    }
    search() { }
    clear() {
        this._featureLayer.removeAll(this._viewer);
    }
}
export default searchBase