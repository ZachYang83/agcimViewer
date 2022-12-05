let baseLayerArr = [{
        name: "谷歌影像",
        tooltip: "谷歌影像底图",
        iconUrl: require("./img/googleSatellite.png"),
        category: "底图",
        creationFunction: function () {
            return new Cesium.UrlTemplateImageryProvider({
                url: "http://mt3.google.cn/vt/lyrs=s&hl=zh-CN&x=%7Bx%7D&y=%7By%7D&z=%7Bz%7D&s=Gali",
                tilingScheme: new Cesium.WebMercatorTilingScheme(),
                minimumLevel: 1,
                maximumLevel: 20,
            });
        },
    },
    {
        name: "Mapbox Satellite",
        tooltip: "Mapbox satellite imagery",
        iconUrl: require("./img/mapboxSatellite.png"),
        category: "底图",
        creationFunction: function () {
            return new Cesium.MapboxStyleImageryProvider({
                url: "https://api.mapbox.com/styles/v1",
                username: "aug-boyang",
                styleId: "ckanudzk8643e1iqt1c7iyzko",
                accessToken: "sk.eyJ1IjoiYXVnLWJveWFuZyIsImEiOiJja2FncDV5NjUwOHNiMnpvNTYybGxxZ2NsIn0.wD9gio5VytJ0zoU6dqjqtg",
                scaleFactor: true,
            });
        },
    },
    {
        name: "Mapbox 影像",
        tooltip: "Mapbox影像底图",
        iconUrl: require("./img/mapboxSatellite.png"),
        category: "底图",
        creationFunction: function () {
            return new Cesium.MapboxStyleImageryProvider({
                url: "https://api.mapbox.com/styles/v1",
                username: "aug-boyang",
                styleId: "satellite-v9",
                accessToken: "sk.eyJ1IjoiYXVnLWJveWFuZyIsImEiOiJja2FncDV5NjUwOHNiMnpvNTYybGxxZ2NsIn0.wD9gio5VytJ0zoU6dqjqtg",
                scaleFactor: true,
            });
        },
    },
    {
        name: "Mapbox 矢量",
        tooltip: "Mapbox矢量底图",
        iconUrl: require("./img/mapboxLight.png"),
        category: "底图",
        creationFunction: function () {
            return new Cesium.MapboxStyleImageryProvider({
                url: "https://api.mapbox.com/styles/v1",
                username: "aug-boyang",
                styleId: "ckagp7gd002st1imrguiishgn",
                accessToken: "sk.eyJ1IjoiYXVnLWJveWFuZyIsImEiOiJja2FncDV5NjUwOHNiMnpvNTYybGxxZ2NsIn0.wD9gio5VytJ0zoU6dqjqtg",
                scaleFactor: true,
            });
        },
    },
    {
        name: "天地图影像",
        tooltip: "天地图影像底图",
        iconUrl: require("./img/tdtSatellite.png"),
        category: "底图",
        creationFunction: function () {
            var tdt = new Cesium.WebMapTileServiceImageryProvider({
                url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=8487c77b8410d6c9cd4a22cac7b0d902",
                layer: "tdtBasicLayer",
                style: "default",
                format: "image/jpeg",
                tileMatrixSetID: "GoogleMapsCompatible",
                show: false,
                minimumLevel: 1,
                maximumLevel: 18,
            });
            return tdt;
        },
    },
    {
        name: "天地图矢量",
        tooltip: "天地图矢量底图",
        iconUrl: require("./img/tdtLight.png"),
        category: "底图",
        creationFunction: function () {
            var tdt = new Cesium.WebMapTileServiceImageryProvider({
                url: "http://t1.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=9e0cd8758617ab990ffbada866b30fe5",
                layer: "tdtBasicLayer",
                style: "default",
                format: "image/jpeg",
                tileMatrixSetID: "GoogleMapsCompatible",
                show: false,
                minimumLevel: 1,
                maximumLevel: 18,
            });
            return tdt;
        },
    },
];
let terrainArr = [{
        name: "WGS84平面椭球",
        iconUrl: require("./img/TerrainProviders/Ellipsoid.png"),
        tooltip: "WGS84 standard ellipsoid, also known as EPSG:4326",
        category: "地形",
        creationFunction: function () {
            return new Cesium.EllipsoidTerrainProvider();
        },
    },
    {
        name: "Cesium地形",
        iconUrl: require("./img/TerrainProviders/CesiumWorldTerrain.png"),
        tooltip: "High-resolution global terrain tileset curated from several datasources and hosted by Cesium ion",
        category: "地形",
        creationFunction: function () {
            return Cesium.createWorldTerrain({
                requestWaterMask: !0,
                requestVertexNormals: !0,
            });
        },
    },
    {
        name: "广州DEM",
        iconUrl: require("./img/TerrainProviders/CesiumWorldTerrain.png"),
        tooltip: "广州DEM",
        category: "地形",
        creationFunction: function () {
            let tpd = new Cesium.CesiumTerrainProvider({
                url: "http://81.71.142.155:6700/DEM/Guangzhou",
                requestWaterMask: !0,
                requestVertexNormals: !0,
            });
            return tpd;
        },
    },
];

export default {
    baseLayerArr: baseLayerArr,
    terrainArr: terrainArr
}