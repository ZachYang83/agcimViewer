/*
 * @author: ML（梅兰）
 * @description: 梯度渲染
 */
import AgPickerHelper from '@/sdk/interactive/pickerHelper.js'
class GradientRendering {
    constructor(viewer) {
        this.viewer = viewer;
        this.model = "";//图层模型字段
        this.pickerHelper = new AgPickerHelper(this.viewer)
    }

    /**
    * @author: ML（梅兰）
    * @description: 方法描述 通过拾取指定的白膜信息获取图层信息对象
    * @param {*}
    * @return {*}
    */
    pickModel() {
        return new Promise((res, rej) => {
            //1、清除上次添加的对象信息
            this.viewer.scene.postProcessStages.removeAll();
            var selected = {
                feature: undefined,
                originalColor: new Cesium.Color(),
            };
            if (!Cesium.PostProcessStageLibrary.isSilhouetteSupported(this.viewer.scene)) return rej()
            //创建蓝色轮廓
            var silhouetteBlue = this.createEdgeDetectionStage({
                color: Cesium.Color.BLUE,
                length: 0.01
            })
            //创建橙色轮廓
            var silhouetteGreen = this.createEdgeDetectionStage({
                color: Cesium.Color.LIME,
                length: 0.01
            })
            this.viewer.scene.postProcessStages.add(
                Cesium.PostProcessStageLibrary.createSilhouetteStage([
                    silhouetteBlue,
                    silhouetteGreen,
                ])
            );
            this.pickerHelper.on("MOUSE_MOVE", (movement) => {
                silhouetteBlue.selected = [];
                var pickedFeature = this.viewer.scene.pick(movement.endPosition);
                if (pickedFeature !== selected.feature) {
                    silhouetteBlue.selected = [pickedFeature];
                }
            })
            this.pickerHelper.on("LEFT_CLICK", (movement) => {
                // silhouetteGreen.selected = [];
                var pickedFeature = this.viewer.scene.pick(movement.position);
                if (!pickedFeature instanceof Cesium.Cesium3DTileFeature) return;
                this.pickerHelper.off("LEFT_CLICK")
                this.pickerHelper.off("MOUSE_MOVE")
                this.model = pickedFeature.primitive;
                // loadFestureFieldBy3dtiles(model, callBack).add(this.model)
                // this.featureList = pickedFeature.getPropertyNames();
                // if (silhouetteGreen.selected[0] === pickedFeature) return;
                // var highlightedFeature = silhouetteBlue.selected[0];
                // if (pickedFeature === highlightedFeature) {
                //     silhouetteBlue.selected = [];
                // }
                // silhouetteGreen.selected = [pickedFeature];
                res(this._getTileFeaturePropety(pickedFeature));
            })

        })
    }

    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 创建轮廓
     * @param {*} option
     * @param {*} option.color 颜色
     * @param {*} option.length 长度
     * @return {*}
     */
    createEdgeDetectionStage(option) {
        var silhouette = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouette.uniforms.color = option.color;
        silhouette.uniforms.length = option.length;
        silhouette.selected = [];
        return silhouette
    }
    /**
     * @author: ML（梅兰）
     * @description: 方法描述 渲染模型颜色
     * @param {*} params.propertyName 选择要渲染的字段
     * @param {*} params.colorSlideVal 设置色差值滑块值
     * @param {*} params.colorSliderMax 设置色差值滑块最大值
     * @param {*} params.colorTargetInfo 设置颜色色带对象
     * @param {*} params.buildingOpacity 设置建筑渲染颜色透明度
     * @return {*}
     */
    modelRendering(params) {
        let { propertyName, colorSlideVal, colorSliderMax, colorTargetInfo, buildingOpacity} = params;
        let colorArr = colorTargetInfo.colorArray;   //色带颜色总数
        let heightTotal = [];
        let avg =0;
        if(colorSlideVal == 0)
            avg = Math.round((colorSliderMax - colorSlideVal) / colorArr.length);
        else
            avg = Math.round((colorSliderMax - colorSlideVal) / (colorArr.length -1));
        for(var i=0;i < colorArr.length - 1;i++)
        {
            heightTotal.push({
                "color":colorArr[i].color,
                "height": avg*i,
            });
        }
        if(colorSlideVal == 0)
            heightTotal.push({
                "color":colorArr[colorArr.length - 1].color,
                "height": avg*(colorArr.length-1),
            });
        else
            heightTotal.push({
                "color":colorArr[colorArr.length - 1].color,
                "height": colorSliderMax - colorSlideVal,
            });
           //console.log(heightTotal);
            let defines = {
                name: "${feature['" + propertyName + "']}",
            };
            for(var j=0;j < heightTotal.length;j++)
            {
                defines["color"+j] = heightTotal[j].color.substr(0, heightTotal[j].color.length - 1) + "," + buildingOpacity + ")";
                defines["height"+j] = heightTotal[j].height ;
            }
            //console.log(defines);
            let color = { conditions: [] };
            for(var k=heightTotal.length -1;k >= 0;k--)
                color.conditions.push(["${name} >= ${height"+k+"}","${color"+k+"}"]);
            color.conditions.push(["true","rgb(127, 59, 8)"])
            //console.log(color);
            if (propertyName != "" && Cesium.defined(propertyName)) {
                this.model.style = new Cesium.Cesium3DTileStyle({
                    defines,
                    color
                });
            }
            this.viewer.scene.requestRender();
            this.renderData(heightTotal);
    }

