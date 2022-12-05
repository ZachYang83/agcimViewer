<template>
  <div>
    <div class="content">
      <a-radio-group :value="selectModel" @change="activeModel">
        <div class="house_content_select">
          <a-row :gutter="16">
            <a-col :span="4">
              <!--<a-tag class="hose_item_bt"   v-on:click="activeModel(1)">
        房屋详情
      </a-tag>-->

              <a-radio-button value="1"> 房屋详情 </a-radio-button>
            </a-col>
            <a-col :span="4">
              <!--<a-tag class="hose_item_bt"  v-on:click="activeModel(2)">
        三维模型
      </a-tag>-->

              <a-radio-button value="2"> 三维模型 </a-radio-button>
            </a-col>
            <a-col :span="4">
              <!--<a-tag class="hose_item_bt"  v-on:click="activeModel(3)">
        户型图
      </a-tag>-->

              <a-radio-button value="3"> 户型图 </a-radio-button>
            </a-col>
            <a-col :span="4">
              <!--<a-tag class="hose_item_bt"  v-on:click="activeModel(4)">
        材料统计
      </a-tag>-->

              <a-radio-button value="4"> 材料统计 </a-radio-button>
            </a-col>
          </a-row>
        </div>
      </a-radio-group>
      <div class="house_content_t">
        <propety-table
          v-show="selectModel === '1'"
          :selectBinPropety="selectBinPropety"
        ></propety-table>
        <floorPlan
          v-show="selectModel === '3'"
          :selectBinPropety="selectBinPropety"
        />
        <modelPanel
          v-show="selectModel === '2'"
          :selectBinPropety="selectBinPropety"
          :selectBin="selectBin"
        />
        <statisticsPanel
          v-show="selectModel === '4'"
          :selectBinPropety="selectBinPropety"
          @hideStatiscsPanel="hideStatiscsPanel"
        ></statisticsPanel>
      </div>
    </div>
  </div>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import propetyTable from "./propety.vue";
import statisticsPanel from "./statistics.vue";
import floorPlan from "./floorPlan.vue";
// import {init} from "../../src/house.js"
import modelPanel from "./model.vue";
export default {
  components: {
    "ag-popup": AgPopup,
    "propety-table": propetyTable,
    statisticsPanel,
    floorPlan,
    modelPanel,
  },
  data() {
    return {
      selectModel: "1",
      isShowStatiscsPanel: false,
    };
  },
  mounted() {},
  props: ["selectBin", "selectBinPropety"],
  watch: {
    selectBin(newV, oldV) {
      this.selectBin = newV;
      if (this.binInter) {
        this.binInter.add3DTiles(newV.url);
      }
    },
    // selectBinPropety(newV,oldV){

    // }
  },
  methods: {
    hideStatiscsPanel() {
      this.isShowStatiscsPanel = false;
    },
    onCancel() {
      this.$emit("hideHousePanel", false);
    },

    activeModel(index) {
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
  border: 1px solid rgba(221, 221, 221, 1);
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
  font-size: 15px;

  font-weight: 400;
  color: rgba(0, 150, 135, 1);

  text-align: center;
}
</style>