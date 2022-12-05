<template>
  <ag-popup v-model="chartVisible" @onCancel="onCancel" class="popup-box">
    <div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        :scroll="{ y: 450 }"
        size="small"
        tableLayout="auto"
        align="center"
      >
        <a slot="name" slot-scope="text">{{ text }}</a>
        <span slot="action" slot-scope="text, record">
          <a @click="() => onClick(record.objectid)">定位</a>
        </span>
      </a-table>
    </div>
    <!-- <div class="switch-box">
      <label class="trlable">透明度</label>
      <a-switch :checked="this.$store.state.transparency" class="switch" @change="onChange" />
    </div> -->
  </ag-popup>
</template>

<script>
import StyleCondition from "@/sdk/renderer/styleCondition";
import serverData4BIM from "@/views/js/net/serverData4BIM";
import AgPopup from "@/views/components/AgPopup.vue";
import config from "../js/config";
import { Switch } from "ant-design-vue";
import { orientate } from "../js/index";

const columns = [
  {
    title: "构件ID",
    dataIndex: "objectid",
    key: "objectid",
  },
  {
    title: "构件名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "功能",
    key: "action",
    scopedSlots: { customRender: "action" },
  },
];
let tileset = null;
let profess = null;
let styleCondition = null;
export default {
  components: {
    "ag-popup": AgPopup,
    "a-switch": Switch,
  },
  props: {
    comOpcity: 0.3,
  },
  data() {
    return {
      chartVisible: false,
      columns,
      tableData: null,
      currentNode: null,
      activeTabKey:null,
    };
  },
  mounted() {},
  methods: {
    open(node, activeKey, tiles, profession, tableName) {
      this.activeTabKey = activeKey;
      var category = node.dataRef.category;
      var _this = this;
      tileset = tiles;
      styleCondition = new StyleCondition(tileset);

      _this.currentNode = node;
      _this.profess = profession;
      switch (category) {
        case "FamilyType":
          if (activeKey == "1") {
            var parentValue = node.$parent.dataRef.name;
            var nodeValue = node.dataRef.name;
            var levelValue = node.$parent.$parent.$parent.dataRef.name;
            var catagoryValue = node.$parent.$parent.dataRef.name;
            var option = {
              filterKey: "name,objectid",
              level: levelValue,
              catagory: catagoryValue,
              familyname: parentValue,
              familytype: nodeValue,
              profession: profession,
            };
          }else if(activeKey == "3"){
            var nodeValue = node.dataRef.name;
            var catagoryValue = node.$parent.$parent.dataRef.name;
            var parentValue = node.$parent.dataRef.name;
            var option = {
              filterKey: "name,objectid",
              catagory: catagoryValue,
              familyname: parentValue,
              familytype: nodeValue,
              profession: profession,
            }; 
          }
          break;
        case "FamilyName":
          var nodeValue = node.dataRef.name;
          var catagoryValue = node.$parent.dataRef.name;
          var option = {
            filterKey: "name,objectid",
            catagory: catagoryValue,
            familyname: nodeValue,
            profession: profession,
          };
          break;
        case "Catagory":
          var nodeValue = node.dataRef.name;
          var option = {
            filterKey: "name,objectid",
            catagory: nodeValue,
            profession: profession,
          };
          break;
      }

      serverData4BIM.getFileterData(tableName, option).then((result) => {
        if (!result.success) return;
        var data = result.content;
        _this.tableData = data;
      });
      _this.chartVisible = true;
    },
    onClick(id) {
      this.$emit("Acept");
      var condition = "${name} === '" + id + "'";
      orientate(id, tileset);
      if (this.currentNode.dataRef.category == "FamilyType" && this.activeTabKey == "1") {
        var levelValue = this.currentNode.$parent.$parent.$parent.dataRef.value;
        var con = `\${level} === '${levelValue}' && \${profession} ==='${this.profess}'`;
        styleCondition.resetVisible(false);
        styleCondition.addShowCondition(con);

        styleCondition.resetColorStyle("#FFFFFF", 0.3);
        styleCondition.addColorStyle(condition, "TOMATO");
      } else if ((this.currentNode.dataRef.category == "FamilyType" && this.activeTabKey == "3")|| this.currentNode.dataRef.category == "FamilyName" ) {
        serverData4BIM.getProperty(config.tableName, id).then((result) => {
          if (!result.success) return;
          var data = result.content;
          var levelValue = data[0].level;
          var con = `\${level} === '${levelValue}' && \${profession} ==='${this.profess}'`;
          styleCondition.resetVisible(false);
          styleCondition.addShowCondition(con);

          styleCondition.resetColorStyle("#FFFFFF", 0.3);
          styleCondition.addColorStyle(condition, "TOMATO");
        });
      }
    },
    onCancel() {
      this.chartVisible = false;
    },
  },
};
</script>
<style scoped>
.popup-box {
  width: 400px;
}
.switch-box {
  position: relative;
  top: -40px;
  left: 5px;
  width: 100px;
}
.switch {
  left: 5px;
}
</style>
