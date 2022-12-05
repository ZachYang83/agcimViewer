<!--
 * @author: 张瀚
 * @description: 定点环绕
-->
<template>
  <div></div>
</template>
<script>
import FixedPointSurround from "@/adk/FixedPointSurround";
var agFixedPointSurround = new FixedPointSurround(CIM.viewer);
export default {
  mounted() {
    agFixedPointSurround.pickAndSurround().then(() => {
      this.$emit("close", { code: "FixedPointRoaming" })
    })
    this.$message.info("左键选择地点开启定点环视，右键单击退出", 5)
  },
  destroyed() {
    agFixedPointSurround.cancel()
  },
};
</script>