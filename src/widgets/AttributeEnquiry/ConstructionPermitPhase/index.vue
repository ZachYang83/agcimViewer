<template>
<!-- 工程建设许可阶段 -->
  <div class="list-box vscroll">
    <ul class="bar-ul">
      <li v-for="item in table" :key="item[0]">
        <div class="infotable">
          <tr>
            <td class="td-title">{{item[0]}}</td>
            <td class="td-info">{{item[1]}}</td>
          </tr>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import ConstructionPermitPhase from "./js/ConstructionPermitPhase.json";
export default {
  data() {
    return {
      name: [],
      info: [],
      table: []
    };
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      let table = [];
      for (let key in ConstructionPermitPhase) {
        table.push([key, ConstructionPermitPhase[key]])
      }
      this.table = table;
    }
  }
}
</script>
<style scoped>
.infotable tr td {
  border: 1px solid;
  padding: 15px;
  height: 95px;
}
.td-title {
  width: 120px;
}
.td-info {
  width: 235px;
}
.list-box {
  overflow: auto;
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