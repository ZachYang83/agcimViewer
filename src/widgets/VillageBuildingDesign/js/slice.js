import RepalceMemeber from "./repalceMemeber";

export function sliceBox( wallData, winData, size) {
    // var position = new Cesium.Cartesian3(modelMatrix[12], modelMatrix[13], modelMatrix[14]);
    var targetU = -0.45, targetD = -0.45, targetL = -0.75, targetR = -0.75, targetF = -0.6, targetB = -0.6;

    var sizes = size.split("×");
    targetU = targetD = -sizes[1] / 1000 / 2;
    targetF = targetB = -sizes[0] / 1000 / 2;

    // let obbCenter = tiles.obbCenter;
    // let subtract = tiles.subtract;
    var boundingbox = eval("(" + wallData.boundingbox + ")").BoundingBox;
    var wallsphere = RepalceMemeber.createBoundingBox(boundingbox);

    var winboundingbox = eval("(" + winData+ ")").BoundingBox;
    var winsphere = RepalceMemeber.createBoundingBox(winboundingbox);


    // var offsetx = sphere.center.x - obbCenter.x + subtract.x;
    // var offsety = sphere.center.y - obbCenter.y + subtract.y;
    // var offsetz = sphere.center.z - obbCenter.z + subtract.z;

    var offsetx = winsphere.center.y - wallsphere.center.y;
    var offsety =winsphere.center.x - wallsphere.center.x; 
    var offsetz = winsphere.center.z - wallsphere.center.z;


    var angleValue = ((0 * Math.PI) / 180);
    var clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
        modelMatrix: Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(offsetx, offsety, offsetz)),//Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(-0.15, -3.4, offsetz-1.2)),
        planes: [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), targetU), //上Up
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), targetD), //下down
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.cos(angleValue), -Math.sin(angleValue), 0.0), targetL),  //左left
            new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.cos(angleValue), Math.sin(angleValue), 0.0), targetR),  //右right
            new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.sin(angleValue), -Math.cos(angleValue), 0.0), targetF),  //前front
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.sin(angleValue), Math.cos(angleValue), 0.0), targetB),  //后back

        ],
        edgeWidth: 0,
        edgeColor: Cesium.Color.WHITE,
        enabled: true,
    });

    return clippingPlaneCollection;
}


export function sliceBox2( modelMatrix, size) {
    // var position = new Cesium.Cartesian3(modelMatrix[12], modelMatrix[13], modelMatrix[14]);
    var targetU = -0.45, targetD = -0.45, targetL = -0.75, targetR = -0.75, targetF = -0.6, targetB = -0.6;

    var sizes = size.split("×");
    targetU = targetD = -sizes[1] / 1000 / 2;
    targetF = targetB = -sizes[0] / 1000 / 2;


    var angleValue = ((0 * Math.PI) / 180);
    var clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
        modelMatrix:modelMatrix ,//Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(-0.15, -3.4, offsetz-1.2)),
        planes: [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), targetU), //上Up
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), targetD), //下down
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.cos(angleValue), -Math.sin(angleValue), 0.0), targetL),  //左left
            new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.cos(angleValue), Math.sin(angleValue), 0.0), targetR),  //右right
            new Cesium.ClippingPlane(new Cesium.Cartesian3(Math.sin(angleValue), -Math.cos(angleValue), 0.0), targetF),  //前front
            new Cesium.ClippingPlane(new Cesium.Cartesian3(-Math.sin(angleValue), Math.cos(angleValue), 0.0), targetB),  //后back

        ],
        edgeWidth: 0,
        edgeColor: Cesium.Color.WHITE,
        enabled: true,
    });

    return clippingPlaneCollection;
}


