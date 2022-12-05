<template>
  <div class="list-box vscroll">
    <ul class="bar-ul" >
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
import PlanningPermitPhase from "./js/PlanningPermitPhase.json";
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
      for (let key in PlanningPermitPhase) {
        table.push([key, PlanningPermitPhase[key]])
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
}
.td-title {
  width: 120px;
}
.td-info {
  width: 230px;
}
.list-box {
  height: 450px;
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