<template></template>
<script>
import AddLable from "./js/addLable";
export default {
  mounted() {
    AddLable.initialize(CIM.viewer);
  },
  destroyed() {
    AddLable.dispose();
  },
};
</script>
