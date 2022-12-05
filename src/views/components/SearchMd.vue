<template>
  <div class="search-md-box" id="searchMdBox" v-bind:class="{ h100: state.detail || state.list }">
    <input v-model="keyWord" placeholder="请输入建筑信息模型或建筑点" />
    <a-icon type="search" class="icon" @click="onSearch" />
    <a-icon type="close" class="icon" @click="onClose" v-show="state.list || state.detail" style="right:30px" />
    <div class="box vscroll">
      <!-- 列表 -->
      <search-list v-show="state.list" :sList="sList" @showDetail="showDetail" ref="search"></search-list>
      <!-- 详情 -->
      <a class="back" v-show="state.detail" @click="onBack">
        <a-icon type="left" />
        返回“{{ keyWord }}”的搜索结果
      </a>
      <search-detail v-show="state.detail" :area="curNode"></search-detail>
    </div>
  </div>
</template>

<script>
import data from "@/widgets/SearchBox/data.json";
import SearchList from "@/widgets/SearchBox/SearchList";
import SearchDetail from "@/widgets/SearchBox/SearchDetail";
import SearchManage from "@/widgets/SearchBox/js/searchManage";
export default {
  components: {
    "search-list": SearchList,
    "search-detail": SearchDetail,
  },
  name: "search-in-map",
  data() {
    return {
      state: {
        list: false,
        detail: false,
        overlay: false,
      },
      keyWord: "",
      sList: [],
      curNode: {},
      searchManage: {},
    };
  },
  mounted() {
    this.searchManage = new SearchManage(this);
  },
  methods: {
    // async onSearch() {
    //   let p = {
    //     keyword: this.keyWord,
    //     pageNum: 1,
    //     pageSize: 10,
    //     fields: [],
    //     indexNames: 'yuliangzhan'
    //   };
    //   let res = await axios.get(
    //     `${base.agsupport}/agsupport/elasticsearch/ordinarySearch`,
    //     { params: p }
    //   );
    //   console.log(res)
    // },
    onClose() {
      this.keyWord = "";
      this.state.list = false;
      this.state.detail = false;
      this.searchManage.clearAll();
    },
    onBack() {
      this.state.list = true;
      this.state.detail = false;
      this.searchManage.resetMapUI();
    },
    onSearch() {
      this.sList = data.content;
      this.state.list = true;
      this.state.detail = false;
      this.searchManage.addMany(this.sList, CIM.viewer);
    },
    showDetail(node) {
      this.searchManage.mapDetail(node);
    },
    showDetailUI(node) {
      this.state.list = false;
      this.state.detail = true;
      this.curNode = node;
    },
  },
};
</script>
<style scoped>
.search-md-box {
  position: relative;
  display: inline-block;
  width: 250px;
  left: 140px;
}
.h100 {
  height: 100%;
}
.search-md-box input {
  text-indent: 14px;
  width: 100%;
  height: 28px;
  line-height: 28px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  font-size: 14px;
  border-radius: 2px;
}
::-webkit-input-placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}
.search-md-box input:focus {
  border: 1px solid #356897;
  outline: none;
}
.search-md-box .icon {
  position: absolute;
  top: 10px;
  right: 8px;
  color: rgb(255, 255, 255, 0.6);
  font-size: 18px;
}
.search-md-box .icon:hover {
  cursor: pointer;
}
.search-md-box .box {
  position: absolute;
  top: 40px;
  left: 0;
  width: 100%;
  border-radius: 2px;
  height: calc(100% - 100px);
  overflow-x: hidden;
  overflow-y: scroll;
}
.box .back {
  display: inline-block;
  box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.15);
  background: #fff;
  width: 100%;
  border-radius: 2px;
  padding: 10px;
  margin-bottom: 10px;
}
</style>
