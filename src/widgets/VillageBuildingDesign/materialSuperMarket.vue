<template>
  <ag-popup
    v-model="visible"
    :title="type == 'add' ? '新增设施' : '修改材料'"
    :isMove="true"
    class="infoBox_modelup_sub"
    @onCancel="onCancel"
    style="width: 700px"
  >
    <div>
      <div v-if="indexModelPanel === 1">
        <a-layout style="min-height: 650px; max-height: 650px">
          <a-layout style="height: 100%">
            <a-layout-sider
              style="
                background: #fff;
                width: 300px;
                min-width: 300px;
                max-width: 300px;
              "
            >
              <!-- <div class="ag-material-classList">
                类别：<a-select
                  default-value="30"
                  style="width: 120px"
                  size="small"
                  v-model="materialClassList"
                  :dropdownMatchSelectWidth="false"
                >
                  <a-select-option
                    v-for="da in tableList"
                    :key="da.value"
                    :value="da.value"
                  >
                    {{ da.text }}
                  </a-select-option>
                </a-select>
              </div> -->
              <div
                class="ag-material-classList"
                v-if="clickMakingInfo !== null && clickMakingInfo !== undefined"
              >
                当前选中：{{ clickMakingInfo.name }}
              </div>
              <a-tree
                :load-data="cascaderLoadData"
                :replaceFields="{
                  title: 'name',
                  key: 'code',
                  children: 'items',
                  tableCode: 'tableCode',
                  largeCode: 'largeCode',
                  mediumCode: 'mediumCode',
                  smallCode: 'smallCode',
                }"
                @select="handleTreeData"
                :tree-data="residence"
              />
            </a-layout-sider>
            <a-layout-content>
              <div class="filter_group">
                <div class="filter_group_left">
                  <a-select
                    :value="replaceType"
                    class="filter_type_g"
                    @change="replaceTypeChange"
                    v-if="type != 'add'"
                  >
                    <a-select-option value="1">单个</a-select-option>
                    <a-select-option value="2">楼层</a-select-option>
                    <a-select-option value="3">全部</a-select-option>
                  </a-select>
                  <a-button @click="replaceIndexMaterialPrev" class="back_"
                    >撤销</a-button
                  >
                  <a-button @click="replaceIndexMaterialReset" class="reset_"
                    >重置</a-button
                  >
                </div>
              </div>
              <div class="bin_select_panel">
                <a-row>
                  <a-col
                    :key="item.url"
                    v-for="item in binSuermarketArr"
                    :span="12"
                    align="center"
                  >
                    <a-card hoverable>
                      <img
                        :src="item.img"
                        width="100%"
                        height="100"
                        class="list_img_item"
                      />
                      <a-card-meta :title="item.name">
                        <template slot="description">
                          <a-button-group class="_do_gp">
                            <a-button
                              size="small"
                              @click="replaceIndexMaterial(item, type)"
                              class="ag_select_tag"
                              >{{ type == "add" ? "添加" : "替换" }}</a-button
                            >
                            <a-button
                              size="small"
                              @click="activeMaterialPanel(item)"
                              class="ag_show_tag"
                              >詳情</a-button
                            >
                          </a-button-group>
                        </template>
                      </a-card-meta>
                    </a-card>
                  </a-col>
                </a-row>
              </div>
              <a-divider class="_bottom_divider" />
            </a-layout-content>
          </a-layout>
        </a-layout>
      </div>
      <div v-if="indexModelPanel === 2">
        <materialpanel
          :selectBin="selectBin"
          :selectBinPropety="selectBinPropety"
        ></materialpanel>

        <div class="do_group">
          <a-button
            class="add_bin_button"
            type="primary"
            v-on:click="replaceIndexMaterial"
            value="small"
            icon="plus"
            title="使用材料"
            >使用材料</a-button
          >
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
      <!-- <materialUploadPanel
        :visible="isShowMaterialUploadPanel"
        @hideMaterialUploadPanel="hideMaterialUploadPanel"
        @loadData="loadData"
      ></materialUploadPanel> -->
    </div>
    <div class="ag-material-footer">
      <a-button @click="handleSaveMaterial" type="primary">保存</a-button>
      <a-button @click="onCancel">取消</a-button>
    </div>
  </ag-popup>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
