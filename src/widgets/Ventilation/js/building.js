export default {
  props: ["buildingTileset", "buildState"],
  data() {
    return {
      keyid: 0,
      show: 1,
      showbd: 1,
      showlvl: 1,
      showid: "1",
      showimg: require("../img/p1.png"),
      showbdid: "1",
      showname: "1期", //区域名称
      showbdname: "A1", //建筑名称
      showlvlname: 1, //楼层
      showlvlid: "1", //楼层id,待优化
      showlvlimg: require("../img/ventals.png"),
      showinfo: "点击楼层查看单层结果",
      buildingInfo: "",
      floor: 1,
      resultimg: require("../img/levelVent.png"),
      resultPlane: null,
      clippingPlane: null,
      humanEntitiesStore: [],
      opacity: 1,
      community: null,
      building: null,
      levels: null,
      people: null,
    };
  },
  mounted() {
    this.community = require("../data/community.json").community;
    this.building = require("../data/community.json").building;
    this.levels = require("../data/community.json").levels;
    this.people = require("../data/community.json").people;

    for (let i = 0; i < this.community.length; i++) {
      this.community[i].imglink = require(`../${this.community[i].imglink}`);
    }
    for (let j = 0; j < this.levels.length; j++) {
      this.levels[j].imglink = require(`../${this.levels[j].imglink}`);
    }
  },
  beforeDestroy() {
    if (this.resultPlane != null)
      CIM.viewer.entities.remove(this.resultPlane);
    if (this.clippingPlane != null) {
      CIM.viewer.entities.remove(this.clippingPlane);
      this.buildingTileset.clippingPlanes = [];
    }
  },
  methods: {
    sendMsgToIndex() {
      this.$emit("backToIndex", "isArea");
    },
    showBuilding(id, name, key) {
      this.keyid = key;
      this.showbdid = id;
      this.showbdname = name;
      if (this.keyid == key) {
        this.showbd = key + 1;
      }
      this.RegisterMouseMoveEvent();
    },
    showLevel(id, img, name, key) {
      this.keyid = key;
      this.showlvlid = id;
      this.showlvlimg = img;
      this.showinfo = this.showbdname + "# " + name + "楼";
      if (this.keyid == key) {
        this.showlvl = key + 1;
      }
      this.floor = name;
      this.ClippingBuilding(this.buildingTileset, this.floor);
      //this.showPeople(this.buildingTileset, this.floor); //需关联建筑ID，暂时只关联层数
    },
    ClippingBuilding(tileset, floor) {
      var viewer = CIM.viewer;
      var floorHeight = 3.3;
      //清空已有剖面图片实体
      if (this.resultPlane != null)
        viewer.entities.remove(this.resultPlane);
      if (this.clippingPlane != null)
        viewer.entities.remove(this.clippingPlane);
      var cartographic = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      );
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      var startHeight = 3.3;
      this.resultPlane = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(
          lng,
          lat,
          startHeight + (floor - 1) * floorHeight - 1.7
        ),
        plane: {
          plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
          dimensions: new Cesium.Cartesian2(21, 38),
          material: this.resultimg,
          classificationType: Cesium.ClassificationType.TERRAIN
        }
      });
      var clippingPlanes = new Cesium.ClippingPlaneCollection({
        planes: [
          new Cesium.ClippingPlane(
            new Cesium.Cartesian3(0.0, 0.0, -1.0),
            startHeight + (floor - 1) * floorHeight - 0.4 - cartographic.height
          )
        ],
        edgeWidth: 1.0
      });
      tileset.clippingPlanes = clippingPlanes;
      tileset.debugShowBoundingVolume = false;
      var boundingSphere = tileset.boundingSphere;
      var radius = boundingSphere.radius;

      if (
        !Cesium.Matrix4.equals(tileset.root.transform, Cesium.Matrix4.IDENTITY)
      ) {
        var transformCenter = Cesium.Matrix4.getTranslation(
          tileset.root.transform,
          new Cesium.Cartesian3()
        );
        var transformCartographic = Cesium.Cartographic.fromCartesian(
          transformCenter
        );
        var boundingSphereCartographic = Cesium.Cartographic.fromCartesian(
          tileset.boundingSphere.center
        );
        var height =
          boundingSphereCartographic.height - transformCartographic.height;
        clippingPlanes.modelMatrix = Cesium.Matrix4.fromTranslation(
          new Cesium.Cartesian3(0.0, 0.0, height)
        );
      }

      var plane = clippingPlanes.get(0);
      this.clippingPlane = viewer.entities.add({
        position: boundingSphere.center,
        plane: {
          dimensions: new Cesium.Cartesian2(radius * 1.1, radius * 1.1),
          material: Cesium.Color.WHITE.withAlpha(0.1),
          plane: plane,
          outline: true,
          outlineColor: Cesium.Color.WHITE
        }
      });
    },
    clearPeople: function () {
      var i = 0;
      var viewer = CIM.viewer;
      for (i = 0; i < this.humanEntitiesStore.length; i++) {

        viewer.entities.remove(this.humanEntitiesStore[i]);

      }
    },
    showPeople: function (tileset, floor) {
      var human; //人物属性数组
      var i; //计数君
      var cartographic = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      );
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      var startHeight = 3.3;
      var floorHeight = 5.1;
      var viewer = CIM.viewer;
      //var scene = viewer.scene;
     
      //删除已存在人模型
      this.clearPeople();
      //显示当前楼层的人模型
      for (i = 0; i < this.people.length; i++) {
        human = this.people[i];
        if (human.level == floor) {
          var position = Cesium.Cartesian3.fromDegrees(lng + human.location, lat - 0.000013, startHeight + (floor - 1) * floorHeight);
          var humanEntities = viewer.entities.add({
            id: human.id,
            position: position,
            model: {
              uri: './model3d/CesiumMan/Cesium_Man.glb',
              color: Cesium.Color.CRIMSON,
              scale: 2.0
            }
          });
          var entityID = viewer.entities.getById(human.id);
          this.humanEntitiesStore.push(entityID);
        }
      }
    },
    RegisterMouseMoveEvent: function () {
      var _this = this;
      var viewer = CIM.viewer;
      var highlightBuilding = null;
      var currentFloor = 1;
      var floorHeight = 5.1;

      var handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
      handler.setInputAction(function (movement) {
        var scene = viewer.scene;
        if (highlightBuilding != null)
          viewer.scene.primitives.remove(highlightBuilding);

        var pickedObject = scene.pick(movement.endPosition); //判断是否拾取到模型
        if (
          scene.pickPositionSupported &&
          Cesium.defined(pickedObject) &&
          Cesium.defined(pickedObject.content) &&
          Cesium.defined(pickedObject.content._tileset)
        ) {
          var cartesian = viewer.scene.pickPosition(movement.endPosition);
          if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var height = cartographic.height;
            var floor = parseInt((height - 1.4) / floorHeight) + 1;
            floor = floor < 1 ? 1 : floor;
            highlightBuilding = _this.highlight(_this.buildingTileset, floor);
            currentFloor = floor;
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    highlight(tileset, floor) {
      var viewer = CIM.viewer;
      var cartographic = Cesium.Cartographic.fromCartesian(
        tileset.boundingSphere.center
      );
      var lat = Cesium.Math.toDegrees(cartographic.latitude);
      var lng = Cesium.Math.toDegrees(cartographic.longitude);
      var startHeight = 3.3;
      var floorHeight = 3.3;
      var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(
          lng,
          lat,
          startHeight + floorHeight * (floor - 1)
        )
      );
      var buildingHighlight = viewer.scene.primitives.add(
        new Cesium.ClassificationPrimitive({
          geometryInstances: new Cesium.GeometryInstance({
            geometry: Cesium.BoxGeometry.fromDimensions({
              vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
              dimensions: new Cesium.Cartesian3(14, 50, floorHeight)
            }),
            modelMatrix: modelMatrix,
            attributes: {
              color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                new Cesium.Color(1.0, 0.0, 0.0, 0.5)
              ),
              show: new Cesium.ShowGeometryInstanceAttribute(true)
            }
          }),
          classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
        })
      );
      return buildingHighlight;
    }
  }
};