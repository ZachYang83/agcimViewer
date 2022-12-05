<template>
  <div class="observed-main">
    <a-alert
      v-if="showAlert"
      banner
      message="请先选择点"
      closable
      @close="onClose"
    />
    <div class="observed-description">
      <label>
        <h3>使用说明</h3>
        1.点击选取观察点，在图层单击选点；
        <br />2.再次点击选取目标点，在图层单击选点； <br />3.点击开始分析。
        <br />
        <font color="green"> <b>绿色连线</b> </font>表示视线可以看到的部分，
        <br />
        <font color="red"> <b>红色部分</b> </font>表示视线被阻挡的部分。
      </label>
    </div>
    <div class="botton-table">
      <a-button type="primary" @click="pickOri">选取观察点</a-button>
    </div>
    <div class="table-container">
      <a-table
        :columns="columnsOri"
        :data-source="dataOri"
        :pagination="false"
        size="small"
      >
        <template slot="name" slot-scope="text, record">
          <editable-cell
            :text="text"
            @change="onCellChange(record.key, 'ori', $event)"
          />
        </template>
        <template slot="action" slot-scope="text, record">
          <a-popconfirm
            v-if="dataOri.length"
            title="确定要删除吗?"
            @confirm="() => onDelete(record.key, record.ori)"
          >
            <a href="javascript:;">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </div>
    <div class="botton-table">
      <a-button type="primary" @click="pickDes">选取目标点</a-button>
    </div>
    <div class="table-container">
      <a-table
        :columns="columnsDes"
        :data-source="dataDes"
        :pagination="false"
        size="small"
      >
        <template slot="action" slot-scope="text, record">
          <editable-cell
            :text="text"
            @change="onCellChange2(record.key, 'des', $event)"
          />
        </template>
        <template slot="action" slot-scope="text, record">
          <a-popconfirm
            v-if="dataDes.length"
            title="确定要删除吗?"
            @confirm="() => onDelete2(record.key, record.des)"
          >
            <a href="javascript:;">删除</a>
          </a-popconfirm>
        </template>
      </a-table>
    </div>
    <div class="botton-group">
      <a-button type="primary" @click="startPicking">开始分析</a-button>
      <a-button type="primary" @click="clearAll">清除全部</a-button>
    </div>
  </div>
