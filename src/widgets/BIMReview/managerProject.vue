<template>
  <ag-popup
    v-model="visible"
    :title="title"
    @onCancel="onCancel"
    class="create-project"
  >
    <div class="create-project-content">
      <div class="create-project-name">
        项目名称：<a-input
          placeholder="请输入项目名称"
          style="width:200px"
          v-model="projectName"
        />
      </div>
      <a-button type="primary" @click="confirm" style="margin-right:15px"
        >确定</a-button
      >
      <a-button type="danger" @click="onCancel">取消</a-button>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axiosWraper from "@/views/js/net/axiosWraper";
let proxyUrl = "/agsupport-rest";

export default {
  components: { "ag-popup": AgPopup },
  props: ["visible", "title", "projectId"],
  data() {
    return {
      projectName: "",
    };
  },
  methods: {
    onCancel() {
      this.projectName = "";
      this.$emit("closePanel", false);
    },
    async confirm() {
      let url = `/agsupport/applicationManager/bimCheckProject/add`;
      const formData = new FormData();
      formData.append("name", this.projectName);
      if (this.title == "修改项目") {
        formData.append("id", this.projectId);
        url = `/agsupport/applicationManager/bimCheckProject/update`;
      }
      let res = await this.managerProject(url, formData).then(
        (resp) => {
          if (resp.success) {
            this.projectName = "";
            this.$message.success(this.title + "成功");
            this.$emit("closePanel", false);
            this.$parent.loadData();
          } else {
            this.$message.error(this.title + "失败");
          }
        },
        (err) => {
          this.$message.error(this.title + "失败");
        }
      );
    },
    async managerProject(url, data) {
      return axiosWraper.getDataByPost(proxyUrl + url, data);
    },
  },
};
</script>
<style scoped>
.create-project {
  right: 50%;
  width: 310px;
  left: 50%;
  margin: auto;
}
.create-project-content {
  padding: 20px;
  text-align: center;
}
.create-project-name {
  margin-bottom: 15px;
}
</style>
