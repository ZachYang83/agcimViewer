<!--
 * @author: 张瀚
 * @description: 二维绘制
-->
<template>
  <div>
    <p>用于临时在二维绘制二维的符号和图形，可用于场景的设计以及专题的图的绘制</p>
    <p>操作统一为双击左键完成、右键取消，单击左键根据绘制类型略有差异。</p>
    <a-tabs default-active-key="1" size="small">
      <a-tab-pane key="1" tab="点绘制">
        <pointRender />
      </a-tab-pane>
      <a-tab-pane key="2" tab="线绘制" force-render>
        <polylineRender />
      </a-tab-pane>
      <a-tab-pane key="3" tab="面绘制">
        <polygonRender />
      </a-tab-pane>
      <a-tab-pane key="4" tab="文字">
        <labelRender />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import pointRender from "./pointRender.vue";
import polylineRender from "./polylineRender.vue";
import polygonRender from "./polygonRender.vue";
import labelRender from "./labelRender.vue";
export default {
  components: { pointRender, polylineRender, polygonRender, labelRender },
  props: {},
  data() {
    return {
      tempDepthTestAgainstTerrain: false,
    };
  },
  created() {
    this.tempDepthTestAgainstTerrain = CIM.viewer.scene.globe.depthTestAgainstTerrain
    CIM.viewer.scene.globe.depthTestAgainstTerrain = false;
  },
  mounted() { },
  destroyed() {
    CIM.viewer.scene.globe.depthTestAgainstTerrain = this.tempDepthTestAgainstTerrain;
  },
  computed: {},
  watch: {},
  methods: {},
};
</script>
<style scoped>
p{
  padding: 5px;
}
::v-deep .render {
  padding: 0 5px;
}
::v-deep .ant-input,::v-deep .ant-input-number {
  margin: 5px 0;
  width: 80%;
  text-align: center;
}
::v-deep .ant-input-affix-wrapper .ant-input{
  width: 100%;
}
::v-deep .ant-btn {
  margin: 5px 0;
}
::v-deep .ant-tabs-nav .ant-tabs-tab {
  margin: 0 4px;
}
</style>