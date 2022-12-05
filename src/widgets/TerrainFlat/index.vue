<template></template>
<script>
import startsup from "./startsUp";
import TerrainFlattening from "./index";
export default {
  mounted() {
    TerrainFlattening.init(CIM.viewer);
  }
};
</script>
 