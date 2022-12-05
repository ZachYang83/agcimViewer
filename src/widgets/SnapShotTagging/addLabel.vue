<template>
  <ag-popup v-model="labelVisible" :title="id?'编辑标注':'添加标注'" @onCancel="onCancel" class="labelForm">
    <div class="wraper">
      <a-form>
        <a-form-item label="标注名称" :label-col="{ span:8 }" :wrapper-col="{ span: 12 }">
          <a-input v-model="labelName" placeholder="请输入标注名称" />
        </a-form-item>
        <a-form-item label="标注内容" :label-col="{ span:8 }" :wrapper-col="{ span: 12 }">
          <a-textarea v-model="labelContent" 
            placeholder="请输入标注内容" 
            :auto-size="{ minRows: 3, maxRows: 5 }"
            />
        </a-form-item>
        <a-form-item v-if="false" label="标注位置" :label-col="{ span:8 }" :wrapper-col="{ span: 12 }" class="shortInput">
          <a-input placeholder="x" v-model="labelPosition.x" />
          <a-input placeholder="y" v-model="labelPosition.y" />
          <a-input placeholder="z" v-model="labelPosition.z" />
        </a-form-item>
        <a-form-item label="标注主题色" :label-col="{ span:8 }" :wrapper-col="{ span: 12 }" >
          <!-- <a-input v-model="labelStyle.bgColor"></a-input> -->
          <div id="themeColorP">
            <div id="themeColor" class="picker" :style="{background: labelStyle.bgColor}" ></div>
          </div>
        </a-form-item>
        <a-form-item label="标注字体颜色" :label-col="{ span:8 }" :wrapper-col="{ span: 12 }" >
          <div id="fontColorP">
            <div id="fontColor" class="picker" :style="{background: labelStyle.color}" ></div>
          </div>
        </a-form-item>
        <a-form-item label="使用初始视角" :label-col="{ span:8 }" :wrapper-col="{ span: 12 }" v-if="id">
          <a-radio-group v-model="useOldView">
            <a-radio :value="true">
              是
            </a-radio>
            <a-radio :value="false">
              否
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :wrapper-col="{span:12,offset: 8}">
          <a-button type="primary" html-type="submit" id="form-submit" @click="submitForm" :disabled="!(labelContent && labelContent && labelPosition.x)">确定</a-button>
          <a-button @click="onCancel" id="form-cancel">取消</a-button>
        </a-form-item>
      </a-form>
    </div>
  </ag-popup>
</template>

<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import widgetAssetsTable from "@/views/js/net/widgetAssetsTable";
import AgPopup from "@/views/components/AgPopup.vue";
import snapshot from "./js/scnapshot.js";
// import { isNullOrEmpty } from "./js/common";
import CreateLabel from './js/createLabel'
import { getCookie } from '@/views/js/net/cookies'
import './js/colorpicker'

