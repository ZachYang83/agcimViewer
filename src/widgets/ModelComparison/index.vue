<template>
  <div class="observed-main">
    <div class="select-box">
      <span style="margin-left: 10px">专业：</span>
      <a-select
        default-value="building"
        style="width: 120px; margin-bottom: 20px"
        @change="handleChange"
      >
        <a-select-option value="building"> 建筑 </a-select-option>
      </a-select>
    </div>
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="tableList"
      row-key="id"
    >
      <template slot="action" slot-scope="text, record">
        <a @click="showModels(record)" type="text" :text="text">模型</a>
      </template>
    </a-table>
    <a-button
      type="primary"
      style="margin-right: 10px"
      @click="showModelComparseResult"
    >
      开始对比
    </a-button>
    <ag-popup
      v-model="visible"
      title="对比结果"
      style="width: 300px; top: 169px"
      @onCancel="onCancel"
    >
      <div class="mainContent" style="overflow-x: hidden; overflow-y: auto">
        <div style="padding: 10px">
          <ul style="list-style-type: none">
            <li @click="changeStructs">
              <div class="li_div" style="background-color: #fb8f1c"></div>
              修改构件
            </li>
            <li
              style="height: auto; background-color: #f2f9ff"
              v-show="changeState"
            >
              <a-tree
                style="left: 20px; position: relative"
                v-if="treeDataChange.length"
                v-model="checkedKeysChange"
                :checkable="checkable"
                :expandedKeys="expandedKeysChange"
                :autoExpandParent="autoExpandParent"
                :selected-keys="selectedKeysChange"
                :treeData="treeDataChange"
                @expand="onExpandChange"
                @select="onSelectChange"
                @check="onCheckChange"
              >
                <template slot="title" slot-scope="item">
                  <span
                    class="txt-ellipsis"
                    :key="item.id"
                    v-html="item.name"
                  ></span>
                  <a-icon
                    style="margin-left: 15px"
                    type="environment"
                    v-if="
                      item.type == 'change' ||
                      item.type == 'delete' ||
                      item.type == 'add'
                    "
                  />
                </template>
              </a-tree>
            </li>
            <li @click="addStructs">
              <div class="li_div" style="background-color: #4cd97e"></div>
              新增构件
            </li>
            <li
              style="height: auto; background-color: #f2f9ff"
              v-show="addState"
            >
              <a-tree
                style="left: 20px; position: relative"
                v-if="treeDataAdd.length"
                v-model="checkedKeysAdd"
                :checkable="checkable"
                :expandedKeys="expandedKeysAdd"
                :autoExpandParent="autoExpandParent"
                :selected-keys="selectedKeysAdd"
                :treeData="treeDataAdd"
                @expand="onExpandAdd"
                @select="onSelectAdd"
                @check="onCheckAdd"
              >
                <template slot="title" slot-scope="item">
                  <span
                    class="txt-ellipsis"
                    :key="item.id"
                    v-html="item.name"
                  ></span>
                  <a-icon
                    style="margin-left: 15px"
                    type="environment"
                    v-if="
                      item.type == 'change' ||
                      item.type == 'delete' ||
                      item.type == 'add'
                    "
                  />
                </template>
              </a-tree>
            </li>
            <li @click="deleteStructs">
              <div class="li_div" style="background-color: #fc382c"></div>
              删除构件
            </li>
            <li
              style="height: auto; background-color: #f2f9ff"
              v-show="deleteState"
            >
              <a-tree
                style="left: 20px; position: relative"
                v-model="checkedKeysDelete"
                v-if="treeDataDelete.length"
                :checkable="checkable"
                :expandedKeys="expandedKeysDelete"
                :autoExpandParent="autoExpandParent"
                :selected-keys="selectedKeysDelete"
                :treeData="treeDataDelete"
                @expand="onExpandDelete"
                @select="onSelectDelete"
                @check="onCheckDelete"
              >
                <template slot="title" slot-scope="item">
                  <span
                    class="txt-ellipsis"
                    :key="item.id"
                    v-html="item.name"
                  ></span>
                  <a-icon
                    style="margin-left: 15px"
                    type="environment"
                    v-if="
                      item.type == 'change' ||
                      item.type == 'delete' ||
                      item.type == 'add'
                    "
                  />
                </template>
              </a-tree>
            </li>
          </ul>
          <div></div>
        </div>
      </div>
    </ag-popup>
  </div>
