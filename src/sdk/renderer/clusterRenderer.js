class agClusterRenderer {
    constructor(viewer) {
        this._viewer = viewer;
        this.singleDigitPins = null;
    }
    /**
     * 设置聚类渲染器
     * @param {Cesium.DataSource} dataSource Cesium场景内的DataSource
     * @param {number} pixelRange 标记像素大小
     * @param {number} minimumClusterSize 最小聚类值
     */
    setRenderer(dataSource, pixelRange, minimumClusterSize) {
        var enabled = true;
        dataSource.clustering.enabled = enabled;
        dataSource.clustering.pixelRange = pixelRange;
        dataSource.clustering.minimumClusterSize = minimumClusterSize;
        this.removeListener=undefined;
        var pinBuilder = new Cesium.PinBuilder();
        this.pin100 = pinBuilder.fromText('100+', Cesium.Color.BLUEVIOLET, 48).toDataURL();
        this.pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
        this.pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
        this.pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
        this.pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
        this.pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();

        this.singleDigitPins = new Array(8);
        for (var i = 0; i < this.singleDigitPins.length; ++i) {
            this.singleDigitPins[i] = pinBuilder.fromText('' + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
        }
        this.customStyle(dataSource);
    }
    /**
     * 自定义聚类样式
     * @param {Cesium.DataSource} dataSource Cesium场景内的DataSource
     */
    customStyle(dataSource) {
        let _this =this;
        if (Cesium.defined(this.removeListener)) {
            this.removeListener();
            this.removeListener = undefined;
        } else {
            this.removeListener = dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
                cluster.label.show = false;
                cluster.billboard.show = true;
                cluster.billboard.id = cluster.label.id;
                cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

                if (clusteredEntities.length >= 100) {
                    cluster.billboard.image = _this.pin100;
                } else if (clusteredEntities.length >= 50) {
                    cluster.billboard.image = _this.pin50;
                }  else if (clusteredEntities.length >= 40) {
                    cluster.billboard.image = _this.pin40;
                } else if (clusteredEntities.length >= 30) {
                    cluster.billboard.image = _this.pin30;
                } else if (clusteredEntities.length >= 20) {
                    cluster.billboard.image = _this.pin20;
                } else if (clusteredEntities.length >= 10) {
                    cluster.billboard.image = _this.pin10;
                } else {
                    cluster.billboard.image = _this.singleDigitPins[clusteredEntities.length - 2];
                }
            });
        }
        var pixelRange = dataSource.clustering.pixelRange;
        dataSource.clustering.pixelRange = 0;
        dataSource.clustering.pixelRange = pixelRange;
    }
}
export default new agClusterRenderer();