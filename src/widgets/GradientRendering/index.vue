<template>
  <div class="rendering-info">
    <p>可根据模型中的字段属性，按分级对白膜进行梯度的渲染</p>
    <a-divider />
    <p class="title-font">应用范围设定</p>
    <div class="layer-selection-body">
      <div class="layer-selection">
        <p class="layer-selection-font">图层选择:</p>
      </div>
      <div class="layer-selection">
        <a-select style="width: 140px" @change="handleChange">
          <a-select-option v-for="(item, index) in layersName" :key="index" :value="index">
            {{ item }}
          </a-select-option>
        </a-select>
        <a-button type="primary" icon="edit" class="layer-selection-button" @click="pickModel">拾取</a-button>
      </div>
    </div>
    <div class="layer-selection-body">
      <div class="layer-selection">
        <p class="layer-selection-field">字段:</p>
      </div>
      <div class="layer-selection">
        <a-select style="width: 140px" @change="fieldChange" placeholder="请选择渲染属性" >
          <a-select-option v-for="(item, index) in fieldName" :key="index" :value="index">
            {{ item }}
          </a-select-option>
        </a-select>
        <a-button type="primary" class="layer-selection-button" @click="hiddenOrOpenColorBox(colorBox ? '关闭' : '选择色带')">
          {{ this.colorBox ? '关闭' : '选择色带' }}
        </a-button>
      </div>
    </div>
    <div class="layui-inline" v-show="colorBox">
      <div id="blendColorPicker">
        <div @click="getColorValue($event,index)" v-for="(item, index) in dataList" :key="index" :id="item.id" :class="[item.id === colorVal ? 'blendColorPickerClick':'']" :style="{background:spliceColor(index,'top')}">
      </div>
      </div>
    </div>

    <div class="layer-selection-range" v-show="xcolorSlider">
      <div class="layer-selection">
        <p>选择色带条:</p>
      </div>
      <div>
        <div class="colorSliderX" :style="{background:classObj}"></div>
      </div>
    </div>

    <div class="layer-selection-range">
      <div class="layer-selection">
        <p>设置色差值:</p>
      </div>
      <div>
        <a-slider :default-value="100" :min="colorSliderMin" :max="colorSliderMax" v-model="colorSlideVal" @change="changeColorSlideVal" />
      </div>
    </div>
    <div class="layer-selection-range">
      <div class="layer-selection">
        <p>设置透明度:</p>
      </div>
      <div>
        <a-slider id="buildingOpacity" :min="0" :max="1" :step="0.1" :default-value="1" v-model="buildingOpacity" @change="modelRendering" />
      </div>
    </div>
    <p class="title-font">应用</p>
    <div class="button-info">
      <div class="button-info-application" v-if="false">
        <a-button type="primary" @click="modelRendering">应用</a-button>
      </div>
      <div class="button-info-clear">
        <a-button type="primary" @click="clear">清除</a-button>
      </div>
    </div>
    <a-table :columns="columns" :data-source="data" :pagination="{ pageSize: 10 }" :scroll="{ y: 240 }" :bordered="true" v-show="isShowResults" />
  </div>
</template>

<script>

import GradientRendering from "./js/gradientRendering.js";
import initPoaLayer from "./js/config.js";
import RenderColor from "./js/renderColor.js";
let model = null;
let viewer = CIM.viewer;
let gradientRendering = new GradientRendering(viewer);
const columns = [
  {
    title: "字段范围",
    dataIndex: "fieldsRange",
    width: 150,
  },
  {
    title: "建筑量",
    dataIndex: "amountConstruction",
  },
];
const data = [];
const appData = require('./json/color.json');
const dataList = appData.colorData;
let renderColor = new RenderColor({
  viewer,
  dataList
});

export default {
  data() {
    return {
      data,
      columns,
      dataList,
      value: "1",
      fieldName: [],//渲染字段数组
      layersName: [],//拾取图层对象集合
      colorVal: "",//选择色带的ID
      colorTargetInfo: "",//选择色带的样式对象
      colorBox: false,   //色带是否展示
      isShowResults: false, //渲染结果是否展示
      buildingOpacity: 1,  //设置透明度值
      colorSliderMin: 0,   //色差值的最小值
      colorSliderMax: 500, //色差值得最大值
      colorSlideVal: 0,    //当前色差值
      classObj: "",        //待渲染的样式对象
     // percentage: 0,
     // avgePerce: 0,
     // tmpDataList: [],
      propertyName: "",  //选取的渲染字段
      xcolorSlider:false, //水平方向色带是否展示
    };
  },
  mounted() {
    agcim.ui.widgetConfigHelper.setInitSence(initPoaLayer, viewer);
  },
  created() {},
  methods: {
    modelRendering() {
      if (this.colorTargetInfo == "") return;
      gradientRendering.modelRendering({
        propertyName: this.propertyName, //用于梯度渲染的字段
        colorSlideVal: this.colorSlideVal, //设置色差值滑块值
        colorSliderMax: this.colorSliderMax, //设置色差值滑块最大值
        colorTargetInfo: this.colorTargetInfo, //设置颜色色带对象
        buildingOpacity: this.buildingOpacity, //设置建筑渲染颜色透明度
      });
      // this.data = gradientRendering.data;
      this.isShowResults = true;
    },
    // 控制色带盒子的显隐
    hiddenOrOpenColorBox(btn) {
     /* if (btn === "选择色带") return;*/
      if (btn === "选择色带" && this.propertyName == "")
      {
          alert("请选择指定字段后再选择色带！");
          return;
      }
      if (btn === "关闭") {
        this.colorVal = "";
        this.colorTargetInfo = "";
        this.colorBox = false;
      }
      this.colorBox = !this.colorBox;
    },
    handleChange(value) {},
    //选择用于渲染的字段
    fieldChange(value) {
      //this.colorBox = true;
      this.propertyName = this.fieldName[value];
      if (value == 0) this.colorSliderMax = 500;
      if (value == 1) this.colorSliderMax = 10000;
    },
    // 获取选择的色带值,并将对应的色带信息高亮
    getColorValue(value, index) {
      this.colorVal = value.target.id;
      this.colorTargetInfo = this.dataList[index];
      this.classObj = this.spliceColor(index,'right');
      this.xcolorSlider = true;
      this.modelRendering();
    },
    //拼接颜色字符串
    spliceColor(index,type) {
      return renderColor.spliceColor(index,type);
    },
    //更改颜色带属性样式
    changeColorSlideVal() {
      //动态设置css样式属性
      this.classObj = renderColor.changeColorSlideVal({
        colorTargetInfo:this.colorTargetInfo,
        colorSlideVal:this.colorSlideVal,
        colorSliderMax:this.colorSliderMax,
        colorSliderMin:this.colorSliderMin,
      });
      //重新渲染白膜信息
      this.modelRendering();
    },
    //拾取白模对象
    pickModel() {
      gradientRendering.pickModel().then((data) => {
        this.layersName.push(data.name);
        this.fieldName = data.featureList;
        data = data.data;
      });
    },

    //清除
    clear() {
      this.isShowResults = false;
      this.colorVal = "";
      this.propertyName = "";
      this.fieldName = [];
      this.colorBox = false;
      this.xcolorSlider = false;
      gradientRendering.clear();
    },
  },
};
</script>

<style scoped src="./css/rendering.css"></style>