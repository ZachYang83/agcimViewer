// import PrimitiveLayer from "@/sdk/layer/primitiveLayer";
import Polyline from "@/sdk/geometry/polyline";
import serverData4BIM from "@/views/js/net/serverData4BIM";
import FeatureLayer from "@/sdk/layer/featureLayer";

/**
 * class RevitHelper Revit模型转3dtile操作相关类
 */
class RevitHelper {
    constructor() {
        this.allPolyLine = [];
        this.featureLayer = null;
    }
    /**
     * 根据定位类型移动到定位位置
     * @param {object} data  数据库查询的包围盒、拓扑等信息
     * @param {Cesium3DTileset} tileset  要定位的tileset
     * @param {string} type  定位的类型：Element、Room、Level
     * @param {viewer} viewer  viewer 视图对象
     */
    flyTo(data, tileset, type, viewer) {
        var modelMatrix = tileset.root.computedTransform;
        var info = eval("(" + data.boundingbox + ")");
        var sphere = null;
        this.removeMark();
        if (type == "Level") {
            var cartList = [];
            for (let i = 0; i < info.length; i++) {
                let point = this.getWorldPosition(info[i], modelMatrix);
                cartList.push(point);
            }
            sphere = Cesium.BoundingSphere.fromPoints(cartList);
        } else {
            var boundingbox = info.BoundingBox;
            var min = this.getWorldPosition(boundingbox.Min, modelMatrix);
            var max = this.getWorldPosition(boundingbox.Max, modelMatrix);
            sphere = Cesium.BoundingSphere.fromCornerPoints(min, max);
        }

        var camera = viewer.scene.camera;
        var offset = new Cesium.HeadingPitchRange(camera.heading, camera.pitch, 0);

        if (type == "Room") {
            offset.pitch = -Cesium.Math.PI;
            var edges = info.EdgeArray;

            if (!this.featureLayer)
                this.featureLayer = new FeatureLayer(viewer);
            this.featureLayer.removeAll();
            for (let i = 0; i < edges.length; i++) {
                var position1 = this.getWorldPosition(
                    edges[i].XYZ1,
                    modelMatrix,
                    0.3048
                );
                var position2 = this.getWorldPosition(
                    edges[i].XYZ2,
                    modelMatrix,
                    0.3048
                );


                var poly = new Polyline("房间", [position1, position2], {
                    material: Cesium.Color.RED,
                    width: 2,
                });
                poly.addToLayer(this.featureLayer);
            }
        }
        camera.flyToBoundingSphere(sphere, { offset: offset });
    }

    /**
     * 获取替换构件的坐标矩阵（假设替换构件的朝向都是面朝正南方向）
     * @param {matrix4} modelMatrix  3dtiles的坐标矩阵
     * @param {object} data  构件包围盒、拓扑信息
     * @return {matrix4} finalMatrix构件坐标矩阵
     */
    getModelMatrix(modelMatrix, data) {
        var boundingbox = eval("(" + data.boundingbox + ")").BoundingBox;
        var topology = eval("(" + data.topologyelements + ")");

        var sphere = this.createBoundingBox(boundingbox);

        var m2 = new Cesium.Cartesian4(
            sphere.center.x,
            sphere.center.y,
            sphere.center.z,
            0
        );

        var modelMatrix2 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            m2,
            new Cesium.Matrix4()
        );

