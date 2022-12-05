<!--
 * @author: 张瀚
 * @description: 后一视角
-->
<template>
  <div></div>
</template>

<script>

export default {
  mounted() {
    CIM.cameraRecord.nextView().then(undefined,()=>{
      this.$message.warning("这是最后一个视角，不能再后退了！");
    });
    this.$emit("close", {code: "NextView"});
  }
}
</script>

<style scoped></style>