import AgTileLayer from "./tileLayer";
/**
 * class CesLayer cesium图层
 */
class CesLayer {

    /**
    * 添加易智瑞的地图
    * @param {object} viewer viewer 
    * @param {string} url 图层url
    * @param {string} token  token
    */
    addArcGISMapServerLayer(viewer, url, token) { 
        let gzMapServer = new Cesium.ArcGisMapServerImageryProvider({
            url: url,
            token: token, 
        })
        viewer.imageryLayers.addImageryProvider(gzMapServer);
        return gzMapServer;
    }
    /**
     * 添加一个wfs的图层，获取json文件，执行回调函数
     * @param {*} url 服务地址
     * @param {*} id  给服务设置一个id
     * @param {*} typeName  服务类型名称
     * @param {*} option  typeName：服务类型名称 maxFeatures： 最大查询数据，暂时不需要，cql_filter：服务查询筛选条件
     * @param {*} callback 回调函数，添加图层操作在回调函数中写
     */
    addWFSLayer(url, id, typeName, option, callback) {
        let resource = Cesium.Resource.fetchJson({
            url: url,
            id: id,
            queryParameters: {
                request: "GetFeature",
                version: "1.0.0",
                typeName: typeName,
                // 'MAXFEATURES': 10,
                outputFormat: "application/json",
                cql_filter: option.cql_filter
            }
        });

        resource.then(json => {
            if('3D'==option.featureType){
                if (callback) { 
                    callback(json, id);
                }
            }else{
                if (json.crs.properties.name == "urn:ogc:def:crs:EPSG::4490") {
                    json.crs.properties.name = "urn:ogc:def:crs:EPSG::4326";
                }
                Cesium.GeoJsonDataSource.load(json, {
                    clapToGround: true
                }).then(dataSource => {
                    if (callback) {
                        callback(dataSource, id);
                    }
                });
            }
            
        });
    }
    /**
     * 移除图层
     * @param {object} viewer viewer 
     * @param {object} layer 图层
     */
    removeLayer(viewer, layer) {
        viewer.dataSources.remove(layer);
    }

    /**
     * 根据id来获得数据源
     * @param {string} layerId 图层id
     */
    getDatasourceById(viewer, layerId) {
        let dataSourcesArr = viewer.dataSources._dataSources;
        for (let i = 0; i < dataSourcesArr.length; i++) {
            if (dataSourcesArr[i].name == layerId) {
                return dataSourcesArr[i];
            }
        }
        return null;
    }

