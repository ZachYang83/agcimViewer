<!--
 * @Author: your name
 * @Date: 2020-12-16 09:14:19
 * @LastEditTime: 2020-12-17 11:22:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agKnowledgeCity\src\widgets\CoordinateQuery\index.vue
-->

<!--
 * @author: pwz（潘文周）
 * @description: 文件描述 坐标查询
-->
<template>
  <ag-popup v-model="visible" title="坐标查询" @onCancel="onCancel" class="infoBox">
    <div class="content">
      <div>通过单击场景选择一点查询WGS84坐标</div>
      <dl>
        <dt style="color:#f99d0d" class="result-msg">x：{{ x }}</dt>
        <dt style="color:#f99d0d" class="result-msg">y：{{ y }}</dt>
        <dt style="color:#f99d0d" class="result-msg">z：{{ z }}</dt>
      </dl>
      <div style="text-align:center">
        <a-button style="width:100px" type="primary" block @click="query">新测量</a-button>
      </div>
    </div>
  </ag-popup>
</template>
<script>
  import AgPopup from "@/views/components/AgPopup.vue";
  import CoordinateQuery from "./js/index.js";

  export default {
    components: { "ag-popup": AgPopup },
    data() {
      return {
        visible: true,
        x: "--",
        y: "--",
        z: "--",
      };
    },
    mounted() {CoordinateQuery.initialize(CIM.viewer, this); },
    methods: {
      query() {
        this.clearQuery();
        CoordinateQuery.initialize(CIM.viewer, this);
      },
      onCancel() {
        this.visible = false;
        this.$emit("close", { code: "CoordinateQuery" });
      },
      clearQuery() {
        CoordinateQuery.dispose()
        this.x = "--";
        this.y = "--";
        this.z = "--";
      },
    },
    destroyed() {
      CoordinateQuery.dispose()
    },
  };
</script>
<style scoped>
  .infoBox {
    width: 400px;
  }

  .infoBox .content {
    padding: 20px;
    line-height: 1.5;
    background: #fff;
  }

  .infoBox {
    margin-bottom: 20px;
    color: black;
  }

  .result-msg {
    margin: 10px 0 0 10px;
  }
</style>