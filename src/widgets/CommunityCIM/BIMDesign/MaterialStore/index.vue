<template>
  <div>
    <div v-show="indexModelPanel === 1">
      <div class="filter_group">
        <span>构件分类</span>
        <a-select
          placeholder
          @change="filterMaterial"
          class="filter_select_"
          default-value="门"
        >
          <a-select-option v-for="i in materialTypeArr" :key="i.key">{{
            i.value
          }}</a-select-option>
        </a-select>

        <a-radio-group :value="replaceType" @change="onChangeReplaceType">
          <a-radio-button value="1">单个</a-radio-button>
          <a-radio-button value="2">楼层</a-radio-button>
          <a-radio-button value="3">全部</a-radio-button>
        </a-radio-group>
      </div>
      <!--列表-->
      <div class="list-box vscroll">
        <ul class="bar-ul">
          <li v-for="item in materialArr" :binid="item.url" :key="item.url">
            <a-item :value="item" @choose="choose" @detail="detail"></a-item>
          </li>
        </ul>
      </div>
    </div>
    <div v-show="indexModelPanel === 2">
      <material-detail ref="mlDetail"></material-detail>

      <div class="do_group">
        <a-button
          class="house_compared"
          v-on:click="backToHouseList"
          value="small"
          icon="rollback"
          title="返回材料列表"
          >返回材料列表</a-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import highlightHelper from "@/sdk/renderer/highlightHelper";
import AItem from "../common/AItem";
import bin_default from "./img/material.png";
import MaterialDetail from "./detail.vue";
import RepalceMemeber from "./js/repalceMemeber";

let viewer = CIM.viewer;
let pickedFeature = null;
let pickerHelper = null;
export default {
  components: {
    "material-detail": MaterialDetail,
    "a-item": AItem,
  },
  data() {
    return {
      replaceType: "1",
      materialArr: [],
      isShowMaterialDetail: false,
      isShowMaterialUploadPanel: false,
      selectBin: null,
      indexModelPanel: 1,
      materialTypeArr: [],
      indexMaterialType: "窗",
      selectBinPropety: null,
    };
  },
  mounted() {
    pickerHelper = new PickerHelper(viewer);
    this.loadSelectData();
    this.addMaterialEvent();
  },

  methods: {
    addMaterialEvent() {
      let vm = this;
      pickerHelper.on("LEFT_CLICK", function(movement) {
        var position = viewer.scene.pickPosition(movement.position);
        pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature)) {
          return;
        }
        highlightHelper.add(pickedFeature, viewer);
        if (pickedFeature.primitive instanceof Cesium.Model) {
          var id = pickedFeature.primitive.id;
          RepalceMemeber.sizeMarking(id, pickedFeature);
        } else if (pickedFeature instanceof Cesium.Cesium3DTileFeature) {
          var id = pickedFeature.getProperty("name");
          RepalceMemeber.sizeMarking(id, pickedFeature);
        } else {
          RepalceMemeber.removeMark();
        }
      });
    },
    choose(e) {
      this.selectBinPropety = e;
      RepalceMemeber.Initialize(pickedFeature, e.url, this.replaceType);
    },
    detail(o) {
      this.indexModelPanel = 2;
      this.$refs.mlDetail.getInit(o);
    },
    onChangeReplaceType(e) {
      this.replaceType = e.target.value;
    },
    filterMaterial(e) {
      if (e === "全部") {
        this.indexMaterialType = null;
      } else {
        this.indexMaterialType = e;
      }
      this.getMaterialArr();
    },
    backToHouseList() {
      this.indexModelPanel = 1;
    },

    activeMaterialUpPanel() {
      this.isShowMaterialUploadPanel = true;
    },
    hideMaterialDetail() {
      this.isShowMaterialDetail = false;
    },
    hideMaterialUploadPanel() {
      this.isShowMaterialUploadPanel = false;
    },
    //获取下拉列表的数据
    async loadSelectData() {
      let vm = this;
      var url =
        "/agsupport-rest/agsupport/dic/getAgDicByTypeCode/COMPONENT_TYPE";
      let data = await axiosWraper.getData(url);

      if (data.success) {
        let content = data.content;
        vm.materialTypeArr = [];
        content.map((item) => {
          vm.materialTypeArr.push({
            key: item.code,
            value: item.value,
          });
        });

        vm.indexMaterialType = vm.materialTypeArr[0].value;
        vm.getMaterialArr(); //加载构件数据
      }
    },
    //获取数据
    async getMaterialArr() {
      let user = this.$store.state.user;
      let param = {
        page: 0,
        rows: 10000,
        catagory: this.indexMaterialType,
      };

      let url = "/agsupport-rest/agsupport/BIM/Component/find";
      let data = await axiosWraper.getData(url, param);
      let result = data.content.rows;
      let beferPath =
        "/agsupport-rest/agsupport/BIM/Component/preview";
      let filterDa = result.map((item) => {
        item.url = beferPath + "?type=2&id=" + item.id;
        item.name = item.name;
        item.img = beferPath + "?type=1&id=" + item.id;
        item.property_url = "/getAll/nongfang1";
        item.beferPath = beferPath;
        return item;
      });

      this.materialArr = filterDa;
    },
    //获取模型的服务器路径
    async loadBinBeforPath(id = "3") {
      let data = await axiosWraper.getData(
        "/agsupport-rest/agsupport/BIM/Project/get"
      );
      if (data.success) {
        let da = data.content.filter((item) => item.id == id);
        return da[0].path;
      }
    },
  },
};
</script>
<style scoped>
.list-box {
  height: 450px;
  overflow: auto;
}
.bar-ul {
  margin: 0px;
  padding: 0;
}
.bar-ul li {
  float: left;
  list-style-type: none;
  margin: 5px;
  width: 194px;
}
.filter_select_ {
  min-width: 120px;
  margin: 0 10px 10px;
}
</style>
