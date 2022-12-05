<template>
  <div class="review-project">
    <a-button
      class="review-project-new"
      type="primary"
      icon="plus"
      @click="managerProject('新建项目', null)"
    >
      新建项目
    </a-button>
    <manager-project
      :visible="projectPanelShow"
      :projectId="projectId"
      :title="projectTitle"
      @closePanel="closePanel"
    ></manager-project>
    <div
      class="tree-box vscroll"
      style="position: relative;left:0px;height: 720px;wightt:400px;overflow-y:scroll;overflow-x:scroll"
    >
      <a-tree
        v-if="treeData.length"
        class="draggable-tree"
        draggable
        :checkable="checkable"
        v-model="checkedKeys"
        @expand="onExpand"
        :expandedKeys="expandedKeys"
        :treeData="treeData"
        :autoExpandParent="autoExpandParent"
        show-icon
      >
        <a-icon type="bank" slot="project" />
        <template slot="title" slot-scope="item">
          <span class="txt-ellipsis" :key="item.key" v-html="item.title"></span>
          <a-icon
            v-if="item.level == 'project'"
            type="upload"
            class="project-upload"
            @click="uploadModel(item)"
          />
          <a-icon
            v-if="item.level == 'project'"
            type="form"
            class="project-update"
            @click="managerProject('修改项目', item)"
          />
          <a-icon
            type="delete"
            class="project-delete"
            @click="handleDelete(item)"
          />
        </template>
      </a-tree>
    </div>
    <upload-model
      :visible="uploadPanelShow"
      @closeUploadPanel="closeUploadPanel"
      :projectId="projectId"
    ></upload-model>
  </div>
</template>
<script>
import ManagerProject from "./managerProject";
import UploadModel from "./uploadModel";
import axiosWraper from "@/views/js/net/axiosWraper";
let proxyUrl = "/agsupport-rest";

export default {
  components: {
    "manager-project": ManagerProject,
    "upload-model": UploadModel,
  },
  data() {
    return {
      //树
      treeData: [],
      //选择的树节点key
      checkedKeys: ["0-0"],
      //展开的key
      expandedKeys: [],
      //是否显示多选框
      checkable: false,
      //是否自动展开父节点
      autoExpandParent: true,
      projectPanelShow: false,
      uploadPanelShow: false,
      projectId: "",
      projectTitle: "",
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    managerProject(type, item) {
      if (item) {
        this.projectId = item.id;
      }
      this.projectTitle = type;
      this.projectPanelShow = true;
    },
    closePanel() {
      this.projectPanelShow = false;
    },
    uploadModel(item) {
      this.projectId = item.id;
      this.uploadPanelShow = true;
    },
    closeUploadPanel() {
      this.uploadPanelShow = false;
    },
    handleDelete(item) {
      const formData = new FormData();
      formData.append("id", item.id);
      let url = `/agsupport/applicationManager/bimCheckProject/delete`;
      if (item.level == "model") {
        url = `/agsupport/applicationManager/bimCheckProjectModel/delete`;
      }
      let res = this.deleteScheme(url, formData);
      res.then(
        (resp) => {
          if (resp.success) {
            this.$message.success("删除成功");
            this.loadData();
          }
        },
        (err) => {
          this.$message.error("删除失败");
        }
      );
    },
    buildTree(data) {
      for (let i = 0; i < data.length; i++) {
        var projectNode = this.treeNode(data[i].name, data[i].id, "project");
        var models = data[i].projectModels;
        for (let j = 0; j < models.length; j++) {
          var modelNode = this.treeNode(models[j].name, models[j].id, "model");
          projectNode.children.push(modelNode);
        }
        this.treeData.push(projectNode);
      }
    },
    treeNode(name, id, level) {
      var item = {
        title: name,
        id: id,
        children: [],
        slots: { icon: level },
        scopedSlots: { title: "title" },
        level: level,
      };
      return item;
    },
    async loadData() {
      this.treeData = [];
      let param = {
        page: 0,
        rows: 1000000,
        paramType: "2",
      };
      let data = await this.getData(param);
      let result = data.content;
      this.buildTree(result);
    },
    async getData(params) {
      let url = `/agsupport/applicationManager/bimCheckProject/find`;
      return axiosWraper.getData(proxyUrl + url, params);
    },
    deleteScheme(url, data) {
      return axiosWraper.delete(proxyUrl + url, data);
    },
  },
};
</script>
<style scoped src="./css/index.css"></style>