</template>

<script>
const columns = [
  {
    scopedSlots: { customRender: "id" },
  },
  {
    title: "审查轮次",
    dataIndex: "version",
  },
  {
    title: "操作",
    dataIndex: "action",
    scopedSlots: { customRender: "action" },
  },
];
//楼的url
let originUrl = "http://192.168.3.203:7280/Models/nanjing/linkpark/tileset.json";
let originUrl2 = "http://192.168.3.203:7280/Models/nanjing/modify/tileset.json";
// import AgPopup from "@/components/AgPopupTwo.vue";
import serverData4BIM from "@/views/js/net/serverData4BIM";
import AgPopup from "@/views/components/AgPopup.vue";
import layerOption from "./js/layerOption.js";
export default {
  components: {
    "ag-popup": AgPopup,
  },
  props: {},
  data() {
    return {
      columns,
      visible: false,
      changeState: true,
      addState: false,
      deleteState: false,
      changeStateVisible: false,
      componentUrl: "",
      selectedRow: [],
      item: {},
      //获取所有的模型的列表
      modelAllList: [],
      majorList: [],
      value: "建筑",
      checkable: true,
      expandedKeysChange: ["0-0"],
      expandedKeysAdd: ["0-0"],
      expandedKeysDelete: ["0-0"],
      autoExpandParent: false,
      checkedKeysDelete: [],
      checkedKeysChange: ["0-0"],
      checkedKeysAdd: [],
      checkedKeysDelete: [],
      selectedKeysChange: [],
      selectedKeysAdd: [],
      selectedKeysDelete: [],
      treeDataChange: [],
      treeDataAdd: [],
      treeDataDelete: [],
      //新增构件列表
      newList: [],
      //删除构件列表
      removeList: [],
      //修改构件列表
      modifyList: [],
      //楼的基本信息
      tableList: [
        {
          id: "3dbf5685-eddd-4091-ab58-26db14c12197",
          name: "中铁建2-建筑20210119.NJM",
          filePath: originUrl,
          version: "1",
        },
        {
          id: "41a43b6e-3173-4cf0-bfbf-d6afae3bb63a",
          name: "中铁建2-建筑改20210119.NJM",
          filePath: originUrl2,
          version: "0",
        },
      ],
      originUrlList: [originUrl, originUrl2],
      selectedRows: [],
      flag:false,
    };
  },
  created() {},
  mounted() {
    this.value = "建筑";
    this.loadFirst(originUrl, originUrl2);
  },
  destroyed() {
    this.flag = false;
  },
  computed: {
    rowSelection() {
      return {
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows;
        },
        getCheckboxProps: (record) => ({
          props: {
            disabled: record.name === "Disabled User", // Column configuration not to be checked
            name: record.name,
          },
        }),
      };
    },
  },
  watch: {},
  methods: {
    //初始化时加载
    loadFirst(url1, url2) {
      let primitives = CIM.viewer.scene.primitives._primitives;
      let needDelete = [];
      for (var i = 0; i < primitives.length; i++) {
        let z = primitives[i].isCesium3DTileset;
        if (z) {
          needDelete.push(primitives[i]);
        }
      }
      for (var j = 0; j < needDelete.length; j++) {
        CIM.viewer.scene.primitives.remove(needDelete[j]);
      }
      let tileset = CIM.viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: url1,
          skipScreenSpaceErrorFactor: 1,
          dynamicScreenSpaceError: true,
          cullWithChildrenBounds: false,
        })
      );
      let tileset2 = CIM.viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: url2,
          skipScreenSpaceErrorFactor: 1,
          dynamicScreenSpaceError: true,
          cullWithChildrenBounds: false,
        })
      );
      tileset.readyPromise.then(function (tileset) {
        tileset.root.transform = [
          -0.7725655762610893,
          -0.593997769967108,
          0.2242968560869134,
          0,
          0.5350681530686466,
          -0.41889324116475274,
          0.7336419590496412,
          0,
          -0.34182525060047614,
          0.6868006273880294,
          0.641451787955518,
          0,
          -2183221.061960516,
          4386561.8249301845,
          4069494.7149399794,
          1,
        ];
        var center = new Cesium.Cartesian3(
          -2183222.116822738,
          4387228.382604693,
          4069186.852191443
        );
        CIM.viewer.camera.setView({
          destination: center,
          orientation: {
            heading: 0.5272534629010135,
            pitch: -0.21678391109077655,
            roll: 0.0017029847779577167,
          },
        });
        console.log("图层1加载完毕");
      });
      tileset2.readyPromise.then(function (tileset) {
        tileset.root.transform = [
          -0.7725655762610893,
          -0.593997769967108,
          0.2242968560869134,
          0,
          0.5350681530686466,
          -0.41889324116475274,
          0.7336419590496412,
          0,
          -0.34182525060047614,
          0.6868006273880294,
          0.641451787955518,
          0,
          -2183221.061960516,
          4386561.8249301845,
          4069494.7149399794,
          1,
        ];
        console.log("图层2加载完毕");
      });
    },
    /**
     * 展示模型
     * @create zgf
     * @date 20210117
     */
    showModels(row) {
      let _this = this;
      let tileList = CIM.viewer.scene.primitives._primitives;
      let item = tileList.find(function (item) {
        return item.url === row.filePath;
      });
      if (!item) {
        item.show = false;
        let tileset = CIM.viewer.scene.primitives.add(
          new Cesium.Cesium3DTileset({
            url: row.filePath,
          })
        );

        tileset.readyPromise.then(function (tileset) {
        });
      } else {
        item.show = true;
      }
      //图层都加载上-控制图层显隐
      for (var i = 0; i < tileList.length; i++) {
        if (!(item.url === tileList[i].url)) {
          tileList[i].show = false;
        }
      }
    },
    //开始比对 对比构件-获取对比结果-新增/修改/删除
    showModelComparseResult() {
      if (this.selectedRows.length < 2) {
        this.$message.warning("请勾选2个进行对比");
        return;
      } else if (this.selectedRows.length > 2) {
        this.$message.warning("勾选内容太多,请勾选2个");
        return;
      }
      this.visible = true;
      layerOption.initialization(this);
      this.treeDataChange = [];
      this.treeDataAdd = [];
      this.treeDataDelete = [];
      let _this = this;
      //查询新增构件数据
      serverData4BIM
        .getCompareDataTwo(
          "agcim3dentity_linkpart",
          "agcim3dentity_修改",
          4,
          "geometry",
          {
            profession: "建筑",
          }
        )
        .then((result) => {
          if (!result.success) return;
          _this.newList = result.content.rows;
          _this.creatRoomTree(
            "建筑",
            "add",
            result.content.rows,
            _this.treeDataAdd
          );
        });
      //查出删除的构件的数据
      serverData4BIM
        .getCompareDataTwo(
          "agcim3dentity_linkpart",
          "agcim3dentity_修改",
          3,
          "geometry",
          {
            profession: "建筑",
          }
        )
        .then((result) => {
          if (!result.success) return;
          _this.removeList = result.content.rows;
          _this.creatRoomTree(
            "建筑",
            "delete",
            result.content.rows,
            _this.treeDataDelete
          );
        });
      //查出修改的构件数据
      serverData4BIM
        .getCompareDataTwo(
          "agcim3dentity_linkpart",
          "agcim3dentity_修改",
          5,
          "geometry",
          {
            profession: "建筑",
          }
        )
        .then((result) => {
          if (!result.success) return;
          _this.modifyList = result.content.rows;
          _this.creatRoomTree(
            "建筑",
            "change",
            result.content.rows,
            _this.treeDataChange
          );
          layerOption.showChangeAllStructs(
            result.content.rows,
            "Root",
            {},
            null,
            _this
          );
          if (result.content.rows.length === 0) {
            _this.changeState = false;
            _this.checkedKeysChange = [];
          } else {
            _this.checkedKeysChange = ["0-0"];
            return;
          }
          setTimeout(function () {
            if (_this.newList.length === 0) {
              _this.addState = false;
              _this.checkedKeysAdd = [];
            } else {
              _this.checkedKeysAdd = ["0-0"];
              _this.addState = true;
              layerOption.showAddOrDeleteStructs(
                _this.newList,
                "Root",
                {},
                "add"
              );
              return;
            }
            if (_this.removeList.length === 0) {
              _this.deleteState = false;
              _this.checkedKeysDelete = [];
            } else {
              _this.checkedKeysDelete = ["0-0"];
              _this.deleteState = true;
              layerOption.showAddOrDeleteStructs(
                _this.removeList,
                "Root",
                {},
                "delete"
              );
              return;
            }
          }, 1000);
        });
    },
    /**
     * 创建结构树
     * @creater zgf
     * @date 20201215
     */
    creatRoomTree(titleName, type, data) {
      if (data.lenght == 0) {
        return;
      }
      let secondLevel = "level";
      let threeNodeName = "name";
      let objectid = "objectid";
      let catagory = "catagory";

      if (type == "change") {
        secondLevel = "blevel";
        threeNodeName = "bname";
        objectid = "bobjectid";
        catagory = "bcatagory";
      }
      var proNode = this.treeNode(titleName, "", "Root", null, "", []);
      for (let j = 0; j < data.length; j++) {
        var levelNode = proNode.children.find(
          (a) => a.name == data[j][secondLevel]
        );
        if (!levelNode) {
          var levelValue = data[j][secondLevel];
          levelNode = this.treeNode(
            data[j][secondLevel],
            data[j][objectid],
            "Level",
            levelValue,
            "",
            []
          );
          proNode.children.push(levelNode);
        }
        var catagoryNode = levelNode.children.find(
          (a) => a.name == data[j][threeNodeName]
        );
        let childList = this.treeNodeEndChildren(
          type,
          data[j][objectid],
          data[j][secondLevel]
        );
        if (!catagoryNode) {
          catagoryNode = this.treeNode(
            data[j][threeNodeName],
            data[j][objectid],
            data[j][catagory],
            data[j][objectid],
            data[j][catagory],
            childList
          );
          levelNode.children.push(catagoryNode);
        }
      }
      if (type == "change") {
        this.treeDataChange.push(proNode);
      } else if (type == "add") {
        this.treeDataAdd.push(proNode);
      } else if (type == "delete") {
        this.treeDataDelete.push(proNode);
      }
    },
    /**
     * 添加节点
     * @create zgf
     * @date 20201215
     */
    treeNode(
      name,
      objectid,
      category,
      value,
      smallType,
      childrenList,
      isLeaf = false
    ) {
      var item = {
        name: name,
        category: category,
        value: value,
        smallType: smallType,
        id: this.index,
        objectid: objectid,
        children: childrenList,
        scopedSlots: { title: "title" },
        isLeaf: isLeaf,
      };
      return item;
    },
    /**
     * 最终树节点展示的内容
     * @create zgf
     * @date 20201216
     */
    treeNodeEndChildren(type, objectid, level) {
      let list = [];
      if (type == "change") {
        list = [
          {
            name: "修改前",
            value: level,
            id: this.index,
            objectid: objectid,
            children: [],
            scopedSlots: { title: "title", icon: "custom" },
            type: type,
            isLeaf: true,
            category: "small",
          },
          {
            name: "修改后",
            value: level,
            id: this.index,
            objectid: objectid,
            children: [],
            scopedSlots: { title: "title", icon: "custom" },
            type: type,
            isLeaf: true,
            category: "small",
          },
        ];
      } else if (type == "add") {
        list = [
          {
            name: "添加后",
            value: level,
            id: this.index,
            objectid: objectid,
            children: [],
            scopedSlots: { title: "title", icon: "custom" },
            type: type,
            isLeaf: true,
            category: "small",
          },
        ];
      } else if (type == "delete") {
        list = [
          {
            name: "删除前",
            value: level,
            id: this.index,
            objectid: objectid,
            children: [],
            scopedSlots: { title: "title", icon: "custom" },
            type: type,
            isLeaf: true,
            category: "small",
          },
        ];
      }
      return list;
    },
    /**
     * 树节点checkbox操作
     * @create zgf
     * @date 20201216
     */
    checkOption(e, type, data) {
      if (
        layerOption.unchangeTiles == null ||
        layerOption.changeTiles == null
      ) {
      }
      layerOption.styleCheck(e, type, data);
    },
    beforeFlyResove(e) {
      let json = e.node.dataRef;
      if (!json.hasOwnProperty("type")) {
        return;
      }
      let objectId = e.node.dataRef.objectid;
      let type = e.node.dataRef.type;
      let level = e.node.dataRef.value;
      let name = e.node.dataRef.name;
      if (type == "change") {
        if (name == "修改前") {
          // 修改前 拿到geometry 添加实体
          let data = this.modifyList.find(
            (a) => a.tobjectid == e.node.dataRef.objectid
          );
          layerOption.flyTo(data, type, "unchange");
        } else if (name == "修改后") {
          //  修改后 高亮构件；
          let data = this.modifyList.find(
            (a) => a.bobjectid == e.node.dataRef.objectid
          );
          layerOption.flyTo(data, type, "changed");
        }
      } else if (type == "add" || type == "delete") {
        if (type == "add") {
          let data = this.newList.find(
            (a) => a.objectid == e.node.dataRef.objectid
          );
          //高亮构件，定位到构件
          layerOption.flyTo(data, type);
        } else if (type == "delete") {
          let data = this.removeList.find(
            (a) => a.objectid == e.node.dataRef.objectid
          );
          //拿到geometry，添加实体
          layerOption.flyTo(data, type);
        }
      }
    },
    //修改构件
    changeStructs() {
      if (this.changeState) {
        this.changeState = false;
      } else {
        this.changeState = true;
      }
    },
    //新增构件
    addStructs() {
      if (this.addState) {
        this.addState = false;
      } else {
        this.addState = true;
      }
    },
    //删除构件
    deleteStructs() {
      if (this.deleteState) {
        this.deleteState = false;
      } else {
        this.deleteState = true;
      }
    },
    onCheckChange(checkedKeys, e) {
      this.checkedKeysAdd = [];
      this.checkedKeysDelete = [];
      this.checkedKeysChange = checkedKeys;
      this.checkOption(e, "change", this.modifyList);
    },
    onExpandDelete(expandedKeys) {
      this.expandedKeysDelete = expandedKeys;
      // $this.autoExpandParent = false;
    },

    onSelectDelete(selectedKeys, e) {
      this.selectedKeysDelete = selectedKeys;
      this.beforeFlyResove(e);
    },
    onCheckDelete(checkedKeys, e) {
      this.checkedKeysChange = [];
      this.checkedKeysAdd = [];

      this.checkedKeysDelete = checkedKeys;
      this.checkOption(e, "delete", this.removeList);
    },
    onCheckAdd(checkedKeys, e) {
      this.checkedKeysChange = [];
      this.checkedKeysDelete = [];
      this.checkedKeysAdd = checkedKeys;
      this.checkOption(e, "add", this.newList);
    },
    onExpandAdd(expandedKeys) {
      this.expandedKeysAdd = expandedKeys;
      // $this.autoExpandParent = false;
    },

    onSelectAdd(selectedKeys, e) {
      this.selectedKeysAdd = selectedKeys;
      this.beforeFlyResove(e);
    },
    // treeDataChange(val) {
    //   if (this.treeDataChange.length === 0) {
    //     return;
    //   }
    //   let children = this.treeDataChange[0].children;
    //   this.selectedKeysChange.push();
    // },
    onExpandChange(expandedKeys) {
      this.expandedKeysChange = expandedKeys;
    },

    onSelectChange(selectedKeys, e) {
      this.selectedKeysChange = selectedKeys;
      this.beforeFlyResove(e);
    },
    onExpandAdd(expandedKeys) {
      this.expandedKeysAdd = expandedKeys;
      // $this.autoExpandParent = false;
    },
    handleChange(value) {
      console.log(`selected ${value}`);
    },
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      console.log(e);
      this.visible = false;
    },
    onCancel() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
::v-deep a-tree .anticon {
  margin-left: 12px;
}
::v-deep .ant-tree li .ant-tree-node-content-wrapper.ant-tree-node-selected {
  background-color: transparent;
}
::v-deep .ant-tree li .ant-tree-node-content-wrapper:hover {
  background-color: transparent;
}
.li_div {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin: 0px 10px 0px 10px;
}
ul {
  padding-inline-start: 10px !important;
}
ul li {
  line-height: 40px;
  height: 40px;
  cursor: pointer;
}
.mainContent {
  width: 100%;
  height: 525px;
  border: 1px solid #d9d9d9;
}
.observed-main {
  margin: 10px;
}
</style>