        var finalMatrix = modelMatrix2;
        var face = topology.Facing;
        var m3 = null;
        if (face == "东") {
            m3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(90));
        } else if (face == "西") {
            m3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(270));
        } else if (face == "北") {
            m3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(180));
        }

        if (m3 != null) {
            finalMatrix = Cesium.Matrix4.multiplyByMatrix3(
                modelMatrix2,
                m3,
                new Cesium.Matrix4()
            );
        }

        return finalMatrix;
    }
    /**
     *从revit的局部坐标系转到Cartesian3坐标系
     * @param {object} localCoordinates 局部坐标系
     * @param {matrix4} modelMatrix 3dtiles的坐标矩阵
     * @param {number} scale 与米的换算单位，如为英寸则传入 0.3048
     * @param {string} face (可选) 构件朝向，仅在计算尺寸标注时需要传入
     * @returns {cartesian3} Cartesian3
     */
    getWorldPosition(localCoordinates, modelMatrix, scale = 1, face) {
        let coord = new Cesium.Cartesian3(
            localCoordinates.X * scale,
            localCoordinates.Y * scale,
            localCoordinates.Z * scale
        );

        var mz = new Cesium.Cartesian4(coord.x, coord.y, coord.z);
        if (face == "东") {
            mz.x += 0.15;
        } else if (face == "南") {
            mz.y -= 0.15;
        } else if (face == "西") {
            mz.x -= 0.15;
        } else if (face == "北") {
            mz.y += 0.15;
        }

        var mz10 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            mz,
            new Cesium.Matrix4()
        );

        var position = Cesium.Matrix4.getTranslation(mz10, new Cesium.Cartesian3());
        return position;
    }

    /**
     *
     *
     *根据构件信息计算位置
     * @param {*} data 构件信息
     * @param {*} modelMatrix 3dtiles的坐标矩阵
     * @returns {} Cesium.BoundingSphere  构件包围盒坐标
     */
    computeComponentPosition(data, modelMatrix) {
        var info = eval("(" + data.boundingbox + ")");

        var boundingbox = info.BoundingBox;
        var min = this.getWorldPosition(boundingbox.Min, modelMatrix);
        var max = this.getWorldPosition(boundingbox.Max, modelMatrix);
        var sphere = Cesium.BoundingSphere.fromCornerPoints(min, max);
        return sphere;
    }

    /**
     *
     *
     *根据id获取构件位置信息
     * @param {*} id 构件id
     * @param {*} modelMatrix 3dtiles的坐标矩阵
     * @param {*} tableName 3dtiles相关的表名
     * @returns {} Cesium.BoundingSphere  构件包围盒坐标
     */
    async getComponentPosition(ids, modelMatrix, tableName) {
        var result = serverData4BIM.getProperty(tableName, ids);

        return await result.then((ref) => {
            if (!ref.success) return null;
            var data = ref.content;
            var sphereList = []; var sphereObjecs = {};
            for (let index = 0; index < data.length; index++) {
                var info = data[index];
                var sphere = this.computeComponentPosition(info, modelMatrix);

                if (!Array.isArray(ids)) return sphere;
                sphereObjecs[info.objectid] = sphere;
            }

            for (let i = 0; i < ids.length; i++) {
                sphereList.push(sphereObjecs[ids[i]]);
            }
            return sphereList;
        });
    }

    /**
     * 创建尺寸标注
     * @param {object} data 数据库查询到的构件拓扑信息
     * @param {matrix4} modelMatrix  3dtiles的坐标矩阵
     * @param {color} color 标注的颜色
     */
    markingSize(data, modelMatrix, color) {
        this.removeMark();
        if (!this.featureLayer)
            this.featureLayer = new FeatureLayer(viewer);

        var topology = eval("(" + data.topologyelements + ")");
        var sizes = topology.Sizes;

        for (let i = 0; i < sizes.length; i++) {
            var position1 = this.getWorldPosition(
                sizes[i].Start,
                modelMatrix,
                0.3048,
                topology.Facing
            );
            var position2 = this.getWorldPosition(
                sizes[i].End,
                modelMatrix,
                0.3048,
                topology.Facing
            );

            var certerPosition = new Cesium.Cartesian3.midpoint(
                position1,
                position2,
                new Cesium.Cartesian3()
            ); //取两个世界坐标点的中心点
            var length = (sizes[i].Length * 0.3048).toFixed(4) * 1000;
            var text = length.toString() + "mm";

            var poly = new Polyline("尺寸标注", [position1, position2], {
                material: color,
                width: 2,
                pixelSize: 5,
            });
            poly.addToLayer(this.featureLayer);

            poly.position = certerPosition;
            poly.label = {
                text: text,
                font: "14px sans-serif",
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.TOP,
                pixelOffset: new Cesium.Cartesian2(0, 5),
            };

            this.allPolyLine.push(poly);
        }
    }
    /**
     * 获取构件尺寸
     * @param {object} data 数据库查询到的构件信息
     * @returns {string} string 宽×高
     */
    getSizes(data) {
        var topology = eval("(" + data.topologyelements + ")");
        var sizes = [];
        var aFoot = 0.3048;
        for (let i = 0; i < topology.Sizes.length; i++) {
            var da = topology.Sizes[i];
            var length = (da.Length * aFoot).toFixed(4) * 1000;
            sizes.push(length);
        }
        if (topology.Facing == "南" || topology.Facing == "北")
            return sizes[0] + "×" + sizes[2];
        else return sizes[1] + "×" + sizes[2];
    }
    /**
     * 判断替换的窗户
     * @param {object} modelData 数据库查询到的门或窗的构件信息
     * @param {matrix4} wallData  3dtiles的坐标矩阵
     * @param {string} repaceData 要替换的窗户或门的尺寸 宽×高
     * @return {boolean} bool  是否合适
     */
    isSuitable(modelData, wallData, repaceData) {
        var modelBox = eval("(" + modelData.boundingbox + ")").BoundingBox;
        var modelSphere = this.createBoundingBox(modelBox);

        var wallBox = eval("(" + wallData.boundingbox + ")").BoundingBox;
        var wallSphere = this.createBoundingBox(wallBox);
        var wallSize = this.getSizes(wallData);

        var difference = new Cesium.Cartesian3(
            wallSphere.center.x - modelSphere.center.x,
            wallSphere.center.y - modelSphere.center.y,
            wallSphere.center.z - modelSphere.center.z
        );

        var topology = eval("(" + wallData.topologyelements + ")");
        var leftwidth,
            rightwidth = null;
        if (topology.Facing == "南" || topology.Facing == "北") {
            leftwidth = (wallSize.split("×")[0] / 2 / 1000 - difference.x).toFixed(3);
            rightwidth = (wallSize.split("×")[0] / 2 / 1000 + difference.x).toFixed(
                3
            );
        } else {
            leftwidth = (wallSize.split("×")[0] / 2 / 1000 - difference.y).toFixed(3);
            rightwidth = (wallSize.split("×")[0] / 2 / 1000 + difference.y).toFixed(
                3
            );
        }

        var topwidth = (wallSize.split("×")[1] / 2 / 1000 - difference.z).toFixed(
            3
        );
        var botoomwidth = (
            wallSize.split("×")[1] / 2 / 1000 +
            difference.z
        ).toFixed(3);

        var modelwidth = repaceData.split("×")[0] / 2 / 1000;
        var modelheight = repaceData.split("×")[1] / 2 / 1000;
        if (
            leftwidth < modelwidth ||
            rightwidth < modelwidth ||
            topwidth < modelheight ||
            botoomwidth < modelheight
        )
            return false;
        return true;
    }
    /**
     * 获取墙体的剖切面板
     * @param {object} wallData 墙数据
     * @param {object} winData  窗户数据
     * @param {string} size 要替换的窗户或门的尺寸 宽×高
     * @return {object} ClippingPlaneCollection 剖切面集合
     */
    getClippingPlane(wallData, winData, size) {
        var targetU, targetD, targetL, targetR, targetF, targetB;

        var sizes = size.split("×");
        targetU = targetD = -sizes[1] / 1000 / 2;
        targetF = targetB = -sizes[0] / 1000 / 2;
        targetL = targetR = 0.2;

        var boundingbox = eval("(" + wallData.boundingbox + ")").BoundingBox;
        var wallsphere = this.createBoundingBox(boundingbox);

        var winboundingbox = eval("(" + winData + ")").BoundingBox;
        var winsphere = this.createBoundingBox(winboundingbox);

        var offsetx = winsphere.center.y - wallsphere.center.y;
        var offsety = winsphere.center.x - wallsphere.center.x;
        var offsetz = winsphere.center.z - wallsphere.center.z;

        var angleValue = (0 * Math.PI) / 180;
        var clippingPlaneCollection = new Cesium.ClippingPlaneCollection({
            modelMatrix: Cesium.Matrix4.fromTranslation(
                new Cesium.Cartesian3(offsetx, offsety, offsetz)
            ),
            planes: [
                new Cesium.ClippingPlane(
                    new Cesium.Cartesian3(0.0, 0.0, -1.0),
                    targetU
                ), //上Up
                new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), targetD), //下down
                new Cesium.ClippingPlane(
                    new Cesium.Cartesian3(
                        -Math.cos(angleValue),
                        -Math.sin(angleValue),
                        0.0
                    ),
                    targetL
                ), //左left
                new Cesium.ClippingPlane(
                    new Cesium.Cartesian3(
                        Math.cos(angleValue),
                        Math.sin(angleValue),
                        0.0
                    ),
                    targetR
                ), //右right
                new Cesium.ClippingPlane(
                    new Cesium.Cartesian3(
                        Math.sin(angleValue),
                        -Math.cos(angleValue),
                        0.0
                    ),
                    targetF
                ), //前front
                new Cesium.ClippingPlane(
                    new Cesium.Cartesian3(
                        -Math.sin(angleValue),
                        Math.cos(angleValue),
                        0.0
                    ),
                    targetB
                ), //后back
            ],
            edgeWidth: 0,
            edgeColor: Cesium.Color.WHITE,
            enabled: true,
        });

        return clippingPlaneCollection;
    }
    /**
     *通过包围盒数据创建包围盒
     * @param {object} boundingBox 组成包围盒的坐标数组
     * @return {boundingSphere} BoundingSphere：certer 包围盒中心
     */
    createBoundingBox(boundingBox) {
        let min = new Cesium.Cartesian3(
            boundingBox.Min.X,
            boundingBox.Min.Y,
            boundingBox.Min.Z
        );
        let max = new Cesium.Cartesian3(
            boundingBox.Max.X,
            boundingBox.Max.Y,
            boundingBox.Max.Z
        );

        let sphere = Cesium.BoundingSphere.fromCornerPoints(
            min,
            max,
            new Cesium.BoundingSphere()
        );

        return sphere;
    }
    /**
     *获取aabb包围盒信息
     * @param {array} data 组成包围盒的坐标数组
     * @return {axisAlignedBoundingBox} AxisAlignedBoundingBox：certer 包围盒中心
     */
    getBoundingBox(data) {
        var cartList = [];
        for (let i = 0; i < data.length; i++) {
            cartList.push(new Cesium.Cartesian3(data[i].X, data[i].Y, data[i].Z));
        }
        var aabb = Cesium.AxisAlignedBoundingBox.fromPoints(cartList);
        return aabb;
    }
    /**
     *移除尺寸标记
     */
    removeMark() {
        if (this.featureLayer)
            this.featureLayer.removeAll();
    }
}

export default new RevitHelper();
