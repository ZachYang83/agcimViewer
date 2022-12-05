<template>
  <ul class=" list-box">
    <li class="item" v-for="(item,index) in sList" :key="item.primary_uid" @click="toDetail(item)">
      <div class="fl">
        <a>{{index+1}}</a>
      </div>
      <div class="fr">
        <img :src="item.img"/>
      </div>
      <div class="middle">
        <h4>{{item.name}}</h4>
        <p>{{item.addr}}</p>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  name: "search-list",
  props: {
    sList: {
      type: Array,
      default: []
    }
  },
  name: "search-in-map",
  data() {
    return {
      list: this.sList
    };
  },
  mounted() {},
  methods: { 
    toDetail(item) {
      item.node = 'list';
      this.$emit("showDetail", item); 
    } 
  }
};
</script>
<style scoped>
.list-box {
  background: #fff;
  width: 100%;
  border-radius: 2px;
  padding: 10px; 
  margin-bottom: 0;
}
.item {
    font-size: 12px;
    list-style: none;
    overflow: auto;
    zoom: 1;
    padding: 5px;
    margin-bottom: 5px;
}
.item:hover{
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
}
.item:hover .fl a{
  background: url("~@/widgets/SearchBox/img/location1.png") no-repeat; 
  background-size: 100%;
}
.item h4 {
  color: #3385ff;
  margin: 0;
}
.item .fl {
  float: left;
}
.item .fl a {
  display: inline-block;
  width: 21px;
  height: 34px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  background: url("~@/widgets/SearchBox/img/location.png") no-repeat;
  background-size: 100%;
}
.item .fr {
  float: right;
}
.item .fr img{
  width: 70px;
  height: 58px;
}
.item .middle {
  margin: 0 90px 0 30px;
}
</style>