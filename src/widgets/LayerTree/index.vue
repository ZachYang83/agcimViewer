<template>
  <div class="mtree-box" ref="mtreeBox" @contextmenu.prevent>
    <div class="top-box">
      <section>
        <!-- 全部折叠 -->
        <a-tooltip v-if="config.foldAll" placement="top">
          <template slot="title">
            <span>全部折叠</span>
          </template>
          <div class="icon-box" @click="onFold('foldAll')">
            <a-icon type="down" />
          </div>
        </a-tooltip>
        <!-- 全部展开 -->
        <a-tooltip v-if="config.unfoldAll" placement="top">
          <template slot="title">
            <span>全部展开</span>
          </template>
          <div class="icon-box" @click="onFold('unfoldAll')">
            <a-icon type="up" />
          </div>
        </a-tooltip>
        <!-- 展开选中 -->
        <a-tooltip v-if="config.foldCheck" placement="top">
          <template slot="title">
            <span>展开选中</span>
          </template>
          <div class="icon-box" @click="onFold('foldCheck')">
            <a-icon type="eye" />
          </div>
        </a-tooltip>
        <!-- 专题 -->
        <a-dropdown v-if="config.project">
          <a-menu slot="overlay" @click="handleProject">
            <a-menu-item v-for="item in projectArr" :key="item.name">
              <p>
                {{ item.name }}
                <a-icon type="check" v-show="item.name === projectName" />
              </p>
            </a-menu-item>
          </a-menu>
          <div class="icon-box" size="small">
            <a-icon type="unordered-list" />
          </div>
        </a-dropdown>
      </section>
      <!-- 级别 -->
      <a-select v-if="config.level" defaultValue="1" class="grade" @change="setGradebySelect">
        <a-select-option value="1">L1</a-select-option>
        <a-select-option value="2">L2</a-select-option>
        <a-select-option value="3">L3</a-select-option>
        <a-select-option value="4">L4</a-select-option>
      </a-select>
      <!-- 搜索 -->
      <a-input-search v-if="config.search" v-model="keyWord" class="search-box" placeholder="输入关键字" @search="searchTree" />
      <!-- 标签快捷搜索定位 -->
      <tag-nav v-if="config.tag" @searchTree="searchTree"></tag-nav>
    </div>
    <!-- 树 -->
    <div class="tree-box vscroll" id="treeOva">
      <a-tree v-if="treeData.length" class="draggable-tree" draggable v-model="checkedKeys" @expand="onExpand" :expandedKeys="expandedKeys" @select="handleSelected" :treeData="treeData" :autoExpandParent="autoExpandParent" @rightClick="openTreeContextMenu" checkable @check="onCheck">
        <a-icon type="down" slot="switcherIcon" />
        <template slot="title" slot-scope="item">
          <span class="index">{{ item.index }}</span>
          <span :title="item.title" class="txt-ellipsis" :key="item.key" v-html="
              item.title.replace(
                new RegExp(keyWord, 'g'),
                '<span style=color:#f50>' + keyWord + '</span>'
              )
            "></span>
          <a-icon v-if="!item.children && item.layerType!='130010'" type="environment" class="environment" v-bind:class="{ active: item.checked }" @click.stop="onCheckLocation(item)" />
        </template>
      </a-tree>
    </div>
    <!-- 右键菜单 -->
    <div class="rt-menu-box" ref="rtMenuBox" v-show="isRtMenuShow" @mouseleave="hideTreeContextMenu">
      <ul v-show="rtMenuObj.hasChild">
        <li @click="isExpandSelect(true)">
          <span>全部展开</span>
        </li>
        <li @click="isExpandSelect(false)">
          <span>全部折叠</span>
        </li>
      </ul>
      <ul v-show="!rtMenuObj.hasChild">
        <li v-for="item in rtMenuObj.list" :key="item.key" @click="handleMemuEvent(item.key)">
          <span v-show="item.state">{{ item.name }}</span>
        </li>
      </ul>
    </div>
    <!-- 透明度 -->
    <a-popover :title="curSelectNode.title" trigger="click" v-model="opacityVisible">
      <template slot="content">
        <a-slider :min="0" :max="1" :step="0.01" v-model="opacity" @change="changeOpacity" />
      </template>
      <span ref="opacityPoa" style="position: absolute"></span>
    </a-popover>

    <!-- 版本切换 -->
    <a-popover :title="curSelectNode.title" trigger="click" v-model="versionVisible">
      <template slot="content">
        <a-radio-group name="radioGroup" :default-value="verArr[0]" @change="changeVersion">
          <a-radio v-for="item in verArr" :key="item" :value="item">{{
            item
          }}</a-radio>
        </a-radio-group>
      </template>
      <span ref="versionPoa" style="position: absolute"></span>
    </a-popover>

  </div>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import axios from "@/views/js/net/http";
