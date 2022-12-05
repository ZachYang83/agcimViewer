/**
 * 2020年4月21日19:21:36 陈彪
 */
import serverData from "./serverData";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
var agFeatureLayer;

class Resident {
    constructor() {
        this.people = [];
        this.tileset = null;
        agFeatureLayer = new AgFeatureLayer(CIM.viewer);
    }
    /**
     * 初始化数据
     */
    initialize() {
        serverData.getPersonCaseInfo().then(response => {
            var data = response;
            this.people.splice(0, this.people.length);
            for (let i = 0; i < data.length; i++) {
                this.people.push(data[i]);
            }
        });
    }

    /**
     * 定位到某个人
     * @param {*} person 
     * @param {*} viewer 
     * @param {*} tileset 
     */
    locateTo(viewer, person, tileset) {
        this.tileset = tileset;
        var floor = this.transLevel(person.room_number);
        this.clipBuilding(this.tileset, floor, viewer);
        this.addPerson(tileset, person, viewer);
    }
    /**
     * //获取剖面
     * @param {*} tileset 
     * @param {*} floor 
     * @param {*} viewer 
     */
    clipBuilding(tileset, floor) {
        var floorHeight = 5.1;   //设定楼层高度
        var startHeight = 0.6;   //设定起始高度

        tileset.readyPromise.then(function (tileset) {
            let cartographic = Cesium.Cartographic.fromCartesian(
                tileset.boundingSphere.center
            );
            var clips = new Cesium.ClippingPlaneCollection({
                planes: [
                    new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0),
                        startHeight + (floor - 1) * floorHeight + 0.2 - cartographic.height
                    )
                ],
                edgeWidth: 1.0
            });
            tileset.clippingPlanes = clips;

            if (!Cesium.Matrix4.equals(tileset._root.transform, Cesium.Matrix4.IDENTITY)) {
                var transformCenter = Cesium.Matrix4.getTranslation(
                    tileset._root.transform,
                    new Cesium.Cartesian3()
                );
                var transformCartographic = Cesium.Cartographic.fromCartesian(
                    transformCenter
                );
                var boundingSphereCartographic = Cesium.Cartographic.fromCartesian(
                    tileset.boundingSphere.center
                );
                var height = boundingSphereCartographic.height - transformCartographic.height;
                clips.modelMatrix = Cesium.Matrix4.fromTranslation(
                    new Cesium.Cartesian3(0.0, 0.0, height)
                );
            }
        });
    }
    addPerson(tileset, person, viewer) {
        var cartographic = Cesium.Cartographic.fromCartesian(   //此行开始计算模型出现位置，写死
            tileset.boundingSphere.center
        );
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var startHeight = 0.6;
        var floorHeight = 5.1;
        var floor = this.transLevel(person.room_number);

        var x = 0; //控制闪烁透明度变量
        var flog = true;  //控制闪烁变量

        var colorChange = function () {  //闪烁
            if (flog) {
                x = x - 0.07;
                if (x <= 0.1) {
                    flog = false;
                }
            }
            else {
                x = x + 0.07;
                if (x >= 0.9) {
                    flog = true;
                }
            }
            return Cesium.Color.RED.withAlpha(x);
        };
        var floor = this.transLevel(person.room_number);
        //删除已存在人模型
        this.removePerson(viewer);
        //显示当前楼层的人模型
        var position = Cesium.Cartesian3.fromDegrees(
            lng + this.transLocation(person.room_number), lat - 0.000065, startHeight + (floor - 1) * floorHeight - 1
        );
        var humanEntities = agFeatureLayer.addEntity({
            id: person.id_card,
            position: position,
            model: {
                uri: './model3d/CesiumMan/Cesium_Man.glb',
                color: new Cesium.CallbackProperty(colorChange, false),
                scale: 2.0
            }
        });
        viewer.flyTo(
            humanEntities,
            {
                offset: new Cesium.HeadingPitchRange(-0.1, -0.8, 45)
            });

    }

    transLevel(room) {
        var levelstr = room.substring(1, 3);
        return parseInt(levelstr);
    }
    transLocation(room) {
        var str = room.substring(3, 5);
        if (str == '01') return 0.000025;
        else return -0.000025;
    }

    removePerson(viewer) {
        agFeatureLayer.removeAll();
    }
    removeClips() {
        if (!this.tileset)
            return;
        if (this.tileset.clippingPlanes) {
            this.tileset.clippingPlanes.removeAll();
        }
    }
    removeAll(viewer) {
        this.removeClips(viewer);
        this.removePerson(viewer);
    }
}

export default new Resident();