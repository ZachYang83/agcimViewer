<template>
  <div>
    <ag-popup v-model="visible" title="BIM设计" @onCancel="onCancel" class="popup-box">
      <div class="content">
        <a-tabs @change="onChangeTab">
          <a-tab-pane key="HouseStore" tab="房屋商店">
            <house-store />
          </a-tab-pane>
          <a-tab-pane key="MaterialStore" tab="材料商店">
            <material-store />
          </a-tab-pane>
        </a-tabs>
      </div>
    </ag-popup>
  </div>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import HouseStore from "./HouseStore/index";
import MaterialStore from "./MaterialStore/index";
let viewer = null;
export default {
  components: {
    "ag-popup": AgPopup,
    "house-store": HouseStore,
    "material-store": MaterialStore,
  },
  data() {
    return {
      visible: true,
      tab: "1",
      visibleModel: false,
      visibleMaterial: false,
    };
  },
  computed: {},
  mounted() {
    viewer = CIM.viewer;
  },
  methods: {
    onShow(o) {
      this.visible = true;
    },
    onCancel() {
      this.visible = false;
    },
    onChangeTab(e) {
      this.tab = e;
    },
  },
};
</script>
<style scoped>
.popup-box {
  width: 480px;
}
.content {
  padding: 10px 20px;
  background: #fff;
}
</style>