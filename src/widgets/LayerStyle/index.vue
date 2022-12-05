<template>
  <ag-popup v-model="layerVisible" :title="title" confirm confirmVal="保存" cancel cancelVal="取消" @onConfirm="onConfirm" @onCancel="onCancel" class="popup-box">
    <div class="stylePanle" ref="styleItemBox" @click="handleClick">
      <div class="styleContent">
        <textarea class="contentDiv vscroll" v-model="styleJson"></textarea>
        <button class="ant-btn ant-btn-primary ant-btn-sm btn-newstyle" @click="formatJson">格式化</button>
        <button class="ant-btn ant-btn-primary ant-btn-sm btn-newstyle" @click="saveAsNewStyle()">另存为新样式</button>
        <button class="ant-btn ant-btn-primary ant-btn-sm btn-application" @click="application()">应用</button>
      </div>
      <div class="styleItem vscroll">
        <div v-for="item in jsonData" :key="item.id" class="list" @click="handleTypeClick(item)" @contextmenu.prevent="openSetMenu($event,item)">
          <div class="img" :title="item.name">
            <img :src="item.img" width="100%" height="100%" />
          </div>
          <div v-if="item.name!=curStyleObj.name" class="title">{{item.name}}</div>
          <input v-if="item.name==curStyleObj.name" type="text" v-model="item.name" class="titleIpt" @blur="update()" />
        </div>
      </div>
      <!-- 右键菜单 -->
      <div class="rt-menu-box" ref="rtMenuBox" v-show="isRtMenuShow">
        <ul>
          <li v-for="item in rtMenuList" :key="item.key" @click="handleMemuEvent(item.key)">
            <span>{{item.name}}</span>
          </li>
        </ul>
      </div>
    </div>
  </ag-popup>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import axios from "@/views/js/net/http";
