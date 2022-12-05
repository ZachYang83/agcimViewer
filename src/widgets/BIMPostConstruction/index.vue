<template>
  <a-tabs default-active-key="1" @change="changeTab">
    <a-tab-pane key="1">
      <span slot="tab">
        <a-icon type="bank" />
        建造模拟
      </span>
      <building-simulation ref="simulation"></building-simulation>
    </a-tab-pane>
    <a-tab-pane key="2">
      <span slot="tab">
        <a-icon type="carry-out" />
        净高/进深核对
      </span>
      <room-tree ref="roomTree"></room-tree>
    </a-tab-pane>
  </a-tabs>
</template>
<script>
import BuildingSimulation from "./BuildingSimulation";
import RoomTree from "./RoomTree";
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import { initPoaLayer } from "./js/config";
export default {
  components: {
    "building-simulation": BuildingSimulation,
    "room-tree": RoomTree,
  },
  mounted(){
    widgetConfigHelper.setInitSence(initPoaLayer, CIM.viewer);
  },
  methods: { 
    changeTab(key) {
      if (key == 1) {
        this.$refs.roomTree.closeRoomCheck();
      } else {
        this.$refs.simulation.onCancel();
      }
    },
  },
};
</script>
<style scoped>
/deep/.ant-tabs-bar {
  margin: 0;
}
/deep/.ant-tabs-nav .ant-tabs-tab {
  margin: 0;
}
</style>
