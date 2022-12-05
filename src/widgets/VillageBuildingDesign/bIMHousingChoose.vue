<template>
    <ag-popup 
      v-model="visible"
      :title="title"
      :isMove="isMove"
      @onCancel="onCancel"
      class="infoBox_modelup_sub">
    <div>
    <!--房屋列表-->
    <div v-show="indexModelPanel===1">
      <div class="bin_select_panel">
        <ul class="bar-ul">
          <li v-for="item in binSuermarketArr" :key="item.url" :binid="item.url">
            <div class="_ag_head_title" :title="item.name">
              <span>{{item.name}}</span>
              <a-checkbox
                @change="addToCompared(arguments,item)"
                class="compared_checkbox"
                v-if="false"
              >对比</a-checkbox>
            </div>

            <div class="img_gg_ss">
              <img :src="item.img" width="168" height="125" class="list_img_item" />
            </div>

            <div style="text-align: center">
              <div class="ag-bimstore-button" v-on:click="showIndexBin(item)">
                <a-tag color="rgba(0,150,135,1)" class="ag_select_tag">选择</a-tag>
              </div>
              <div class="ag-bimstore-button" v-on:click="activeHousePanel(item)">
                <a-tag class="ag_show_tag">预览</a-tag>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <a-divider class="_bottom_divider" />
    </div>
    <!--房屋详情-->
    <div v-show="indexModelPanel===2">
      <house-panel :selectBin="selectBin" :selectBinPropety="selectBin"></house-panel>
      <div class="do_group">
        <a-button
          class="add_bin_button"
          type="primary"
          v-on:click="showIndexBin(selectBin)"
          value="small"
          icon="plus"
          title="使用房屋"
        >使用房屋</a-button>
        <a-button
          class="house_compared"
          v-on:click="backToHouseList"
          value="small"
          icon="rollback"
          title="返回详情列表"
        >返回详情列表</a-button>
      </div>
    </div>
    <!-- <modelUploadPanel :visible="isShowModelPanel" @hideModelUpPanel="hideModelUpPanel"></modelUploadPanel> -->
    <!--房屋对比-->
    <!-- <houseComparedPnel
      :visible="ishoseComparedPanel"
      @onClose="hideHouseComparesPanel"
      :comparedArr="comparedArr"
    /> -->
    </div>
    </ag-popup>
</template>
<script>

import AgPopup from "@/views/components/AgPopup.vue";
//import modelUploadPanel from "@/widgets/uploadManage/uploadBuilding.vue";
import housepanel from "./house/index";
//import houseComparedPnel from "@/widgets/villageBuilding/widgets/houseCompared/index.vue";
import axiosWraper from "@/views/js/net/axiosWraper";
//import bin_default from "@/assets/img/house.png";
import projectServer from "./server/projectServer";



let _baseUrl1 = "/agsupport-rest";
let _baseUrl2 = "/agsupport-rest";
let defaultHouse = [
];