    /**
     * @author: ML（梅兰）
     * @description: 方法描述 渲染分析数据结果
     * @param {*} params.heightTotal  按指定属性进行渲染的数组
     * @param {*} params.queryResultData  指定图层的所有结果集属性
     * @return {*}
     */
    renderData(heightTotal,queryResultData)
    {
        //1、可后台将分析结果直接返回  2、分析结果数据直接由前台进行处理
        //后期接口开发完成再做实现
    }






    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 返回从白模里面拾取到的信息
     * @param {*} pickerHelper
     * @return {*}
     */
    _getTileFeaturePropety(pickedFeature) {
        let name = "";
        if (pickedFeature.tileset.agMetaData) name = pickedFeature.tileset.agMetaData.text;
        //过滤掉非数值型字段
        let featureList = pickedFeature.getPropertyNames().filter(item => {
            if (typeof pickedFeature.getProperty(item) === "number") return item;
        });
        return {
            featureList,
            name,
           
        }
    }
    loadFestureFieldBy3dtiles(model, callBack) {
        function add() {
            model.tileLoad.addEventListener(function (tile) {
                processTileFeatures(tile);
            });
        }
        function remove() {
        }
        function processTileFeatures(tile) {
            var content = tile.content;
            var innerContents = content.innerContents;
            if (Cesium.defined(innerContents)) {
                var length = innerContents.length;
                for (var i = 0; i < length; ++i) {
                    processContentFeatures(innerContents[i]);
                }
            } else {
                processContentFeatures(content);
            }
        }
        function processContentFeatures(content) {
            let tmpDataList = [];
            var featuresLength = content.featuresLength;
            for (var i = 0; i < featuresLength; ++i) {
                var feature = content.getFeature(i);
                tmpDataList.push({
                    key: i,
                    fieldsVal: feature.getProperty(that.propertyName),
                });
            }
            if (callBack) callBack(tmpDataList)
            return tmpDataList

        }
        return {
            add, remove
        }
    }
    /**
     * @author: ML（梅兰）
     * @description: 方法描述 清除梯度渲染
     * @param {*}
     * @return {*}
     */
    clear() {
        this.viewer.scene.postProcessStages.removeAll();
        this.pickerHelper.off("LEFT_CLICK")
        this.pickerHelper.off("MOUSE_MOVE")
        this.model.style = null;
        this.model.show = true;
    }

};
export default GradientRendering;