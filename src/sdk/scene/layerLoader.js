import Ag3DTilesLayer from '../layer/ag3DTilesLayer';
import WFSLayer from "@/sdk/layer/agWFSLayer";
import Terrain from '../layer/terrain'
import cesLayer from '../layer/cesLayer'

class LayerLoaderBase {
    constructor() {
        this.supportTypes = "";
    }
    add(viewer, ly, _this) {
        console.error("未实现add方法")
    }
}

class A3DTilesLayer extends LayerLoaderBase {
    constructor() {
        super();
        this.supportTypes = "120010";
    }
    add(viewer, ly, _this) {
        if (!_this._isLayerIdExists(ly.id)) {
            return;
        }
        var specular = undefined;
        let layer = new Ag3DTilesLayer(viewer);
        if (ly.specular != "")
            specular = JSON.parse(ly.specular)
        let tiles = layer.add(ly.url, {
            lightColor: specular
        }, ly.styleManagerId);
        tiles.agMetaData = ly;
        layer.id = ly.id;
        _this._aglayers.push(layer);
        _this.triggleLayerShowHandler(layer, true);
    }
}

class TerrainLayerLoader extends LayerLoaderBase {
    constructor() {
        super();
        this.supportTypes = "130010";
    }
    add(viewer, ly, _this) { //ly 待里面对地形的配置，可通过扩展字段配置
        let option = {
            url: ly.url,
            requestWaterMask: true,
            requestVertexNormals: true
        }
        var layer = new Terrain(viewer);
        layer.add(option);
        layer.agMetaData = ly;
        layer.id = ly.id;
        _this._aglayers.push(layer);
    }
}

class ArcGISMapServerLayerLoader extends LayerLoaderBase {
    constructor() {
        super();
        this.supportTypes = "020202, 020302";
    }
    add(viewer, ly, _this) {
        if (!_this._isLayerIdExists(ly.id)) {
            return;
        }
        let layer = cesLayer.addArcGISMapServerLayer(viewer, ly.url);
        layer.agMetaData = ly;
        layer.id = ly.id;
        _this._aglayers.push(layer);
    }
}
class WMSLayerLoader extends LayerLoaderBase {
    constructor() {
        super();
        this.supportTypes = "030002, 030003";
    }
    add(viewer, ly, _this) {
        if (!_this._isLayerIdExists(ly.id)) {
            return;
        }
        cesLayer.addWMSLayer(viewer, ly, function (layer) {
            layer.id = ly.id;
            _this._aglayers.push(layer);
            _this.triggleLayerShowHandler(layer, true)
        });
    }
}
class WMTSLayerLoader extends LayerLoaderBase {
    constructor() {
        super();
        this.supportTypes = "050002, 050003";
    }
    add(viewer, ly, _this) {
        if (!_this._isLayerIdExists(ly.id)) {
            return;
        }
        let layer = cesLayer.addWMTSLayer(viewer, ly);
        layer.agMetaData = ly;
        layer.id = ly.id;
        _this._aglayers.push(layer);
        _this.triggleLayerShowHandler(layer, true);
    }
}
class WFSLayerLoader extends LayerLoaderBase {
    constructor() {
        super();
        this.supportTypes = "040003";
    }
    add(viewer, ly, _this) {
        cesLayer.addWFSLayer(
            ly.url + '?service=WFS',
            ly.id,
            ly.layerTable, {
            cql_filter: "1=1",
            featureType: ly.featureType
        },
            function (dataSource, id) {
                if (!_this._isLayerIdExists(id)) {
                    return;
                }
                var layer = new WFSLayer(viewer);
                if ('3D' == ly.featureType) {
                    layer.add3d(dataSource, id, ly);
                } else {
                    layer.add(dataSource, id, ly);
                }
                layer.id = ly.id;
                dataSource.agMetaData = ly;
                _this._aglayers.push(layer);
                _this.triggleLayerShowHandler(layer, true);
            }
        );
    }
}

export default [
    new A3DTilesLayer(),
    new TerrainLayerLoader(),
    new ArcGISMapServerLayerLoader(),
    new WMSLayerLoader(),
    new WMTSLayerLoader(),
    new WFSLayerLoader()
]