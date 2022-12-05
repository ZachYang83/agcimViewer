<template>
  <div>
    <div class="content">
      <a-radio-group :value="selectModel" @change="onChangeModel">
        <div class="house_content_select">
          <a-row :gutter="16">
            <a-col :span="4">
              <a-radio-button value="1">材料详情</a-radio-button>
            </a-col>
            <a-col :span="4">
              <a-radio-button value="2">三维模型</a-radio-button>
            </a-col>
            <a-col :span="4">
              <a-radio-button value="3" v-if="false">材料属性</a-radio-button>
            </a-col>
            <a-col :span="4">
              <a-button v-if="false">材料纹理</a-button>
            </a-col>
          </a-row>
        </div>
      </a-radio-group>
      <div class="house_content_t">
        <!-- 详情 start -->
        <div v-show="selectModel==='1'" class="property-box">
          <a-descriptions layout="vertical" bordered>
            <a-descriptions-item
              v-for="item in propertyList"
              :key="item.key"
              :label="item.label"
            >{{item.text}}</a-descriptions-item>
          </a-descriptions>
        </div>
        <!-- 详情 end-->
        <!-- 三维模型 start-->
        <div v-show="selectModel==='2'" id="modelContainer" class="initViewer" ref="modelContainer">
          <div class="tools_panel">
            <a-icon
              type="home"
              v-on:click="zoomToHome"
              title="复位"
              v-if="false"
              :style="{ fontSize: '20px' }"
            />
            <a-tag class="home_in" v-on:click="zoomToHome">初始化</a-tag>
          </div>
        </div>
        <!-- 三维模型 end-->
      </div>
    </div>
  </div>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import { Descriptions } from "ant-design-vue";
import previewModel from "../common/previewModel.js";

//材料详情
let arr = [
  { key: "componentName", val: "构件名称" },
  { key: "componentType", val: "构件类型" },
  { key: "singlePrice", val: "单价" },
  { key: "size", val: "尺寸(长*宽*高)" },
  { key: "coveredArea", val: "材料简介" },
  { key: "costEstimates", val: "造价面积（万元）" },
  { key: "vendor", val: "厂商" },
  { key: "texture", val: "材质" },
  { key: "remark", val: "简介" },
];
let viewerA = null;
export default {
  components: {
    "a-descriptions": Descriptions,
    "a-descriptions-item": Descriptions.Item,
    "ag-popup": AgPopup,
  },
  data() {
    return {
      selectModel: "1",
      isShowStatiscsPanel: false,

      propertyList: [],
    };
  },
  mounted() {},
  computed: {},
  methods: {
    getInit(o) {
      this.selectBinPropety = o;
      this.getpropertyList(o);
      this.getModelShow(o);
    },
    //房屋详情
    getpropertyList(o) {
      this.propertyList = [];
      for (let v in o) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key == v) {
            let newO = {
              key: i,
              label: arr[i].val,
              text: o[v],
            };
            this.propertyList.push(newO);
          }
        }
      }
    },
    //三维模型
    getModelShow(o) {
      if (!viewerA) {
        viewerA = previewModel.initViewer(this.$refs.modelContainer.id);
        previewModel.displayerDefaultUI(viewerA);
        previewModel.addEntity(viewerA, o.url);
      } else {
        previewModel.addEntity(viewerA, o.url);
      }
    },
    zoomToHome() {
      previewModel.zoomToHome(viewerA);
    },

    backToHouseList() {
      this.indexModelPanel = 1;
    },
    onCancel() {
      this.$emit("hideMaterialPanel", false);
    },
    hideStatiscsPanel() {
      this.isShowStatiscsPanel = false;
    },
    onChangeModel(index) {
      this.selectModel = index.target.value;
    },
  },
};
</script>
<style scoped>
.tools_panel {
  position: absolute;
  z-index: 1000;
  margin-top: 10px;
  margin-left: 10px;
}
.content {
  width: 100%;
  height: 480px;
  padding: 10px;
  padding-left: 30px;
  padding-right: 30px;
}

.item-t {
  padding: 10px;
}
.statistics_dom {
  overflow: auto;
  width: 100%;
  max-height: 500px;
}
.floor_dom {
  height: 500px;
  padding-top: 30px;
}
.propety_dom {
  width: 100%;
  max-height: 500px;
  overflow: auto;
}
.ant-tabs .ant-tabs-left-content {
  padding-left: 24px;
  padding-right: 24px;
  border-left: 1px solid #e8e8e8;
}
._icon_cesiumicon {
  font-size: 17px;
}
.house_content_select {
  width: 100%;
}
.house_content_select .ant-col-4 {
  display: block;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  width: 25%;
}
.house_content_t {
  overflow: auto;
  width: 100%;
  height: 420px;
  border-radius: 2px;
  /* border: 1px solid rgba(221, 221, 221, 1); */
  margin-top: 10px;
}
.hose_item_bt {
  width: 90px;
  height: 36px;
  border-radius: 2px;
  border: 1px solid rgba(0, 150, 135, 1);
  font-size: 16px;

  font-weight: 400;
  color: rgba(0, 150, 135, 1);
  line-height: 36px;
  text-align: center;
}
.ant-btn:active {
  background: rgba(0, 150, 135, 1);
  color: #fff;
}
.ant-btn:focus {
  background: rgba(0, 150, 135, 1);
  color: #fff;
}
.ant-btn {
  width: 90px;
  height: 36px;
  border-radius: 2px;
  border: 1px solid rgba(0, 150, 135, 1);
  font-size: 16px;

  font-weight: 400;
  color: rgba(0, 150, 135, 1);
  line-height: 36px;
  text-align: center;
}
.ant-radio-group {
  width: 100% !important;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  z-index: 1;
  background: rgba(0, 150, 135, 1);
  color: #fff;
}
.ant-radio-button-wrapper {
  border-radius: 2px;
  border: 1px solid rgba(0, 150, 135, 1);
  font-size: 12px;

  font-weight: 400;
  color: rgba(0, 150, 135, 1);

  text-align: center;
}

.initViewer {
  width: 100%;
  height: 100%;
}
.tools_panel {
  position: absolute;
  z-index: 1000;
  right: 30px;
  margin-top: 10px;
}
.home_in {
  width: 70px;
  height: 30px;
  background: rgba(0, 150, 135, 1);
  border-radius: 2px;
  font-size: 16px;

  font-weight: 400;
  color: rgba(255, 255, 255, 1);
  line-height: 30px;
}
</style>