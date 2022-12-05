<template>
  <ag-popup v-model="isShow" title="BIM工具" @onCancel="onCancel" class="popup-box">
    <div id="mainBox">
      <!-- <p>用于验证控规盒子内的建筑指标,是否超出控规限制，如建筑高度，建筑退线距离等。</p> -->
      <p class="tips"><b>提示：</b>点击你想隐藏的构件，将其进行隐藏</p>
      <a-divider />

      <label><b>隐藏的构件：</b></label>
      <a-table :columns="columns" :data-source="tableData" :scroll="{ y: 450 }" size="small" tableLayout="auto" align="center">
        <a slot="name" slot-scope="text">{{ text }}</a>
        <span slot="action" slot-scope="text, record">
          <a @click="() => onClick(record)">显示</a>
        </span>
      </a-table>
    </div>
  </ag-popup>
</template>


<script>
import PickerHelper from "@/sdk/interactive/pickerHelper";
import revitHelper from "@/sdk/bim/revitHelper";
import StyleCondition from "@/sdk/renderer/styleCondition";
import AgPopup from "@/views/components/AgPopup.vue";

let tileset = null;
let pickerHelper;
let styleCondition = null;


const columns = [
  {
    title: "构件ID",
    dataIndex: "objectid",
    key: "objectid",
  },
  {
    title: "构件类型",
    dataIndex: "catagory",
    key: "catagory",
  },
  {
    title: "功能",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      isShow: true,
      tableData: null,
      columns,
    };
  },
  mounted() {
    let _this = this;
    var viewer = CIM.viewer;

    pickerHelper = new PickerHelper(viewer);
    pickerHelper.on("LEFT_CLICK", function (movement) {
      let o = movement.position;
      var pickedFeature = viewer.scene.pick(o);
      if (pickedFeature && pickedFeature.tileset) {

        if (tileset == null || pickedFeature.tileset != tileset) {
          if (tileset != null)
            styleCondition.resetVisible(true);
          tileset = pickedFeature.tileset;
          styleCondition = new StyleCondition(tileset);
          _this.tableData = [];
        }

        var id = pickedFeature.getProperty("name");
        var catagory = pickedFeature.getProperty("catagory");
        _this.tableData.push({ "objectid": id, "catagory": catagory });

        styleCondition.addHideCondition("${name} ==='" + id + "'");
      }

    })
  },
  methods: {
    onClick(record) {
      styleCondition.addShowCondition("${name} ==='" + record.objectid + "'");
      var val = { "objectid": record.objectid, "catagory": record.catagory };
      var index = this.tableData.findIndex(function myFunction(value) {
        return value.objectid == record.objectid;
      });

      if (index > -1) {
        this.tableData.splice(index, 1);
      }
    },
    //关闭
    onCancel() {
      if (styleCondition)
        styleCondition.resetVisible(true);
      pickerHelper.off();
      tileset = null;
      this.$emit("close", { code: "ClickHideShow" });
    },
  },
  destroyed() {
    tileset = null;
    if (styleCondition)
      styleCondition.resetVisible(true);
    pickerHelper.off();
  },
};
</script>
<style scoped>
.popup-box {
  width: 350px;
}
.tips {
  position: relative;
  top: 10px;
  background: #fdfae9;
  /* text-align: left;
  font-size: 15px;
  border: 1px solid #e4dba6;
  line-height: 16px;
  padding: 4px; */
}
</style>

