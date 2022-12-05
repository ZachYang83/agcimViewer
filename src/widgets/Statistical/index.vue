<template>
  <div class="static-page">
    <h4 class="h4">选定区域</h4>
    <a-button
      type="primary"
      @click="getAllStatistics"
      style="margin:0 10px 20px 10px;"
      v-if="!isDrawing"
      >全区域</a-button
    >
    <a-button type="primary" @click="drawPolygon" v-if="!isDrawing"
      >绘制</a-button
    >
    <a-button
      type="primary"
      disabled
      v-if="isDrawing"
      style="margin:0 10px 20px 10px;"
      >绘制中...</a-button
    >
    <h4 class="h4">统计结果</h4>
    <a-table
      :pagination="pagination"
      :columns="columns"
      :data-source="tableArr"
      :rowKey="(data) => data.id"
      class="table"
    >
      <span slot="action" slot-scope="record">
        <a @click="onShowList(record)"> 清单</a>
      </span>
    </a-table>
    <!-- 清单 -->
    <ag-popup
      :title="title"
      v-model="popVisible"
      @onCancel="onCancel"
      class="popup-box"
    >
      <div class="content">
        <div v-if="addModleFlag" class="add-box">
          <p
            class="red"
            v-show="!newModel.coordinates"
            style="margin-bottom:10px;"
          >
            请点击地图添加模型
          </p>
          <a-input v-model="newModel.name" placeholder="模型名称" />
          <a-input v-model="newModel.remark" placeholder="备注" />
          <a-button type="primary" @click="saveModle">
            保存
          </a-button>
        </div>
        <div class="top-box">
          <div>
            <a-button v-if="!addModleFlag" type="primary" @click="addModle">
              添加
            </a-button>
          </div>
          总数：{{ pagination1.total }}
        </div>
        <a-table
          :row-selection="{
            selectedRowKeys: selectedRowKeys1,
            onChange: onSelectChange1,
          }"
          :pagination="pagination1"
          @change="handleTableChange1"
          :columns="columns1"
          :data-source="tableArr1"
          :rowKey="(data) => data.id"
          size="small"
          align="center"
          class="table1"
        >
          <span slot="name" slot-scope="text, record">
            {{ record.floor }}-{{ text }}
          </span>
          <span slot="action" slot-scope="text, record">
            <a class="loc" @click="toLocation(record)">定位</a>
            <a class="loc red" @click="toDelete(record.id)">删除</a>
            <a @click="editSave(record)">保存</a>
          </span>
        </a-table>
      </div>
    </ag-popup>
  </div>
</template>

