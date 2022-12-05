<template>
  <div class="content">
    <div class="plan-detail-button-group">
      <!-- <a-button type="primary" @click="setDefault">设为默认</a-button> -->
      <a-button type="primary" style="margin-left:20px;" @click="deletePlan"
        >删除方案</a-button
      >
    </div>
    <div class="house_content_t">
      <propety-table :selectPlanPropety="selectPlanPropety"> </propety-table>
    </div>
  </div>
</template>
<script>
import propetyTable from "./propety.vue";
import axios from "@/views/js/net/http";
import schemeServer from "./server/schemeServer";

export default {
  props: ["selectPlanPropety","backPlanList"],
  components: {
    "propety-table": propetyTable,
  },
  data() {
    return {};
  },
  methods: {
    setDefault() {
      var planId = this.selectPlanPropety.id;
      let res = schemeServer.updateScheme({id: planId, paramType: 2});
      res.then(
        (resp) => {
          if (resp.success) {
            this.$message.success("设置默认成功");
            this.backPlanList();
          }
        },
        (err) => {
          this.$message.error("设置默认失败");
        }
      );
    },
    deletePlan() {
      var planId = this.selectPlanPropety.id;
      let res = schemeServer.deleteScheme(planId);
      res.then(
        (resp) => {
          if (resp.success) {
            this.$message.success("删除成功");
            this.backPlanList();
          }
        },
        (err) => {
          this.$message.error("删除失败");
        }
      );
    },
  },
};
</script>
<style scoped>
.content {
  width: 100%;
  height: 480px;
  padding: 10px;
  padding-left: 30px;
  padding-right: 30px;
}
.house_content_t {
  overflow: auto;

  height: 420px;
  border-radius: 2px;
  border: 1px solid rgba(221, 221, 221, 1);
  margin-top: 10px;
}
.ant-btn:active {
  color: #fff;
}
.ant-btn:focus {
  color: #fff;
}
.ant-btn {
  width: 90px;
  height: 36px;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 400;
  line-height: 36px;
  text-align: center;
}
</style>
