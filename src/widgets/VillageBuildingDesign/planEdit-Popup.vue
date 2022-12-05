<template>
  <ag-popup
    v-model="visible"
    title="新建房屋"
    :isMove="isMove"
    @onCancel="onCancel"
    class="infoBox_material"
  >
    <div>
      <div class="ag-from-tall">
        <a-form :form="form" @submit="handleSubmit">
          <a-form-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="房屋名称"
          >
            <a-input
              v-decorator="[
                  'name',
                  { rules: [{ required: true, message: '请输入房屋名称' }] },
                ]"
              placeholder="请输入房屋名称"
            ></a-input>
          </a-form-item>
          <a-form-item
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
            label="房屋描述"
          >
            <a-textarea
              v-decorator="[
                  'description',
                  { rules: [{ required: true, message: '请输入房屋描述' }] },
                ]"
              placeholder="请输入房屋描述"
            ></a-textarea>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" class="ag-from-btn-upload">确定</a-button>
            <a-button class="ag-from-btn-clear" @click="onCancel">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
import user from "@/views/js/store/user";
import axiosWraper from "@/views/js/net/axiosWraper";
import {DateTimeForformat} from "./js/public";

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 8 },
};

export default {
  data() {
    return {
      options: [],
      isMove: false,
      formItemLayout,
      imageFile: [],
      uploading: false,
      spinning: false,
    };
  },
  props: ["visible"],
  components: { "ag-popup": AgPopup },

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
    beforeThumbUpload(file, imageFile) {
      this.form.setFieldsValue({
        imageFile: file.name,
      });
      this.imageFile = [...this.imageFile, file];
      return false;
    },
    handleSubmit(e) {  
      // var modelData = this.getModelData();
      e.preventDefault();
      const formData = new FormData();
      let name = this.form.getFieldValue("name");
      let description = this.form.getFieldValue("description");
      this.$emit("onPlanEditPopupSubmit", {
        userId : user.state.userId,
        name: name,
        description: description,
        createTime:DateTimeForformat(new Date())
      });
      this.form.resetFields();
      this.onCancel()
    },
    onCancel() {
      this.$emit("closePanel_planEditPopup", false);
    },
    getModelData() {
      var modelData = [];
      var planData = CIM.viewer.scene.primitives._primitives;
      for (let i = 0; i < planData.length; i++) {
        if (planData[i] instanceof Cesium.Cesium3DTileset) {
          if (!planData[i].userId || planData[i].userId != user.state.userId)
            continue;
          var primitives = {};
          primitives.type = "1";
          primitives.url = planData[i]._url;
          primitives.tableName = planData[i].tableName;
          primitives.id = planData[i].id; //储存房屋id

          if (planData[i].components) {
            //primitives.components = planData[i].components; //替换的房屋构件id
            primitives.components = JSON.stringify(planData[i].components);
          }
          if (planData[i].style) {
            primitives.style = planData[i].style.show.expression; //隐藏的房屋构件
          }
          primitives.propertyUrl = planData[i].property_url;
          var subtract = planData[i].subtract;
          primitives.subtract = [subtract.x, subtract.y, subtract.z];
          var obbCenter = planData[i].obbCenter;
          primitives.obbCenter = [obbCenter.x, obbCenter.y, obbCenter.z];
          var transform = planData[i]._root.transform;
          primitives.modelMatrix = [
            transform[0],
            transform[1],
            transform[2],
            transform[3],
            transform[4],
            transform[5],
            transform[6],
            transform[7],
            transform[8],
            transform[9],
            transform[10],
            transform[11],
            transform[12],
            transform[13],
            transform[14],
            transform[15],
          ];
          modelData.push(primitives);
        } else if (planData[i] instanceof Cesium.Model) {
          if (
            planData[i].id.userId &&
            planData[i].id.userId == user.state.userId
          ) {
            var entity = {};
            entity.name = planData[i].id.name;
            entity.type = "2";
            entity.angle = planData[i].id.deg;
            entity.url = planData[i]._resource._url;
            var orientation = planData[i].id.orientation._value;
            entity.orientation = [
              orientation.x,
              orientation.y,
              orientation.z,
              orientation.w,
            ];
            var position = planData[i].id.position._value;
            entity.position = [position.x, position.y, position.z];
            modelData.push(entity);
          } else if (planData[i].userId == user.state.userId) {
            var component = [];
            component.type = "3";
            component.componentId = planData[i].id;
            component.url = planData[i].url;
            component.boundingbox = planData[i].boundingbox; //包围盒
            component.topologyelements = planData[i].topologyelements; //拓扑关系
            component.tableName = planData[i].tableName; //表名

            component.designSchemeId = planData[i].designSchemeId; //设计方案ID
            var modelMatrix = planData[i].modelMatrix;
            component.modelMatrix = [
              modelMatrix[0],
              modelMatrix[1],
              modelMatrix[2],
              modelMatrix[3],
              modelMatrix[4],
              modelMatrix[5],
              modelMatrix[6],
              modelMatrix[7],
              modelMatrix[8],
              modelMatrix[9],
              modelMatrix[10],
              modelMatrix[11],
              modelMatrix[12],
              modelMatrix[13],
              modelMatrix[14],
              modelMatrix[15],
            ];
            component.tileUrl = planData[i].tileUrl;
            // component.componentType = planData[i].componentType;

            component.relationIds = planData[i].relationIds;
            modelData.push(component);
          }
        }
      }
      return modelData;
    },
    setData(data) {
      if (data === undefined) return;
      this.form.setFieldsValue({
        landInfo: data.landInfo,
        planName: data.name,
        savePath: data.id,
        description: data.description,
      });
    },
    async loadData() {
      var options = [];
      options.push({
        id: "add",
        name: "新增",
      });
      let param = {
        page: 0,
        rows: 1000000,
        userId: user.state.userId,
      };
      let url = "/agsupport-rest/scheme/list";
      let data = await axiosWraper.getData(url, param);
      let result = data.content.rows;
      for (let i = 0; i < result.length; i++) {
        options.push(result[i]);
      }
      this.options = options;
    },
  },
};
</script>
<style scoped>
.infoBox_material {
  top: 100px !important;
  width: 500px;
  height: auto;
  left: 50%;
  margin-left: -250px;
  top: 52px;
}
.ag-from-btn-upload {
  margin-left: 56%;
}
.infoBox_material .ant-col-4 {
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 27%;
}
.infoBox_material .ag-from-btn-clear {
  color: #009687;
  left: 15px;
}
.infoBox_material .ant-form-item {
  margin-bottom: 0;
}
.infoBox_material .ag-from-tall {
  width: 500px;
  height: auto;
  background: #fcfcfc;
  padding-top: 20px;
  border-radius: 5px;
}
.ag-from-house {
  float: left;
  font-size: 15px;
}
.ag-from-picture {
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
  width: 100%;
}
</style>