import qs from "qs";
// import agDomNode from "@/sdk/ui/domNode";
// import agSwitchLayer from "@/sdk/layer/switchLayer";
import net from "@/views/js/net/serverData4Config";
import {
  restructTreeData,
  getMenuKeys,
  getParentKey,
  getAllParentKey,
  getMenuKeysByLevel,
} from "./js/index";
import TagNav from "./TagNav.vue";
import config from "./js/config";
export default {
  name: "LayerTree",
  components: {
    "tag-nav": TagNav,
  },
  data() {
    return {
      config,
      //专题
      projectArr: [],
      //专题名
      projectName: "",
      //树
      treeData: [],
      //展开的key
      expandedKeys: [],
      //被选中的====
      checkedKeys: [],
      prevCheckedKeys: [],
      //树所有key
      treeAllKey: [],
      //是否自动展开父节点
      autoExpandParent: true,
      //右键菜单是否显示
      isRtMenuShow: false,
      //右键菜单
      rtMenuObj: {
        hasChild: false,
        list: [
          { index: "0", name: "透明度调整", key: "setOpacity", state: false },
          {
            index: "1",
            name: "缩放至图层",
            key: "zoomToLayerById",
            state: false,
          },
          { index: "2", name: "图层样式", key: "setLayerStyle", state: false },
          { index: "3", name: "版本切换", key: "setVersion", state: false },
          { index: "4", name: "清单", key: "getMdInfo", state: false },
          { index: "5", name: "图层信息", key: "getLayerInfo", state: false },
        ],
      },
      //右键当前选中的
      curSelectNode: {},
      //搜索
      keyWord: "",
      //放图层列表
      layerArr: [],
      opacityVisible: false,
      opacity: 1,
      versionVisible: false,
      panelVisible: false,
      //版本切换
      verArr: [],
    };
  },
  created() {
    this.getProjectInfo();
  },
  mounted() {
    this.$nextTick(() => {
      let o = document.getElementById("treeOva");
      o.style.maxHeight = document.body.clientHeight - 400 + "px";
    });
  },
  methods: {
    handleProject({ key }) {
      this.projectName = key;
      var res = this.buildLayerTree();
      CIM_LAYERTREE_NAME = key;
      axiosWraper.getConfigProxyUrl(key);
      res
        .then(function(data) {
          CIM.layerTree.loadInitializeLayers(CIM.viewer, data);
        })
        .catch(function(error) {
          return;
        });
      
    },
    async getProjectInfo() {
      let res = await axios.get(
        `/agsupport-rest/agsupport/project/getProjectInfo/${this.$store.state.user.userId}`
      );
      if (res.success) {
        this.projectArr = res.content;
        this.projectName = this.projectArr[0].name;
        this.buildLayerTree();
      }
    },
    /**创建图层树 */
    async buildLayerTree() {
      let vm = this;
      let p = {
        projectName: this.projectName,
        userId: this.$store.state.user.userId,
      };
      let res = await net.getLayerTreeData(p);
      var arr = res.content[0].children;
      vm.treeData = restructTreeData(arr, "", []).data;
      vm.checkedKeys = restructTreeData(arr, "", []).checkedData;
      this.prevCheckedKeys = vm.checkedKeys.slice(0);
      // vm.expandChecks();
      // let switchLayer = new agSwitchLayer();
      // switchLayer.addListener(CIM.viewer);
      return res;
    },
    //展开默认勾选的
    expandChecks() {
      let vm = this;
      vm.expandedKeys = [];
      vm.checkedKeys.forEach((element) => {
        const arr_temp = getAllParentKey(element, vm.treeData, []);
        vm.expandedKeys = [...vm.expandedKeys, ...arr_temp];
      });
      vm.expandedKeys = Array.from(new Set(vm.expandedKeys));
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    //点击文字触发
    handleSelected(keys, info) {
      this.autoExpandParent = false;
      let itemKey = info.node.eventKey;
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
    //展开折叠
    onFold(type) {
      switch (type) {
        case "unfoldAll":
          let allkey = getMenuKeys(this.treeData, []);
          this.expandedKeys = allkey;
          break;
        case "foldAll":
          this.expandedKeys = [];
          break;
        case "foldCheck":
          this.expandChecks();
          break;
        default:
      }
    },
    //隐藏右键的菜单
    hideTreeContextMenu: function (e) {
      this.isRtMenuShow = false;
    },
    //右键
    openTreeContextMenu(e) {
      this.curSelectNode = e.node.dataRef;
      //在这里根据layerType等任意属性，加不同菜单
      //影像图层
      if (
        this.curSelectNode.layerType === "050002" ||
        this.curSelectNode.layerType === "050003"
      ) {
        this.setRMenuList([1, 5]);
      }
      //地形图层
      if (this.curSelectNode.layerType === "130010") {
        this.setRMenuList([-1]);
      }
      //3d tiles
      if (this.curSelectNode.layerType === "120010") {
        this.setRMenuList([0, 1, 2, 3, 5]);
      }
      //wfs
      if (this.curSelectNode.layerType === "040003") {
        //3d点
        if ("3D" === this.curSelectNode.featureType) {
          this.setRMenuList([0, 1, 2, 4, 5]);
        } else {
          this.setRMenuList([0, 1, 2, 5]);
        }
      }
      //版本切换
      if (this.curSelectNode.proxyType === "2") {
        this.$set(this.rtMenuObj.list[3], "state", true);
        this.verArr = this.curSelectNode.layerVersion.split(",");
      } else {
        this.$set(this.rtMenuObj.list[3], "state", false);
      }
      this.getMenuPosition(e);
    },
    //菜单列表
    setRMenuList(list) {
      let arr = this.rtMenuObj.list;
      for (let i = 0; i < arr.length; i++) {
        if (list.indexOf(i) > -1) {
          this.$set(arr[i], "state", true);
        } else {
          this.$set(arr[i], "state", false);
        }
      }
    },
    //确定菜单位置
    getMenuPosition: function (e) {
      const hl = agcim.ui.domNode.getDomTopLeft(this.$refs.mtreeBox);
      this.isRtMenuShow = true;
      let event = e.event;
      this.$nextTick(() => {
        let h =
          document.documentElement.clientHeight || document.body.clientHeight;
        let l = event.clientX - hl.left > 240 ? 240 : event.clientX - hl.left;
        let t =
          h - event.clientY - hl.top < 200
            ? event.clientY - hl.top - this.$refs.rtMenuBox.offsetHeight
            : event.clientY - hl.top;
        this.$refs.rtMenuBox.style.left = l + "px";
        this.$refs.rtMenuBox.style.top = t + "px";

        if (this.curSelectNode.children) {
          this.rtMenuObj.hasChild = true;
        } else {
          this.rtMenuObj.hasChild = false;
        }
        //透明度显示位置
        this.$refs.opacityPoa.style.left = event.clientX - hl.left + "px";
        this.$refs.opacityPoa.style.top = event.clientY - hl.top + "px";

        //版本切换显示位置
        this.$refs.versionPoa.style.left = event.clientX - hl.left + "px";
        this.$refs.versionPoa.style.top = event.clientY - hl.top + "px";
      });
    },
    //全部打开，关闭（右键选中的）
    isExpandSelect(flag) {
      const arr1 = [this.curSelectNode];
      const b = getMenuKeys(arr1, []);
      if (flag) {
        for (let i in b) {
          if (this.expandedKeys.indexOf(b[i]) === -1) {
            this.expandedKeys.push(b[i]);
          }
        }
      } else {
        for (let i in b) {
          let index = this.expandedKeys.indexOf(b[i]);
          if (index > -1) {
            this.expandedKeys.splice(index, 1);
          }
        }
      }
    },
    //控制级别显示
    setGradebySelect(n) {
      this.expandedKeys = [];
      this.expandedKeys = getMenuKeysByLevel(this.treeData, n, []);
    },
    //搜索
    searchTree(keyWord) {
      var vm = this;
      vm.keyWord = keyWord;
      vm.searchValue = vm.keyWord;
      if (vm.searchValue === "") {
        vm.expandedKeys = [];
      } else {
        vm.expandedKeys = [];
        let _backupsExpandedKeys = [];
        let candidateKeysList = vm.getkeyList(vm.searchValue, vm.treeData, []);
        candidateKeysList.map((item) => {
          var key = getParentKey(item, vm.treeData);
          if (key && !_backupsExpandedKeys.some((item) => item === key))
            _backupsExpandedKeys.push(key);
        });
        for (let i = 0; i < _backupsExpandedKeys.length; i++) {
          getAllParentKey(
            _backupsExpandedKeys[i],
            vm.treeData,
            _backupsExpandedKeys
          );
        }
        vm.expandedKeys = _backupsExpandedKeys.slice();
      }
    },
    //获取节点title中含有value的所有key集合
    getkeyList(value, tree, keyList) {
      for (let i = 0; i < tree.length; i++) {
        let node = tree[i];
        if (node.text.indexOf(value) > -1) {
          keyList.push(node.key);
        }
        if (node.children) {
          this.getkeyList(value, node.children, keyList);
        }
      }
      return keyList;
    },
    //点击复选框
    onCheck(checkedKeys, e) {
      if (e.checked) {
        var existItems = CIM.layerTree._aglayerIds;
        var items = [];
        for (var i = checkedKeys.length - 1; i > -1; i--) {
          if (existItems.indexOf(checkedKeys[i]) < 0) {
            items.push(checkedKeys[i]);
          }
        }
        CIM.layerTree.addMany(items, CIM.viewer);
      } else {
        var existItems = CIM.layerTree._aglayerIds;
        var items = [];
        for (var i = existItems.length - 1; i > -1; i--) {
          if (checkedKeys.indexOf(existItems[i]) < 0) {
            items.push(existItems[i]);
          }
        }
        CIM.layerTree.removeMany(items, CIM.viewer);
      }
      if (e.node.dataRef.children) {
        let num = e.node.dataRef.children.length;
        for (let i = 0; i < num; i++) {
          this.$set(e.node.dataRef.children[i], "checked", e.checked);
        }
      } else {
        this.$set(e.node.dataRef, "checked", e.checked);
      }
    },
    //点击定位图标
    onCheckLocation(node) {
      if (node.checked) {
        CIM.layerTree.zoomToLayerById(node.id);
      }
    },
    //菜单事件
    handleMemuEvent(key) {
      this.isRtMenuShow = false;
      this[key]();
    },
    //透明度调整
    changeOpacity(opacity) {
      CIM.layerTree.setLayerOpacityById(this.curSelectNode.id, opacity);
    },
    //缩放至图层
    zoomToLayerById() {
      CIM.layerTree.zoomToLayerById(this.curSelectNode.id);
    },
    //图层样式
    setLayerStyle() {
      let o = this.curSelectNode;
      o.code = "LayerStyle";
      this.$emit("onShow", o);
    },
    //图层信息
    getLayerInfo() {
      alert("图层信息");
    },
    //获取图层原始透明度--回显
    setOpacity() {
      this.opacityVisible = true;
      this.opacity = 1; ////////////////
    },
    setVersion() {
      this.versionVisible = true;
    },
    getMdInfo() {
      let o = this.curSelectNode;
      o.code = "LayerPointList";
      this.$emit("onShow", o);
    },
    changeVersion(e) {
      let ly = CIM.layerTree._layerTreeData[this.curSelectNode.id];
      ly["defaultVersion"] = e.target.value;
      let new_url =
        ly["url1"] +
        ly.layerAggregateName +
        "/tileset.json?layerName=" +
        ly.text +
        "&version=" +
        e.target.value;
      ly.url = new_url;

      CIM.layerTree.removeLayerById(ly.id, CIM.viewer, 0);
      if (this.checkedKeys.indexOf(ly.id) > -1) {
        setTimeout(() => {
          CIM.layerTree.addMany([ly.id]);
        }, 500);
      }
    }
  },
  computed: {
    checkedKeysA() {
      this.checkedKeys;
      return CIM.layerTree._aglayerIds;
    },
  },
  watch: {
    checkedKeysA: function (val) {
      this.checkedKeys = val;
    },
    // keyWord: function () {
    //   var vm = this;
    //   clearTimeout(vm.timer);
    //   vm.timer = setTimeout(function () {
    //     vm.searchTree();
    //   }, 500);
    // },
  },
};
</script>
<style scoped src="./css/index.css">
