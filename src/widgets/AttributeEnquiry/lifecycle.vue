<template>
  <ag-popup v-model="visible" title="全生命周期" @onCancel="onCancel" class="popup-box">
    <div class="content">
      <a-tabs @change="onChangeTab">
        <a-tab-pane key="PlanningPermitPhase" tab="用地规划许可">
          <planning-permit />
        </a-tab-pane>
        <a-tab-pane key="ConstructionPermitPhase" tab="工程建设许可阶段">
          <construction-permit />
        </a-tab-pane>
        <a-tab-pane key="BuildPermitPhase" tab="施工许可阶段">
          <build-permit />
        </a-tab-pane>
        <a-tab-pane key="CompletionAcceptancePhase" tab="竣工验收阶段">
          <completion-acceptance />
        </a-tab-pane>
        <a-tab-pane key="ManagementPhase" tab="物业管理">
          <managerment />
        </a-tab-pane>
      </a-tabs>
    </div>
  </ag-popup>
</template>
<script>
import BuildPermitPhase from "./BuildPermitPhase/index";
import CompletionAcceptancePhase from "./CompletionAcceptancePhase/index";
import ConstructionPermitPhase from "./ConstructionPermitPhase/index";
import ManagermentPhase from "./ManagermentPhase/index";
import PlanningPermitPhase from "./PlanningPermitPhase/index";
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: {
    "ag-popup": AgPopup,
    "build-permit": BuildPermitPhase,
    "completion-acceptance": CompletionAcceptancePhase,
    "construction-permit": ConstructionPermitPhase,
    "managerment": ManagermentPhase,
    "planning-permit": PlanningPermitPhase,
  },
  props: ["visible"],
  data() {
    return {
      tab: "1",
    }
  },
  mounted() {

  },
  methods: {
    onChangeTab(e) {
      this.tab = e;
    },
    onCancel() {
      this.$emit("close", { code: "AttributeEnquiry" });
      this.$emit("closeLifeCycle", false);
    },
  }
}
</script>
<style scoped>
.popup-box {
  width: 750px;
  height: 600px;
  top: 135px;
  left: 620px;
}
.content {
  padding: 10px 20px;
  background: #fff;
}
</style>