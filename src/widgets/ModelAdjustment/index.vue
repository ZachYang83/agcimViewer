<template>
  <ag-popup
    v-model="visible"
    title="更新3DTiles位置"
    @onCancel="onCancel"
    class="infoBox"
  >
    <div class="content">
      <p>
        单击切换模型 ：
        <b>{{ name }}</b>
        <a-button style="margin-left:10px;" @click="zoomTo">定位</a-button>
      </p>
      <a-divider />
      <a-button @click="onModelMove">移动</a-button>
      <a-button style="margin-left:10px;" @click="onModelRoate">旋转</a-button>
      <a-divider />
      <div class="h4">平移偏移值</div>
      x: <a-input-number v-model="translateVal.x" />y:
      <a-input-number v-model="translateVal.y" />z:
      <a-input-number v-model="translateVal.z" />
      <a-button type="primary" @click="onTranslate">平移</a-button>
      <a-divider />
      <div class="h4">旋转偏移值 (角度)</div>
      x: <a-input-number v-model="rotateVal.x" />y:
      <a-input-number v-model="rotateVal.y" />z:
      <a-input-number v-model="rotateVal.z" />
      <a-button type="primary" @click="onRotate">旋转</a-button>
      <a-divider />
      <div class="btm">
        <a-button type="primary" @click="save">保存下载</a-button>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import axios from "@/views/js/net/http";
import AgPopup from "@/views/components/AgPopup.vue";
import saveAs from "./js/FileSaver";
import AdjustModel from "./js/AdjustModel";

let viewer = null;
let pickerHelper = null;
let tileset = null;
let modelType = null;

