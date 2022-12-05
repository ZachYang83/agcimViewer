/**
 * class PolylineTrailLinkMaterialProperty 流动线纹理扩展类
 * 可设置颜色，速度
 */
class PolylineTrailLinkMaterialProperty {
    constructor(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration || 3000;
        this._time = (new Date()).getTime();

        this.isTranslucent = function () {
            return true;
        }
    }
    /**
     * 获取类型
     * @private
     */
    getType() {
        return 'PolylineTrailLink';
    }
    /**
     * 获取属性值，获取结果材质
     * @param {number} time 速度相关的动画时间
     * @param {object} result 返回的材质结果 
     * @private
     */
    getValue(time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result
            .color);
        result.image = Cesium.Material.PolylineTrailLinkImage;
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
        return result;
    }
    /**
     * 如果为true，则会调用该对象的equal方法来判断
     * @param {object} other 
     * @private
     */
    equals(other) {
        return this === other ||
            (other instanceof PolylineTrailLinkMaterialProperty &&
                Cesium.Property.equals(this._color, other._color))
    }
}

const createMaterialImage = function () {
    var c = document.createElement("canvas");
    c.width = 512;
    c.height = 32;
    var ctx = c.getContext("2d");
    var my_gradient = ctx.createLinearGradient(0, 0, c.width, 0);
    my_gradient.addColorStop(0, "rgba(255,0,0, 1)");
    my_gradient.addColorStop(1, "rgba(255,0,0, 0)");
    ctx.fillStyle = my_gradient;
    ctx.fillRect(0, 0, c.width, c.height);
    return c.toDataURL('image/png');
}

Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
Cesium.Material.PolylineTrailLinkImage = createMaterialImage();
Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                        {\n\
                                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                            vec2 st = materialInput.st;\n\
                                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                            material.alpha = colorImage.a * color.a;\n\
                                            material.diffuse = (color.rgb);\n\
                                            return material;\n\
                                        }";
Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
    fabric: {
        type: Cesium.Material.PolylineTrailLinkType,
        uniforms: {
            color: new Cesium.Color(0.0, 0.0, 1.0, 0),
            image: Cesium.Material.PolylineTrailLinkImage,
            time: 20
        },
        source: Cesium.Material.PolylineTrailLinkSource
    },
    translucent: function (material) {
        return true;
    }
});