</template>
<script>
import Draw from "@/sdk/interactive/draw.js";
import widgetConfigHelper from "@/sdk/ui/widgetConfigHelper";
import { initPoaLayer } from "./js/config";
import PickerHelper from "@/sdk/interactive/pickerHelper";
import SightAnalysis from "@/sdk/spatialAnalysis/sightAnalysis";
import agCoordinate from "@/sdk/maths/coordinate";
import AgBillboard from "@/sdk/geometry/billboard";
import startPicture from "./img/start_icon.png";
import endPicture from "./img/end_icon.png";
import AgFeatureLayer from "@/sdk/layer/featureLayer";
let viewer = CIM.viewer;
var agFeatureLayer = new AgFeatureLayer(viewer);
var sight = new SightAnalysis(viewer);
let draw = new Draw(viewer);
let entity = null;
let entities = [];
let dataOri = [];
let dataDes = [];
let columnsOri = [
  {
    title: "观察点",
    dataIndex: "ori",
    key: "ori",
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
let columnsDes = [
  {
    title: "目标点",
    dataIndex: "des",
    key: "des",
  },
  {
    title: "操作",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
export default {
  data() {
    return {
      dataOri,
      columnsOri,
      columnsDes,
      dataDes,
      indexOri: 0,
      indexDes: 0,
      message: "Error",
      showAlert: false,
    };
  },
  mounted() {
    widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  methods: {
    //点击开始分析
    startPicking() {
      let oriList = []; //观察点
      let desList = []; //目标点
      draw.removeInputAction();
      this.clearLinesByName(["agPolyline"]);
      //开始分析前判断有无点
      if (this.dataOri.length == 0 || this.dataDes.length == 0) {
        this.message = "请先选择点";
        this.showAlert = true;
      } else {
        this.showAlert = false;
        for (var i = 0; i < this.dataOri.length; i++) {
          let json = new Cesium.Cartesian3(
            this.dataOri[i].position.x,
            this.dataOri[i].position.y,
            this.dataOri[i].position.z
          );
          json["pointName"] = this.dataOri[i].ori;
          oriList.push(json);
        }
        for (var i = 0; i < this.dataDes.length; i++) {
          let json = new Cesium.Cartesian3(
            this.dataDes[i].position.x,
            this.dataDes[i].position.y,
            this.dataDes[i].position.z
          );
          json["pointName"] = this.dataDes[i].des;
          desList.push(json);
        }
        for (var i = 0; i < oriList.length; i++) {
          for (var j = 0; j < desList.length; j++) {
            //开始分析
            sight.analysis({
              start: oriList[i],
              end: desList[j],
              limt: 5,
              lineName: {
                startName: oriList[i].pointName,
                endName: desList[j].pointName,
              },
            });
          }
        }
      }
    },
    //清除页面所有
    clearAll() {
      draw.removeInputAction();
      this.clearLines();
      this.dataOri = [];
      this.dataDes = [];
      this.indexOri = 0;
      this.indexDes = 0;
    },
    //取观察点
    pickOri() {
      CIM.agcimScene.setSceneConfig({ depthTestAgainstTerrain: true }); //开启地形深度检测，防止点穿地面
      draw
        .drawPoint({
          pixelSize: 4,
          color: Cesium.Color.BLUE,
          show: false,
        })
        .then((res) => {
          this.indexOri = this.indexOri + 1;
          let json = {
            ori: "观察点" + this.indexOri,
            position: new Cesium.Cartesian3(
              res.positions[0].x,
              res.positions[0].y,
              res.positions[0].z
            ),
            key: res.entity.id,
          };
          this.dataOri.push(json);
          var billboardOpt = {
            width: 30,
            height: 33,
          };
          var billboard = new AgBillboard(
            json.ori,
            json.position,
            startPicture,
            billboardOpt
          );
          billboard.addToLayer(agFeatureLayer);
        })
        .then((res) => {
          this.pickOri();
        });
    },
    //取目标点
    pickDes() {
      CIM.agcimScene.setSceneConfig({ depthTestAgainstTerrain: true }); //开启地形深度检测，防止点穿地面
      draw
        .drawPoint({
          pixelSize: 4,
          color: Cesium.Color.RED,
          show: false,
        })
        .then((res) => {
          this.indexDes = this.indexDes + 1;
          let json = {
            key: res.entity.id,
            des: "目标点" + this.indexDes,
            position: new Cesium.Cartesian3(
              res.positions[0].x,
              res.positions[0].y,
              res.positions[0].z
            ),
          };
          this.dataDes.push(json);
          var billboardOpt = {
            width: 30,
            height: 33,
          };
          var billboard = new AgBillboard(
            json.des,
            json.position,
            endPicture,
            billboardOpt
          );
          billboard.addToLayer(agFeatureLayer);
        })
        .then((res) => {
          this.pickDes();
        });
    },
    //根据名字清除点线
    clearLinesByName(type) {
      let et = viewer.entities.values;
      for (let i = 0; i < et.length; i++) {
        if (et[i].name != undefined && et[i].name.indexOf(type) > -1) {
          viewer.entities.remove(et[i]);
          i--;
        }
      }
    },
    //根据Id清除点线
    clearLinesById(id) {
      let et = viewer.entities.values;
      for (let i = 0; i < et.length; i++) {
        id.map((value) => {
          if (et[i].id == value) {
            viewer.entities.remove(et[i]);
            i--;
          }
        });
      }
    },
    //清除画线
    clearLines() {
      viewer.entities.removeAll(entities);
      for (let i = 0; i < entities.length; i++) {
        viewer.entities.remove(entities[i]);
      }
    },
    //单个删除观察点(表格+地图)
    onDelete(key, name) {
      var entity = viewer.entities.getById(key);
      this.clearLinesByName([name]);
      const dataOri = [...this.dataOri];
      this.dataOri = dataOri.filter((item) => item.key !== key);
    },
    onCellChange(key, dataIndex, value) {
      const dataOri = [...this.dataOri];
      const target = dataOri.find((item) => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.dataOri = dataOri;
      }
    },
    //单个删除目标点(表格+地图)
    onDelete2(key, name) {
      var entity = viewer.entities.getById(key);
      this.clearLinesByName([name]);
      const dataDes = [...this.dataDes];
      this.dataDes = dataDes.filter((item) => item.key !== key);
    },
    onCellChange2(key, dataIndex, value) {
      const dataDes = [...this.dataDes];
      const target = dataDes.find((item) => item.key === key);
      if (target) {
        target[dataIndex] = value;
        this.dataDes = dataDes;
      }
    },
    onClose(e) {
      this.showAlert = false;
    },
  },
  destroyed: function() {
    draw.removeInputAction();
  },
};
</script>
<style scoped>
.observed-main {
  height: 95%;
  padding-bottom: 20px;
  overflow-y: scroll;
}
/*修改滚动条样式*/
div.observed-main::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  /**/
}
div.observed-main::-webkit-scrollbar-track {
  background: rgb(239, 239, 239, 0);
  border-radius: 2px;
}
div.observed-main::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 10px;
}
div.observed-main::-webkit-scrollbar-thumb:hover {
  background: #356897;
}
div.observed-main::-webkit-scrollbar-corner {
  background: #179a16;
}
.observed-description {
  margin: 20px;
}
.botton-group {
  display: flex;
  justify-content: center;
}
.botton-group button {
  margin: 10px;
}
.botton-table {
  display: flex;
  justify-content: left;
}
.botton-table button {
  margin: 10px;
}
.table-container {
  margin: 0 10px;
  height: 225px;
  overflow-y: scroll;
}
/*修改滚动条样式*/
div.table-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
  /**/
}
div.table-container::-webkit-scrollbar-track {
  background: rgb(239, 239, 239, 0);
  border-radius: 2px;
}
div.table-container::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 10px;
}
div.table-container::-webkit-scrollbar-thumb:hover {
  background: #356897;
}
div.table-container::-webkit-scrollbar-corner {
  background: #179a16;
}
</style>
