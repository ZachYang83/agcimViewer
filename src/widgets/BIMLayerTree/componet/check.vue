<template>
  <ag-popup
    v-model="visible"
    title="净高/进深核对"
    @onCancel="onCancel"
    class="infoBox"
  >
    <div class="content">
      <a-upload
        :file-list="fileList"
        :remove="handleRemove"
        :before-upload="beforeUpload"
        accept=".xls,.xlsx"
        @change="handleChange"
      >
        <a-button> <a-icon type="upload" /> 上传文件 </a-button>
      </a-upload>
      <div v-show="resultShow">
        <div class="result-unit"><label>单位：mm</label></div>
        <div class="result-msg">
          <label>H1: {{ result[0] }}</label>
          <label class="result-msg-lable">H2: {{ result[1] }}</label>
          <label>H3: {{ result[2] }}</label>
        </div>
        <div class="result-msg">
          <label>H4: {{ result[3] }}</label>
          <label class="result-msg-lable">H5: {{ result[4] }}</label>
          <label>L1: {{ result[5] }}</label>
        </div>
        <div class="result-msg">
          <label>L2: {{ result[6] }}</label>
          <label class="result-msg-lable">L3: {{ result[7] }}</label>
          <label>L4: {{ result[8] }}</label>
        </div>
      </div>
      <div class="check-button">
        <a-button
          type="primary"
          :disabled="fileList.length === 0"
          :loading="uploading"
          style="margin-top: 16px"
          @click="handleRoomCheck"
          block
        >
          开始核对
        </a-button>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axios from "@/views/js/net/http";
var baseUrl = "agsupport-rest/agsupport/applicationManager/bimCheck/statistics";
export default {
  components: { "ag-popup": AgPopup },
  data() {
    return {
      resultShow: false,
      result: [],
      fileList: [],
      uploading: false,
    };
  },
  props: ["visible"],
  mounted() {},
  methods: {
    handleRemove(file) {
      const index = this.fileList.indexOf(file);
      const newFileList = this.fileList.slice();
      newFileList.splice(index, 1);
      this.fileList = newFileList;
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      return false;
    },
    handleChange(info) {
      if (this.fileList.length == 0) {
        this.resultShow = false;
        return;
      }
      const { fileList } = this;
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append("excelFile", file);
      });
      formData.append("paramType", "1");
      this.uploading = true;
      let res = axios({
        method: "POST",
        url: baseUrl,
        data: formData,
        timeout: 1000 * 60 * 5,
      });
      res.then(
        (resp) => {
          if (resp.success) {
            let result = [];
            let data = resp.content;
            this.uploading = false;
            this.resultShow = true;
            this.$message.success(`${info.file.name} 上传成功.`);
            for (let i = 0; i < data.length; i++) {
              let msg = data[i].value[0];
              result.push(msg);
            }
            this.result = result;
          }
          if (!resp.success) {
            this.fileList = [];
            this.uploading = false;
            this.resultShow = false;
            this.$message.error(`${info.file.name} 上传失败.`);
          }
        },
        (err) => {
          this.fileList = [];
          this.uploading = false;
          this.resultShow = false;
          this.$message.error(`${info.file.name} 上传失败.`);
        }
      );
    },
    handleRoomCheck() {
      this.$parent.showComponet(null, null, true);
    },
    onCancel() {
      this.clear();
      this.$emit("closeRoomCheck");
    },
    clear() {
      this.fileList = [];
      this.resultShow = false;
    },
  },
};
</script>
<style scoped>
.infoBox {
  width: 300px;
}
.infoBox .content {
  padding: 20px;
  line-height: 1.5;
  background: #fff;
}
.check-button {
  text-align: center;
}
.result-msg {
  text-align: center;
  font-size: 16px;
  color: #1890ff;
  padding: 10px 10px 0 10px;
}
.result-msg-lable {
  margin: 0 25px;
}
.result-unit {
  position: absolute;
  top: 40px;
  right: 15px;
  color: #1890ff;
}
</style>
