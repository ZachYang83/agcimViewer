
import axiosWraper from "@/views/js/net/axiosWraper";
import agMath from "@/sdk/maths/math";
class component {
    constructor() {
        this.allPolyLine = null;
        this.allModel = [];
        this.cartList = [];
        this.tilesTableName = "agcim3dentity_a";
        this.obbCenter = this.getObbCenter();
        this.obb = [{ "Z": -10.199999809265137, "Y": 7.7728090630557745E-09, "X": -8.8196496963500977 }, { "Z": -10.199999809265137, "Y": 58.249996185302734, "X": -8.8196496963500977 }, { "Z": -10.199999809265137, "Y": 58.249996185302734, "X": 87.0 }, { "Z": -10.199999809265137, "Y": 7.7728090630557745E-09, "X": 87.0 }, { "Z": 101.09999847412109, "Y": 7.7728090630557745E-09, "X": -8.8196496963500977 }, { "Z": 101.09999847412109, "Y": 7.7728090630557745E-09, "X": 87.0 }, { "Z": 101.09999847412109, "Y": 58.249996185302734, "X": 87.0 }, { "Z": 101.09999847412109, "Y": 58.249996185302734, "X": -8.8196496963500977 }];
        this.baseLine = null;
    }
    async getProperty(id) {
        var sql = `objectid=${id}`;
        let data = await axiosWraper.getData(
            `/agsupport-rest/agsupport/BIM/dentitya/find?${sql}`
        );

        // var sql = `filterKey=name,boundingbox&objectid=${id}`;
        // var data = await axiosWraper.getData(
        //   `/agsupport-rest/agsupport/dentitya/filter?${sql}`
        // );
        return data;
    }
    async flyTo(id, tileset, type = "element", isMark) {
        let _this = this;
        _this.clear();
        _this.getProperty(id).then((res) => {
            if (!res.success) return;
            var data = res.content;


            var modelMatrix = tileset.root.computedTransform;
            var info = eval("(" + data[0].boundingbox + ")")
            var sphere = null;
            if (type == "Level") {
                var cartList = [];
                for (let i = 0; i < info.length; i++) {
                    let point = _this.getWorldPosition(info[i], modelMatrix);
                    cartList.push(point);
                }
                sphere = Cesium.BoundingSphere.fromPoints(cartList);
            }
            else {

                var boundingbox = info.BoundingBox;

                var min = _this.getWorldPosition(boundingbox.Min, modelMatrix);
                var max = _this.getWorldPosition(boundingbox.Max, modelMatrix);
                sphere = Cesium.BoundingSphere.fromCornerPoints(min, max);
            }

            var camera = CIM.viewer.scene.camera;
            var offset = new Cesium.HeadingPitchRange(
                camera.heading,
                camera.pitch,
                0
            );
            camera.flyToBoundingSphere(sphere, { offset: offset });
            // _this.addPoint(sphere.center, Cesium.Color.fromCssColorString('#4aeddb'));
            if (type == "Room") {
                var edges = info.EdgeArray;
                _this.allPolyLine = [];
                var positions = [];
                if (!isMark) {
                    for (let i = 0; i < edges.length; i++) {
                        var poly = _this.addLabel(edges[i], modelMatrix, Cesium.Color.RED, isMark);  //fromCssColorString('#3f9191')
                        _this.allPolyLine.push(poly);

                        // var point1 = _this.getWorldPosition(edges[i].XYZ1, modelMatrix, false);
                        // var point2 = _this.getWorldPosition(edges[i].XYZ2, modelMatrix, false);
                        // if (minheight == null) {
                        //     maxheight = point1;
                        //     minheight = point1;
                        // }

                        // if (point1.z > maxheight.z) maxheight = point1;
                        // if (point1.z < minheight.z) minheight = point1;

                        // positions.push(point1);
                        // positions.push(point2);
                        // extrudedHeight = point1.z;

                    }
                } else {
                    let data = _this.restructPosition(edges);
                    for (let i = 0; i < data.length; i++) {
                        var poly = _this.addLabel(data[i], modelMatrix, Cesium.Color.RED, isMark);  //fromCssColorString('#3f9191')
                        _this.allPolyLine.push(poly);
                    }
                }
                // var poly = _this.addPolygon(positions, minheight, maxheight);
                // _this.allPolyLine.push(poly);

            }

            // _this.addPoint(new Cesium.Cartesian3(modelMatrix[12], modelMatrix[13], modelMatrix[14]), Cesium.Color.GREEN);
            // var obb = _this.getWorldPosition({ X: 0, Y: 0, Z: 0 }, modelMatrix)
            // _this.addPoint(obb, Cesium.Color.RED);
            // _this.addPoint(Cesium.Cartesian3.fromDegrees(116.39123, 39.90691, 15), Cesium.Color.YELLOW);
            // var topology = eval("(" + data[0].topologyelements + ")");

        });
    }

