<!--
 * @Author: your name
 * @Date: 2020-12-24 22:21:45
 * @LastEditTime: 2021-01-28 10:45:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agcimViewer\src\widgets\SunshineCalculation\components\windowsPanel.vue
-->
<template>
  <ag-popup
    v-model="visible"
    :title="title"
    @onCancel="onCancel"
    class="infoBox-select-windows"
  >
    <div class="select-windows">
      <div class="select-windows-content">
        <label>
          1、鼠标左键点击选择窗户及采样点位置；
          <br />
          2、再次鼠标左键点击取消窗户选择。
        </label>
      </div>
      <div class="select-windows-footer">
        <a-button @click="getModel">获取模型</a-button>
        <a-button @click="getAllWindows">获取全部窗口</a-button>
        <a-button @click="deselectAll">取消</a-button>
      </div>
    </div>
  </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: { "ag-popup": AgPopup },
  props: ["visible"],
  data() {
    return {
      title: "选择要分析的窗户",
    };
  },
  methods: {
    getModel() {
      this.$emit("getModel");
    },
    getAllWindows() {
      this.$emit("getAllWindows");
    },
    deselectAll() {
      this.$emit("deselectAll", false);
    },
    onCancel() {
      this.$emit("hideModel", false);
    },
  },
};
</script>

<style scoped>
.infoBox-select-windows {
  width: 300px;
  height: auto;
}

.infoBox-select-windows .select-windows {
  padding: 10px;
}

.select-windows .select-windows-footer {
  text-align: center;
}

.select-windows .select-windows-footer button {
  margin-top: 10px;
  margin-right: 5px;
}

.select-windows .select-windows-footer button:last-child {
  margin-right: 0px;
}
</style>