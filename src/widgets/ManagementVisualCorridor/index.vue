<!--
 * @author: 张瀚
 * @description: 视廊管控
 * @Bugs: 
 * 1、
 * @Futures: 
 * 1、
 * @Suggestion: 
 * 1、
-->
<template>
  <div class="render">
    <a-row type="flex" align="middle">
      <a-col :span="8">
        <h5>视廊类型：</h5>
      </a-col>
      <a-col :span="16">
        <a-select v-model="corridorType">
          <a-select-option :value="item.value" v-for="item in corridorTypeList" :key="item.value">
            {{item.name}}
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <roadVisualCorridor v-if="corridorType == 0"/>
    <landscapeVisualCorridor v-else/>
  </div>
</template>

<script>
import roadVisualCorridor from './roadVisualCorridor.vue'
import landscapeVisualCorridor from './landscapeVisualCorridor.vue'
export default {
  components: {
    roadVisualCorridor,
    landscapeVisualCorridor
  },
  props: {},
  data() {
    return {
      corridorTypeList: [{
        name: '道路视廊管控',
        value: 0
      }, {
        name: '景点视廊管控',
        value: 1
      }],
      corridorType:0
    };
  },
  created() {
  },
  mounted() { },
  destroyed() { },
  computed: {},
  watch: {},
  methods: {
  },
};
</script>
<style scoped>
.render {
  padding: 5px;
}
::v-deep .ant-col {
  margin-bottom: 5px;
}
::v-deep h5 {
  margin: 0;
}
::v-deep .visual-corrido-input,.ant-select {
  width: 140px;
  text-align: center;
}
</style>