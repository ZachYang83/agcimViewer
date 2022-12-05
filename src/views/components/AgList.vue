<!--
 * @author: 张瀚
 * @description: 文件描述
-->
<template>
  <div class="ag-list ag-scrollbar">
    <div v-for="(item,index) in dataList" :key="index">
      <slot :item="item" :index="index"></slot>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    dataList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {};
  },
  created() { },
  mounted() { },
  destroyed() { },
  computed: {},
  watch: {},
  methods: {},
};
</script>
<style scoped>
.ag-list {
  border: 1px solid #d9d9d9;
  border-radius: 5px;
}
.ag-list > div {
  border: 1px dashed #d9d9d9;
  border-width: 0 0 1px 0;
  padding: 10px;
}
.ag-list > div:last-child {
  border-style: solid;
}
</style>