import mainUI from "../ui/mainUI.js"

/**
 * Class Scene 场景
 */
class Scene {
    constructor(viewer) {
        var _mainUI = mainUI;
        this._viewer = viewer;
        this._layerTree = null;
    }
    /**
     * 初始化
     * @param {object} viewer viewer
     * @param {object} treeData 图层树数据
     */
    initialize(viewer, treeData) {
        this._viewer = viewer;
        this._layerTree = CIM.layerTree;
        this._layerTree.loadInitializeLayers(viewer, treeData);

        this.initializeOperationHabit();
    }
    /**
     * 操作习惯
     */
    initializeOperationHabit() {
        if (true) {
            this._modifyMouseAction(this._viewer);
        }
    }
    /**
     * 修改鼠标操作
     * @private
     * @param {object} viewer  viewer
     */
    _modifyMouseAction(viewer) {
        //修改旋转为右键操作
        viewer.scene.screenSpaceCameraController.tiltEventTypes = [
            Cesium.CameraEventType.RIGHT_DRAG,
            Cesium.CameraEventType.PINCH,
            {
                eventType: Cesium.CameraEventType.LEFT_DRAG,
                modifier: Cesium.KeyboardEventModifier.CTRL
            },
            {
                eventType: Cesium.CameraEventType.RIGHT_DRAG,
                modifier: Cesium.KeyboardEventModifier.CTRL
            }
        ];
        //重置地图放大缩小操作，
        viewer.scene.screenSpaceCameraController.zoomEventTypes = [
            Cesium.CameraEventType.MIDDLE_DRAG,
            Cesium.CameraEventType.WHEEL,
            Cesium.CameraEventType.PINCH
        ];
    }
    /**
     * 统一配置场景属性
     * @function setSceneConfig
     * @memberof agcimScene 
     * @param {*} option 配置属性对象
     */
    setSceneConfig(option) {
        var scene = this._viewer.scene;
        for (let key in option) {
            switch (key) {
                case 'enableLighting': //是否启用以太阳为光源的地球
                case 'depthTestAgainstTerrain': //是否启用深度探测
                case 'preloadAncestors': //是否应预加载渲染图块的祖先
                case 'preloadSiblings': //是否应预加载渲染图块的同级
                case 'show': //是否显示地球
                case 'showGroundAtmosphere': //是否显示大气
                case 'showWaterEffect': //显示动画波浪效果
                case 'undergroundColor': //启用或禁用相机对地形的碰撞检测
                    scene.globe[key] = option[key];
                    break;
                case 'skyBox': //设置天空盒
                    scene[key] = option[key];
                    break;
                case 'fog': //是否显示场景的雾
                    scene[key].enabled = option[key];
                    break;
                case 'sun': //是否显示太阳
                case 'moon': //是否显示月亮
                case 'skyAtmosphere': //是否屏蔽大气层
                    scene[key].show = option[key];
                    break;
                case 'enableCollisionDetection': //启用或禁用相机对地形的碰撞检测
                    scene.screenSpaceCameraController[key] = option[key];
                    break;
                case 'baseColor': //设置无底图影像时地球的颜色
                    scene.globe[key] = new agcim.renderer.Color().getColor(option[key]);
                    break;
            }
        }

    }

    /**
    *监听图层事件
    * @function addImageryLayerEvent
    * @memberof agcimScene 
    * @param {string} type 监听类型  layerAdded：将层添加监听， layerMoved ，图层移动， layerRemoved ，图层移除， layerShownOrHidden 图层显示或隐藏监听
    * @param {function} callback 回调方法
    */
    addImageryLayerEvent(type, callback) {
        if (this._viewer.imageryLayers[type] != undefined && this._viewer.imageryLayers[type] != null) {
            this._viewer.imageryLayers[type].addEventListener(function (ret) {
                if (callback) {
                    callback(ret)
                }
            })
        }

    }
    /**
    *删除监听图层事件
    * @function removeImageryLayerEvent
    * @memberof agcimScene 
    * @param {string} type 删除监听类型  layerAdded：将层添加监听， layerMoved ，图层移动， layerRemoved ，图层移除， layerShownOrHidden 图层显示或隐藏监听
    * @param {function} callback 回调方法
    */
    removeImageryLayerEvent(type, callback) {
        if (this._viewer.imageryLayers[type] != undefined && this._viewer.imageryLayers[type] != null) {
            this._viewer.imageryLayers[type].removeEventListener(function (ret) {
                if (callback) {
                    callback(ret)
                }
            })
        }

    }

}
export default Scene;