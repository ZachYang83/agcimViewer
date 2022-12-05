<template>
  <div class="ag-ReviewProvisions">
    <a-divider orientation="left">选择审查项目</a-divider>
    <a-select
      show-search
      placeholder="请选择审查项目"
      style="width: 200px; margin-left: 10px"
      @change="checkObjectChange"
      @dropdownVisibleChange="handleDropdownVisibleChange"
    >
      <a-select-option
        v-for="item in objectList"
        :key="item.value"
        :value="item.value"
        :extend="item.projectModels"
      >
        {{ item.label }}
      </a-select-option>
    </a-select>
    <a-button
      class="review-project-new"
      type="primary"
      icon="plus"
      style="margin-left: 10px"
      @click="createProject"
    >
      添加
    </a-button>
    <!--新建项目面板-->
    <create-project
      :visible="projectPanelShow"
      @closePanel="closePanel"
    ></create-project>

    <a-divider orientation="left">选择规范</a-divider>
    <a-checkbox-group v-model="selectionCriteriaData">
      <a-row v-for="item in options" :key="item.value">
        <a-col :span="24">
          <a-checkbox :value="item.value"
            >{{ item.label }}{{ handleOptionsTypeNum(item.value) }}</a-checkbox
          >
        </a-col>
      </a-row>
    </a-checkbox-group>
    <a-divider orientation="left">选择规范分类</a-divider>
    <a-checkbox-group v-model="selectionCriteriaClassificationData">
      <a-row v-for="item in classificationOptions" :key="item.value">
        <a-col :span="24">
          <!-- <a-checkbox :value="item.value" :style="{color:item.color}" @click="changeData(item.label)">{{ item.label }}</a-checkbox> -->
          <a-checkbox :value="item.value" :style="{ color: item.color }"
            >{{ item.label
            }}{{ handleClassificationTypeNum(item.value) }}</a-checkbox
          >
        </a-col>
      </a-row>
    </a-checkbox-group>
    <div class="ag-save">
      <a-button type="primary" size="small" v-on:click="handleSave"
        >确定</a-button
      >
      <a-button
        type="primary"
        size="small"
        v-on:click="handleReSet"
        style="margin-left: 10px"
        >重置</a-button
      >
    </div>
    <div
      class="ag-result"
      :class="{ active: isActive }"
      :style="{ width: tbWidth }"
    >
      <a-table
        :customRow="handleRowClick"
        :columns="columns"
        :data-source="data"
        bordered
        :pagination="false"
        size="small"
        :scroll="{ y: 180 }"
        v-if="showResult"
        :rowKey="(data) => data.id"
      >
        <span
          slot="name"
          slot-scope="text, record"
          :style="{
            color: classificationTypeColorList[record.classificationType],
          }"
          >{{ record.name + "、" + record.result }}</span
        >
        <span slot="customTitle">
          审查结果：
          <template>
            <a-select
              size="small"
              v-model="selected"
              style="width: 120px"
              @change="handleChange(selected)"
            >
              <a-select-option
                v-for="option in selectOptions"
                :key="option.text"
                :value="option.value"
                >{{ option.text }}</a-select-option
              >
            </a-select>
            <a-button
              type="primary"
              @click="createReport"
              style="margin-left: 10px"
              >生成报告</a-button
            >
            <a-icon
              type="double-right"
              :class="{ up: isActive }"
              @click="onToggleBox"
            />
          </template>
        </span>
      </a-table>
    </div>

    <a-drawer width="360" :visible="showDrawer" :mask="false" :closable="false">
      <a-tabs default-active-key="1" @change="handleTabStatus">
        <a-tab-pane key="1" tab="审查结果详情">
          <div class="ag-draw-content">
            <ul style="padding-left: 10px">
              <li class="clause_detail_li" style="padding-top: 20px">
                <div class="detailTitle">审查依据</div>
                <span>
                  <a-icon type="file-done" style="color: #3e7bff" />
                </span>
                <div class="clause_type">{{ detailData.type }}</div>
                <div class="clause_detail">
                  <p class="clause_title">建筑设计防火规范 GB 50016-2014</p>
                  <p class="clause_content">
                    <template>
                      <a-tooltip placement="left">
                        <template slot="title">{{
                          detailData.name + " " + detailData.basis
                        }}</template>
                        {{ detailData.basis }}
                      </a-tooltip>
                    </template>
                  </p>
                </div>
              </li>
              <li class="clause_detail_li" style="padding-top: 20px">
                <div class="detailTitle">审查结果</div>
                <div class="detail_result">{{ detailData.result }}</div>
              </li>
              <li class="clause_detail_li" style="padding-top: 40px">
                <div class="detailTitle">意见</div>
                <div style="padding-left: 10px">
                  <!-- <textarea
              autocomplete="off"
              placeholder="请输入您的建议，不超过200字"
              class="el-textarea__inner"
              style="resize: none; min-height: 33px;"
            ></textarea>-->
                  <a-textarea
                    v-model="opinionArea"
                    placeholder="请输入您的建议，不超过200字"
                    style="min-height: 100px"
                  />
                </div>
                <!-- <div class="no_submit_button">提交</div> -->

                <div class="clause_button">
                  <div
                    v-on:click="snapshot"
                    style="display: block; float: left; padding-left: 20px"
                  >
                    <svg
                      t="1600333298380"
                      class="icon"
                      viewBox="0 0 1024 1024"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      p-id="2508"
                      width="25"
                      height="25"
                    >
                      <path
                        d="M260.096 512c47.104 0 84.992-38.912 84.992-84.992s-38.912-84.992-84.992-84.992-84.992 38.912-84.992 84.992C179.2 474.112 217.088 512 260.096 512zM260.096 388.096c21.504 0 43.008 17.408 43.008 43.008 0 21.504-17.408 43.008-43.008 43.008-21.504 0-43.008-17.408-43.008-43.008C222.208 405.504 238.592 388.096 260.096 388.096zM677.888 815.104 677.888 815.104 677.888 815.104 555.008 606.208l0 0c-4.096-8.192-8.192-13.312-21.504-13.312-4.096 0-13.312 4.096-13.312 4.096l-64.512 64.512-72.704-94.208c0-8.192-8.192-13.312-17.408-13.312-8.192 0-13.312 4.096-17.408 8.192l0 0L183.296 811.008l0 0c-4.096 4.096-4.096 8.192-4.096 13.312 0 12.288 8.192 21.504 21.504 21.504l456.704 0c13.312 0 21.504-8.192 21.504-21.504C677.888 823.296 677.888 819.2 677.888 815.104L677.888 815.104zM238.592 801.792l128-192.512 64.512 94.208c4.096 8.192 8.192 12.288 17.408 12.288 4.096 0 13.312-4.096 13.312-4.096l64.512-64.512 94.208 153.6L238.592 800.768zM887.808 55.296 303.104 55.296c-47.104 0-84.992 37.888-84.992 84.992l0 21.504c0 13.312 8.192 21.504 21.504 21.504s21.504-13.312 21.504-25.6l0-21.504c0-21.504 17.408-43.008 43.008-43.008l584.704 0c21.504 0 43.008 17.408 43.008 43.008l0 584.704c0 21.504-17.408 43.008-43.008 43.008l-21.504 0c-13.312 0-21.504 8.192-21.504 21.504 0 12.288 8.192 21.504 21.504 21.504l21.504 0c47.104 0 84.992-37.888 84.992-84.992L973.824 136.192C968.704 89.088 933.888 55.296 887.808 55.296zM720.896 222.208 136.192 222.208C89.088 222.208 51.2 260.096 51.2 307.2l0 584.704c0 47.104 37.888 84.992 84.992 84.992l584.704 0c47.104 0 84.992-38.912 84.992-84.992L805.888 303.104C801.792 256 768 222.208 720.896 222.208zM763.904 887.808c0 21.504-17.408 43.008-43.008 43.008L136.192 930.816c-21.504 0-43.008-17.408-43.008-43.008L93.184 303.104c0-21.504 17.408-43.008 43.008-43.008l584.704 0c21.504 0 43.008 17.408 43.008 43.008L763.904 887.808z"
                        p-id="2509"
                        fill="#2c2c2c"
                      ></path>
                    </svg>
                  </div>
                  <div style="display: block; float: right">
                    <a-button
                      type="primary"
                      @click="handleSubmit"
                      :disabled="isNullOrEmpty(opinionArea)"
                      >提交</a-button
                    >
                    <a-button v-on:click="handleCloseDrawer">关闭</a-button>
                  </div>
                </div>

                <div id="pic_group" class="pic_group clearfix"></div>
              </li>
            </ul>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="问题构建列表">
          <div class="ag-draw-content">
            <a-collapse
              accordion
              v-for="item in gData"
              class="ant-collapse-pro"
              :key="item.key"
            >
              <a-collapse-panel :key="item.UniqueId" :header="item.Name">
                <a v-on:click="handleFlyTo(item)">
                  <p>构件名称 : {{ item.Name }}</p>
                </a>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </a-tab-pane>
      </a-tabs>
      <div class="ag-drawer-footer">
        <a-row>
          <a-col :span="12" align="center">
            <a-button type="primary" @click="handleNext(0)">上一条</a-button>
          </a-col>
          <a-col :span="12" align="center">
            <a-button type="primary" @click="handleNext(1)">下一条</a-button>
          </a-col>
        </a-row>
      </div>
    </a-drawer>

    <!-- 生成报告 -->
    <a-modal
      v-model="visibleReport"
      class="report-modal"
      title="模型名称"
      width="50%"
      :footer="null"
    >
      <ul class="mulbox">
        <li :class="{ active: isReActive }" @click="changeTab(true)">
          已采纳9(条)
        </li>
        <li :class="{ active: !isReActive }" @click="changeTab(false)">
          已忽略1(条)
        </li>
      </ul>
      <!-- <a-table
        :columns="columns1"
        :data-source="data"
        :pagination="false"
        :rowKey="(data) => data.id"
      ></a-table> -->
      <div style="margin: 10px; text-align: left; margin-left: 10%">
        项目名称：基础平台演示
      </div>
      <div style="margin: 10px; text-align: left; margin-left: 10%">
        设计单位: 奥格科技股份有限公司
      </div>
      <table align="center" e border="1" cellspacing="0" style="width: 80%">
        <tr>
          <th rowspan="2">专业</th>
          <th rowspan="2">建筑</th>
          <th>单位名称</th>
          <th>广州报业集团</th>
        </tr>
        <tr>
          <th>模型名称</th>
          <th>综合大楼</th>
        </tr>
        <tr>
          <td>序号</td>
          <td colspan="3">BIM 审查意见</td>
        </tr>
        <tr :key="arr" v-for="(arr, index) in data">
          <td>{{ index + 1 }}</td>
          <td align="left" colspan="3" style="padding-left: 10px">
            {{ arr.result }}
          </td>
        </tr>
      </table>

      <a-button @click="previewReport" type="primary" shape="round" size="large"
        >报告下载</a-button
      >
    </a-modal>
  </div>