export default {
  name: "ModelAdjustment",
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      //平移
      translateVal: {
        x: 0,
        y: 0,
        z: 0,
      },
      //旋转
      rotateVal: {
        x: 0,
        y: 0,
        z: 0,
      },
      name: "无",
    };
  },
  mounted() {
    viewer = CIM.viewer;
    AdjustModel.initialize(viewer);
    pickerHelper = new PickerHelper(viewer);
    if (!tileset) {
      tileset = CIM.layerTree._aglayers[0]._primitives[0]; //默认
      this.name = tileset.agMetaData.nameCn;
      modelType = "tileset";
      AdjustModel.setModel(tileset, modelType);
    }
    this.addEvent();
    // this.addModel();
  },
  methods: {
    addModel() {
      let pos1 = Cesium.Cartesian3.fromDegrees(120, 30, 3);
      let url1 =
        "/agsupport-rest/agsupport/BIM/Component/preview?type=2&id=917ceb5e-a2a0-4d20-accb-f447fa3c2cd9";
      let offset = new Cesium.HeadingPitchRange(
        -Cesium.Math.PI * 0.75,
        -Cesium.Math.PI_OVER_FOUR,
        50
      );
      viewer.camera.lookAt(pos1, offset);
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      //  添加模型
      // let bus1 = viewer.scene.primitives.add(
      //   Cesium.Model.fromGltf({
      //     url: url1,
      //     modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(pos1),
      //   })
      // );
      // bus1.name = "树";
      var hpr = new Cesium.HeadingPitchRoll(0, 0, 0);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(pos1, hpr);
      let bus1 = viewer.entities.add({
        name: "树",
        position: pos1,
        orientation: orientation,
        model: {
          scale: 10,
          uri: url1,
        },
      });
    },
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
      this.$emit("close", { code: "ModelAdjustment" });
    },
    onModelMove() {
      AdjustModel.useTriAxis();
    },
    onModelRoate() {
      AdjustModel.useTriCircle();
    },
    addEvent() {
      let vm = this;
      pickerHelper.on("LEFT_CLICK", function(movement) {
        let o = movement.position;
        var pick = viewer.scene.pick(o);
        if (pick && pick.content) {
          tileset = pick.primitive;
          vm.name = tileset.agMetaData.nameCn;
          modelType = "tileset";
          AdjustModel.setModel(tileset, modelType);
        } else if (pick && pick.node && pick.id) {
          tileset = pick.id;
          vm.name = tileset.name;
          modelType = "gltfEntity";
          AdjustModel.setModel(tileset, modelType);
        } else if (pick && pick.node && !pick.id) {
          tileset = pick.primitive;
          vm.name = tileset.name;
          modelType = "gltfPrimitive";
          AdjustModel.setModel(tileset, modelType);
        }
      });
    },
    //平移
    onTranslate() {
      let vm = this;
      var mat;
      var m = Cesium.Matrix4.fromArray([
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        vm.translateVal.x,
        vm.translateVal.y,
        vm.translateVal.z,
        1.0,
      ]);
      if (modelType == "tileset") {
        mat = tileset._root.transform;
        tileset.root.transform = Cesium.Matrix4.multiply(mat, m, mat);
      } else if (modelType == "gltfPrimitive") {
        mat = tileset.modelMatrix;
        tileset.modelMatrix = Cesium.Matrix4.multiply(mat, m, mat);
      } else if (modelType == "gltfEntity") {
        var modelPosition = tileset.position._value;
        mat = Cesium.Transforms.eastNorthUpToFixedFrame(modelPosition);
        var modelMatrix = Cesium.Matrix4.multiply(mat, m, mat);
        tileset.position._value = new Cesium.Cartesian3(
          modelMatrix[12],
          modelMatrix[13],
          modelMatrix[14]
        );
      }
    },
    //旋转
    onRotate() {
      let mat = tileset._root.transform;

      let m1 = Cesium.Matrix3.fromRotationX(
        Cesium.Math.toRadians(this.rotateVal.x)
      );
      tileset._root.tramform = Cesium.Matrix4.multiplyByMatrix3(mat, m1, mat);

      mat = tileset._root.transform;
      m1 = Cesium.Matrix3.fromRotationY(
        Cesium.Math.toRadians(this.rotateVal.y)
      );
      tileset._root.tramform = Cesium.Matrix4.multiplyByMatrix3(mat, m1, mat);

      mat = tileset._root.transform;
      m1 = Cesium.Matrix3.fromRotationZ(
        Cesium.Math.toRadians(this.rotateVal.z)
      );
      tileset._root.tramform = Cesium.Matrix4.multiplyByMatrix3(mat, m1, mat);
    },
    zoomTo() {
      if (!tileset) {
        this.$message.info("请先点击模型选择");
      } else {
        viewer.zoomTo(tileset);
      }
    },
    async uploadToServe() {
      let res = await axios.get(
        `/agsupport-rest/agsupport/project/uploadTo/${this.$store.state.user.userId}`
      );
      if (res.success) {
      }
    },
    save() {
      let content = this.LoadData(tileset.url);
      for (let i = 0; i < 16; i++) {
        content["root"]["transform"][i] = tileset._root.transform[i];
      }
      let blob = new Blob([JSON.stringify(content)], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, "tileset.json");
    },
    LoadData(path) {
      let result = null;
      try {
        let xhr = new XMLHttpRequest(),
          okStatus = document.location.protocol === "file:" ? 0 : 200;
        xhr.open("GET", path, false);

        xhr.overrideMimeType("text/html;charset=utf-8"); //默认为utf-8
        xhr.send(null);
        if (xhr.readyState == 4 && xhr.status == 200) {
          result = JSON.parse(xhr.responseText);
        }
      } catch (error) {
        result = null;
      }
      return result;
    },
  },
  destroyed() {
    pickerHelper.off();
  },
};
</script>
<style scoped>
.infoBox {
  width: 400px;
}
.infoBox .content {
  padding: 20px;
  line-height: 1.5;
}
.infoBox .ant-input-number {
  margin: 10px 10px 0 0;
  width: 70px;
}
.infoBox .btm {
  text-align: center;
}
.ant-divider-horizontal {
  margin: 10px 0;
}
</style>
