 /**
 * class HighlightHelper 高亮类
 */
class HighlightHelper {
    constructor() {
        this.curEntity = null;
        this.cur3MTile = {
            feature: null,
            originalColor: null,
        }; 
    } 
    /**
     * 添加高亮效果
     * @param {object} pickedFeature pick的对象 viewer.scene.pick(movement.position)
     * @param {object} viewer viewer
     * @param {object} option 高亮颜色：默认Cesium.Color.YELLOW
     */
    add(pickedFeature, viewer, option) {
        let _t = this;
        if (Cesium.defined(pickedFeature)) {
            //3d
            if (pickedFeature.primitive instanceof Cesium.Model) {
                _t.highlight3D(pickedFeature.primitive);
            } else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
                _t.highlight3D(pickedFeature, option);
            } else {
                //2d 
                if (pickedFeature.id) {
                    _t.highlight2D(pickedFeature, option);
                }
            }
            //关闭弹窗移除高亮   
            // viewer.selectedEntity = pickedFeature.id;
            // viewer.infoBox.viewModel.closeClicked._listeners.pop();
            // viewer.infoBox.viewModel.closeClicked._listeners.push(function () {
            //     _t.remove(viewer);
            // });
        } else {
            _t.remove(viewer);
        }
    }
    /**
     * 设置3d构建高亮
     * @param {object} feature pick的对象
     * @param {object} option 默认高亮颜色： Cesium.Color.YELLOW
     * @private
     */
    highlight3D(feature, option = Cesium.Color.YELLOW) {
        let _cur = this.cur3MTile;
        if (feature === _cur.feature) {
            // feature.color = _cur.originalColor;
            // _cur.feature = null;
            return;
        }
        if (_cur.feature != null) {
            _cur.feature.color = _cur.originalColor;
        }
        try {
            const targetColor = option;
            _cur.originalColor = Cesium.Color.clone(feature.color);
            _cur.feature = feature;
            feature.color = Cesium.Color.clone(targetColor, feature.color);
        } catch (error) { }
    }
    /**
     * 设置2d数据高亮
     * @param {object} picked pick的对象
     * @param {object} option  高亮颜色： Cesium.Color.YELLOW
     * @private
     */
    highlight2D(picked, option) {
         this.setEntity(picked.id, option);
    }
    /**
     * 设置2d数据高亮
     * @param {*} entity entity
     * @param {*} option 默认高亮颜色： Cesium.Color.YELLOW
     */
    setEntity(entity, option) {
        //color  billbord 
        //fillColor  label
        //material  polyline polygon ...   
        let arr = [{
            type: 'scale',
            list: ['billboard', 'point']
        }, {
            type: 'fillColor',
            list: ['label']
        }, {
            type: 'material',
            list: ['box', 'corridor', 'cylinder', 'ellipse', 'ellipsoid', 'path', 'plane', 'polygon', 'polyline', 'polylineVolume', 'wall']
        }];

        for (let i = 0; i < arr.length; i++) {
            let list = arr[i].list;
            for (let j = 0; j < list.length; j++) {
                if (entity[list[j]]) {
                    if (this.curEntity == entity[list[j]]) {
                        return;
                    }

                    if (this.curEntity != null) {
                        this.curEntity.material = this.curEntity.material0;
                        this.curEntity.scale = this.curEntity.scale0;
                        this.curEntity.fillColor = this.curEntity.fillColor0;
                    }
                    let a = entity[list[j]];
                    this[arr[i].type](a, option);
                    return;
                }
            }
        }
    }
    /**
     * 设置材质
     * @param {object} picked pick的对象
     * @param {object} option  高亮颜色： Cesium.Color.YELLOW
     * @private
     */
    material(pickF, option = Cesium.Color.YELLOW) {
        pickF.material0 = pickF.material;
        pickF.material = option;
        this.curEntity = pickF;
    }
    /**
     * 点 放大
     * @param {object} picked pick的对象
     * @param {number} option  正数
     * @private
     */
    scale(pickF, option = 1.5) {
        pickF.scale0 = pickF.scale;
        pickF.scale = option;
        this.curEntity = pickF;
    }
    /**
     * 设置lable颜色
     * @param {object} picked pick的对象
     * @param {object} option  高亮颜色： Cesium.Color.YELLOW
     * @private
     */
    fillColor(pickF, option = Cesium.Color.YELLOW) {
        pickF.fillColor0 = pickF.fillColor;
        pickF.fillColor = option;
        this.curEntity = pickF;
    }
    /**
     * 移除高亮效果
     * @param {object} viewer viewer
     */
    remove(viewer) {
        if (this.curEntity) {
            this.curEntity.material = this.curEntity.material0;
            this.curEntity.scale = this.curEntity.scale0;
            this.curEntity.fillColor = this.curEntity.fillColor0;
            this.curEntity = null;
        }
        if (this.cur3MTile.feature) {
            this.cur3MTile.feature.color = this.cur3MTile.originalColor;
            this.cur3MTile = {
                feature: null,
                originalColor: null,
            };
        }
        // viewer.selectedEntity = null;
        // viewer.infoBox.viewModel.closeClicked._listeners.pop();
    }
}
export default  HighlightHelper