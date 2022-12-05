<template>
  <div style="height:100%">
    <div class="camera-action">
      <a-button type="primary" @click="showModal">
        <a-icon type="plus" />
      </a-button>
      <a-modal
        title="添加当前视图窗口"
        :visible="visible"
        @ok="addViewPoint"
        @cancel="cancel"
        okText="确认"
        cancelText="取消"
        :mask="false"
      >
        <a-form>
          <a-form-item
            label="视点名称"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 12 }"
          >
            <a-input v-model="cameraName" placeholder="请输入视点名称" />
          </a-form-item>
          <a-form-item label="是否为默认视点" :label-col="{ span: 12 }">
            <div>
              <a-radio-group v-model="isDefault">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="2">否</a-radio>
              </a-radio-group>
            </div>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-modal
        title="编辑视点"
        :visible="editVisible"
        @ok="editViewPoint"
        @cancel="editCancel"
        style="top: 20px;"
        okText="确认"
        cancelText="取消"
        :mask="false"
      >
        <a-form>
          <a-form-item
            label="视点名称"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 16 }"
          >
            <a-input v-model="editCameraName" />
          </a-form-item>
          <a-form-item label="视点分类" :label-col="{ span: 6 }">
            <a-row :gutter="16">
              <a-col :span="10">
                <a-select
                  v-model="classify"
                  placeholder="请选择视点所在的文件夹"
                  style="width: 195px"
                >
                  <a-select-option
                    v-for="(value, key) in classifyItems"
                    :value="key"
                    :key="key"
                    >{{ value }}</a-select-option
                  >
                </a-select>
              </a-col>
              <a-col :span="6"></a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="是否为默认视点" :label-col="{ span: 8 }">
            <div>
              <a-radio-group v-model="editDefaultValue">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="2">否</a-radio>
              </a-radio-group>
            </div>
          </a-form-item>

          <div class="editImg">
            <div class="editFormPlace">
              <img :src="curCode" />
            </div>
            <div class="editNewPlace">
              <a-button @click="editNewPlace()">更新位置</a-button>
            </div>
          </div>
          <!-- todo 未完成 -->
          <a-form-item>
            <div class="additionalAll">
              <div class="additionalTitle">
                <span style="margin:10px">附加功能：</span>
              </div>
              <ul class="addf-box vscroll">
                <li v-for="(item, index) in functionsArr" :key="index">
                  {{ item.action }} ， {{ item.obj }} ， {{ item.params }}
                  <a-icon
                    type="edit"
                    class="icon"
                    @click.stop="updateFunc(index, item)"
                  />
                  <a-icon
                    type="delete"
                    class="icon"
                    @click.stop="deleteFunc(index)"
                  />
                </li>
              </ul>

              <div class="addtionalContent">
                <div class="addtionalFunc">
                  <a-button type="primary" @click="updateFunc('add')">
                    <a-icon type="plus" />
                  </a-button>
                  <a-modal
                    title="添加附加功能"
                    :visible="addVisible"
                    @ok="addCertain"
                    @cancel="addCancel"
                    okText="确认"
                    cancelText="取消"
                    :mask="false"
                  >
                    <a-form>
                      <a-form-item
                        label="动作列表"
                        :label-col="{ span: 8 }"
                        :wrapper-col="{ span: 10 }"
                      >
                        <a-select
                          placeholder="showLayer"
                          style="width: 160px"
                          @change="addHandleChange"
                          v-model="addCameraFile"
                        >
                          <a-select-option value="showLayer"
                            >showLayer</a-select-option
                          >
                          <a-select-option value="closeLayer"
                            >closeLayer</a-select-option
                          >
                          <!-- <a-select-option value="setLayerOpacity">setLayerOpacity</a-select-option> -->
                        </a-select>
                      </a-form-item>
                      <a-form-item
                        label="所执行对象"
                        :label-col="{ span: 8 }"
                        :wrapper-col="{ span: 10 }"
                      >
                        <a-input
                          v-model="addCameraObj"
                          placeholder="请输入图层名"
                        />
                      </a-form-item>

                      <a-form-item
                        label="执行参数"
                        :label-col="{ span: 8 }"
                        :wrapper-col="{ span: 10 }"
                      >
                        <a-input v-model="addCameraArg" />
                      </a-form-item>
                    </a-form>
                  </a-modal>
                </div>
              </div>
            </div>
          </a-form-item>
        </a-form>
      </a-modal>

      <a-select
        default-value="detail"
        v-model="listType"
        style="width: 100px;margin:0 10px;"
        @change="handleTypeClick"
      >
        <a-select-option value="thumbnail">
          缩略图
        </a-select-option>
        <a-select-option value="detail">
          列表
        </a-select-option>
      </a-select>
      <!-- <a-select
        default-value="detail"
        v-model="classify"
        style="width: 100px"
        @change="handleDisplayClick"
      >
        <a-select-option v-for="(value, key) in classifyItems" :key="key">
          {{ value }}
        </a-select-option>
      </a-select> -->
      <div class="viewPoint-tag">
        <template v-for="(tag, index) in tags">
          <a-tag :color="tagColor[index]" :key="tag.id" @click="queryTag(tag)">
            {{ tag.name }}
          </a-tag>
        </template>
      </div>
      <a-spin tip="Loading..." :spinning="spinning" />
    </div>

    <div class="camera-list vscroll">
      <div
        v-for="item in cameraListFilter"
        :key="item.id"
        class="cameralist-thumbnail"
      >
        <div v-if="listType == 'thumbnail'" class="list-thumbnail">
          <div class="list-action">
            <span class="ibox">
              <a-icon type="edit" class="icon" @click.stop="editModal(item)" />
            </span>
            <span class="ibox">
              <a-popconfirm
                title="是否确认要删除这个视点？"
                @confirm="deleteCertain(item)"
                okText="确认"
                cancelText="取消"
              >
                <a-icon type="delete" class="icon" />
              </a-popconfirm>
            </span>
          </div>
          <div @click="flyCamera(item)">
            <img :src="item.json.code" />
            <p>
              {{ item.name }}
              <span v-if="item.json.isDefault == 1">(默认视点)</span>
            </p>
          </div>
        </div>

        <div v-else>
          <div class="list-thumbnail">
            <div class="list-detail" @click="flyCamera(item)">
              <div id="pic-left">
                <img :src="item.json.code" />
              </div>
              <div class="detail-right">
                <div class="detail-list">
                  <span>{{ item.name }}</span>
                  <span v-if="item.json.isDefault == 1">(默认视点)</span>
                </div>
                <div class="detail-list">
                  <!-- <span>类别:</span> -->
                  <span style="font-size:12px;color:#48D1CC">{{
                    classifyItems[item.json.classify]
                  }}</span>
                </div>
              </div>
            </div>
            <div class="list-action">
              <span class="ibox">
                <a-icon
                  type="edit"
                  class="icon"
                  @click.stop="editModal(item)"
                />
              </span>
              <span class="ibox">
                <a-popconfirm
                  title="是否确认要删除这个视点？"
                  @confirm="deleteCertain(item)"
                  okText="确认"
                  cancelText="取消"
                >
                  <a-icon type="delete" class="icon" />
                </a-popconfirm>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import canvas2Image from "@/views/js/extension/canvas2Image.js";
