/*
 * @Author: yangzh
 * @Date: 2021-01-07 11:32:51
 * @LastEditTime: 2021-02-02 16:16:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agcimViewer\src\widgets\SunshineCalculation\js\selectWindow.js
 */
import serverData4BIM from "@/views/js/net/serverData4BIM";
class SelectHelper {
    construct() {
    }

    //获取单一分类的Cesium3dTileFeature
    getComponents(tileset, type) {
        this.features = [];
        var tilechildren = tileset.root.children;
        var keys = ["_features", "features"]
        var filter = ["_content", "_contents", "content", "contents"]
        this.traverse(tilechildren, keys, filter)
        console.log(this.features.length, 'this.features');
        var componets = this.featureFilter(this.features, type);
        return componets;
    }

    traverse(data, keys, filter) {
        let _this = this;
        for (let k of Object.keys(data)) {
            console.log(k,'k')
            if (keys.includes(k) && typeof data[k] === "object") {
                _this.num += data[k].length;
                if (data[k] instanceof Array) {
                    data[k].map(value => _this.features.push(value))
                }
                continue;
            }
            if (filter.includes(k) || data instanceof Array) {
                _this.traverse(data[k], keys, filter);
            }

        }
    }

    featureFilter(features, type) {
        let ids = [];
        let componets = [];
        let selectFeature = {};
        for (let i = 0; i < features.length; i++) {
            let catagory = features[i].getProperty("catagory");
            let featureId = features[i].getProperty("name");
            if (catagory == type) {
                selectFeature.id = featureId;
                selectFeature.object = features[i];
                selectFeature.modelMatrix = features[i].tileset.root.computedTransform;
                componets.push(selectFeature);
                ids.push(featureId);
                features[i].color = Cesium.Color.RED;
            }
        }
        console.log(componets.length, 'componets.length')
        return componets;
    }

    //获取所有分类的Cesium3dTileFeature
    getAllCompents(tileset, vm) {
        var option = { filterKey: "catagory", profession: " " };
        var catagory = [];
        var res = serverData4BIM.getTableName(tileset.agMetaData.id);
        res.then((ref) => {
            if (!ref.success) return null;
            if (ref.content === null || ref.content == "") {
                vm.$message.info("该模型还没有入库")
            } else {
                var tableName = ref.content.entitytable;
                serverData4BIM.getFileterData(tableName, option).then((result) => {
                    if (!result.success) return;
                    var data = result.content;
                    data.map((value) => {
                        if (value.catagory !== "") {
                            catagory.push(value.catagory);
                        }
                    });
                    var allComponets = [];
                    for (let i = 0; i < catagory.length; i++) {
                        var value = this.getComponents(tileset, catagory[i]);
                        var key = catagory[i];
                        var coms = { key: value };
                        allComponets.push(coms);
                    }
                    return allComponets;
                });
            }
        });
    }

}

export default new SelectHelper();