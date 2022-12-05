<!--
 * @author: 张瀚
 * @description: 顶视图
-->
<template>
  <div></div>
</template>

<script>
import coordinate from "@/sdk/maths/coordinate.js";
import TopView from "./js/topView.js";
let topView = new TopView( CIM.viewer);
export default {
  components: {},
  props: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    topView.topView().then(()=>{
      this.$emit("close", { code: "TopView" })
    })
    this.$message.info("视角已经锁定为顶视图，左键双击可以退出",5)
  },
  destroyed() {
    topView.close()
  },
  computed: {},
  watch: {},
  methods: {},
};
</script>

<style scoped>
</style>