    restructPosition(data) {
        let positionArr = [];
        var minheight = 0;
        var maxheight = 0;
        var minX = 9999999;
        var maxX = 0;
        var minY = 9999999;
        var maxY = 0;
        for (let i = 0; i < data.length; i++) {
            if (data[i].XYZ1.Z != data[i].XYZ2.Z) {
                maxX = data[i].XYZ1.X > maxX ? data[i].XYZ1.X : maxX;
                minX = data[i].XYZ1.X < minX ? data[i].XYZ1.X : minX;
                maxY = data[i].XYZ1.Y > maxY ? data[i].XYZ1.Y : maxY;
                minY = data[i].XYZ1.Y < minY ? data[i].XYZ1.Y : minY;
                minheight = data[i].XYZ1.Z < data[i].XYZ2.Z ? data[i].XYZ1.Z : data[i].XYZ2.Z;
                maxheight = data[i].XYZ1.Z > data[i].XYZ2.Z ? data[i].XYZ1.Z : data[i].XYZ2.Z;
            }
        }
        positionArr.push({ name: "L1", XYZ1: { X: minX, Y: minY, Z: minheight }, XYZ2: { X: minX, Y: maxY, Z: minheight } });
        positionArr.push({ name: "L2", XYZ1: { X: minX, Y: maxY, Z: minheight }, XYZ2: { X: maxX, Y: maxY, Z: minheight } });
        positionArr.push({ name: "L3", XYZ1: { X: maxX, Y: minY, Z: minheight }, XYZ2: { X: maxX, Y: maxY, Z: minheight } });
        positionArr.push({ name: "L4", XYZ1: { X: minX, Y: minY, Z: minheight }, XYZ2: { X: maxX, Y: minY, Z: minheight } });

        positionArr.push({ name: "H1", XYZ1: { X: minX, Y: minY, Z: minheight }, XYZ2: { X: minX, Y: minY, Z: maxheight } });
        positionArr.push({ name: "H2", XYZ1: { X: minX, Y: maxY, Z: minheight }, XYZ2: { X: minX, Y: maxY, Z: maxheight } });
        positionArr.push({ name: "H3", XYZ1: { X: maxX, Y: maxY, Z: minheight }, XYZ2: { X: maxX, Y: maxY, Z: maxheight } });
        positionArr.push({ name: "H4", XYZ1: { X: maxX, Y: minY, Z: minheight }, XYZ2: { X: maxX, Y: minY, Z: maxheight } });

        var topCenter = { X: (minX + maxX) / 2, Y: (minY + maxY) / 2, Z: maxheight };
        var bottomCenter = { X: (minX + maxX) / 2, Y: (minY + maxY) / 2, Z: minheight };
        positionArr.push({ name: "H5", XYZ1: bottomCenter, XYZ2: topCenter });
        return positionArr;
    }

