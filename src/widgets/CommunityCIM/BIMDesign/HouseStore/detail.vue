<template>
  <div>
    <div class="content">
      <a-radio-group :value="selectModel" @change="onChangeModel">
        <div class="house_content_select">
          <a-row :gutter="16">
            <a-col :span="4">
              <a-radio-button value="1">房屋详情</a-radio-button>
            </a-col>
            <a-col :span="4">
              <a-radio-button value="2">三维模型</a-radio-button>
            </a-col>
            <a-col :span="4">
              <a-radio-button value="3">户型图</a-radio-button>
            </a-col>
            <a-col :span="4">
              <a-radio-button value="4">材料统计</a-radio-button>
            </a-col>
          </a-row>
        </div>
      </a-radio-group>

      <div class="house_content_t">
        <!-- 房屋详情 -->
        <div v-show="selectModel==='1'" class="property-box">
          <!-- <dl v-for="item in propertyList" :key="item.key">
            <dd>{{item.label}}：{{item.text}}</dd>
          </dl>-->
          <a-descriptions title layout="vertical" bordered>
            <a-descriptions-item
              v-for="item in propertyList"
              :key="item.key"
              :label="item.label"
            >{{item.text}}</a-descriptions-item>
          </a-descriptions>
        </div>
        <!-- 三维模型 -->
        <div v-show="selectModel==='2'" id="model_dom" class="initViewer" ref="model_dom">
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
        <!-- 户型图 -->
        <floorPlan v-show="selectModel==='3'" :selectBinPropety="selectBinPropety" />
        <!-- 材料统计 -->
        <a-table
          v-show="selectModel==='4'"
          :rowKey="statistArr => statistArr.id"
          :columns="columns"
          :data-source="statistArr"
          :pagination="pagination"
          :loading="loading"
          @change="handleTableChange"
        ></a-table>
      </div>
    </div>
  </div>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import axiosWraper from "@/views/js/net/axiosWraper";
import floorPlan from "./floorPlan.vue";
import { Descriptions } from "ant-design-vue";
import previewModel from "../common/previewModel.js";

//房屋详情
let arr = [
  { key: "sourseName", val: "模型" },
  { key: "hourseName", val: "房屋名称" },
  { key: "homesteadArea", val: "宅基地面积（平方米）" },
  { key: "floorArea", val: "占地面积（平方米）" },
  { key: "coveredArea", val: "建筑面积（平方米）" },
  { key: "costEstimates", val: "造价面积（万元）" },
  { key: "remark", val: "房屋简介" },
];

const columns = [
  {
    title: "名称",
    dataIndex: "name",
  },
  {
    title: "分类",
    dataIndex: "catagory",
  },
  {
    title: "标高",
    dataIndex: "level",
  },
];

let viewerA = null;

export default {
  components: {
    "a-descriptions": Descriptions,
    "a-descriptions-item": Descriptions.Item,
    "ag-popup": AgPopup,
    floorPlan,
  },
  data() {
    return {
      selectBinPropety: {},
      selectModel: "1",
      isShowStatiscsPanel: false,
      propertyList: [],

      //材料统计
      statistArr: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      loading: false,
      columns,
    };
  },
  mounted() {},
  methods: {
    getInit(o) {
      this.selectBinPropety = o;
      this.getpropertyList(o);
      this.getStatistics({
        tableName: o.tableName,
        name: "",
        page: this.pagination.current,
        rows: this.pagination.pageSize,
      });
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
        viewerA = previewModel.initViewer(this.$refs.model_dom.id);
        previewModel.displayerDefaultUI(viewerA);
        previewModel.add3dTiles(viewerA, o.url);
      } else {
        previewModel.add3dTiles(viewerA, o.url);
      }
    },
    zoomToHome() {
      previewModel.zoomToHome(viewerA);
    },

    async getStatistics(params = {}) {
      this.loading = true;
      let url = "/agsupport-rest/agsupport/BIM/dentity/find";
      let res = await axiosWraper.getData(url, params);
      this.statistArr = res.content.rows;
      this.pagination.total = res.content.total;
      this.loading = false;
    },
    handleTableChange(pagination, filters, sorter) {
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;

      this.getStatistics({
        tableName: this.selectBinPropety.tableName,
        name: "",
        page: pager.current,
        rows: pager.pageSize,
      });
    },

    hideStatiscsPanel() {
      this.isShowStatiscsPanel = false;
    },

    onCancel() {
      this.$emit("hideHousePanel", false);
    },

    onChangeModel(index) {
      this.selectModel = index.target.value;
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
.pop-box {
  background: rgba(238, 238, 238, 1);
  left: 250px;
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
  width: 420px;
  height: 420px;
  overflow: auto;
  border-radius: 2px;
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