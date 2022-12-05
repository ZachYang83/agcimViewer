<template>
  <a-descriptions title="" layout="vertical" bordered :column="1">
    <a-descriptions-item
      :label="item.name"
      v-for="item in propetyData"
      :key="item.key"
    >
      {{ item.value }}
    </a-descriptions-item>
  </a-descriptions>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
export default {
  props: ["selectPlanPropety"],
  data() {
    return {
      propetyData: [],
    };
  },
  mounted() {
    this.setPropety(this.selectPlanPropety);
  },
  watch: {
    selectPlanPropety(newV, oldV) {
      this.setPropety(newV);
    },
  },
  methods: {
    setPropety(data) {
      let result = [data];
      let arr = [];
      result.map((item) => {
        for (let ii in item) {
          let filterItem = {};
          filterItem.key = ii;
          filterItem.value = item[ii];
          switch (ii) {
            case "name":
              filterItem.name = "方案名称";
              arr.push(filterItem);
              break;
            case "landInfo":
              filterItem.name = "地块信息";
              arr.push(filterItem);
              break;
            case "createTime":
              filterItem.name = "创建时间";
              arr.push(filterItem);
              break;
            case "modifyTime":
              filterItem.name = "最后修改时间";
              arr.push(filterItem);
              break;
            case "isDefault":
              filterItem.name = "是否默认";
              arr.push(filterItem);
              break;
            case "description":
              filterItem.name = "方案简介";
              arr.push(filterItem);
              break;
          }
        }
      });
      this.propetyData = arr;
    },
  },
};
</script>
<style scoped>
.ant-descriptions-bordered .ant-descriptions-item-label {
  background-color: #fafafa;
  font-weight: 600;
  color: #686868;
}
</style>
