<template>
  <div>
    <div
      class="tree-box vscroll"
      style="
        position: relative;
        left: 10px;
        top: 10px;
        height: 720px;
        overflow-y: scroll;
        overflow-x: scroll;
      "
    >
      <a-tree
        v-if="treeData.length"
        class="draggable-tree"
        draggable
        :checkable="checkable"
        v-model="checkedKeys"
        @select="handleSelected"
        @expand="onExpand"
        :expandedKeys="expandedKeys"
        :treeData="treeData"
      >
        <template slot="title" slot-scope="item">
          <span class="txt-ellipsis" :key="item.id" v-html="item.name"></span>
        </template>
      </a-tree>
    </div>
    <Check-panel
      :visible="checkVisible"
      @closeRoomCheck="closeRoomCheck"
      ref="child"
    ></Check-panel>
  </div>
</template>
<script>
import Check from "./check";
import axiosWraper from "@/views/js/net/axiosWraper";
import StyleCondition from "@/sdk/renderer/styleCondition";
import serverData4BIM from "@/views/js/net/serverData4BIM";
import component from "./js/component";
let layerText = "GD综合大楼";
let tileset = null;
let styleCondition = null;

export default {
  components: {
    "Check-panel": Check,
  },
  data() {
    return {
      //tree数据
      treeData: [],
      //是否显示多选框
      checkable: false,
      //选择的树节点key
      checkedKeys: ["0-0"],
      //展开的key
      expandedKeys: ["0-0"],
      //净高/进深核对面板
      checkVisible: false,
      //当前选择的树节点
      curSelectNode: null,
    };
  },
  mounted() {
    tileset = this.getTilesetByLayerText(layerText);
    if (tileset == null) {
      this.$message.error("GD综合大楼图层未打开！");
      return;
    }
    styleCondition = new StyleCondition(tileset);
    this.creatRoomTree();
  },
  methods: {
    showComponet(keys, node, isMark = false) {
      if (!node) node = this.curSelectNode;
      var category = node.dataRef.category;
      var option = this.getCondition(node);
      var levelValue = option.level;
      var condition = option.cond;
      if (category == "Room") {
        var con = `\${level} === '${levelValue}'`;
        styleCondition.resetColorStyle("#FFFFFF", 0.3);
        styleCondition.resetVisible(false);
        styleCondition.addShowCondition(con);
        component.flyTo(node.dataRef.value, tileset, "Room", isMark);
        return;
      }
    },
    getCondition(node) {
      var category = node.dataRef.category;
      var nodeValue = node.dataRef.name;
      var condition = null;
      var levelValue = null;

      if (category == "Room") {
        levelValue = node.$parent.dataRef.value;
        condition = `\${level} === '${levelValue}'`;
      }

      return { level: levelValue, cond: condition };
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
    },
    //点击文字触发
    handleSelected(keys, info) {
      this.curSelectNode = info.node;
      let itemKey = info.node.eventKey;
      if (itemKey.length == 7) {
        this.closeRoomCheck();
        this.$refs.child.clear();
        this.checkVisible = true;
        return;
      }
      if (this.expandedKeys.length > 0) {
        if (this.expandedKeys.includes(itemKey)) {
          this.expandedKeys.splice(this.expandedKeys.indexOf(itemKey), 1);
        } else {
          this.expandedKeys = [...this.expandedKeys, itemKey];
        }
      } else {
        this.expandedKeys = [itemKey];
      }
    },
    treeNode(name, category, value, isLeaf = false) {
      var item = {
        name: name,
        category: category,
        value: value,
        id: this.index,
        children: [],
        scopedSlots: { title: "title" },
        isLeaf: isLeaf,
      };
      return item;
    },
    closeRoomCheck() {
      this.checkVisible = false;
      this.flyTo(tileset);
      component.clear();
      styleCondition.resetColorStyle();
      styleCondition.resetVisible(true);
    },
    creatRoomTree() {
      var _this = this;
      serverData4BIM
        .getFileterData('agcim3dentity_a', {
          filterKey: "level,name,objectid",
          infotype: "RoomInfo",
          profession: " ",
        })
        .then((result) => {
          if (!result.success) return;
          var data = result.content;

          var proNode = _this.treeNode("GD综合大楼", "Root", null);
          for (let j = 0; j < data.length; j++) {
            var levelNode = proNode.children.find(
              (a) => a.name == data[j].level
            );

            if (!levelNode) {
              var levelValue = data[j].level;
              levelNode = _this.treeNode(data[j].level, "Level", levelValue);
              proNode.children.push(levelNode);
            }

            var catagoryNode = levelNode.children.find(
              (a) => a.name == data[j].name
            );
            if (!catagoryNode) {
              catagoryNode = _this.treeNode(
                data[j].name,
                "Room",
                data[j].objectid,
                true
              );

              levelNode.children.push(catagoryNode);
            }
          }
          _this.treeData.push(proNode);
        });
    },
    getTilesetByLayerText(text) {
      var layerId = CIM.layerTree.getLayerByText(text).id;
      var layer = CIM.layerTree.getLayerById(layerId);
      if (layer) {
        return layer._primitives[0];
      }
      return null;
    },
    flyTo() {
      CIM.viewer.camera.flyTo({
        destination: new Cesium.Cartesian3(
          -2325145.958132308,
          5389665.282541676,
          2487154.575760661
        ),
        orientation: {
          heading: 6.213756823636766,
          roll: 6.283010704128504,
          pitch: -0.27810372485321366,
        },
      });
    },
  },
  destroyed() {
    this.flyTo(tileset);
    component.clear();
    styleCondition.resetColorStyle();
    styleCondition.resetVisible(true);
  },
};
</script>
<style scoped></style>
