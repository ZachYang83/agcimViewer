<template>
  <div class="parameter-part">
    <div class="general-des">
      <div class="general-des-title">
        <span @click="changePop">更多通用参数</span>
      </div>
      <ag-popup
        v-model="showPara"
        :title="title"
        @onCancel="onCancel"
        class="parameters-box"
      >
        <div class="general-parameter">
          <a-form-model
            labelAlign="left"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-form-model-item label="最小扫掠角">
              <a-input v-model="sweepAngle" :readOnly="readOnly" /> °
            </a-form-model-item>
            <a-form-model-item label="最小连续日照时间">
              <a-input v-model="minSunshineTime" :readOnly="readOnly" /> min
            </a-form-model-item>
            <a-form-model-item label="采样空间间隔">
              <a-input v-model="spaceInterval" :readOnly="readOnly" /> m
            </a-form-model-item>
            <a-form-model-item label="采样时间间隔">
              <a-input v-model="timeInterval" :readOnly="readOnly" /> min
            </a-form-model-item>
            <a-form-model-item label="最低日照时长">
              <a-input v-model="minShineTime" value="3" /> h
            </a-form-model-item>
          </a-form-model>
          <label class="general-des-standard" @click="showHideStandard"
            >通用标准</label
          >
          <ag-imgpopup
            v-model="showStandard"
            :title="title"
            @onCancel="onImgCancel"
            class="img-box"
          >
          <img src="../rs/standard.png" />
          </ag-imgpopup>
           <label class="visibility-analysis" @click="showHideVisibility"
            >通视分析</label
          >
          <ag-vispopup
            v-model="showVisibility"
            title="通视分析"
            @onCancel="onVisCancel"
            class="vis-box"
          >
          <div :style="{paddingLeft:'10px'}">
          <a-form-model
            labelAlign="left"
            :label-col="formItemLayout.labelCol"
            :wrapper-col="formItemLayout.wrapperCol"
          >
            <a-form-model-item label="请选择通视分析时间">
              <a-time-picker :allowClear="false" :style="{width:'100px'}" v-model="time" format="HH:mm" @change="visualAnalysis" />
              <a-button  :style="{width:'30px',height:'30px',marginLeft:'5px'}" type="danger" icon="close"  @click="cleanEntities"></a-button>
            </a-form-model-item>
          </a-form-model>
          </div>
          </ag-vispopup>
          <div class="parameters-head">
            <a-button>保存</a-button>
            <a-button>导入</a-button>
          </div>
        </div>
      </ag-popup>
    </div>

    <div class="window-footer">
      <a-button
        :style="{
          backgroundColor: 'rgb(53, 104, 151)',
          color: 'rgb(255, 255, 255)',
        }"
        @click="startAnalysis"
        >开始分析</a-button
      >
      <a-button
        :style="{
          backgroundColor: 'rgb(46, 139, 87)',
          color: 'rgb(255, 255, 255)',
        }"
        @click="outputReport"
        >输出报告</a-button
      >
      <a-button
        :style="{
          backgroundColor: 'rgb(238, 44, 44)',
          color: 'rgb(255, 255, 255)',
        }"
        @click="cleanAll"
        >清除全部</a-button
      >
    </div>
    <div>
      <a-progress
        :percent="successPercent"
        v-if="isReloadData"
        v-show="showProcess"
        :style="{marginLeft:'3px'}"
      />
    </div>
  </div>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
const formItemLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12, offset: 0 },
};

export default {
  components: { "ag-popup": AgPopup, "ag-imgpopup": AgPopup,"ag-vispopup":AgPopup },
  data() {
    return {
      formItemLayout,
      readOnly: true,
      title: "通用参数",
      showPara: false,
      isReloadData: true,
      successPercent: 0,
      showStandard: false,
      showVisibility:false,
      time:null,
      sunshineTime:null,
    };
  },
  props: {
    sweepAngle: {
      type: String,
      default: null,
    },
    minSunshineTime: {
      type: String,
      default: null,
    },
    spaceInterval: {
      type: String,
      default: null,
    },
    timeInterval: {
      type: String,
      default: null,
    },
    percent: {
      type: Number,
      default: 0,
    },
    minShineTime: {
      type: Number,
      default: 3,
    },
    showProcess:{
      type:Boolean,
      default:false
    },
    currentTime:{
      type:Object,
      default:null,
    },
    sunshineDay:{
      type:Object,
      default:null,
    }
  },
  watch: {
    percent: {
      handler(newValue) {
        this.successPercent = newValue;
        this.reload();
      },
    },
    sunshineDay: {
      handler(newValue) {
        this.sunshineTime = newValue;
      },
    },
    currentTime: {
      handler(newValue) {
        this.time = newValue;
      },
    },
  },
  methods: {
    startAnalysis() {
      this.$emit("startAnalysis");
    },
    outputReport() {
      this.$emit("outputReport");
    },
    cleanAll() {
      this.$emit("cleanAll");
      this.successPercent = 0;
      this.reload();
    },
    getComponentPosition(){
      this.$emit("getComponentPosition");
    }
    ,
    changePop() {
      this.showPara = !this.showPara;
    },
    onCancel() {
      this.showPara = false;
    },
    onImgCancel() {
      this.showStandard = false;
    },
    showHideStandard() {
      this.showStandard = !this.showStandard;
    },
    showHideVisibility(){
      this.showVisibility = !this.showVisibility;
    },
    onVisCancel(){
       this.showVisibility = false;
       this.$emit("cleanEntities");
    },
    reload() {
      this.isReloadData = false;
      this.$nextTick(() => {
        this.isReloadData = true;
      });
    },
    visualAnalysis(){
      var year = this.sunshineTime._d.getFullYear();
      var month = this.sunshineTime._d.getMonth();
      var date = this.sunshineTime._d.getDate();
      console.log(this.time,'time');
      var hour = this.time._d.getHours();
      var minute = this.time._d.getMinutes();
      var standardTime = new Date(year,month,date,hour,minute,0);
      console.log(standardTime,'standardTime');
       this.$emit("visualAnalysis",standardTime);
    },
    cleanEntities(){
      this.$emit("cleanEntities");
    }
  },
};
</script>

<style>
.general-parameter {
  padding: 10px 10px 10px 20px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
}
.general-des-title {
  text-align: end;
}
.general-des-title span {
  color: rgb(54, 141, 218);
}

.general-des-title span:hover {
  color: rgb(7, 94, 170);
  cursor: pointer;
}
.general-parameter .ant-form-item {
  margin-bottom: 0px;
}
.img-box {
  left: 500px;
  top: 300px;
  width: 641px;
}
.vis-box{
  left: 500px;
  top: 50px;
  width: 320px;
}
.general-parameter-title {
  font-size: 16px;
}
.general-parameter .ant-input {
  width: 80px;
}
.parameters-box {
  width: 300px;
  left: 500px;
}
.parameters-head {
  margin: 5px;
  text-align: center;
}
.general-des-standard {
  color: rgb(54, 141, 218);
}

.general-des-standard :hover {
  color: rgb(7, 94, 170);
  cursor: pointer;
}
.visibility-analysis{
  color: rgb(54, 141, 218);
  float: right;
  padding-right: 15px;
}

.visibility-analysis :hover {
  color: rgb(7, 94, 170);
  cursor: pointer;
}
.parameters-head button:first-child {
  margin-right: 60px;
}

.window-footer {
  margin-top: 15px;
  text-align: center;
}

.window-footer button {
  margin-right: 3px;
}
</style>