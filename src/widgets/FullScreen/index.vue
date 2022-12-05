<!--
 * @author: 谢小龙
 * @description: 全屏展示
-->
<template>
  <div></div>
</template>

<script>

import fullScreenTool from "@/adk/fullScreenTool.js";

export default {
  mounted() {
    fullScreenTool.toggleFullScreen()
    this.$emit("close", { code: "FullScreen" })
  },
}
</script>

<style scoped>
</style>