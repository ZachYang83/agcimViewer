<template>
  <ag-popup
    v-model="visible"
    title="场景设置"
    @onCancel="onCancel"
    class="infoBox"
  >
    <div id="toolbar" class="switch-box">
      <table>
        <tbody>
          <tr>
            <td>Bloom</td>
            <td><input type="checkbox" data-bind="checked: show" /></td>
          </tr>
          <tr>
            <td>Glow only</td>
            <td><input type="checkbox" data-bind="checked: glowOnly" /></td>
          </tr>
          <tr>
            <td>Contrast</td>
            <td>
              <input
                type="range"
                min="-255.0"
                max="255.0"
                step="0.01"
                data-bind="value: contrast, valueUpdate: 'input'"
              />
            </td>
          </tr>
          <tr>
            <td>Brightness</td>
            <td>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.01"
                data-bind="value: brightness, valueUpdate: 'input'"
              />
            </td>
          </tr>
          <tr>
            <td>Delta</td>
            <td>
              <input
                type="range"
                min="1"
                max="5"
                step="0.01"
                data-bind="value: delta, valueUpdate: 'input'"
              />
            </td>
          </tr>
          <tr>
            <td>Sigma</td>
            <td>
              <input
                type="range"
                min="1"
                max="10"
                step="0.01"
                data-bind="value: sigma, valueUpdate: 'input'"
              />
            </td>
          </tr>
          <tr>
            <td>Step Size</td>
            <td>
              <input
                type="range"
                min="0"
                max="7"
                step="0.01"
                data-bind="value: stepSize, valueUpdate: 'input'"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      visible: true,
      isProxy: false,
      isDepthTest: false,
    };
  },
  mounted() {
    this.isDepthTest = CIM.viewer.scene.globe.depthTestAgainstTerrain;
    var bloom = CIM.viewer.scene.postProcessStages.bloom;
    var viewModel = {
      show: true,
      glowOnly: false,
      contrast: bloom.uniforms.contrast,
      brightness: bloom.uniforms.brightness,
      delta: bloom.uniforms.delta,
      sigma: bloom.uniforms.sigma,
      stepSize: bloom.uniforms.stepSize,
    };

    Cesium.knockout.track(viewModel);
    var toolbar = document.getElementById("toolbar");
    Cesium.knockout.applyBindings(viewModel, toolbar);
    for (var name in viewModel) {
      if (viewModel.hasOwnProperty(name)) {
        Cesium.knockout
          .getObservable(viewModel, name)
          .subscribe(updatePostProcess);
      }
    }

    function updatePostProcess() {
      var bloom = CIM.viewer.scene.postProcessStages.bloom;
      bloom.enabled = Boolean(viewModel.show);
      bloom.uniforms.glowOnly = Boolean(viewModel.glowOnly);
      bloom.uniforms.contrast = Number(viewModel.contrast);
      bloom.uniforms.brightness = Number(viewModel.brightness);
      bloom.uniforms.delta = Number(viewModel.delta);
      bloom.uniforms.sigma = Number(viewModel.sigma);
      bloom.uniforms.stepSize = Number(viewModel.stepSize);
    }
  },
  methods: {
    onCancel() {
      this.visible = false;
      this.$emit("close", { code: "SceneSettingTool" });
    },
    
  },
};
</script>
<style scoped>
.infoBox{
  width: 200px;
  height: 200px;
}
.switch-box {
  padding: 5px 10px;
  width: 200px;
  height: 200px;
}
.switch-box .item {
  margin-bottom: 10px;
}
.switch {
  left: 15px;
}
.trlable {
  font-size: 12px;
}
</style>