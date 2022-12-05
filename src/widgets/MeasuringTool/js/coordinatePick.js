import Draw from "@/sdk/interactive/draw";

class CoordinatePick {
    constructor() {
        this.viewer = null;
        this.draw = null;
    }

    pickAndDrawPoint(viewer) {
        return new Promise((resolve, reject) => {
            this.viewer = viewer;
            this.draw = new Draw(viewer);
            this.draw.drawPoint().then(result => {
                var positions = result.positions;
                let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
                let long = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
                let lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
                let elev = cartographic.height.toFixed(2);
                resolve({
                    long,
                    lat,
                    elev,
                    x: positions[0].x,
                    y: positions[0].y,
                    z: positions[0].z
                })
            }, error => {
                console.log(error);
            });
        })
    }
    dispose() {
        this.draw.dispose();
    }
}

export default new CoordinatePick();