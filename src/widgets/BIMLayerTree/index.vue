<template>
  <div class="mainBox" ref="mtreeBox">
    <p class="pblock">
      当前模型 ：
      <b>{{ config.tilename }}</b>
      <a-button class="button" @click="chooseTile">选择</a-button>
    </p>
    <a-divider />
    <a-tabs
      :activeKey="config.activeTabKey"
      tabPosition="top"
      size="small"
      @change="changeTab"
      class="tabs"
    >
      <a-tab-pane key="1" tab="构件"></a-tab-pane>
      <a-tab-pane key="2" tab="空间"></a-tab-pane>
      <a-tab-pane key="3" tab="结构"></a-tab-pane>
    </a-tabs>
    <div class="tabplock" v-show="isProShow">
      <a-radio-group
        :options="plainOptions"
        :default-value="config.selectValue"
        @change="onChange"
      ></a-radio-group>
      <a-divider type="horizontal" />
    </div>
    <div class="tree-box">
      <a-tree
        v-if="treeData.length"
        class="draggable-tree"
        draggable
        :checkable="checkable"
        v-model="checkedKeys"
        @expand="onExpand"
        :expandedKeys="expandedKeys"
        :treeData="treeData"
        :autoExpandParent="autoExpandParent"
        @rightClick="openTreeContextMenu"
        @dblclick="showComponet"
        :load-data="onLoadData"
      >
        <template slot="title" slot-scope="item">
          <span class="txt-ellipsis" :key="item.id" v-html="item.name"></span>
        </template>
      </a-tree>
    </div>

    <div
      class="rt-menu-box"
      ref="rtMenuBox"
      v-show="isRtMenuShow"
      @mouseleave="hideTreeContextMenu"
      style="z-index: 90"
    >
      <ul>
        <li
          v-for="item in rtMenuObj"
          :key="item.key"
          @click="handleMemuEvent(item.key)"
        >
          <span v-show="item.state" :id="item.key">{{ item.name }}</span>
        </li>
      </ul>
    </div>
    <statics-panel ref="mychild" v-show="staticsVisible"></statics-panel>
    <list-panel
      ref="list"
      comOpcity.sync="opacity"
      @Acept="accept"
      v-show="listVisible"
    ></list-panel>
    <Check-panel
      :visible="checkVisible"
      @closeRoomCheck="closeRoomCheck"
      ref="child"
    ></Check-panel>
    <!-- 透明度 -->
    <a-popover title="模型透明度" trigger="click" v-model="opacityVisible">
      <template slot="content">
        <a-slider
          :min="0"
          :max="1"
          :step="0.01"
          v-model="opacity"
          @change="changeOpacity"
        />
      </template>
      <span ref="opacityPoa" style="position: absolute"></span>
    </a-popover>
  </div>
</template>

<script>
import agDomNode from "@/sdk/ui/domNode";
import StyleCondition from "@/sdk/renderer/styleCondition";
import revitHelper from "@/sdk/bim/revitHelper";
import PickerHelper from "@/sdk/interactive/pickerHelper";

import { ColorPicker } from "@/views/js/extension/colorPicker";
import serverData4BIM from "@/views/js/net/serverData4BIM";

import statics from "./componet/statics";
import List from "./componet/list";
import Check from "./componet/check";
import config from "./js/config";
import { orientate, getCondition, getStyleCondition } from "./js/index";

