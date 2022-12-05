import axiosWraper from "@/views/js/net/axiosWraper";
/**
 * class widgetConfigHelper  微件管理
 */
class widgetConfigHelper {
    /**
     * 设置配置
     * 支持的类型包括 
     * 1：point:{x,y,z}
     * 2: float:
     * 3: array-str 
     * 4: array-float
     * @param {string} widgetCode 微件编码
     * @param {function} finishHandler 回调处理函数 
     */
    getConfig(widgetCode, finishHandler) {
        var url = "/agsupport-rest/agsupport/widgetConfig/getConfigList?code=" + widgetCode;
        axiosWraper.getData(url).then((data) => {
            var configKeyValue = {};
            var configKeyType = {};
            var returnValue = data.content;
            returnValue.forEach(function (element) {
                if (element.isActive) {
                    configKeyValue[element.configKey] = element.configValue;
                    configKeyType[element.configKey] = element.configType;
                }
            })
            if (finishHandler) {
                try {
                    finishHandler(configKeyValue, configKeyType)
                } catch (e) {
                    console.warn("加载微件配置错误:" + e)
                }
            }
        })
    }
    /**
     *  读取所有配置，同时设置到configToStore中，如果
     *  configToStore有endSetConfig方法，那么会触发endSetConfig方法
     * @param {string} widgetCode 微件编码
     * @param {object} configToStore 配置数据（vue里面的data）
     * @param {function} finishHandler 回调处理函数
     */
    getConfigTo(widgetCode, configToStore, finishHandler) {
        this.getConfig(widgetCode, function (configKeyValue, configKeyType) {
            for (var name in configKeyValue) {
                try {
                    if (configKeyType[name] == 'float') {
                        configToStore[name] = parseFloat(configKeyValue[name]);
                    } else if (configKeyType[name] == 'point') {
                        configToStore[name] = eval('(' + configKeyValue[name] + ')');
                    } else if (configKeyType[name] == 'array-str') {
                        configToStore[name] = configKeyValue[name].split(',');
                    } else if (configKeyType[name] == 'array-float') {
                        var str = configKeyValue[name].split(',');
                        configToStore[name] = [];
                        for (var i = 0; i < str.length; i++) {
                            configToStore[name].push(parseFloat(str[i]));
                        }
                    } else {
                        configToStore[name] = configKeyValue[name];
                    }
                } catch (e) {
                    console.warn("不能解析widgetConfigHelper:" + name)
                }
            }
            if (configToStore.endSetConfig) {
                configToStore.endSetConfig();
            }
            if (finishHandler) {
                try {
                    finishHandler(configKeyValue)
                } catch (e) {
                    console.warn("加载微件配置错误:" + e)
                }
            }
            return configToStore;
        })
    }
    /**
     * 功能初始化时： 
     * {
     *   位置:position
     *   图层:layer
     * }
     * @param {Object} initConfig 
     * @param {Object} viewer 
     */
    setInitSence(initConfig, viewer) {
        if (initConfig) {
            //定位
            if (initConfig.position) {
                viewer.camera.flyTo({
                    destination: new Cesium.Cartesian3(
                        initConfig.position.arr[0],
                        initConfig.position.arr[1],
                        initConfig.position.arr[2]
                    ),
                    orientation: {
                        heading: initConfig.position.heading,
                        roll: initConfig.position.roll,
                        pitch: initConfig.position.pitch,
                    },
                });
            }
            //加默认图层
            if (initConfig.layer) {
                for (let i = 0; i < initConfig.layer.length; i++) {
                    let ly = CIM.layerTree.getLayerByText(initConfig.layer[i]);
                    let ids = CIM.layerTree._aglayerIds;
                    if (ly && ly.id && ids.indexOf(ly.id) == -1) {
                        CIM.layerTree.addLayer(ly, viewer);
                    }
                }
            }
        }
    }
}

export default new widgetConfigHelper();