export default {
  components: {
    //modelUploadPanel,
    "house-panel": housepanel,
    //houseComparedPnel,
    "ag-popup": AgPopup
  },
  props: ["indexSuperMarket",'visible'],
  data() {
    return {
      isShowModelPanel: false,
      selectBin: null,
      selectBinPropety: null,
      ishoseComparedPanel: false,
      indexModelPanel: 1,
      comparedArr: [],
      binSuermarketArr: [],
      title: "选择房屋",
      isMove: true
    };
  },
  mounted() {
    this.getPropetyData();
  },

  methods: {
    showIndexBin(e) {
      this.$emit("showIndexBin", e);
    },
    hideHouseComparesPanel() {
      this.ishoseComparedPanel = false;
    },
    backToHouseList() {
      this.indexModelPanel = 1;
    },
    activeHouseComparedPanel() {
      if (this.comparedArr.length < 1) {
        return;
      }
      this.ishoseComparedPanel = true;
    },
    activeModelPanel() {
      this.isShowModelPanel = true;
    },
    hideModelUpPanel() {
      this.isShowModelPanel = false;
      this.getPropetyData();
      // this.$emit('getPropetyData');
    },
    activeHousePanel(da) {
      this.indexModelPanel = 2;
      this.selectBin = da;
      // let indexData=this.binSuermarketArr.filter(i=>i.id==da.id);
      // if(indexData.length>0){
      //   this.selectBinPropety=indexData[0]
      // }
    },
    addToCompared(e, b) {
      let id = b.id;
      let comparedArr = this.comparedArr;
      if (e[0].target.checked) {
        this.comparedArr.push(b);
      } else {
        this.comparedArr = comparedArr.filter(item => {
          return item.id !== id;
        });
      }
    },
    //获取模型的服务器路径
    async loadBinBeforPath() {
      let data = await projectServer.findProjectById({paramType: 2});
      if (data.success) {
        let da = data.content.filter(item => item.id == "3");
        return da[0].path;
      }
    },
    onCancel() {
      this.$emit('hidePanel_BIMHousingChoose', false);
    },
    async getPropetyData() {
      let _this = this;
      let user = this.$store.state.user;
      let param = {
        page: 0,
        rows: 100000,
        userId: user.userId
      };

 
      
      let data = await projectServer.findProject(param);
      let beferPath = await this.loadBinBeforPath();
      let result = data.content.rows;
  
      let filterDa = result.map(item => {
        item.url = beferPath + item.storeFullPath;
        item.name = item.hourseName;
        //item.img=imgUrl+item.id;
        item.img = "/systemFile/" + item.thumb;
        item.property_url = "/getAll/" + item.tableName;
        //如果有位置信息
        // if(transform)
        item.beferPath = beferPath;
        if (!item.thumb) {
          //加载默认缩略图
          //item.img = bin_default;
        }
        return item;
      });
      
  
      this.binSuermarketArr = Array.prototype.concat(defaultHouse, filterDa);
    }
  }
};
</script>
<style scoped>
.bin_select_panel li {
  float: left;
  list-style-type: none;
  padding: 5px 12px;
  margin: 6px 6px;
  background: #fff;
  width: 203px;
  height: 213px;
  /* margin-left: -30px; */
  /* margin-right: 10px; */
  /* margin-right: -29px; */
  border-radius: 2px;
  border: 1px solid rgba(221, 221, 221, 1);
}
.infoBox_modelup_sub{
  width:500px;
  height:600px;
}
.bin_select_panel {
  border-radius: 0 0 5px 5px;
  padding: 10px;
  height: 470px;
  overflow-y: auto;
  margin-left: -28px;
}
.do_group {
  margin: 15px 30px;
}
._bottom_divider {
  margin: 0;
}
.ag-bimstore-button {
  padding: 5px;
  /* color: blue; */
  float: left;
  margin-left: 5px;
  font-size: 15px;
  font-size: 16px;

  font-weight: 400;
}
.ag-bimstore-button :hover {
  color: aqua;
}
.add_bin_button {
  width: 200px;
  height: 40px;
  background: rgba(0, 150, 135, 1);
  border-radius: 2px;
  font-size: 16px;

  font-weight: 400;
  color: rgba(255, 255, 255, 1);
}
.house_compared {
  margin-left: 20px;
  width: 200px;
  height: 40px;
  background: rgba(0, 150, 135, 1);
  border-radius: 2px;
  color: #fff;
  font-size: 16px;

  font-weight: 400;
  color: rgba(255, 255, 255, 1);
}
.bar-ul {
  margin-top: 0px;
}
.ag_show_tag {
  width: 60px;
  height: 26px;
  border-radius: 2px;
  line-height: 21px;
  border-radius: 2px;
  border: 1px solid rgba(0, 150, 135, 1);
  color: rgba(0, 150, 135, 1);
}
.ag_select_tag {
  width: 60px;
  height: 26px;
  border-radius: 2px;
  line-height: 21px;
  background: rgba(0, 150, 135, 1);
  border-radius: 2px;

  font-weight: 400;
  color: rgba(255, 255, 255, 1);
}
._ag_head_title {
  padding-top: 5px;
  font-size: 14px;

  font-weight: 400;
   color:rgba(0, 150, 135, 1);
}
._ag_head_title > span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100px;
  display: inline-block;
}

.list_img_item {
  margin-top: 10px;
}
.img_gg_ss {
  width: 160px;
  height: 135px;
}
.compared_checkbox {
  float: right;
}
.supermarket_group {
    position: absolute;
    right: 10px;
    top: 100px;
    z-index: 2;
  }
  .supermarket {
    width: 480px;
    height: 620px;
    overflow: hidden;
    border-radius: 4px;
  }
  .supermarket .ant-tabs-nav .ant-tabs-tab-active {
    color: #fff;
    font-weight: 500;
    background: rgba(0, 150, 135, 1) !important;
  }
  .supermarket .ant-tabs-nav .ant-tabs-tab {
    position: relative;
    display: inline-block;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 100%;
    margin: 0;
    padding: 0;
    text-decoration: none;
    cursor: pointer;
    -webkit-transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    transition: color 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    width: 160px;
    text-align: center;
    line-height: 40px;
    height: 40px;
    background: rgba(238, 238, 238, 1);
  
    font-weight: 500;
    font-size: 16px;
  }
  .supermarket .ant-tabs-ink-bar {
    position: absolute;
    bottom: 1px;
    left: 0;
    z-index: 1;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    width: 0;
    height: 2px;
    background-color: #f1f6f2;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
  }
  .house_Store_y {
    border-radius: 40px 0 0px 0px;
  }
  .do_bt {
    width: 220px;
    height: 50px;
    background: rgba(255, 255, 255, 1);
    border-radius: 4px;
    font-size: 16px;
    font-weight: 400;
    color: rgba(102, 102, 102, 1);
  }
  .out-supermarket {
    text-align: center;
    margin-top: 10px;
  }
  .save_ {
    margin-right: 40px;
  }
</style>