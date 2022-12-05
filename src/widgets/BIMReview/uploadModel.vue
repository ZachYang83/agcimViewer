<template>
  <ag-popup
    v-model="visible"
    title="上传模型"
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
                上传
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
  props: ["visible", "projectId"],
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
      this.spinning = true;
      this.uploading = true;
      let res = this.uploadModel({
        bimCheckProjectId: this.projectId,
        modelZipFile: this.abridgeFile[0],
      });
      res
        .then(
          (resp) => {
            if (resp.success) {
              this.spinning = !this.spinning;
              this.$message.success("上传成功");
              this.form.resetFields();
              this.vis = false;
              this.$emit("closeUploadPanel", false);
              this.$parent.loadData();
            }
            if (!resp.success) {
              this.spinning = !this.spinning;
              this.$message.error(resp.message);
            }
          },
          (err) => {
            this.spinning = !this.spinning;
            this.$message.error("上传失败");
          }
        )
        .then(() => {
          this.abridgeFile = [];
          this.uploading = false;
        });
    },
    onCancel() {
      this.abridgeFile = [];
      this.uploading = false;
      this.form.resetFields();
      this.$emit("closeUploadPanel", false);
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