    /**
     * 加载天地图影像及注记服务
     * @param {object} viewer viewer
     */
    addTDTLayer(viewer) {
        let TDT_IMG_CLayer = new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=d1e432cfe1064bad5b4c19745e0f1289",
            layer: "img",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "w",
            credit: new Cesium.Credit("天地图全球影像服务"),
            subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            maximumLevel: 18,
            show: false
        });
        viewer.imageryLayers.addImageryProvider(TDT_CIA_CLayer);
        //在线天地图影像中文标记服务(经纬度)
        let TDT_CIA_C =
            "http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0" +
            "&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
            "&style=default&format=tiles&tk=d1e432cfe1064bad5b4c19745e0f1289";
        var TDT_CIA_CLayer = new Cesium.WebMapTileServiceImageryProvider({
            url: TDT_CIA_C,
            layer: "tdtImg_c",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "c",
            subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
            tilingScheme: new Cesium.GeographicTilingScheme(),
            tileMatrixLabels: [ "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19" ],
            maximumLevel: 50,
            show: false
        });
        // viewer.imageryLayers.addImageryProvider(TDT_IMG_CLayer);
    }

    // 加载geoserver 发布的wmts服务，只支持3857 4326，以及偏差小的如4490
    // addWMTSLayer(viewer) {
    
    //     let shadedRelief1 = new Cesium.WebMapTileServiceImageryProvider({
    //         url:
    //             "https://server.geoai.com/server/rest/services/gz2015quyunimg2000/MapServer/WMTS?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0" +
    //             "&LAYER=gz2015quyunimg2000&STYLE=&FORMAT=image/png&TILEMATRIXSET=EPSG:4547&TILEMATRIX=EPSG:4547:{TileMatrix}&TILECOL={TileCol}&TILEROW={TileRow}",
    //         // layer: "gz2015quyunimg2000",
    //         // style: "default",
    //         // format: "image/png",
    //         maximumLevel: 19
    //     });

    //     viewer.imageryLayers.addImageryProvider(shadedRelief1);
    // }
    /**
     * 加载geoserver的服务WMS,返回agTilelayer
     * @param {object} viewer viewer 
     * @param {object} layer 图层 
     */
    addWMSLayer(viewer, wmsOption, callback) {
        var option = {
            service: 'WMS',
            version: '1.1.0',
            request: 'GetMap',
            style: 'default',
            transparent: 'true',
            format: 'image/png',
            srs: JSON.parse(wmsOption.data).coordinateSystem || 'EPSG:4326'
        }; 
        let opts = new Cesium.WebMapServiceImageryProvider({
            url: wmsOption.url,
            layers: wmsOption.layerTable,
            parameters: option
        })
        var tileLayer = new AgTileLayer(viewer);
        var imagerLayer = tileLayer.add(opts);  

        var ly = wmsOption;
        var xmlhttp = new XMLHttpRequest();
        if (xmlhttp != null) {
            xmlhttp.onreadystatechange = onResponse;
            xmlhttp.open("GET", ly.url + '?REQUEST=GetCapabilities', true);
            xmlhttp.send();
        } 
        function onResponse() {
            if (xmlhttp.readyState != 4) return; 
            var _str;
            if (document.all) {
                let xmlDom = new ActiveXObject("Microsoft.XMLDOM");
                _str = xmlDom.loadXML(xmlhttp.response); 
            } else {
                _str = new DOMParser().parseFromString(xmlhttp.response, "text/xml");  
            }  
           var x = _str.documentElement.getElementsByTagName("Layer");  
            for (var i = 0; i < x.length; i++) {
                let name = x[i].getElementsByTagName("Name")[0].firstChild.data;
                if (name == ly.text) {
                    let o = x[i].getElementsByTagName("BoundingBox")[0]; 
                    ly.rectangle = {
                        west: o.getAttribute('minx'),
                        east: o.getAttribute('maxx'),
                        south: o.getAttribute('miny'),
                        north: o.getAttribute('maxy')
                    }  
                    imagerLayer.agMetaData = ly;  
                    if(callback){
                        callback(tileLayer)
                    }
                }
            } 
        }
    }
     
    /**
     * 加载geoserver的服务WTMS
     * @param {object} viewer viewer 
     * @param {object} layer 图层
     */
    addWMTSLayer(viewer, layer) {
        
        //拼接参数matrixIds===========
        let matrixIds = ['EPSG:4326:0', 'EPSG:4326:1', 'EPSG:4326:2', 'EPSG:4326:3', 'EPSG:4326:4', 'EPSG:4326:5', 'EPSG:4326:6', 'EPSG:4326:7', 'EPSG:4326:8', 'EPSG:4326:9', 'EPSG:4326:10',
            'EPSG:4326:11', 'EPSG:4326:12', 'EPSG:4326:13', 'EPSG:4326:14', 'EPSG:4326:15', 'EPSG:4326:16', 'EPSG:4326:17', 'EPSG:4326:18', 'EPSG:4326:19', 'EPSG:4326:20', 'EPSG:4326:21'
        ];
        let opts = new Cesium.WebMapTileServiceImageryProvider({
            url: layer.url,
            layer: layer.layerTable,
            style: '',
            format: 'image/png',
            tileMatrixSetID:  JSON.parse(layer.data).tileMatrixSet,
            tileMatrixLabels: matrixIds,
            tilingScheme: new Cesium.GeographicTilingScheme({
                numberOfLevelZeroTilesX: 2,
                numberOfLevelZeroTilesY: 1
              }) 
        });
        var tileLayer = new AgTileLayer(viewer);
        tileLayer.add(opts);   
        
        return tileLayer;
    }
   
};
export default new CesLayer();

 