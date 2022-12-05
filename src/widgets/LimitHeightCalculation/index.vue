
<!--
 * @author: pwz（潘文周）
 * @description:  限高计算
-->
<template>
  <div class="limitHeight">
    <div class="gap">
      <p>在此两点的连线上选取要计算的建筑物的计算点位置，计算此连线下建筑的可以建造的临界高度。</p>
    </div>
    <div class="btn-group gap">
      <a-button type="primary" class="left" @click="selectStartAndEndPoint">选取景观点和参照点</a-button>
      <a-button type="primary" class="right" @click="selecteComputerPoints">选取计算点</a-button>
    </div>
    <div class="gap" v-show="tableArr.length>0">
      <span>分析列表</span>
      <a-button type="danger" ghost class="right clear" @click="clear">清除</a-button>
      <a-table :columns="columns" :data-source="tableArr" :rowKey="data => data.height" :scroll="{ y: 400 }" size="small" align="center" class="table">
      </a-table>
    </div>
  </div>
</template>

<script>
import LimitHeightCalculation from "@/adk/LimitHeight.js";
let viewer = CIM.viewer;
let limitHeightCalculation = new LimitHeightCalculation(viewer);
const columns = [
  {
    title: "研究点名称",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
  },
  {
    title: "相对距离(m)",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "限高(m)",
    dataIndex: "height",
  },
];
export default {
  components: {},
  props: {},
  data() {
    return {
      columns,
      tableArr: [],
    };
  },
  created() {},
  mounted() {},
  destroyed() {},
  computed: {},
  watch: {},
  methods: {
    //选择景观点和参照点
    selectStartAndEndPoint() {
      console.log(limitHeightCalculation.pickStartAndEndPoint());
    },
    //选择计算点
    selecteComputerPoints() {
      limitHeightCalculation
        .pickComputePoint().then(computeArray => {
        }, err => {
          this.$message.info("请在观景点与参照点的连线上选取计算点")
        })
    },
    //清除
    clear() {
      limitHeightCalculation.clear();
      this.tableArr = [];
    },
  },
};
</script>

<style  scoped>
.limitHeight {
  padding: 0 10px;
}
.btn-group {
  text-align: center;
}
.btn-group .left {
  margin-right: 10px;
}
.gap {
  margin: 10px 0;
}
.clear {
  float: right;
  margin-right: 20px;
}
</style>