import agCamera from "@/sdk/camera/camera";
import serverData from "./js/serverData";
let viewer = CIM.viewer;
export default {
  name: "viewPoint",
  data() {
    return {
      visible: false, //是否显示添加当前视图窗口
      editVisible: false, //是否显示编辑视点
      addVisible: false, //是否显示添加附加功能

      addCameraFile: "", //添加附加功能，修改动作列表操作
      addCameraObj: "", //添加附加功能，所执行的对象（图层服务名称）
      addCameraArg: "", //添加附加功能，所执行的对象的值（setLayerOpacity时，图层透明度的值）
      functionsArr: [],
      isAddFuncIndex: "add", //新增or编辑

      editCameraName: "", //修改视点 ：视点名称
      editDefaultValue: "", //修改视点 ：是否为默认视点

      cameraName: "", //新增视点：视点名称
      isDefault: 2, //新增视点：是否为默认视点（1为默认，2为非默认）

      size: "large",
      listType: "detail", //当前排列方式
      classify: "all", //当前分类展示
      classifyItems: {
        all: "全部",
        cityPlan: "城市规划",
        cityDesign: "城市设计",
        cityHealthCheck: "城市体检",
      },
      curCode: "",
      arrCartesian: [],
      cameraList: [],
      cameraListFilter: [], //用于分类展示筛选
      curCamera: null,
      spinning: true,
      tags: [
        { id: 1, name: "全部", checked: true },
        { id: 2, name: "城市规划", checked: false },
        { id: 3, name: "城市设计", checked: false },
        { id: 4, name: "城市体检", checked: false },
      ],
      tagColor: ["blue", "", "", ""],
    };
  },
  created() {
    this.cameraList = this.getData();
  },
  methods: {
    queryTag(tag) {
      if (tag.name == "全部") {
        this.tags[0].checked = !this.tags[0].checked;
        this.tags[1].checked = false;
        this.tags[2].checked = false;
        this.tags[3].checked = false;
      } else if (tag.name == "城市规划") {
        this.tags[0].checked = false;
        this.tags[1].checked = !this.tags[1].checked;
      } else if (tag.name == "城市设计") {
        this.tags[0].checked = false;
        this.tags[2].checked = !this.tags[2].checked;
      } else if (tag.name == "城市体检") {
        this.tags[0].checked = false;
        this.tags[3].checked = !this.tags[3].checked;
      }
      var color = [];
      var filterList = [];
      for (let i = 0; i < this.tags.length; i++) {
        var checked = this.tags[i].checked;
        if (checked) {
          color.push("blue");
          filterList.push(this.tags[i].name);
        } else {
          color.push("");
        }
      }
      this.tagColor = color;
      this.handleDisplayClick(filterList);
    },
    // 获取列表数据
    async getData() {
      this.spinning = true;
      let data = await serverData.getJsonStore(
        "name=viewPoint&page=1&rows=1000"
      );
      let rows = data.content.rows;
      for (let i = 0; i < rows.length; i++) {
        rows[i].json = JSON.parse(rows[i].json);
      }
      this.cameraList = rows;
      this.cameraListFilter = this.cameraList;
      this.spinning = false;
    },
    // 修改排列方式操作
    handleTypeClick(e) {
      this.listType = e;
    },
    // 修改分类显示操作
    handleDisplayClick(list) {
      this.showListFilter = true;
      this.showList = false;
      if (list.length == 0) {
        this.cameraListFilter = [];
      } else {
        var viewList = [];
        for (let i = 0; i < list.length; i++) {
          if (list[i] == "全部") {
            viewList = "all";
          } else if (list[i] == "城市规划") {
            viewList.push("cityPlan");
          } else if (list[i] == "城市设计") {
            viewList.push("cityDesign");
          } else if (list[i] == "城市体检") {
            viewList.push("cityHealthCheck");
          }
        }
        if (viewList == "all") {
          this.cameraListFilter = this.cameraList;
        } else {
          this.cameraListFilter = this.cameraList.filter(
            (item) =>
              item.json.classify == viewList[0] ||
              item.json.classify == viewList[1] ||
              item.json.classify == viewList[2]
          );
        }
      }
      // if (e == "all") {
      //   this.cameraListFilter = this.cameraList;
      // } else {
      //   this.cameraListFilter = this.cameraList.filter(
      //     (item) => item.json.classify == e
      //   );
      // }
    },
    // 显示添加视点弹窗
    showModal() {
      this.visible = true;
    },
    // 添加视点
    addViewPoint() {
      var genimg = canvas2Image.capturePng(viewer, 300, null, 0.8);
      var s = agCamera.getCameraAsJSON(viewer);
      s.name = this.cameraName;
      s.code = genimg.src;
      s.up = this.up;
      s.isDefault = this.isDefault;
      s.classify = "cityPlan";
      let params = {
        name: this.cameraName,
        domain: "GZ",
        usage: "viewPoint",
        url: "",
        sort: "",
        json: JSON.stringify(s),
        tag: "",
      };
      this.visible = false;
      // 修改默认视点
      if (this.isDefault == 1) {
        this.updateDefaultView();
      }
      let promise = serverData.saveJsonStore(params);
      promise.then(
        function(data) {
          this.getData();
        }.bind(this)
      );
    },
    // 删除视点列表
    deleteCertain(item) {
      let _this = this;
      let param = "paramId=" + item.id;
      let promise = serverData.deleteJsonStore(param);
      promise.then(function(data) {
        _this.getData();
      });
    },
    // 编辑视点
    editViewPoint() {
      let _this = this;
      this.editVisible = false;
      let s = {
        name: this.editCameraName,
        position: this.position,
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll,
        classify: this.classify,
        isDefault: this.editDefaultValue,
        code: this.curCode,
        functions: this.functionsArr,
      };

      let params = {
        id: this.curCamera.id,
        name: this.editCameraName,
        domain: "GZ",
        usage: "viewPoint",
        url: "",
        sort: "",
        json: JSON.stringify(s),
        tag: "",
      };
      this.visible = false;
      // 修改默认视点
      if (this.editDefaultValue == 1) {
        this.updateDefaultView(this.curCamera.id);
      }
      let promise = serverData.updateJsonStore(params);
      promise.then(function(data) {
        _this.getData();
      });
    },
    // 修改默认视点
    updateDefaultView(id) {
      for (let i = 0; i < this.cameraList.length; i++) {
        if (this.cameraList[i].json.isDefault == 1) {
          if (id && id == this.cameraList[i].id) {
            return;
          }
          let list = {
            id: this.cameraList[i].id,
            name: this.cameraList[i].name,
            domain: "GZ",
            usage: "viewPoint",
            url: "",
            sort: "",
            json: this.cameraList[i].json,
            tag: "",
          };
          list.json.isDefault = 2;
          list.json = JSON.stringify(list.json);
          serverData.updateJsonStore(list);
        }
      }
    },
    // 点击编辑按钮操作
    editModal(val) {
      this.editVisible = true;
      this.curCamera = val;
      this.editCameraName = this.curCamera.name;
      this.classify = this.curCamera.json.classify;
      this.editDefaultValue = this.curCamera.json.isDefault;
      this.curCode = val.json.code;
      this.position = val.json.position;
      this.heading = val.json.heading;
      this.pitch = val.json.pitch;
      this.roll = val.json.roll;
      if (val.json.functions) {
        this.functionsArr = val.json.functions;
      } else {
        this.functionsArr = [];
      }
    },
    // 点击更新位置按钮操作
    editNewPlace() {
      let genimgNew = canvas2Image.capturePng(viewer, 300, null, 0.8);
      this.curCode = genimgNew.src;
      this.position = viewer.camera.positionWC.clone();
      this.heading = viewer.camera.heading;
      this.pitch = viewer.camera.pitch;
      this.roll = viewer.camera.roll;
    },

    // 添加附加功能按钮操作，显示弹窗
    addCertain() {
      let vm = this;
      this.addVisible = false;
      let o = {
        action: vm.addCameraFile,
        obj: vm.addCameraObj,
        params: vm.addCameraArg,
      };
      if (this.isAddFuncIndex == "add") {
        //添加列表
        vm.functionsArr.push(o);
      } else {
        //修改
        vm.functionsArr[vm.isAddFuncIndex] = o;
      }
    },
    // 取消添加视点操作
    cancel() {
      this.visible = false;
    },
    // 取消编辑视点操作
    editCancel() {
      this.editVisible = false;
    },
    // 取消添加附加功能操作
    addCancel() {
      this.addVisible = false;
    },
    // 点击列表定位
    flyCamera: function(item) {
      let val = item.json;
      if (Array.isArray(val.position)) {
        val.position = new Cesium.Cartesian3(
          val.position[0],
          val.position[1],
          val.position[2]
        );
      }
      agCamera.setCamera(CIM.viewer, val);
      this.excuteFunction(val);
    },
    // 添加附加功能，修改动作列表操作
    addHandleChange(value) {
      this.addCameraFile = value;
    },
    updateFunc(index, o) {
      this.isAddFuncIndex = index;
      this.addVisible = true;
      if (o) {
        this.addCameraFile = o.action;
        this.addCameraObj = o.obj;
        this.addCameraArg = o.params;
      } else {
        this.addCameraFile = "showLayer";
        this.addCameraObj = "";
        this.addCameraArg = "";
      }
    },
    deleteFunc(index) {
      this.functionsArr.splice(index, 1);
    },
    //执行附加功能
    excuteFunction(information, params) {
      var vm = this;
      if (!information.functions || information.functions.length == 0) return;
      information.functions.map((val) => {
        vm[val.action](val, params);
      });
    },
    showLayer(data, params) {
      var layerName = data.obj;
      let ly = CIM.layerTree.getLayerByText(layerName);
      let ids = CIM.layerTree._aglayerIds;
      //未添加，则添加
      if (ly && ly.id && ids.indexOf(ly.id) == -1) {
        CIM.layerTree.addLayer(ly, viewer);
      }
    },
    closeLayer(data, params) {
      var layerName = data.obj;
      let ly = CIM.layerTree.getLayerByText(layerName);
      let ids = CIM.layerTree._aglayerIds;
      //已添加，就删除
      if (ly && ly.id && ids.indexOf(ly.id) > -1) {
        CIM.layerTree.removeLayerById(ly.id, viewer);
      }
    },
    setLayerOpacity(data, params) {
      //设置
    },
  },
};
</script>

<style scoped src="./index.css"></style>
