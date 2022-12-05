<template>
  <div class="area-page">
    <div class="h4">区域通风分析</div>
    <div class="item" style="border-top: 1px solid rgba(128, 128, 128, 0.37);">
      <p>透明度</p>
      <a-slider
        id="test"
        :min="0"
        :max="1"
        :step="0.01"
        style="width:37%"
        v-model="opacity"
        @change="changeOpacity"
      />
    </div>

    <div class="item">
      <p>风向分析</p>
      <div class="DictCom">
        <div class="ventDict">
          <a-icon
            title="西北风"
            type="double-left"
            @click="changeDirection('windNW.png')"
            :rotate="225"
          />
          <a-icon
            title="北风"
            type="double-left"
            @click="changeDirection('windN.png')"
            :rotate="270"
          />
          <a-icon
            title="东北风"
            type="double-left"
            @click="changeDirection('windNE.png')"
            :rotate="315"
          />
        </div>
        <div class="ventDict">
          <a-icon
            title="西风"
            type="double-left"
            @click="changeDirection('windW.png')"
            :rotate="180"
          />
          <a-icon type="stop" @click="changeDirection('result.png')" spin />
          <a-icon
            title="东风"
            type="double-left"
            @click="changeDirection('windE.png')"
          />
        </div>
        <div class="ventDict">
          <a-icon
            title="西南风"
            type="double-left"
            @click="changeDirection('windSW.png')"
            :rotate="135"
          />
          <a-icon
            title="南风"
            type="double-left"
            @click="changeDirection('windS.png')"
            :rotate="90"
          />
          <a-icon
            title="东南风"
            type="double-left"
            @click="changeDirection('windSE.png')"
            :rotate="45"
          />
        </div>
      </div>
    </div>

    <div class="h4">房屋列表</div>
    <div class="bditem">
      <table
        class="bdtable"
        style="border-top: 1px solid rgba(128, 128, 128, 0.37);"
      >
        <td>小区名称</td>
        <td>楼号</td>
        <td>缩略图</td>
        <td>详情</td>
      </table>
      <table v-for="bding in bdlist" :key="bding.bdid" class="bdtable">
        <td>{{ idName }}</td>
        <td>{{ bding.bdnum }}栋</td>
        <td>
          <img width="70px" height="90px" :src="bding.imglink" />
        </td>
        <td>
          <a v-on:click="sendBdMsgToIndex">查看</a>
        </td>
      </table>
    </div>
  </div>
</template>

<script>
import agRenderer from "@/sdk/renderer/renderer";

export default {
  props: ["idName", "currentCommunity", "currentCommunityLG"],
  data() {
    return {
      opacity: 1,
      // ventimg: require("../img/ventals.png"),
      bdlist: [
        {
          bdid: "1",
          bdnum: "A1",
          imglink: require("./img/A1.png"),
        },
      ],
    };
  },
  methods: {
    sendMsgToIndex() {
      this.$emit("backToIndex", "isVentilation");
    },
    sendBdMsgToIndex() {
      this.$emit("backToIndex", "isBuilding");
    },
    changeDirection(dict) {
      agRenderer.setMaterialFromImage(
        this.currentCommunity,
        require("./img/" + dict)
      );
    },
    changeOpacity() {
      agRenderer.setOpacity(this.currentCommunity, this.opacity);
    },
  },
  destroyed() {
  },
};
</script>

<style scoped src="./css/area.css"></style>
