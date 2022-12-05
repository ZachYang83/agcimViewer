import FeatureLayer from "./featureLayer"
/**
 * Class PointLayer 类
 */
class PointLayer extends FeatureLayer {
    constructor() {
        super(CIM.viewer);
    }
    /**
     * 从数据集中加载数据
     * @param {object} viewer viewer
     * @param {object} dataSource 图层dataSource
     */
    addFromDataSource(viewer, dataSource) {
        let entities = dataSource._entityCollection.values;
        for (let i = 0; i < 50; i++) {
            let entity = entities[i];
            let properties = entity.properties;
            let ProvinceNa = properties.Name_CHN._value;

            //画点

            var point = viewer.entities.add({
                position: entity.position._value,
                name: ProvinceNa,
                point: {
                    color: Cesium.Color.CRIMSON,
                    pixelSize: 9,
                    outlineColor: Cesium.Color.ALICEBLUE,
                    outlineWidth: 2
                }
            });
            this._entities.push(point);
        }
    }
    /**
     * 移除实体点
     * @param {object} viewer viewer
     */
    removeCommunityPoint(viewer) {
        let entitys = dataSource._entityCollection.values;
        for (var i = 0; i < entitys.length; i++) {
            if (entitys[i]._name === "lablebill") {
                console.log("i=" + i);
                console.log(entitys[i]._name);
                console.log(entitys[i]._id);
                viewer.entities.remove(entitys[i]);
                i--;
            }
        }

    }

}
export default new PointLayer();