</template>
<script>
let viewer = CIM.viewer;
let styleCondition = null;

import { CalculationStandard, isNullOrEmpty } from "./js/common";
import articleJson from "./data/articleJson.json";
import { Alert } from "ant-design-vue";
import axiosWraper from "@/views/js/net/axiosWraper";
// import component from "../BIMLayerTree/js/component";
import { Modal } from "ant-design-vue";
import Scnapshot from "./js/scnapshot";
import StyleCondition from "@/sdk/renderer/styleCondition";
import serve from "./serve/index";
import CreateProject from "./createProject";
import agRevitHelper from "@/sdk/bim/revitHelper";
import serverData4BIM from "@/views/js/net/serverData4BIM";

export default {
  components: {
    "create-project": CreateProject,
  },
  data() {
    return {
      gData: [],
      detailData: {
        type: "政策法规",
        basis:
          "消防电梯应分别设置在不同防火分区内，且每个防火分区不应少于1 台。",
        result:
          "不符合《建筑设计防火规范》第7.3.2条。如果建筑有防火分区，那么防火分区有消防电梯。",
        name: "5.6.3",
        method: "JZ563",
      },
      clickRow: 0, //点击审查结果table第几行
      options: [
        { label: "住宅设计规范", value: 1 },
        { label: "建筑抗震设计规范", value: 2 },
        { label: "建筑设计防火规范", value: 3 },
        { label: "建筑防排烟系统技术标准", value: 4 },
        { label: "人民防空地下室设计规范", value: 5 },
        { label: "公共建筑节能设计标准", value: 6 },
        { label: "中小学校设计规范", value: 7 },
        { label: "住宅建筑规范", value: 8 },
        { label: "消防给水及消防栓系统计算规范", value: 9 },
      ],
      classificationOptions: [
        { label: "政策法规", value: 0, color: "#ff0000" },
        { label: "强制性条文", value: 1, color: "#f2a646" },
        { label: "一般性条文（未列入审查要点）", value: 2, color: "#54b870" },
        { label: "一般性条文（列入审查要点）", value: 3, color: "#3a92f6" },
      ],
      columns: [
        {
          key: "name",
          slots: { title: "customTitle" },
          scopedSlots: { customRender: "name" },
        },
      ],
      columns1: [
        {
          title: "序号",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "审查结果",
          dataIndex: "result",
          key: "result",
        },
      ],
      selectOptions: [
        {
          value: 0,
          text: "已通过",
        },
        {
          value: 1,
          text: "未通过",
        },
      ],
      selected: 0,
      data: [],
      selectionCriteriaData: [],
      selectionCriteriaClassificationData: [],
      classificationTypeColorList: ["#ff0000", "#f2a646", "#54b870", "#3a92f6"],
      showResult: false,
      showDrawer: false,
      opinionArea: "",
      isActive: true,
      visibleReport: false,
      isReActive: true,
      tbWidth: document.body.clientWidth - 172 + "px",
      objectList: [
        { label: "GD综合大楼", value: "927ecdf5-7ccd-4655-8758-cd07bd61751d" },
      ],
      selectionNum: null, //选择规范统计
      selectionClassificationNum: null, //选择规范分类统计
      isHasSelect: false, //是否已搜索审查项目
      sourceId: null, //项目ID
      projectPanelShow: false,
    };
  },
  mounted() {
    this.handleBimCheckProject();
  },
  methods: {
    //新建审查项目
    createProject() {
      this.projectPanelShow = true;
    },
    //关闭新建项目面板
    closePanel() {
      this.projectPanelShow = false;
    },
    handleDropdownVisibleChange(open) {
      if (open) {
        this.objectList = null;
        this.handleBimCheckProject();
      }
    },
    //获取审查项目列表
    handleBimCheckProject() {
      serve.getBimCheckProject({ paramType: 2 }).then((ret) => {
        var result = [];
        ret = ret.content;
        for (let index = 0; index < ret.length; index++) {
          result.push({
            label: ret[index].name,
            value: ret[index].id,
            projectModels: ret[index].projectModels,
          });
        }
        this.objectList = result;
      });
    },
    //上一条下一条
    handleNext(type) {
      var newRow = 0;
      var _this = this;
      var selectNext = false; //是否触发服务器请求和更新Draw数据
      switch (type) {
        case 0:
          if (_this.clickRow != 0) {
            newRow = _this.clickRow - 1;
            _this.clickRow -= 1;
            selectNext = true;
          }
          break;
        case 1:
          if (_this.clickRow < this.data.length) {
            newRow = _this.clickRow + 1;
            _this.clickRow += 1;
            selectNext = true;
          }
          break;
      }
      if (selectNext == true) {
        let clickData = this.data[newRow];
        _this.detailData = clickData;
        _this.gData = [];
        _this.gData = JSON.parse(clickData.elements);
        if (
          document.getElementById("pic_group") != undefined &&
          document.getElementById("pic_group") != null
        ) {
          document.getElementById("pic_group").innerHTML = "";
        }
        this.opinionArea = "";
        serve
          .getImage({
            imgId: clickData.id,
            paramType: 2,
          })
          .then((ret) => {
            if (ret.content != undefined && ret.content != null) {
              this.opinionArea = ret.content[0].description;
              for (let index = 0; index < ret.content.length; index++) {
                this.getImgSrc(
                  "data:image/jpeg;base64," + ret.content[index].problemImg
                );
              }
            }
          });
      }
    },
    //审查依据Tab切换
    handleTabStatus() {},
    //选择规范数量
    handleOptionsTypeNum(type) {
      let result = "";
      if (this.isHasSelect == true) {
        var data = this.selectionNum.filter(
          (element) => element.classificationType == type
        );
        if (data != undefined && data.length > 0) {
          result = "(" + data[0].count + ")";
        } else {
          result = "(0)";
        }
      }

      return result;
    },
    //获取规范分类数量
    handleClassificationTypeNum(type) {
      let result = "";
      if (this.isHasSelect == true) {
        var data = this.selectionClassificationNum.filter(
          (element) => element.type == type
        );
        if (data != undefined && data.length > 0) {
          result = "(" + data[0].count + ")";
        } else {
          result = "(0)";
        }
      }

      return result;
    },
    checkObjectChange(value, extend) {
      // this.flyTo(value);
      var tempProjectModels = extend.data.attrs.extend;
      var addManyList = [];
      for (let i = 0; i < tempProjectModels.length; i++) {
        var nurl = "/systemFile/" + tempProjectModels[i].path;
        var option = {
          url: nurl,
        };
        var item = new Cesium.Cesium3DTileset(option);
      }
      var tileset = CIM.viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset(option)
      );
      tileset.readyPromise
        .then(function () {
          var boundingSphere = tileset.boundingSphere;
          CIM.viewer.camera.viewBoundingSphere(
            boundingSphere,
            new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius)
          );
          CIM.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        })
        .otherwise(function (error) {
          throw error;
        });
      var formData = new FormData();
      formData.append("paramType", 2);
      formData.append("sourceId", value);
      serve.getStatisticsUsingPOST(formData).then((ret) => {
        if (ret.success == true) {
          this.selectionNum = ret.content.classificationTypes;
          this.selectionClassificationNum = ret.content.types;
          this.sourceId = value;
          this.isHasSelect = true;
        }
      });
    },
    getImgSrc(url) {
      let _t = this;
      require("./css/index.css");
      var preview = function () {
        var oMask = document.createElement("div");
        oMask.id = "mask";
        var basePage = document.getElementsByClassName("base-page")[0];
        basePage.appendChild(oMask);
        var pic_model = document.createElement("div");
        pic_model.id = "pic_model";
        pic_model.className = "loginCon";
        pic_model.innerHTML =
          '<div><div id="pic_header">图片预览<span id="pic_close">X</span></div><div id="pic_content"><div id="pic_img"></div></div><div id="pic_footer"><button id="pic_delete">删除</button></div></div>';
        basePage.appendChild(pic_model);
        var pic_img2 = document.getElementById("pic_img");
        var img_pre = document.createElement("img");
        img_pre.id = "img_pre";
        img_pre.src = url;
        img_pre.style.width = "550px";
        img_pre.style.heigth = "550px";
        img_pre.style.top = "0px";
        img_pre.style.bottom = "0px";
        img_pre.style.left = "0px";
        img_pre.style.ritht = "0px";
        img_pre.style.margin = "auto";
        pic_img2.appendChild(img_pre);
        $("#img_pre").blowup({
          background: "#F39C12",
          width: 250,
          height: 250,
          scale: 2.5,
        });
        var oClose = document.getElementById("pic_close");
        oClose.onclick = function () {
          basePage.removeChild(oMask);
          basePage.removeChild(pic_model);
        };

        var oDelete = document.getElementById("pic_delete");
        oDelete.onclick = function () {
          basePage.removeChild(oMask);
          basePage.removeChild(pic_model);
          pic_group.removeChild(pic_div);
        };
      };

      var pic_group = document.getElementById("pic_group");
      var pic_div = document.createElement("div");
      pic_group.appendChild(pic_div);
      pic_div.className = "pic-item";
      // pic_div.addEventListener("click", preview, true);
      var pic_img = document.createElement("img");
      pic_img.className = "pic_img";
      pic_div.appendChild(pic_img);
      pic_img.style.width = "100px";
      pic_img.style.height = "auto";
      pic_img.src = url;
      //创建预览与删除元素
      let look_del = document.createElement("div");
      look_del.id = "look_del";
      pic_div.appendChild(look_del);
      let look = document.createElement("div");
      look.id = "look_del_look";
      let del = document.createElement("div");
      del.id = "look_del_del";
      look_del.appendChild(look);
      look_del.appendChild(del);

      pic_div.addEventListener(
        "mouseover",
        function () {
          pic_img.classList.add("pic_img_mark");
          look_del.style.display = "block";
        },
        false
      );
      pic_div.addEventListener(
        "mouseout",
        function () {
          pic_img.classList.remove("pic_img_mark");
          look_del.style.display = "none";
        },
        false
      );
      look.addEventListener("click", preview, true);
      del.addEventListener(
        "click",
        function () {
          pic_group.removeChild(pic_div);
        },
        true
      );
    },
    flyTo(id) {
      // CIM.layerTree.addMany([id]);
      CIM.layerTree.zoomToLayerById(id);
    },
    handleCloseDrawer() {
      this.showDrawer = false;
      this.gData = [];
    },
    handleReSet() {
      this.data = [];
      this.selectionCriteriaData = [];
      this.selectionCriteriaClassificationData = [];
      this.showResult = false;
    },
    handleChange(value) {
      this.handleSave();
    },
    // 点击保存
    handleSave() {
      if (isNullOrEmpty(this.selectionCriteriaData)) {
        Modal.warning({
          title: "请选择 '选择规范' ",
        });
      } else if (isNullOrEmpty(this.selectionCriteriaClassificationData)) {
        Modal.warning({
          title: "请选择 '选择规范分类' ",
        });
      } else {
        serve
          .getBimData({
            classificationType: this.selectionCriteriaData.toString(),
            type: this.selectionCriteriaClassificationData.toString(),
            status: this.selected,
            rows: 99999,
            sourceId: this.sourceId,
          })
          .then((ret) => {
            this.data = ret.content.rows;
            this.showResult = true;
          });
        // this.data = articleJson.filter(
        //   (element) =>
        //     this.selectionCriteriaClassificationData.indexOf(
        //       element.classificationType
        //     ) > -1 && element.status == this.selected
        // );
      }
    },
    handleRowClick(data, rowNum) {
      var _this = this;

      return {
        on: {
          click: async (ret) => {
            _this.clickRow = rowNum;
            _this.showDrawer = true;

            let clickData = _this.data.find(
              (element) => element.name == data.name
            );
            _this.detailData = clickData;
            _this.gData = [];
            _this.gData = JSON.parse(clickData.elements);
            if (
              document.getElementById("pic_group") != undefined &&
              document.getElementById("pic_group") != null
            ) {
              document.getElementById("pic_group").innerHTML = "";
            }
            this.opinionArea = "";
            serve
              .getImage({
                imgId: clickData.id,
                paramType: 2,
              })
              .then((ret) => {
                if (ret.content != undefined && ret.content != null) {
                  this.opinionArea = ret.content[0].description;
                  for (let index = 0; index < ret.content.length; index++) {
                    this.getImgSrc(
                      "data:image/jpeg;base64," + ret.content[index].problemImg
                    );
                  }
                }
              });
          },
        },
      };
    },
    handleClose() {
      this.gData = [];
    },
    handleFlyTo(data) {
      var tilesets = CIM.viewer.scene.primitives._primitives;
      var tileset;
      tilesets.forEach((element) => {
        if (
          element.agMetaData != undefined &&
          element.agMetaData.id == "927ecdf5-7ccd-4655-8758-cd07bd61751d"
        ) {
          tileset = element;
        }
      });
      serverData4BIM.getProperty("agcim3dentity_a", data.id).then((res) => {
        if (!res.success) return;
        styleCondition.resetVisible(false);
        styleCondition.resetColorStyle();
        if (res.content[0].infotype == "LevelInfo") {
          var con = `\${level} === '${res.content[0].name}'`;

          styleCondition.addShowCondition(con);
          // component.flyTo(data.Id, tileset, "Level", false);

          agRevitHelper.flyTo(res.content[0], tileset, "Level", CIM.viewer);
        } else if (res.content[0].infotype == "ElementInfo") {
          var con = `\${level} === '${res.content[0].level}'`;
          var condition = "${name} === '" + data.Id + "'";

         
          styleCondition.addColorStyle(condition, "#FF0000");
          agStyleCondition.addShowCondition(con);
          //component.flyTo(data.Id, tileset, "element", false);

          agRevitHelper.flyTo(res.content[0], tileset, "element", CIM.viewer);
        } else if (res.content[0].infotype == "RoomInfo") {
          var con = `\${level} === '${res.content[0].level}'`;
          agStyleCondition.addShowCondition(con);
          //component.flyTo(data.Id, tileset, "Room", false);

          agRevitHelper.flyTo(res.content[0], tileset, "Room", CIM.viewer);
        }
      });
    },
    isNullOrEmpty(_data) {
      return (
        _data === undefined ||
        _data === "" ||
        _data === null ||
        _data.length === 0
      );
    },
    onToggleBox() {
      this.isActive = !this.isActive;
    },
    createReport() {
      this.visibleReport = true;
    },
    //上传PDF
    async previewReport() {
      //this.$message.info("待请求接口,PDF预览");
      var perview = await serve
        .pdfPreview({
          checkResultList: this.data.map((e) => {
            return e.result;
          }),
          cityName: "广州市建筑工程",
          designCompany: "奥格科技股份有限公司",
          projectName: "基础平台演示",
        })
        .then(async (e) => {
          await serve
            .pdfDownload(encodeURIComponent(e.content.replace(/\\/g, "/")))
            .then((res) => {
              // var blob = new Blob([res.data]),
              //   fileName = "text.pdf";
              // this.downLoad(blob, fileName);
            });
        });
    },
    downLoad(blob, fileName) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    },
    changeTab(e) {
      this.isReActive = e;
    },
    snapshot() {
      Scnapshot.initialize();
    },
    handleSubmit() {
      var formData = new FormData();
      let imgs = document.getElementsByClassName("pic_img");
      for (var i = 0; i < imgs.length; i++) {
        var img_url = imgs[i].src;
        let file = new window.File([this.dataURItoBlob(img_url)], "123123123");
        formData.append("files", file);
      }
      formData.append("description", this.opinionArea);
      formData.append("imgId", this.detailData.id);
      serve.imgUpLoad(formData).then((ret) => {
        this.$message.success("保存成功");
      });
    },
    dataURItoBlob(base64Data) {
      var byteString;
      if (base64Data.split(",")[0].indexOf("base64") >= 0)
        byteString = atob(base64Data.split(",")[1]);
      else byteString = unescape(base64Data.split(",")[1]);
      var type = base64Data.split(",")[0].split(":")[1].split(";")[0];
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      // canvas.toDataURL 返回的默认格式是 image/png
      return new Blob([ia], { type: type });
    },
  },
  watch: {
    showDrawer: function (val) {
      if (val) {
        this.tbWidth = document.body.clientWidth - 172 - 360 + "px";
      } else {
        this.tbWidth = document.body.clientWidth - 172 + "px";
      }
    },
  },
  destroyed() {},
};
</script>
<style src="./css/index.css" scoped></style>
