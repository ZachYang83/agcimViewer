<template>
  <ag-popup
    v-model="visible"
    title="新建项目"
    @onCancel="onCancel"
    class="infoBox_modelup_sub"
  >
    <div>
      <a-spin tip="上传中，请稍后..." :spinning="spinning">
        <div class="ag-from-tall">
          <a-form :form="form" @submit="handleSubmit">
            <a-form-item
              :label-col="formItemLayout.labelCol"
              :wrapper-col="formItemLayout.wrapperCol"
              label="项目名称"
            >
              <a-input
                v-decorator="[
                  'projectName',
                  { rules: [{ required: true, message: '请输入项目名称' }] },
                ]"
                placeholder="请输入项目名称"
                style="width: 170px"
              >
              </a-input>
            </a-form-item>
            <a-form-item
              :label-col="formItemLayout.labelCol"
              :wrapper-col="formItemLayout.wrapperCol"
              label="选择模型"
            >
              <a-input
                v-decorator="[
                  'modelZipFile',
                  { rules: [{ required: true, message: '请选择模型' }] },
                ]"
                placeholder="请选择模型"
                style="width: 150px"
                readOnly
              >
              </a-input>
              <a-upload
                :file-list="abridgeFile"
                :remove="handleRemove"
                :before-upload="beforeAbridgeUpload"
                :showUploadList="false"
                accept=".adb"
              >
                <a-button style="position: absolute;top: -6px;right: -86px;">
                  <a-icon type="upload" />
                  选择
                </a-button>
              </a-upload>
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                class="ag-from-btn-upload"
              >
                确定
              </a-button>
              <a-button
                type="danger"
                class="ag-from-btn-clear"
                @click="onCancel"
              >
                取消
              </a-button>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </div>
  </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axiosWraper from "@/views/js/net/axiosWraper";
import { create } from "domain";
let proxyUrl = "/agsupport-rest";

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};

export default {
  data() {
    return {
      formItemLayout,
      abridgeFile: [],
      uploading: false,
      spinning: false,
      vis: false,
    };
  },
  props: ["visible"],
  components: { "ag-popup": AgPopup },
  mounted() {},

  beforeCreate() {
    this.form = this.$form.createForm(this, { name: "normal_login" });
  },
  methods: {
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },
    beforeAbridgeUpload(file, abridgeFile) {
      this.form.setFieldsValue({
        modelZipFile: file.name,
      });
      this.abridgeFile = [...this.abridgeFile, file];
      return false;
    },
    handleSubmit(e) {
      e.preventDefault();
      let projectName = this.form.getFieldValue("projectName");
      if (!projectName) {
        return;
      }
      this.create(projectName);
    },
    async create(projectName) {
      var _this = this;
      let url = `/agsupport/applicationManager/bimCheckProject/add`;
      const formData = new FormData();
      formData.append("name", projectName);
      let res = await _this.managerProject(url, formData).then(
        (resp) => {
          if (resp.success) {
            _this.upload(resp.content); //上传模型
          } else {
            _this.$message.error("新建项目失败");
          }
        },
        (err) => {
          _this.$message.error("新建项目失败");
        }
      );
    },
    upload(projectId) {
      this.spinning = true;
      this.uploading = true;
      let res = this.uploadModel({
        bimCheckProjectId: projectId,
        modelZipFile: this.abridgeFile[0],
      });
      res
        .then(
          (resp) => {
            if (resp.success) {
              this.spinning = !this.spinning;
              this.$message.success("添加项目成功");
              this.form.resetFields();
              this.vis = false;
              this.$emit("closePanel", false);
            }
            if (!resp.success) {
              this.spinning = !this.spinning;
              this.$message.error(resp.message);
            }
          },
          (err) => {
            this.spinning = !this.spinning;
            this.$message.error("模型上传失败");
          }
        )
        .then(() => {
          this.abridgeFile = [];
          this.uploading = false;
        });
    },
    async managerProject(url, data) {
      return axiosWraper.getDataByPost(proxyUrl + url, data);
    },
    onCancel() {
      this.abridgeFile = [];
      this.uploading = false;
      this.form.resetFields();
      this.$emit("closePanel", false);
    },
    uploadModel(params) {
      const formData = new FormData();
      formData.append("bimCheckProjectId", params.bimCheckProjectId);
      formData.append("file", params.modelZipFile);
      return axiosWraper.getDataByPost(
        proxyUrl + "/agsupport/applicationManager/bimCheckProjectModel/add",
        formData
      );
    },
  },
};
</script>
<style scoped>
.infoBox_modelup_sub {
  width: 329px;
  left: 50%;
  right: 50%;
  margin: auto;
}

.infoBox_modelup_sub .ag-from-btn-upload {
  margin-left: 90px;
}

.infoBox_modelup_sub .ant-col-4 {
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 17.666667% !important;
}

.infoBox_modelup_sub .ag-from-btn-clear {
  margin-left: 20px;
}

.infoBox_modelup_sub .ant-form-item {
  margin-bottom: 10px;
}

.infoBox_modelup_sub .ag-from-tall {
  width: 500px;
  height: auto;
  background: #fcfcfc;
  padding-top: 20px;
  border-radius: 5px;
}

.infoBox_modelup_sub .ag-from-house {
  float: left;
  font-size: 15px;
}

.infoBox_modelup_sub .ag-from-picture {
  padding-left: 450px;
  padding-bottom: 3px;
}

.ag-from-null {
  clear: both;
}

.ag-from-body {
  background: #009687;
}

.ant-form-item-control {
  width: 300px;
}
</style>
