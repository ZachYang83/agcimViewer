<template>
  <div class="item">
    <h4 :title="value.name">{{value.name}}</h4>
    <img :src="value.img" :alt="value.name" /> 
    <div class="btm">
      <div class="btn active" v-on:click="choose(value)">选择</div>
      <div class="btn" v-on:click="detail(value)">预览</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  methods: {
    choose(o) {
      this.$emit("choose", o);
    },
    detail(o) {
      this.$emit("detail", o);
    },
  },
};
</script>
<style scoped>
.item {
  display: inline-block;
  background: #fff;
  font-size: 14px;
  padding: 5px 12px;
  border-radius: 2px;
  border: 1px solid rgba(221, 221, 221, 1);
}
.item h4 {
  font-size: 14px;
  width: 168px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item img {
  width: 168px;
  height: 125px;
}
.btm {
  margin-top: 10px;
  display: flex;
  justify-content: space-around;
}
.btm .btn {
  text-align: center;
  width: 60px;
  height: 26px;
  line-height: 26px;
  border-radius: 2px;
  border: 1px solid#366a9a;
  color:#366a9a;
}
.btm .btn:hover{
  cursor: pointer;
}
.btm .active {
  background:#366a9a;
  color: #fff;
}
</style>