<script>
const columns = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "数量",
    dataIndex: "total",
    key: "total",
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
const columns1 = [
  {
    title: "名称",
    dataIndex: "name",
    key: "name",
    scopedSlots: { customRender: "name" },
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
import agCamera from "@/sdk/camera/camera";
import agWFSLayer from "@/sdk/layer/agWFSLayer";
import Ag3DTilesLayer from "@/sdk/layer/ag3DTilesLayer";
import highlightHelper from "@/sdk/renderer/highlightHelper";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import Draw from "@/sdk/interactive/draw";
import agCoordinate from "@/sdk/maths/coordinate";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
import coordinate from "@/sdk/maths/coordinate";
import axiosWraper from "@/views/js/net/axiosWraper";
import axios from "@/views/js/net/http";
import qs from "qs";
import AgPopup from "@/views/components/AgPopup.vue";
let draw;
var agFeatureLayer = new AgFeatureLayer(CIM.viewer);

let viewer = CIM.viewer;
let pickerHelper = null;
let curLayer = null;
let mapArray = "";
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      //统计列表
      columns,
      tableArr: [],
      pagination: {
        pageSize: 10,
        current: 1,
      },

      //是否正在绘制区域
      isDrawing: false,

      //当前模型
      curModle: {},

      //清单弹窗
      popVisible: false,
      columns1,
      tableArr1: [],
      selectedRowKeys1: [],
      pagination1: {
        pageSize: 10,
        current: 1,
      },
      //添加新点
      addModleFlag: false,
      newModel: {
        name: "",
        coordinates: "",
        feature: "",
        remark: "",
        sourceId: "",
      },
    };
  },
  mounted() {
    pickerHelper = new PickerHelper(viewer);
    draw = new Draw(viewer);
    this.getAllStatistics();
  },
  computed: {
    title: function() {
      return this.curModle.name + "清单";
    },
  },
  methods: {
    //全区域统计列表
    getAllStatistics() {
      let vm = this;
      viewer.entities.removeAll();
      mapArray = "";
      vm.getStatistics(vm.pagination, mapArray);
    },
    //绘制区域 -> 统计列表
    drawPolygon() {
      let vm = this;
      let WGSArr = [];
      vm.isDrawing = true;
      let arr_en = viewer.entities._entities._array;
      for (let i = 0; i < arr_en.length; i++) {
        if ("agPolygon" == arr_en[i]._name) {
          viewer.entities.removeAll();
        }
      }

      draw.drawPolygon().then(
        (result) => {
          var arr = result.positions;
          for (let i = 0; i < arr.length; i++) {
            let p = agCoordinate.Cartesian3_to_WGS84(arr[i]);
            WGSArr.push([p.lng, p.lat]);
          }
          mapArray = encodeURIComponent(JSON.stringify(WGSArr));
          vm.getStatistics(vm.pagination, mapArray);

          vm.isDrawing = false;
        },
        (error) => {
          console.log(error);
        }
      );
    },
    //统计列表
    async getStatistics(params = {}, mapArray) {
      let res = await axiosWraper.getData(
        `/agsupport-rest/agsupport/BIM/materials/statistics`,
        {
          mapArray: mapArray,
          paramType: 1,
          page: params.current,
          rows: params.pageSize,
        }
      );
      if (res.success) {
        this.tableArr = res.content.rows;
      }
    },
    //显示清单
    onShowList(row) {
      pickerHelper.off();
      this.popVisible = true;
      this.curModle = row;
      this.addModleFlag = false;
      this.pagination1.current = 1;
      this.getList(this.pagination1);
    },
    //关闭清单
    onCancel() {
      this.popVisible = false;
    },
    //清单列表
    async getList(params = {}) {
      this.loading = true;
      let res = await axiosWraper.getData(
        `/agsupport-rest/agsupport/BIM/materials/find`,
        {
          mapArray: mapArray,
          sourceId: this.curModle.id,
          rows: params.pageSize,
          page: params.current,
        }
      );
      this.tableArr1 = [];
      if (res.success) {
        this.loading = false;
        const pagination = { ...this.pagination1 };
        pagination.total = res.content.total;
        this.pagination1 = pagination;
        let arr = res.content.rows;
        for (let i = 0; i < arr.length; i++) {
          let o = arr[i].coordinates.split(",");
          arr[i].coordinates = [
            parseFloat(o[0]),
            parseFloat(o[1]),
            parseFloat(o[2]),
          ];
        }
        this.tableArr1 = arr;
      }
    },
    //分页清单列表
    handleTableChange1(pagination, filters) {
      const pager = { ...this.pagination1 };
      pager.current = pagination.current;
      this.pagination1 = pager;
      this.getList(this.pagination1);
    },
    //checkbox 控制模型显示隐藏
    onSelectChange1(selectedRowKeys, data) {
      let aa = this.selectedRowKeys1;
      for (let k = 0; k < aa.length; k++) {
        if (selectedRowKeys.indexOf(aa[k]) == -1) {
          this.removeModelById(aa[k]);
        }
      }
      //判断是否已存在
      let o = this.curModle;
      var layer;
      let tarr = CIM.layerTree._aglayers;
      for (let i = 0; i < tarr.length; i++) {
        if (tarr[i].id == o.id) {
          layer = tarr[i];
          break;
        }
      }
      if (!layer) {
        layer = new agWFSLayer(viewer);
        layer.id = o.id;
        tarr.push(layer);
      }
      curLayer = layer;
      layer.set3dTilesStyle(
        { arr: data, id: o.id },
        {
          url: o.url,
          styleManagerId: o.styleManagerId,
        },
        true
      );
      this.selectedRowKeys1 = selectedRowKeys;
    },
    //添加点模型
    addModle() {
      let vm = this;
      vm.initNewModel();
      vm.addModleFlag = true;
      pickerHelper.on("LEFT_CLICK", function(movement) {
        let pickedFeature = viewer.scene.pick(movement.position);
        var position = viewer.scene.pickPosition(movement.position);
        var cartographic = coordinate.cartesian3ToCartographic(
          position,
          "Degrees"
        );
        if (position) {
          let row = {
            name: vm.curModle.name,
            coordinates: [cartographic.lng, cartographic.lat, cartographic.alt],
            feature: "",
          };
          vm.newModel.coordinates = [
            cartographic.lng,
            cartographic.lat,
            cartographic.alt,
          ].toString();
          vm.newModel.feature = ""; //获取朝向等等

          let layer = new Ag3DTilesLayer(viewer);
          let tileset = layer.add(
            vm.curModle.url,
            {}, //feature
            vm.curModle.styleManagerId
          );
          pickerHelper.off();
        }
      });
    },
    //初始化新点模型
    initNewModel() {
      this.newModel = {
        name: this.curModle.name + (this.pagination1.total + 1),
        coordinates: "",
        feature: "",
        remark: "",
        sourceId: "",
      };
    },
    //保存点模型
    async saveModle() {
      let vm = this;
      vm.newModel.sourceId = vm.curModle.id;
      if (vm.newModel.coordinates == "") {
        return "";
      }
      let res = await axios.post(
        `/agsupport-rest/agsupport/BIM/materials/add`,
        qs.stringify(vm.newModel)
      );
      if (res.success) {
        vm.addModleFlag = false;
        vm.getList(vm.pagination1);
        vm.getStatistics(vm.pagination, mapArray);
      }
    },
    //定位
    toLocation(row) {
      let lytree = CIM.layerTree._aglayers;
      for (let k = 0; k < lytree.length; k++) {
        if (lytree[k].id == this.curModle.id) {
          let arr = lytree[k]._primitives;
          for (let i = 0; i < arr.length; i++) {
            if (arr[i].agMetaData.id == row.id) {
              let tileset = arr[i];
              viewer.flyTo(tileset, {
                duration: 2,
              });
              return;
            }
          }
        }
      }
      agCamera.setCameraByPosition(viewer, row.coordinates);
    },
    //删除点模型
    async toDelete(id) {
      let vm = this;
      let res = await axios.delete(
        `/agsupport-rest/agsupport/BIM/materials/delete?ids=` + id
      );
      if (res.success) {
        vm.$message.success("删除成功");
        vm.getList(vm.pagination1);
        vm.getStatistics(vm.pagination, mapArray);
        //如果存在地图上，移除模型
        vm.removeModelById(id);
      }
    },
    //移除模型
    removeModelById(id) {
      let arr = curLayer._primitives;
      if (arr) {
        for (let i = arr.length - 1; i > -1; i--) {
          if (arr[i].agMetaData && id == arr[i].agMetaData.id) {
            viewer.scene.primitives.remove(arr[i]);
            arr.splice(i, 1);
          }
        }
      }
    },
    editSave(row) {
      this.$message.info("调整模型后，保存模型位置，状态等，待确定");
    },
  },
};
</script>
<style scoped>
.table /deep/ .ant-table-column-title .ant-table-selection {
  display: none;
}
.static-page .h4 {
  margin: 0 10px 10px;
}
.popup-box {
  width: 400px;
  background: #fff;
}
.popup-box .content {
  padding: 20px;
}
.popup-box .top-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}
.static-page .ml10 {
  margin-left: 10px;
}
.table1 .loc {
  margin-right: 10px;
}
.static-page .add-box input {
  margin-bottom: 10px;
}
.static-page .red {
  color: #ff4d4f;
}
</style>