//所有的tileset
let tileset = null;
let pickerHelper = null;
let styleCondition = null;
let tableName = null;
export default {
  name: "AgBIM",
  data() {
    return {
      //配置
      config,
      //专业模块是否显示
      isProShow: true,
      //折叠面板展示的key
      activeKey: ["1", "2", "3"],
      //选择的树节点key
      checkedKeys: ["0-0"],
      //展开的key
      expandedKeys: ["0-0"],
      //是否自动展开父节点
      autoExpandParent: true,
      //tree数据
      treeData: [],
      //所有选择的key
      allCheckedKeys: {},
      //是否显示多选框
      checkable: true,
      //所有数据
      allTreeData: {},
      //右键菜单是否显示
      isRtMenuShow: false,
      //当前选择的树节点
      curSelectNode: null,
      //颜色选择器
      colorPicker: null,
      //统计面板可见
      staticsVisible: false,
      //构件列表面板可见
      listVisible: false,
      //净高/进深核对面板
      checkVisible: false,
      //专业
      plainOptions: null,
      //楼层
      levels: null,
      //透明度
      opacity: 1,
      //透明度面板的显示
      opacityVisible: false,
      //右键菜单
      rtMenuObj: [
        { index: "0", name: "构件", key: "getFamilyInsane", state: false },
        { index: "1", name: "统计", key: "staticsComponent", state: true },
        { index: "2", name: "定位", key: "showComponet", state: true },
        { index: "2", name: "隔离", key: "showOne", state: true },
        { index: "4", name: "显示所有", key: "showAll", state: true },
        { index: "5", name: "清除选择", key: "clearSelect", state: true },
        { index: "6", name: "颜色设置", key: "colorPick", state: true },
        { index: "7", name: "透明度调整", key: "setOpacity", state: true },
        {
          index: "8",
          name: "净高/进深核对",
          key: "roomCheckPanel",
          state: false,
        },
      ],
    };
  },
  components: {
    "statics-panel": statics,
    "list-panel": List,
    "Check-panel": Check,
  },
  mounted() {},
  methods: {
    chooseTile() {
      var _this = this;
      var viewer = CIM.viewer;

      pickerHelper = new PickerHelper(viewer);
      pickerHelper.on("LEFT_CLICK", function (movement) {
        let o = movement.position;
        var pick = viewer.scene.pick(o);
        if (pick && pick.tileset) {
          tileset = pick.tileset;
          styleCondition = new StyleCondition(tileset);
          config.tilename = tileset.agMetaData.nameCn;
          pickerHelper.off();
        }
        serverData4BIM.getTableName(tileset.agMetaData.id).then((ref) => {
          if (!ref.success) return null;
          if (ref.content === null || ref.content == "") {
            _this.$message.info("该模型还没有入库");
          } else {
            tableName = ref.content.entitytable;
            _this.creatTree();

            var option = {
              filterKey: "name,objectid",
              infotype: "LevelInfo",
              profession: " ",
            };

            serverData4BIM
              .getFileterData(tableName, option)
              .then((result) => {
                if (!result.success) return;
                var data = result.content;
                _this.levels = data;
              });
          }
        });
      });
    },
    accept() {
      this.opacity = 0.3;
    },
    hideTreeContextMenu: function (e) {
      this.isRtMenuShow = false;
    },
    //打开右键菜单
    openTreeContextMenu(e) {
      this.curSelectNode = e.node;
      if (config.activeTabKey == "1") {
        this.rtMenuObj = this.rtMenuObj.map((item) => {
          item.state = true;
          return item;
        });

        if (e.node.dataRef.category == "FamilyType") {
          this.rtMenuObj[0].state = true;
          this.rtMenuObj[1].state = false;
        } else {
          this.rtMenuObj[1].state = true;
          this.rtMenuObj[0].state = false;
        }
      }
      if (config.activeTabKey == "2") {
        this.rtMenuObj = this.rtMenuObj.map((item) => {
          item.state = false;
          return item;
        });
      }
      if (config.activeTabKey == "3") {
        this.rtMenuObj = this.rtMenuObj.map((item) => {
          item.state = false;
          return item;
        });
        if (e.node.dataRef.category == "Catagory") {
          this.rtMenuObj[0].state = true;
          this.rtMenuObj[1].state = true;
        } else if (e.node.dataRef.category == "FamilyName") {
          this.rtMenuObj[0].state = true;
          this.rtMenuObj[1].state = true;
        } else if (e.node.dataRef.category == "FamilyType") {
          this.rtMenuObj[0].state = true;
        }
      } else {
        this.rtMenuObj = this.rtMenuObj.map((item) => {
          item.state = true;
          return item;
        });
      }

      if (e.node.dataRef.category == "Root") {
        this.rtMenuObj[7].state = true;
        this.rtMenuObj[4].state = true;
      } else this.rtMenuObj[7].state = false;

      if (e.node.dataRef.category == "Room") {
        this.rtMenuObj[8].state = true;
      } else this.rtMenuObj[8].state = false;

      this.getMenuPosition(e);
      this.colorPick();
    },
    //确定菜单位置
    getMenuPosition: function (e) {
      const hl = agDomNode.getDomTopLeft(this.$refs.mtreeBox);
      this.isRtMenuShow = true;
      let event = e.event;
      let h =
        document.documentElement.clientHeight || document.body.clientHeight;
      let l = event.clientX - hl.left > 240 ? 240 : event.clientX - hl.left;

      let t =
        h - event.clientY - hl.top < 200
          ? event.clientY - hl.top - 150
          : event.clientY - hl.top;
      this.$refs.rtMenuBox.style.left = l + "px";
      this.$refs.rtMenuBox.style.top = t + "px";

      //透明度显示位置
      this.$refs.opacityPoa.style.left = event.clientX - hl.left + "px";
      this.$refs.opacityPoa.style.top = event.clientY - hl.top + "px";
    },
    handleMemuEvent(key) {
      this.isRtMenuShow = false;
      this[key]();
    },
    setOpacity() {
      this.opacityVisible = true;
    },
    changeOpacity(opacity) {
      styleCondition.setOpacity(opacity);
    },
    //创建颜色选择器
    colorPick() {
      let _this = this;
      if (!this.colorPicker) {
        this.colorPicker = new ColorPicker({
          el: "colorPick",
          offset: 180,
          change: function (elem, hex) {
            _this.color = hex;
            var e = _this.curSelectNode;
            _this.setColor(hex, _this.curSelectNode);
          },
        });
      }
    },
    //设置颜色
    setColor(color, node) {
      var nodeInfo = node.dataRef;

      if (nodeInfo.category == "Root") {
        styleCondition.resetColorStyle(color, this.opacity);
      } else {
        var dbIDs = getCondition(node).cond;
        styleCondition.addColorStyle(dbIDs, color);
        styleCondition.setOpacity(this.opacity);
      }
    },
    treeNode(name, category, value, isLeaf = false) {
      var item = {
        name: name,
        category: category,
        value: value,
        children: [],
        scopedSlots: { title: "title" },
        isLeaf: isLeaf,
      };
      return item;
    },
    async creatTree() {
      let _this = this;

      var professional = await this.getProfession();
      this.plainOptions = [];
      for (let i = 0; i < professional.length; i++) {
        this.plainOptions.push({
          label: professional[i],
          value: professional[i],
        });

        serverData4BIM
          .getFileterData(tableName, {
            filterKey: "level,catagory",
            profession: professional[i],
          })
          .then((result) => {
            if (!result.success) return;
            var data = result.content;
            _this.getTreeData(data, professional[i]);
          });
      }
    },
    //获取构件数据
    getTreeData(data, professional) {
      var proNode = this.treeNode(config.tilename, "Root", null);
      for (let j = 0; j < data.length; j++) {
        var levelNode = proNode.children.find((a) => a.name == data[j].level);

        if (!levelNode) {
          var levelValue = data[j].level;
          levelNode = this.treeNode(data[j].level, "Level", levelValue);
          this.sortFloor(proNode, levelNode, levelValue);
        }

        var catagoryNode = levelNode.children.find(
          (a) => a.name == data[j].catagory
        );
        if (!catagoryNode) {
          catagoryNode = this.treeNode(
            data[j].catagory,
            "Category",
            data[j].catagory
          );
          levelNode.children.push(catagoryNode);
        }
      }
      this.allTreeData[professional] = proNode;
      this.allCheckedKeys[professional] = ["0-0"];
      if (professional == "建筑") {
        this.treeData.push(this.allTreeData[config.selectValue]);

        styleCondition.resetVisible(false);
        styleCondition.addShowCondition(
          "${profession} ==='" + config.selectValue + "'"
        );
      }
    },
    //楼层排序
    sortFloor(proNode, levelNode, levelValue) {
      var num = parseInt(levelValue);
      if (levelValue == "RF") num = 23;
      if (proNode.children.length > 0) {
        for (let k = 0; k < proNode.children.length; k++) {
          var lastlevel = parseInt(proNode.children[k].name);

          if (proNode.children[k].name == "RF") lastlevel = 23;
          if (num < lastlevel) {
            var lastNode = proNode.children.splice(k, proNode.children.length);
            proNode.children.push(levelNode);
            proNode.children = proNode.children.concat(lastNode);
            break;
          } else if (num > lastlevel && k == proNode.children.length - 1) {
            proNode.children.push(levelNode);
            break;
          }
        }
      } else proNode.children.push(levelNode);
    },
    creatRoomTree() {
      var _this = this;
      serverData4BIM
        .getFileterData(tableName, {
          filterKey: "level,name,objectid",
          infotype: "RoomInfo",
          profession: " ",
        })
        .then((result) => {
          if (!result.success) return;
          var data = result.content;
          _this.getRoomTreeData(data);
        });
    },
    //获取房间数据
    getRoomTreeData(data) {
      var proNode = this.treeNode(config.tilename, "Root", null);
      for (let j = 0; j < data.length; j++) {
        var levelNode = proNode.children.find((a) => a.name == data[j].level);

        if (!levelNode) {
          var levelValue = data[j].level;
          levelNode = this.treeNode(data[j].level, "Level", levelValue);
          proNode.children.push(levelNode);
        }

        var catagoryNode = levelNode.children.find(
          (a) => a.name == data[j].name
        );
        if (!catagoryNode) {
          catagoryNode = this.treeNode(
            data[j].name,
            "Room",
            data[j].objectid,
            true
          );
          levelNode.children.push(catagoryNode);
        }
      }
      this.treeData.push(proNode);
    },
    creatCatagoryTree() {
      var _this = this;
      serverData4BIM
        .getFileterData(tableName, {
          filterKey: "objectid,name,catagory",
          profession: " ",
        })
        .then((result) => {
          if (!result.success) return;
          var data = result.content;
          data = data.filter((a) => a.catagory && a.catagory.trim());
          _this.getCatagoryTreeData(data);
        });
    },
    getCatagoryTreeData(data) {
      var proNode = this.treeNode(config.tilename, "Root", null);
      for (let j = 0; j < data.length; j++) {
        var catagoryNode = proNode.children.find(
          (a) => a.name == data[j].catagory
        );

        if (!catagoryNode) {
          var catagoryValue = data[j].catagory;
          catagoryNode = this.treeNode(
            data[j].catagory,
            "Catagory",
            catagoryValue
          );
          proNode.children.push(catagoryNode);
        }

        // var nameNode = catagoryNode.children.find(
        //   (a) => a.name == data[j].name
        // );
        // if (!nameNode) {
        //   nameNode = this.treeNode(
        //     data[j].name,
        //     "Component",
        //     data[j].objectid,
        //     true
        //   );
        //   catagoryNode.children.push(nameNode);
        // }
      }
      this.treeData.push(proNode);
    },
    //获取模型的所有专业
    async getProfession() {
      var result = await serverData4BIM.getFileterData(tableName, {
        filterKey: "profession",
        infotype: "ElementInfo",
        profession: "",
      });

      if (!result.success) return;
      var data = result.content;
      var professions = [];
      for (let i = 0; i < data.length; i++) {
        professions.push(data[i].profession);
      }
      return professions;
    },
    //切换构件/房间
    changeTab(key) {
      config.activeTabKey = key;
      this.treeData = [];

      if (tileset == null) return;
      revitHelper.removeMark();
      if (key == 1) {
        this.isProShow = true;
        this.checkable = true;
        this.checkedKeys = ["0-0"];
        this.treeData.push(this.allTreeData[config.selectValue]);

        styleCondition.resetVisible(false);
        styleCondition.addShowCondition(
          "${profession} ==='" + config.selectValue + "'"
        );
      }
      if (key == 2) {
        this.isProShow = false;
        this.checkable = false;
        this.creatRoomTree();
        styleCondition.resetVisible(true);
      }
      if (key == 3) {
        this.isProShow = false;
        this.checkable = true;
        this.creatCatagoryTree();
        styleCondition.resetVisible(true);
      }
    },

    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    //切换专业
    onChange(e) {
      this.treeData = [];
      config.selectValue = e.target.value;
      this.checkedKeys = this.allCheckedKeys[e.target.value];
      this.treeData.push(this.allTreeData[e.target.value]);

      styleCondition.resetVisible(false);
      styleCondition.addShowCondition(
        "${profession} ==='" + config.selectValue + "'"
      );
    },
    //定位
    showComponet(keys, node, isCheck = false) {
      if (!node) node = this.curSelectNode;
      var category = node.dataRef.category;

      this.opacity = 0.3;
      if (category == "Root") {
        var camera = CIM.viewer.scene.camera;
        var offset = new Cesium.HeadingPitchRange(
          camera.heading,
          camera.pitch,
          tileset.boundingSphere.radius
        );
        camera.flyToBoundingSphere(tileset.boundingSphere, { offset: offset });
        styleCondition.resetColorStyle("#FFFFFF", this.opacity);
      } else {
        styleCondition.resetVisible(false);
        styleCondition.resetColorStyle("WHITE", this.opacity);
        var option = getCondition(node);
        var levelValue = option.level;
        var condition = option.cond;

        if (category == "Room") {
          var con = `\${level} === '${levelValue}'`;
          styleCondition.addShowCondition(con);
          orientate(node.dataRef.value, tileset, "Room", isCheck);
          return;
        }

        if (category != "Level") {
          var con = `\${level} === '${levelValue}' && \${profession} ==='${config.selectValue}'`;
          styleCondition.addShowCondition(con);
        } else {
          if (config.activeTabKey == "1")
            styleCondition.addShowCondition(
              "${profession} ==='" + config.selectValue + "'"
            );
          else styleCondition.resetVisible(true);
        }

        var levelID = this.levels.find((a) => a.name == levelValue).objectid;
        orientate(levelID, tileset, "Level");

        styleCondition.addColorStyle(condition, "TOMATO");
      }
    },
    //显示所有
    showAll() {
      this.checkedKeys = ["0-0"];
      styleCondition.resetVisible(false);
      styleCondition.addShowCondition(
        "${profession} ==='" + config.selectValue + "'"
      );

      this.opacity = 1;
      styleCondition.resetColorStyle();
    },
    //隔离
    showOne() {
      var node = this.curSelectNode;
      var category = node.dataRef.category;
      var nodeValue = node.dataRef.name;

      var option = getCondition(node);
      var condition = option.cond;
      styleCondition.resetVisible(false);
      styleCondition.addShowCondition(condition);
    },
    //清楚选择
    clearSelect() {
      this.opacity = 1;
      styleCondition.resetColorStyle();
    },
    //统计
    staticsComponent() {
      this.staticsVisible = true;
      this.listVisible = false;
      this.$refs.mychild.open(
        this.curSelectNode,
        config.activeTabKey,
        config.selectValue,
        tableName
      );
    },
    //净高、进深核对
    roomCheckPanel(e) {
      // this.showComponet(null, null, true);
      this.$refs.child.clear();
      this.checkVisible = true;
    },
    closeRoomCheck() {
      this.checkVisible = false;
    },
    //构件
    getFamilyInsane() {
      var tiles = tileset;
      this.staticsVisible = false;
      this.listVisible = true;
      this.$refs.list.open(
        this.curSelectNode,
        config.activeTabKey,
        tiles,
        config.selectValue,
        tableName
      );
    },
    //异步数据加载
    onLoadData(treeNode) {
      if (config.activeTabKey == "1") {
        return new Promise((resolve) => {
          if (treeNode.dataRef.children.length > 0) {
            resolve();
            return;
          }
          var _this = this;
          var option = {};
          var parentValue = treeNode.$parent.dataRef.name;
          var nodeValue = treeNode.dataRef.name;

          if (treeNode.dataRef.category == "Category") {
            option = {
              profession: config.selectValue,
              filterKey: "familyname",
              level: parentValue,
              catagory: nodeValue,
            };
          } else if (treeNode.dataRef.category == "FamilyName") {
            var levelValue = treeNode.$parent.$parent.dataRef.name;
            option = {
              profession: config.selectValue,
              filterKey: "familytype",
              level: levelValue,
              catagory: parentValue,
              familyname: nodeValue,
            };
          }

          serverData4BIM
            .getFileterData(tableName, option)
            .then((result) => {
              if (!result.success) return;
              var data = result.content;

              var childrens = [];
              for (let j = 0; j < data.length; j++) {
                var childNode = null;
                if (treeNode.dataRef.category == "Category") {
                  childNode = _this.treeNode(
                    data[j].familyname,
                    "FamilyName",
                    ""
                  );
                } else if (treeNode.dataRef.category == "FamilyName") {
                  childNode = _this.treeNode(
                    data[j].familytype,
                    "FamilyType",
                    "",
                    true
                  );
                }
                childrens.push(childNode);
              }
              treeNode.dataRef.children = childrens;
              this.treeData = [...this.treeData];
              resolve();
            });
        });
      }

      if (config.activeTabKey == "2") {
        return;
      }

      if (config.activeTabKey == "3") {
        return new Promise((resolve) => {
          if (treeNode.dataRef.children.length > 0) {
            resolve();
            return;
          }
          var _this = this;
          var option = {};
          var nodeValue = treeNode.dataRef.name;
          if (treeNode.dataRef.category == "Catagory") {
            option = {
              profession: config.selectValue,
              filterKey: "familyname",
              catagory: nodeValue,
            };
          } else if (treeNode.dataRef.category == "FamilyName") {
            option = {
              profession: config.selectValue,
              filterKey: "familytype",
              familyname: nodeValue,
            };
          }

          serverData4BIM
            .getFileterData(tableName, option)
            .then((result) => {
              if (!result.success) return;
              var data = result.content;

              var childrens = [];
              for (let j = 0; j < data.length; j++) {
                var childNode = null;
                if (treeNode.dataRef.category == "Catagory") {
                  childNode = _this.treeNode(
                    data[j].familyname,
                    "FamilyName",
                    ""
                  );
                } else if (treeNode.dataRef.category == "FamilyName") {
                  childNode = _this.treeNode(
                    data[j].familytype,
                    "FamilyType",
                    "",
                    true
                  );
                }
                childrens.push(childNode);
              }
              treeNode.dataRef.children = childrens;
              this.treeData = [...this.treeData];
              resolve();
            });
        });
      }
    },
  },
  watch: {
    checkedKeys: function (val) {
      var tileName = config.selectValue;
      this.allCheckedKeys[tileName] = val;
      var procond = "${profession} ==='" + config.selectValue + "'";
      if (val.indexOf("0-0") >= 0) {
        styleCondition.resetVisible(false);
        styleCondition.addShowCondition(procond);
      } else {
        var conditions = getStyleCondition(val, this.treeData);
        styleCondition.setShowStyle(conditions);
      }
    },
  },
  destroyed: function () {},
};
</script>
<style scoped src="./css/index.css">