    clear() {
        if (this.allPolyLine != null) {
            for (let i = 0; i < this.allPolyLine.length; i++) {
                CIM.viewer.entities.remove(this.allPolyLine[i])
            }
        }
    }
    getWorldPosition(localCoordinates, modelMatrix, isNormal = true) {
        var obb = this.getObbCenter();
        // modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        //     Cesium.Cartesian3.fromDegrees(116.39123, 39.90691, 15)
        // );


        let coord = new Cesium.Cartesian3(
            localCoordinates.X,
            localCoordinates.Y,
            localCoordinates.Z
        );
        if (!isNormal) {
            coord = new Cesium.Cartesian3(
                localCoordinates.X * 0.3048,
                localCoordinates.Y * 0.3048,
                localCoordinates.Z * 0.3048,
            );
        }

        // var mz = new Cesium.Cartesian4(
        //     coord.x - obb.x,
        //     coord.y - obb.y,
        //     coord.z - obb.z + 1
        // )
        var mz = new Cesium.Cartesian4(
            coord.x,
            coord.y,
            coord.z
        )
        var mz10 = Cesium.Matrix4.multiplyByTranslation(
            modelMatrix,
            mz,
            new Cesium.Matrix4()
        );

        var position = new Cesium.Cartesian3(mz10[12], mz10[13], mz10[14]);
        return position;
    }
    getObbCenter() {
        var obb = [{ "Z": -10.199999809265137, "Y": 7.7728090630557745E-09, "X": -8.8196496963500977 }, { "Z": -10.199999809265137, "Y": 58.249996185302734, "X": -8.8196496963500977 }, { "Z": -10.199999809265137, "Y": 58.249996185302734, "X": 87.0 }, { "Z": -10.199999809265137, "Y": 7.7728090630557745E-09, "X": 87.0 }, { "Z": 101.09999847412109, "Y": 7.7728090630557745E-09, "X": -8.8196496963500977 }, { "Z": 101.09999847412109, "Y": 7.7728090630557745E-09, "X": 87.0 }, { "Z": 101.09999847412109, "Y": 58.249996185302734, "X": 87.0 }, { "Z": 101.09999847412109, "Y": 58.249996185302734, "X": -8.8196496963500977 }]; this.cartList = []
        for (let i = 0; i < 4; i++) {
            this.cartList.push(new Cesium.Cartesian3(obb[i].X, obb[i].Y, obb[i].Z))
        }
        var aabb = Cesium.AxisAlignedBoundingBox.fromPoints(this.cartList);
        var ce = new Cesium.Cartesian3(aabb.center.x, aabb.center.y, this.cartList[0].z)

        return ce;
    }
    async getBoxSubtract(tileset) {
        if (!tileset || !tileset instanceof Cesium.Cesium3DTileset) {
            return
        }
        var url = tileset.root.tileset.url;
        let data = await Cesium.Resource.fetchJson(url);

        var boundingVolume1 = data.root.boundingVolume;
        var boundingVolume2 = data.root.children[0].boundingVolume;

        // var boundingVolume1 = tileset.root.boundingSphere.center;
        // var boundingVolume2 = tileset.root.children[0].boundingSphere.center;


        var subtract = new Cesium.Cartesian3(
            boundingVolume2.box[0] - boundingVolume1.box[0],
            boundingVolume2.box[1] - boundingVolume1.box[1],
            boundingVolume2.box[2] - boundingVolume1.box[2]);

        return subtract;
    }
    addLabel(data, modelMatrix, color, isMark = true) {
        // var start = new Cesium.Cartesian3(data.Start.X, data.Start.Y, data.Start.Z);
        // var end = new Cesium.Cartesian3(data.End.X, data.End.Y, data.End.Z);

        // if (face == "南") {
        //     mz1.y -= 0.15;
        //     mz2.y -= 0.15;
        // } else if (face == "西") {
        //     mz1.x -= 0.15;
        //     mz2.x -= 0.15;
        // } else if (face == "北") {
        //     mz1.y += 0.1;
        //     mz2.y += 0.1;
        // } else if (face == "东") {
        //     mz1.x += 0.1;
        //     mz2.x += 0.1;
        // }

        var position1 = this.getWorldPosition(data.XYZ1, modelMatrix, false);
        var position2 = this.getWorldPosition(data.XYZ2, modelMatrix, false);

        var certerPosition = new Cesium.Cartesian3((position1.x + position2.x) / 2, (position1.y + position2.y) / 2, (position1.z + position2.z) / 2);

        var poly = CIM.viewer.entities.add({
            position: certerPosition,
            polyline: {
                pixelSize: 5,
                material: color,
                width: 2,
                positions: [position1, position2],
            },
        });

        if (isMark) {
            // var length = (parseFloat(data.Length) * 0.3048).toFixed(4) * 1000;
            // var text = length.toString() + "mm"
            var distance = agMath.getDistance(position1, position2);
            // var distance = parseFloat(data.Length);
            var text = data.name + ":" + (distance * 1000).toFixed(0) + "mm";
            poly.label = {
                // text: text,
                // font: '14px sans-serif',
                // fillColor: Cesium.Color.GOLD,
                // style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                // outlineWidth: 2,
                // verticalOrigin: Cesium.VerticalOrigin.TOP,
                // pixelOffset: new Cesium.Cartesian2(0, 5),
                text: text,
                font: 'normal 16px MicroSoft YaHei',
                fillColor: Cesium.Color.GOLD,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                outlineWidth: 2,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                showBackground: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            }
        }
        return poly;
    }

    addPolygon(positions, minheight, maxheight) {
        var cartographic1 = CIM.viewer.scene.globe.ellipsoid.cartesianToCartographic(minheight);
        var alt1 = cartographic1.height;

        var cartographic2 = CIM.viewer.scene.globe.ellipsoid.cartesianToCartographic(maxheight);
        var alt2 = cartographic2.height;


        var polygon = CIM.viewer.entities.add({
            name: "Green extruded polygon",
            polygon: {
                hierarchy: positions,
                height: alt1,
                extrudedHeight: alt2 - alt1,
                perPositionHeight: false,
                material: Cesium.Color.fromCssColorString('#4aeddb').withAlpha(0.1),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#4aeddb'),
            },
        });
        return polygon;
    }

    addPoint(position, color) {
        var point = CIM.viewer.entities.add({
            name: '尺寸标注',
            position: position,
            point: {
                color: color, //点位颜色
                pixelSize: 20 //像素点大小
            }
        });
    }
}

export default new component();