// import materialUploadPanel from "@/widgets/uploadManage/uploadSreucture.vue";
import materialpanel from "./index.vue";
import projectServer from "./server/projectServer";
import componentServer from "./server/componentServer";
import AgPopup from "@/views/components/AgPopup.vue";
import axios from "@/views/js/net/http";
import axiosMaterial from "./server/axiosMaterial";

const baseUrl = "/agsupport-rest/resource/findResourceDir/";

let _baseUrl1 = "/agsupport-rest";

export default {
  components: { materialpanel, "ag-popup": AgPopup },
  // props:["selectBinPropety"],
  props: ["visible", "clickMakingInfo"],
  data() {
    return {
      binSuermarketArr: [],
      isShowMaterialPanel: false,
      isShowMaterialUploadPanel: false,
      selectBin: null,
      indexModelPanel: 1,
      materialTypeArr: [],
      indexMaterialType: "窗",
      selectBinPropety: null,
      replaceType: "1",
      residence: [],
      selectVal: null,
      dateArr: [],
      dateArr1: [],
      dateArr2: [],
      type: "add",
      tableList: [],
      materialClassList: "30",
      isSave: false,
    };
  },
  mounted() {
    this.loadSelectData();
    this.handleChange();
    this.dateSelectList();
  },
  watch: {},
  methods: {
    //判空
    isNullOrEmpty(data) {
      return (
        data == null || data == undefined || data.length == 0 || data == ""
      );
    },
    filterMaterial(e) {
      if (e === "全部") {
        this.indexMaterialType = null;
      } else {
        this.indexMaterialType = e;
      }

      this.loadData();
    },
    //获取分类列表
    async dateSelectList() {
      const re = await axiosMaterial.itemizeList();
      if (re.success) {
        const result = re.content;
        result.forEach((r) => {
          this.tableList.push({
            value: r.code,
            text: r.name,
          });
        });
      }
    },
    //点击树节点
    handleTreeData(key, props) {
      let tempKeyList = key[0].split("-");
      let tempKey = this.materialClassList + "-";
      if (tempKeyList.length >= 1) {
        tempKey = tempKey + tempKeyList[0];
      }
      if (tempKeyList.length >= 2) {
        tempKey = tempKey + "." + tempKeyList[1];
      }
      // var posList = treeNode.pos.split("-");
      this.loadData(tempKey);
    },
    //获取子节点的数据
    cascaderLoadData(treeNode) {
      return new Promise((resolve) => {
        if (!this.isNullOrEmpty(treeNode.dataRef.item)) {
          resolve();
          return;
        }
        var posList = treeNode.pos.split("-");
        setTimeout(async () => {
          let url = "/agsupport-rest/agsupport/buildingComponent/get";
          let params = {};
          params.largeCode = this.residence[posList[1]].code;
          params.filterType = posList.length;
          params.tableCode = this.selectVal;
          if (posList.length == 3) {
            //获取二级code、
            let tempMediumCode = this.residence[posList[1]]["items"][posList[2]]
              .code;
            if (!this.isNullOrEmpty(tempMediumCode)) {
              let tempMediumCodeList = tempMediumCode.split("-");
              if (tempMediumCodeList.length >= 2) {
                params.mediumCode = tempMediumCodeList[1];
              }
            }
          }
          if (posList.length == 4) {
            //获取二级code、
            let tempsmallCode = this.residence[posList[1]]["items"][posList[2]][
              "items"
            ][posList[3]].code;
            if (!this.isNullOrEmpty(tempsmallCode)) {
              let tempsmallCodeList = tempsmallCode.split("-");
              if (tempsmallCodeList.length >= 3) {
                params.smallCode = tempsmallCodeList[2];
              }
            }
          }
          const res = await axios.get(url, {
            params: params,
          });
          if (res.success) {
            if (this.isNullOrEmpty(res.content)) {
              treeNode.dataRef.isLeaf = true;
              resolve();
              return;
            }
            let date = Array.from(res.content);
            treeNode.dataRef.items = [];
            date.forEach((da) => {
              let dateMap = {};
              //层级索引 每一级对应不同的code
              let tempCodeList = [
                da.largeCode,
                da.largeCode + "-" + da.mediumCode,
                da.largeCode + "-" + da.mediumCode + "-" + da.smallCode,
              ];
              dateMap.code = tempCodeList[posList.length - 1];
              dateMap.name = da.chineseName;
              // dateMap.isLeaf = posList.length >=2
              treeNode.dataRef.items.push(dateMap);
            });
            this.residence = [...this.residence];
            resolve();
          } else {
            resolve();
            return;
          }
        }, 1000);
      });
    },
    async handleChange() {
      this.selectVal = null;
      //一级列表数据
      let url = "/agsupport-rest/agsupport/buildingComponent/get";
      let params = {};
      params.mediumCode = "00";
      params.smallCode = "00";
      params.filterType = "1";
      params.tableCode = this.selectVal;
      const res = await axios.get(url, {
        params: params,
      });
      let date = Array.from(res.content);
      this.residence = [];
      date.forEach((da) => {
        let dateMap = {};
        dateMap.code = da.largeCode;
        dateMap.name = da.chineseName;
        dateMap.isLeaf = false;
        this.residence.push(dateMap);
      });
    },
    replaceTypeChange(e) {
      this.replaceType = e;
    },
    backToHouseList() {
      this.indexModelPanel = 1;
    },
    replaceIndexMaterial(e, type) {
      let index = this.replaceType;
      if (type == "add") {
        this.$emit("addIndexMaterial", e, index);
      } else {
        this.$emit("replaceIndexMaterial", e, index);
      }
    },
    //构件替换撤回
    replaceIndexMaterialPrev() {
      this.$emit("replaceIndexMaterialPrev");
    },
    handleSaveMaterial() {
      this.isSave = true;
      this.$emit("handleSaveMaterial");
      this.$emit("onCancel", false);
    },
    //构件替换重置
    replaceIndexMaterialReset() {
      this.$emit("replaceIndexMaterialReset");
    },
    activeMaterialUpPanel() {
      this.isShowMaterialUploadPanel = true;
    },
    hideMaterialPanel() {
      this.isShowMaterialPanel = false;
    },
    hideMaterialUploadPanel() {
      this.isShowMaterialUploadPanel = false;
    },
    onCancel() {
      if (!this.isSave) this.$emit("replaceIndexMaterialReset");
      this.$emit("onCancel", false);
    },
    activeMaterialPanel(da) {
      this.indexModelPanel = 2;
      this.selectBin = da;
      let indexData = this.binSuermarketArr.filter((i) => i.id == da.id);
      if (indexData.length > 0) {
        this.selectBinPropety = indexData[0];
      }
    },
    //获取数据
    async loadData(key) {
      let user = this.$store.state.user;
      // let param = {
      //   page: 0,
      //   rows: 1000000,
      //   userId: user.userId,
      //   //componentName:this.indexMaterialType,
      // };
      let param = {
        page: 0,
        rows: 1000000,
        // userId: user.userId,
      };
      // if (this.indexMaterialType) {
      //   param.catagory = this.indexMaterialType;
      // }
      param.componentCode = key;

      let data = await componentServer.findComponent(param);
      let beferPath = componentServer.previewComponentUrl;

      let result = data.content.rows;
      let imgUrl = _baseUrl1 + "/resource/findThumb/";
      let filterDa = result.map((item) => {
        item.url = beferPath + "?type=2&id=" + item.id;
        item.name = item.name;
        //item.img=imgUrl+item.id;
        item.img = beferPath + "?type=1&id=" + item.id;
        item.property_url = "/getAll/nongfang1";
        item.beferPath = beferPath;
        // if (!item.thumb) {
        //   //加载默认缩略图
        //   item.img = bin_default;
        // }
        return item;
      });
      this.binSuermarketArr = filterDa;
    },
    //获取模型的服务器路径
    async loadBinBeforPath(id = "3") {
      let data = await projectServer.findProjectById({ paramType: 2 });
      if (data.success) {
        let da = data.content.filter((item) => item.id == id);
        return da[0].path;
      }
    },
    //获取下拉列表的数据
    async loadSelectData() {
      let _this = this;
      var url =
        "/agsupport-rest/agsupport/dic/getAgDicByTypeCode/COMPONENT_TYPE";
      let data = await axiosWraper.getData(url);

      if (data.success) {
        let content = data.content;
        let filterArr = [];
        content.map((item) => {
          filterArr.push({
            key: item.code,
            value: item.value,
          });
        });
        try {
          _this.materialTypeArr = filterArr;
          // _this.indexMaterialType=filterArr[0].value;
          _this.loadData(); //加载构件数据
        } catch (err) {
        }
      }
    },
  },
};
</script>
<style scoped src="./css/antPro.css"></style> 
<style scoped src="./css/index.css"></style> 
