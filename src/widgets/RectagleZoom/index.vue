<!--
 * @author: 张瀚
 * @description: 框选放大功能
-->
<template>
  <div></div>
</template>

<script>
import RectagleZoom from '@/adk/RectagleZoom'
let agRectagleZoom = new RectagleZoom(CIM.viewer)
export default {
  mounted() {
    //启用框选功能
    agRectagleZoom.pickAndZoom({
      finishCallback: () => {
        this.$emit("close", { code: "RectagleZoom" })
      }
    })
    this.$message.info('左键单击框选放大，右键重选，左键双击退出功能', 5)
  },
  destroyed() {
    agRectagleZoom.cancel()
  },
}
</script>