import AgFeatureLayer from "./featureLayer";
import axiosWraper from "@/views/js/net/axiosWraper"
import Ag3DTilesLayer from "./ag3DTilesLayer";
import WaterStyle from "../renderer/waterStyle";
/**
 * class WFSLayer wfs图层类
 */
class WFSLayer extends AgFeatureLayer {
    constructor(viewer) {
        super(viewer)
        this._viewer = viewer;
    }
    /**
     * 添加图层
     * @param {object} dataSource dataSource
     * @param {string} id 图层id
     * @param {object} layerConfig 图层配置json信息
     */
    add(dataSource, id, layerConfig) {
        dataSource.name = id;
        this.addDatasource(dataSource);
        this.setDefualtStyle(dataSource);
        if (layerConfig.styleManagerId) {
            this.setConfigStyle(dataSource, layerConfig.styleManagerId);
        }
    }
    /**
     * 添加3d的点图层
     * @param {object} dataSource dataSource
     * @param {string} id 图层id
     * @param {object} layerConfig 图层配置json信息
     */
    add3d(dataSource, id, layerConfig) {
        dataSource.id = id;
        if (layerConfig.styleManagerId) { //预留其他情况
            this.setConfigStyle(dataSource, layerConfig.styleManagerId);
        }
    }
    /**
     * 设置3dtiles样式
     * @param {object} data 数据
     * @param {object} lyConfig 图层样式json配置
     * @param {boolean} isTable 是否有数据表,默认：直接取图层的features
     */
    set3dTilesStyle(data, lyConfig, isTable) {
        var viewer = this._viewer;
        let arr = data.arr;
        if (!isTable) {
            arr = data.features;
        }

        let curAg3dLy = null;
        let arr1 = CIM.layerTree._aglayers;
        for (let j = arr1.length - 1; j > 0; j--) {
            if (data.id == arr1[j].id) {
                curAg3dLy = CIM.layerTree._aglayers[j]._primitives;
                break;
            }
        }

        for (let i = 0; i < arr.length; i++) {
            let p = arr[i].coordinates;
            let option = arr[i];
            if (!isTable) {
                p = arr[i].geometry.coordinates;
                option = arr[i].properties;
            } else {
                delete option.url;
            }
            //curAg3dLy 是否已加载 子模型  
            let flag = false;
            for (let k = 0; k < curAg3dLy.length; k++) {
                if (curAg3dLy[k].agMetaData.id == arr[i].id) {
                    flag = true;
                    break;
                }
            }
            if (flag) {
                continue;
            } else {
                let layer = new Ag3DTilesLayer(this._viewer);
                let tileset = layer.add(lyConfig.url, option, lyConfig.styleManagerId);
                tileset.readyPromise.then(function (tileset) {
                    var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
                    var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
                    var ellipsoid = viewer.scene.globe.ellipsoid;
                    var cartographic = Cesium.Cartographic.fromDegrees(p[0], p[1], (p[2] || option.height));
                    var offset = ellipsoid.cartographicToCartesian(cartographic);
                    var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
                    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation)

                    tileset.agMetaData = option;
                    curAg3dLy.push(tileset);
                });
            }
        }
    }
    /**
     * 设置默认样式
     * @param {object} dataSource dataSource
     */
    setDefualtStyle(dataSource) {
        var entities = dataSource.entities.values;

        var colorHash = {};
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            var name = entity.name;
            var color = colorHash[name];
            if (!color) {
                color = Cesium.Color.fromRandom({
                    alpha: 1
                });
                colorHash[name] = color;
            }
            if (entity.polygon) {
                entity.polygon.outline = true;
                entity.polygon.extrudedHeight = 0;
            }
        }
    }
    /**
     * 设置样式
     * @param {object} dataSource dataSource
     * @param {object} styleConfig 样式配置
     */
    setStyle(dataSource, styleConfig) {
        if (styleConfig.uniqueValueInfos) {
            this.setUniqueValueStyle(dataSource, styleConfig);
            return;
        }
        if (dataSource && dataSource.entities && dataSource.entities.values) {
            var entities = dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
                var entity = entities[i];
                if (entity.polygon) {
                    entity.polygon.outline = true;
                    entity.polygon.extrudedHeight = 0;
                    entity.polygon.material = eval(styleConfig.material)
                    entity.polygon.outlineColor = eval(styleConfig.outlineColor)
                    entity.polygon.outlineWidth = styleConfig.outlineWidth;
                    entity.polygon.height = 1;
                    if (styleConfig.showLine) {
                        var positions = entity.polygon.hierarchy._value.positions;
                        var line = CIM.viewer.entities.add({
                            polyline: {
                                positions: positions,
                                material: eval(styleConfig.outlineColor),
                            },
                        });
                    }
                }
                if (entity.polyline) {
                    entity.polyline.material = eval(styleConfig.material);
                    entity.polyline.width = eval(styleConfig.outlineWidth);
                    if (styleConfig.lineType) {
                        if (styleConfig.lineType == "PolylineDash") {
                            var material = new Cesium.PolylineDashMaterialProperty({
                                color: eval(styleConfig.material)
                            });
                        } else if (styleConfig.lineType == "PolylineArrow") {
                            var material = new Cesium.PolylineArrowMaterialProperty(eval(styleConfig.material));
                            entity.polyline.width = 10;
                        }
                        entity.polyline.material = material;
                    } else {
                        entity.polyline.material = eval(styleConfig.material);
                    }
                }
                this.setStyleOfBillboard(entity, styleConfig);
                this.setStyleOfLabel(entity, styleConfig);
            }
        }
    }
    /**
     * 设置特别样式，比如图例标记的样式
     * @param {object} dataSource dataSource
     * @param {object} styleConfig 样式配置
     */
    setUniqueValueStyle(dataSource, styleConfig) {
        var entities = dataSource.entities.values;
        var field = styleConfig.field;
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            if (entity.polygon) {
                entity.polygon.outline = true;
                entity.polygon.extrudedHeight = 0;
                for (var k = 0; k < styleConfig.uniqueValueInfos.length; k++) {
                    if (entity.properties[field]._value == styleConfig.uniqueValueInfos[k].value) {
                        entity.polygon.material = eval(styleConfig.uniqueValueInfos[k].material)
                        entity.polygon.outlineColor = eval(styleConfig.uniqueValueInfos[k].outlineColor)
                        entity.polygon.outlineWidth = styleConfig.uniqueValueInfos[k].outlineWidth;
                    }
                }
            }
            if (entity.polyline) {
                for (var k = 0; k < styleConfig.uniqueValueInfos.length; k++) {
                    if (entity.properties[field]._value == styleConfig.uniqueValueInfos[k].value) {
                        entity.polyline.material = eval(styleConfig.uniqueValueInfos[k].material);
                        entity.polyline.width = eval(styleConfig.uniqueValueInfos[k].outlineWidth)
                        if (styleConfig.uniqueValueInfos[k].lineType) {
                            if (styleConfig.uniqueValueInfos[k].lineType == "PolylineDash") {
                                var material = new Cesium.PolylineDashMaterialProperty({
                                    color: eval(styleConfig.uniqueValueInfos[k].material)
                                });
                            } else if (styleConfig.uniqueValueInfos[k].lineType == "PolylineArrow") {
                                var material = new Cesium.PolylineArrowMaterialProperty(eval(styleConfig.uniqueValueInfos[k].material));
                            }
                            entity.polyline.width = eval(styleConfig.uniqueValueInfos[k].outlineWidth) || 10;
                            entity.polyline.material = material;
                        }
                    }
                }
            }
            this.setStyleOfBillboard(entity, styleConfig);
            this.setStyleOfLabel(entity, styleConfig);
        }
    }

    /**
     * 设置Label样式
     * @param {object} entity entity
     * @param {object} styleConfig 样式配置
     */
    setStyleOfLabel(entity, styleConfig) {
        if (!styleConfig.label)
            return;
        var labelInfo = {};
        labelInfo.text = entity.properties[styleConfig.label.text];
        labelInfo.font = styleConfig.label.font;
        labelInfo.style = eval(styleConfig.label.style)
        labelInfo.fillColor = eval(styleConfig.label.fillColor)
        labelInfo.outlineColor = eval(styleConfig.label.outlineColor)
        labelInfo.horizontalOrigin = eval(styleConfig.label.horizontalOrigin)
        labelInfo.verticalOrigin = eval(styleConfig.label.verticalOrigin)
        labelInfo.heightReference = eval(styleConfig.label.heightReference)
        labelInfo.scaleByDistance = eval(styleConfig.label.scaleByDistance);
        labelInfo.pixelOffset = eval(styleConfig.label.pixelOffset);

        if (eval(styleConfig.label.markHeight)) {
            let ellipsoid = this._viewer.scene.globe.ellipsoid;
            let cartesian3 = entity.position._value;
            let cartograhphic = ellipsoid.cartesianToCartographic(cartesian3);
            let lat = Cesium.Math.toDegrees(cartograhphic.latitude);
            let lng = Cesium.Math.toDegrees(cartograhphic.longitude);
            let position = new Cesium.Cartesian3.fromDegrees(lng, lat, entity.properties.height._value);
            entity.position._value = position;
        }

        //距离信息
        if (styleConfig.label.distanceDisplayCondition) {
            var distanceDisplayCondition = styleConfig.label.distanceDisplayCondition;
            var fieldValue = entity.properties[distanceDisplayCondition.field]._value;
            for (let i = 0; i < distanceDisplayCondition.condition.length; i++) {
                var contition = distanceDisplayCondition.condition[i].value;
                if (contition.split(" ")[0] == "<") {
                    if (fieldValue < contition.split(" ")[1]) {
                        labelInfo.distanceDisplayCondition = eval(distanceDisplayCondition.condition[i].distance);
                        break;
                    }
                } else if (contition.split(" ")[0] == ">=") {
                    if (fieldValue >= contition.split(" ")[1]) {
                        labelInfo.distanceDisplayCondition = eval(distanceDisplayCondition.condition[i].distance);
                        break;
                    }
                }
            }
        }

        var centerpoint = null;
        if (entity.polygon) {
            var pointsArray = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
            centerpoint = Cesium.BoundingSphere.fromPoints(pointsArray).center;
        }
        if (entity.polyline) {
            var pointsArray = entity.polyline.positions.getValue();
            centerpoint = pointsArray[pointsArray.length / 2];
        }
        if (entity.polygon) {
            var pointsArray = entity.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
            centerpoint = Cesium.BoundingSphere.fromPoints(pointsArray).center;
        }
        if (entity.billboard) {
            centerpoint = entity.position._value;
            labelInfo.pixelOffset = new Cesium.Cartesian3(0, 5, 20);
            if (styleConfig.heightDisplayCondition) {
                entity.billboard.scaleByDistance = new Cesium.NearFarScalar(1.5e4, 0.0, 1.5e5, 1.0);
            }
        }

        entity.position = centerpoint;
        entity.label = labelInfo;

        let str = entity.id;
        var index = str.lastIndexOf("\.");
        str = str.substring(index + 1, str.length);
        if (str.indexOf('_') == -1) {
            entity.label.show = true;
        } else {
            entity.label.show = false;
        }
    }
    /**
     * 设置billboard样式
     * @param {object} entity entity
     * @param {object} styleConfig 样式配置
     */
    setStyleOfBillboard(entity, styleConfig) {
        if (!styleConfig.billboard)
            return;
        if (!entity.billboard)
            return;

        if (styleConfig.billboard.image) {
            if (styleConfig.billboard.field) {
                var img = styleConfig.billboard.image.replace("{field}", entity.properties[styleConfig.billboard.field]);
                // 判断图片地址是否有效，无效拿otherImage 里面的地址
                new Promise(function (reject) {
                    var ImgObj = new Image(); //判断图片是否存在
                    ImgObj.src = img;
                    ImgObj.onerror = function (err) {
                        entity.billboard.image = styleConfig.otherImage;
                    }
                })
                entity.billboard.image = img;
            } else {
                entity.billboard.image = styleConfig.billboard.image;
            }
        }


        if (!styleConfig.billboard.formated) {
            if (styleConfig.billboard.alignedAxis)
                styleConfig.billboard.alignedAxis = eval(styleConfig.billboard.alignedAxis);
            if (styleConfig.billboard.pixelOffset)
                styleConfig.billboard.pixelOffset = eval(styleConfig.billboard.pixelOffset);
            if (styleConfig.billboard.eyeOffset)
                styleConfig.billboard.eyeOffset = eval(styleConfig.billboard.eyeOffset);
            if (styleConfig.billboard.horizontalOrigin)
                styleConfig.billboard.horizontalOrigin = eval(styleConfig.billboard.horizontalOrigin);
            if (styleConfig.billboard.verticalOrigin)
                styleConfig.billboard.verticalOrigin = eval(styleConfig.billboard.verticalOrigin);
            if (styleConfig.billboard.scaleByDistance)
                styleConfig.billboard.scaleByDistance = eval(styleConfig.billboard.scaleByDistance);
            styleConfig.billboard.formated = true;
        }
        styleConfig.billboard.scale ? entity.billboard.scale = styleConfig.billboard.scale : "";
        styleConfig.billboard.alignedAxis ? entity.billboard.alignedAxis = styleConfig.billboard.alignedAxis : "";
        styleConfig.billboard.pixelOffset ? entity.billboard.pixelOffset = styleConfig.billboard.pixelOffset : "";
        styleConfig.billboard.pixelOffset ? entity.billboard.alignedAxis = styleConfig.billboard.pixelOffset : "";
        styleConfig.billboard.eyeOffset ? entity.billboard.eyeOffset = styleConfig.billboard.eyeOffset : "";
        styleConfig.billboard.horizontalOrigin ? entity.billboard.horizontalOrigin = styleConfig.billboard.horizontalOrigin : "";
        styleConfig.billboard.verticalOrigin ? entity.billboard.verticalOrigin = styleConfig.billboard.verticalOrigin : "";
        styleConfig.billboard.scaleByDistance ? entity.billboard.scaleByDistance = styleConfig.billboard.scaleByDistance : "";
        if (styleConfig.heightDisplayCondition) {
            entity.billboard.scaleByDistance = new Cesium.NearFarScalar(1.5e4, 0.0, 1.5e5, 1.0);
        }
    }
    /**
     * 设置配置的样式
     * @param {object} dataSource dataSource
     * @param {string} styleId 样式id
     */
    setConfigStyle(dataSource, styleId) {
        let _this = this;
        var prm = axiosWraper.getData('/agsupport-rest/agsupport/stylemanager/findById', {
            'id': styleId
        });
        prm.then(function (data) {
            if (data.success && data.content && data.content.information) {
                let json = JSON.parse(data.content.information);
                if (json['3d']) {
                    _this.set3dTilesStyle(dataSource, json['3d']);
                } if (json['waters']) {
                    let w = new WaterStyle();
                    w.setWatersStyle(dataSource, _this, json['waters']);
                } else {
                    _this.setStyle(dataSource, json);
                }
            }
        })

    }
    /**
     * 获取图例
     * @param {function} successHandler 回调函数
     */
    getLegendData(successHandler) {
        if (this._dataSource.length == 0)
            return null;
        let _this = this;
        var agMetaData = this._dataSource[0].agMetaData;
        if (agMetaData) {
            axiosWraper.getData('/agsupport-rest/agsupport/stylemanager/findById', {
                'id': agMetaData.styleManagerId
            }).then(function (data) {
                if (data.success && data.content) {
                    let json = JSON.parse(data.content.information);
                    var helper = new WFSLayerLegendHelper();
                    _this.title = agMetaData.nameCn;
                    successHandler(helper.parseUniqueLegend(json), _this);
                }
            })
            return true;
        }
        return null;
    }
}
class WFSLayerLegendHelper {
    parseUniqueLegend(data) {
        if (!data.uniqueValueInfos)
            return null;
        var legendObj = {};
        var list = [];
        if (data.legendTitle) {
            legendObj.title = data.legendTitle;
        }
        for (var i = 0; i < data.uniqueValueInfos.length; i++) {
            list.push({
                style: data.uniqueValueInfos[i].style,
                lineType: data.uniqueValueInfos[i].lineType,
                value: data.uniqueValueInfos[i].legendName ? data.uniqueValueInfos[i].legendName : data.uniqueValueInfos[i].value,
                material: eval(data.uniqueValueInfos[i].material).toCssColorString()
            })
        }
        legendObj.legendList = list;
        return {
            "legend": legendObj
        };
    }
}
export default WFSLayer;