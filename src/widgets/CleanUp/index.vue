<!--
 * @author: 张瀚
 * @description: 清理工具
 * @Futures: 
 * 1、增加其他类型的清理，例如数据源等
-->
<template>
  <div></div>
</template>

<script>
import cleanUpTool from "@/adk/cleanUpTool.js";
export default {
  computed: {},
  mounted() {
    cleanUpTool.removeAll(CIM.viewer)
    this.$emit("close", { code: "CleanUp" });
  },
};
</script>