import canvas2Image from "@/views/js/extension/canvas2Image.js";
import agDomNode from "@/sdk/ui/domNode";
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      disabled: true,
      curStyleObj: {},
      layerVisible: false,
      styleJson: "",
      // 样式列表
      jsonData: [],
      //右键菜单是否显示
      isRtMenuShow: false,
      //右键菜单列表
      rtMenuList: [
        // { index: "0", name: "重命名", key: "updateName", popconfirm: false },
        {
          index: "1",
          name: "更新缩略图",
          key: "updateThumbnail",
          popconfirm: true,
        },
        { index: "2", name: "删除", key: "delete", popconfirm: true },
      ], 
      layer: {},
    };
  },
  mounted() {
    //
  },
  methods: {
    ondisabled() {
      this.disabled = false;
    },
    async getstyleConfigList() {
      this.jsonData = [];
      let name = this.layer.text.indexOf('水域') > -1 ? '水域' : '';
      let res1 = await axiosWraper.getData(
        `/agsupport-rest/agsupport/configManager/styleConfig/find`,
        {
          page: 0,
          rows: 100,
          name: name,
          layerType: this.layer.layerType,
        }
      );
      if (res1.success) {
        let arr = res1.content.rows;
        for (let i = 0; i < arr.length; i++) {
          let o = arr[i];
          if (o.viewImg && o.viewImg.indexOf(";base64,") == -1) {
            o.img = "data:image/png;base64," + arr[i].viewImg;
          } else {
            o.img = arr[i].viewImg;
          }
          this.jsonData.push(o);
        }
      }
    },
    onShow(node) {
      this.layer = node;
      this.getstyleConfigList();

      this.layerVisible = true;
      var arr = CIM.viewer.scene.primitives._primitives;
      this.curLayer = [];
      for (let j = 0; j < arr.length; j++) {
        let o = arr[j].agMetaData;
        if (o && o.id === this.layer.id) {
          this.curLayer.push(arr[j]);
        }
      }
    },
    onConfirm() {
      this.curStyleObj.layerId = this.layer.id;
      this.update("2");
    },
    onCancel() {
      this.layerVisible = false;
    },
    handleClick(e) {
      this.isRtMenuShow = false;
      let classItem = e.target.getAttribute("class");
      if (classItem && classItem.indexOf("styleItem") !== -1) {
        // this.resetListShow();
      }
    },
    handleTypeClick(item) {
      this.curStyleObj = item;
      this.styleJson = item.information;
      this.isRtMenuShow = false;
    },
    // 另存为新样式
    async saveAsNewStyle() {
      let genimg = canvas2Image.capturePng(CIM.viewer, "200");
      var param = new FormData();
      param.append("name", "新建_"+this.layer.text);
      param.append("layerType", this.layer.layerType);
      param.append("viewImg", genimg.src);
      param.append("information", this.styleJson);
      let res = await axios.post(
        `/agsupport-rest/agsupport/configManager/styleConfig/add`,
        param
      );
      if (res.success) {
        this.getstyleConfigList();
      }
    },
    delHtmlTag(str) {
      return str
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, "")
        .replace("var style =", "")
        .replace("var style = ", "")
        .replace(/&gt;/g, ">"); //去掉所有的html标记
    },
    application() {
      let vm = this;
      let v = this.styleJson;
      if (v.indexOf("{") == 0) {
        for (var i = 0; i < this.curLayer.length; i++) {
          if (this.curLayer[i] instanceof Cesium.Cesium3DTileset) {
            let style = new Cesium.Cesium3DTileStyle(JSON.parse(v));
            if (this.curLayer[i]) {
              this.curLayer[i].style = style;
              //待移除shader--------------
            }
          } else {
            let baseWaterColor = JSON.parse(v).waters.baseWaterColor;
            this.curLayer[i].appearance.material.uniforms.baseWaterColor = eval(baseWaterColor);
          }
        }
      } else {
        //动态光
        this.curLayer[0].style = null;
        vm.setCustomShader(this.curLayer[0], v);
      }
    },
    setCustomShader(tileset, fs) {
      tileset.tileVisible.addEventListener(function (tile) {
        let content = tile.content;
        for (let i = 0; i < content.featuresLength; i++) {
          let feature = content.getFeature(i);
          let model = feature.content._model;
          if (this._properties && this._properties.length) {
            this._properties.forEach((property) => {
              if (
                feature.hasProperty(property["key"]) &&
                feature.getProperty(property["key"]) === property["keyValue"]
              ) {
                feature.setProperty(
                  property["propertyName"],
                  property["propertyValue"]
                );
              }
            });
          }
          if (
            fs &&
            model &&
            model._sourcePrograms &&
            model._rendererResources
          ) {
            Object.keys(model._sourcePrograms).forEach((key) => {
              let program = model._sourcePrograms[key];
              model._rendererResources.sourceShaders[
                program.fragmentShader
              ] = fs;
            });
            model._shouldRegenerateShaders = true;
          }
        }
      }, this);
    },
    openSetMenu(e, item) {
      this.getMenuPosition(e);
      this.curItem = item;
    },
    //确定菜单位置
    getMenuPosition: function (event) {
      this.isRtMenuShow = true;
      this.$refs.rtMenuBox.style.left = event.clientX + "px";
      this.$refs.rtMenuBox.style.top = event.clientY + "px";
    },
    // 点击右键列事件
    handleMemuEvent(key) {
      this.isRtMenuShow = false;
      this[key]();
    },
    //修改
    async update(paramType = 1) {
      this.curStyleObj.information = this.styleJson;
      this.disabled = true;
      var param = new FormData();
      for (let i in this.curStyleObj) {
        if (i == "createTime" || i == "modifyTime") {
          param.append(i, "");
        } else {
          param.append(i, this.curStyleObj[i]);
        }
      }
      param.append("paramType", paramType);
      let res = await axios.post(
        `/agsupport-rest/agsupport/configManager/styleConfig/update`,
        param
      );
      if (res.success) {
        this.getstyleConfigList();
        this.$message.success("修改成功");
      }
    },
    updateName() {
      this.disabled = false;
    },
    // 更新缩略图
    updateThumbnail() {
      let genimg = canvas2Image.capturePng(CIM.viewer, "200");
      this.curStyleObj.viewImg = genimg.src;
      this.update();
    },
    // 删除
    delete() {
      let vm = this;
      this.$confirm({
        title: "提示",
        content: "确认删除？删除不可恢复！",
        okText: "确认",
        cancelText: "取消",
        async onOk() {
          let res = await axios.delete(
            `/agsupport-rest/agsupport/configManager/styleConfig/delete?ids=` +
              vm.curStyleObj.id
          );
          if (res.success) {
            vm.$message.success("删除成功");
            vm.getstyleConfigList();
          }
        },
      });
    },
    formatJson(str) {
      if (this.styleJson) {
        var tt = JSON.stringify(JSON.parse(this.styleJson), null, "\t");
        this.styleJson = tt;
      }
    },
  },
  computed: {
    title: function () {
      return "图层样式 - " + this.layer.nameCn;
    },
  },
};
</script>
<style scoped>
.popup-box {
  width: 650px;
}
.stylePanle {
  width: 650px;
  height: 250px;
  border-bottom: 1px solid #ccc;
}
.styleContent {
  width: 310px;
  height: 250px;
  padding: 5px;
  float: left;
}
.contentDiv {
  width: 300px;
  height: 200px;
  color: #333;
  background: rgba(212, 211, 211, 0.3);
  overflow-y: auto;
}
.contentDiv code {
  font-size: 12px;
}
.styleItem {
  width: 330px;
  height: 200px;
  display: inline-block;
  overflow-y: auto;
  position: relative;
}
.styleItem .list {
  width: 80px;
  height: 100px;
  padding: 5px;
  cursor: pointer;
  float: left;
}
.styleItem .list .img {
  width: 70px;
  height: 70px;
  border: 1px solid #fff;
  border-radius: 2px;
  overflow: hidden;
}
.styleItem .list .img:hover {
  border: 1px solid #fcf;
}
.styleItem .list .title,
.styleItem .list .titleIpt {
  width: 70px;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-all;
}
.styleItem .list .titleIpt {
  border: none;
  background: rgba(0, 0, 0, 0.05);
}
/* 菜单树右侧鼠标菜单 */
.rt-menu-box {
  position: fixed;
  z-index: 90;
  min-width: 120px;
  background-color: #fff;
  -webkit-box-shadow: 0px 1px 15px 1px rgba(69, 65, 78, 0.18);
  box-shadow: 0px 1px 15px 1px rgba(69, 65, 78, 0.18);
}

.rt-menu-box ul {
  padding: 10px 0;
  margin: 0;
}

.rt-menu-box li {
  list-style-type: none;
}

.rt-menu-box span {
  display: block;
  color: #595959;
  height: 28px;
  line-height: 28px;
  font-size: 12px;
  font-family: inherit;
  background: #fff;
  border: 0px;
  border-radius: 1px;
  padding: 0 30px;
}

.rt-menu-box span:hover {
  color: #fff;
  background: #36a3f7;
  cursor: pointer;
}

.rt-menu-box span i {
  margin-right: 10px;
}
.styleContent button {
  margin: 10px 5px 0px 5px;
}
</style>