let viewer = CIM.viewer;
let pickerHelper = new PickerHelper(viewer);
export default {
  name: "labelForm",
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      id: '',
      labelVisible: false,
      labelInfo: null,
      labelName: "",
      labelContent: "",
      labelPosition: {
        x: '',
        y: '',
        z: ''
      },
      labelStyle: {
        bgColor: '#0000ff',
        color: '#fff'
      },
      useOldView: true,
      _currentCameraInfo: null,
      userInfo: getCookie("user"),
      layerId: ''
    };
  },
  methods: {
    open(_labelInfo) {
      this.id = _labelInfo ? _labelInfo.id: ''
      this.labelInfo = _labelInfo ? JSON.parse(JSON.stringify(_labelInfo)) : null
      this.labelVisible = true
      this.labelName = _labelInfo ? _labelInfo.name : ""
      this.labelContent = _labelInfo ? _labelInfo.content : ""
      this.labelPosition = _labelInfo ? JSON.parse(_labelInfo.position) : {
        x: '',
        y: '',
        z: ''
      }
      this.useOldView = true
      this.labelStyle = _labelInfo ? JSON.parse(_labelInfo.style) : {
        bgColor: '#0000ff',
        color: '#fff'
      }
      this.createPickerEvent()
      this.pickColorHandle()
    },
    createPickerEvent() {
      pickerHelper.on("LEFT_DOUBLE_CLICK", (movement)=>{
        /* 标注所在图层 */
        this.layerId = pickerHelper.getPickObject(movement.position).tileset.agMetaData.id
        /* 标注位置 */
        this.labelPosition = viewer.scene.pickPosition(movement.position)
        this._currentCameraInfo = {
          position: viewer.camera.position.clone(),
          heading: viewer.camera.heading,
          roll: viewer.camera.roll,
          pitch: viewer.camera.pitch
        }
      })
    },
    pickColorHandle(_type){
      let _this = this
        Colorpicker.create({
          pl: "themeColorP",
          el: "themeColor",
          color: _this.labelStyle.bgColor,
          change: function (elem, hex) {
            _this.labelStyle.bgColor = hex
          }
        })
      
        Colorpicker.create({
          pl: "fontColorP",
          el: "fontColor",
          color: _this.labelStyle.color,
          change: function (elem, hex) {
            // elem.style.backgroundColor = hex;
            _this.labelStyle.color = hex
          }
        })
    },
    async submitForm() {
      if(this.id && this.useOldView){
        this._currentCameraInfo = this.labelInfo.camera_info
      }else{
        this._currentCameraInfo = {
          position: viewer.camera.position.clone(),
          heading: viewer.camera.heading,
          roll: viewer.camera.roll,
          pitch: viewer.camera.pitch
        }
      }
      let date = new Date()
      let month = date.getMonth()+1
      let labelObj = {
        tableName: "model_tag",
        name: this.labelName,
        content: this.labelContent,
        position: this.labelPosition,
        style: this.labelStyle,
        layer_id: this.layerId ? this.layerId : this.labelInfo.layer_id,
        camera_info: this._currentCameraInfo,
        user_id: JSON.parse(this.userInfo).userId,
        user_name: JSON.parse(this.userInfo).userName,
        create_time: this.id ? this.labelInfo.create_time : date.getFullYear() + '-' + month + '-' + date.getDate(),
        modify_time: date.getFullYear() + '-' + month + '-' + date.getDate()
      }
      if(this.id){
        labelObj.id = this.id
      }
      var fd = new FormData();
      for (let key in labelObj) {
        if(typeof(labelObj[key]) === "object"){
          fd.append(key, JSON.stringify(labelObj[key]));
        }else{
          fd.append(key, labelObj[key]);
        }
      }
      let res
      if(this.id){
        res = await widgetAssetsTable.update(fd)
      }else{
        res = await widgetAssetsTable.add(fd)
      }
      if(res.success){
        if(this.id){
          viewer.entities.remove({id: `label-${this.id}`})  
        }else{
          labelObj.id = fd.get('id')
        }
        CreateLabel.initialize(viewer,labelObj);
        this.$message.success(res.message)
        this.$emit("refreshData")
        this.onCancel();
      }else{
        this.$message.error(`操作失败! ${res.message}`)
      }
    },
    onCancel() {
      let node1 = document.getElementById("themeColorP").childNodes
      document.getElementById("themeColorP").removeChild(node1[1])
      let node2 = document.getElementById("fontColorP").childNodes
      document.getElementById("fontColorP").removeChild(node2[1])
      this.labelVisible = false;
    },
    isNullOrEmpty(_data) {
      return (
        _data === undefined ||
        _data === "" ||
        _data === null ||
        _data.length === 0
      );
    },
  },
};
</script>

<style scoped>
#fontColorP, #themeColorP{
  position: relative;
}
.labelForm {
  width: 500px;
  overflow: inherit !important;
}

.labelForm .wraper {
  margin: 10px auto;
}
.labelForm .wraper .picker{
  display: inline-block;
  width: 30px;
  height: 30px;
  border: 1px solid #ccc;
}
.labelForm .ant-row{
  margin-bottom: 8px;
}
.labelForm .shortInput .ant-input{
  display: inline-block;
  width: 30%;
  margin-right: 5px;
}
.labelForm .wraper #thumbnail {
  position: relative;
  width: 200px;
  height: 200px;
  border: 1px solid rgb(53, 104, 151);
  padding: 2px;
  box-sizing: border-box;
  overflow: hidden;
}

.labelForm .wraper #scissor {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.labelForm .wraper #scissor i {
  font-size: 40px;
}

.labelForm .wraper #form-submit {
  margin-right: 20px;
}
</style>