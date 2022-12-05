<template>
  <ag-popup
    v-model="visible"
    title="经济技术指标"
    @onCancel="onCancel"
    class="info-box1"
  >
    <div class="list-box vscroll">
      <ul class="bar-ul">
        <li v-for="item in tableList" :key="item[0]">
          <div class="infotable">
            <tr>
              <td class="td-title">{{ item[0] }}</td>
              <td class="td-info">{{ item[1] }}</td>
            </tr>
          </div>
        </li>
      </ul>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: {
    "ag-popup": AgPopup,
  },
  props: ["visible"],
  data() {
    return {
      tableList: [
        ["建设用地面积", "6000m²"],
        ["总建筑面积", "40388.66m²"],
        ["建筑面积", "25414.75m²"],
        ["基底面积", "1635.88m²"],
        ["建筑密度", "27.26%"],
        ["建筑容积率", "4.24"],
        ["绿化率", "32.61%"],
        ["道路面积率", "20.26%"],
        ["建筑占地面积", "1635.88m²"],
        ["停车位个数", "220个"],
      ],
    };
  },
  mounted() {},
  methods: {
    onCancel() {
      this.$emit("close", { code: "AttributeEnquiry" });
      this.$emit("closeEconomicPanel", false);
    },
  },
};
</script>
<style scoped>
.info-box1 {
  position: absolute;
  width: 480px;
  height: 300px;
  top: 45px;
  right: 10px;
}
.infotable tr td {
  border: 1px solid;
  padding: 10px;
}
.td-title {
  width: 110px;
}
.td-info {
  width: 110px;
}
.list-box {
  overflow: auto;
  padding: 20px;
}
.bar-ul {
  margin: 0px;
  padding: 0;
}
.bar-ul li {
  float: left;
  list-style-type: none;
}
</style>
