<template>
  <div>
    <div style="margin-left:10px">
      <h3>
        <b>功能描述</b>
      </h3>
      <br />
      <p>提取天际线，并可下载当前界面截图</p>
      <br />
    </div>
    <div class="sky-line">
      <a-button class="locate" @click="getSkyLine">
        <a-icon type="check-circle" style="font-size: 14px;" />提取天际线
      </a-button>
      <a-button class="locate" @click="clear">
        <a-icon type="delete" style="font-size: 14px;" />清除
      </a-button>
    </div>
    <div class="sky-line" v-show="screenshot">
      <a-button class="locate" @click="downloadScreen">
        <a-icon type="delete" style="font-size: 14px;" />截图并下载
      </a-button>
    </div>
  </div>
</template>
<script>
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import canvas2image from "@/views/js/extension/canvas2Image.js";
import { initPoaLayer } from "./js/config";
let viewer = CIM.viewer;
let collection = {};
let postProcessStageComposite = {};
let postProcessStageComposite1 = {};
export default {
  name: "skyLineAnalysis",
  data() {
    return {
      screenshot: false,
    };
  },
  mounted() {
    widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  methods: {
    getSkyLine() {
      var skyColor = "vec4(1.0,1.0,0.0,1.0)"; //天空颜色
      collection = viewer.scene.postProcessStages;
      var edgeDetection = Cesium.PostProcessStageLibrary.createEdgeDetectionStage(); //边缘检测
      var postProccessStage = new Cesium.PostProcessStage({
        name: "czm_skylinetemp",
        fragmentShader:
          "uniform sampler2D colorTexture;" +
          "uniform sampler2D depthTexture;" +
          "varying vec2 v_textureCoordinates;" +
          "void main(void)" +
          "{" +
          "float depth = czm_readDepth(depthTexture, v_textureCoordinates);" +
          "vec4 color = texture2D(colorTexture, v_textureCoordinates);" +
          "if(depth<1.0 - 0.000001){" +
          "gl_FragColor = color;" +
          "}" +
          "else{" +
          "gl_FragColor = " +
          skyColor +
          ";" +
          "}" +
          "}",
      });
      var postProccessStage1 = new Cesium.PostProcessStage({
        name: "czm_skylinetemp1",
        fragmentShader:
          "uniform sampler2D colorTexture;" +
          "uniform sampler2D redTexture;" +
          "uniform sampler2D silhouetteTexture;" +
          "varying vec2 v_textureCoordinates;" +
          "void main(void)" +
          "{" +
          "vec4 redcolor=texture2D(redTexture, v_textureCoordinates);" +
          "vec4 silhouetteColor = texture2D(silhouetteTexture, v_textureCoordinates);" +
          "vec4 color = texture2D(colorTexture, v_textureCoordinates);" +
          "if(redcolor.r == 1.0){" +
          "gl_FragColor = mix(color, vec4(1.0,0.0,0.0,1.0), silhouetteColor.a);" +
          "}" +
          "else{" +
          "gl_FragColor = color;" +
          "}" +
          "}",
        uniforms: {
          redTexture: postProccessStage.name,
          silhouetteTexture: edgeDetection.name,
        },
      });
      postProcessStageComposite = new Cesium.PostProcessStageComposite({
        name: "czm_skyline",
        stages: [edgeDetection, postProccessStage],
        inputPreviousStageTexture: false,
        uniforms: edgeDetection.uniforms,
      });
      postProcessStageComposite1 = new Cesium.PostProcessStageComposite({
        name: "czm_skyline1",
        stages: [postProccessStage1],
        inputPreviousStageTexture: true,
        uniforms: edgeDetection.uniforms,
      });
      collection.add(postProcessStageComposite);
      collection.add(postProcessStageComposite1);
      this.screenshot = true;
    },
    downloadScreen() {
      var canvas = viewer.scene.canvas;
      var getimg = canvas2image.convertToImage(
        canvas,
        canvas.width,
        canvas.height,
        "png"
      );
      var image = document.getElementById("image");
      savefile(getimg.src, "skylinePic.png");
      function savefile(data, filename) {
        var save_link = document.createElement("a");
        save_link.href = data;
        save_link.download = filename;
        save_link.style.display = "none";
        document.body.appendChild(save_link);
        save_link.click();
        document.body.removeChild(save_link);
      }
    },
    clear() {
      this.screenshot = false;
      collection.remove(postProcessStageComposite);
      collection.remove(postProcessStageComposite1);
    },
  },
};
</script>
<style scoped>
.sky-line {
  margin: 10px;
  text-align: center;
}
.locate {
  background-color: rgb(24, 144, 255);
  color: white;
  border: 0;
  margin-right: 5px;
}
.locate:hover {
  background-color: rgb(85, 173, 255);
}
</style>
