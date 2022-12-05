<!--
 * @author: 张瀚
 * @description: 前一视角
-->
<template>
  <div></div>
</template>

<script>

export default {
  mounted() {
    CIM.cameraRecord.backView().then(undefined,()=>{
      this.$message.warning("这是第一个视角，不能再前进了！");
    });
    this.$emit("close", {code: "PreView"});
  }
}
</script>

<style scoped></style>