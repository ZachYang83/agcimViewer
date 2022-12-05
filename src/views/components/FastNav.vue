<template>
  <!-- 快捷菜单 -->
  <div class="fast-nav" id="fastNav">
    <ul>
      <li v-for="item in list" :key="item.id" @click="fastGo(item)">
        <i class="icon" :class="item.iconClass"></i>
        <!-- <span class="txt">{{item.name}}</span> -->
      </li>
      <li v-for="item in fastnavList" :key="item.id" @click="fastGo(item)">
        <i class="icon" :class="item.iconClass"></i>
        <!-- <span class="txt">{{item.name}}</span> -->
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: "FastNav",
  props: {
    fastnavList: { type: Array },
  },
  data() {
    return {
      list: [
        {
          id: "funcArea",
          name: "功能区",
          funcInvokeUrl: "funcArea",
          iconClass: "icon-multi",
        },
        // {
        //   id: "ViewPoint",
        //   name: "视点管理",
        //   code: "ViewPoint",
        //   iconClass: "icon-eye",
        //   funcInvokeUrl: "ViewPoint",
        // },
      ],
      keyWord: "",
    };
  },
  methods: {
    fastGo(o) {
      switch (o.funcInvokeUrl) {
        case "funcArea":
          this.$store.state.mainBoxState = !this.$store.state.mainBoxState;
          break;
        case "/": //工具
          this.$emit("changeToolState", o);
          break;
        default:
          //导航栏功能
          this.$emit("openMainBox", o);
      }
    },
  },
};
</script>
<style scoped>
.fast-nav {
  position: absolute;
  top: 0;
  left: 470px;
  z-index: 5;
  height: 36px;
  display: table;
  min-width: 160px;
}
.fast-nav ul {
  display: table-cell;
  vertical-align: middle;
  margin: 0;
  padding: 0;
  color: rgba(255, 255, 255, 0.5);
  width: 100%;
}
.fast-nav li {
  list-style: none;
  display: inline-block; 
  padding: 0 10px;
}
.fast-nav li+li{
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}
.fast-nav .icon {
  display: inline-block;
  vertical-align: -3px;
  opacity: 0.8;
}
.fast-nav .icon:hover {
  opacity: 1;
}
.fast-nav li:hover {
  cursor: pointer;
  font-weight: bold;
  color: #fff;
}
.fast-nav li .txt {
  margin-left: 10px;
}

.icon-eye {
  width: 17px;
  height: 20px;
  background: url("../../assets/img/tool/fastnav/sys-eye.png") no-repeat;
  background-size: 100%;
}
.icon-multi {
  width: 17px;
  height: 20px;
  background: url("../../assets/img/tool/fastnav/sys-multi.png") no-repeat;
  background-size: 100%;
}
.icon-distance {
  width: 20px;
  height: 20px;
  background: url("../../assets/img/tool/fastnav/sys-distance.png") no-repeat
    center;
  background-size: 100%;
}
</style>
