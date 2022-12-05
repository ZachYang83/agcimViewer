<template>
  <header class="header">
    <div class="t4">
      <img src="../../assets/img/logo.png"/>
    </div>
    <div class="user-box">
          <a-avatar style="backgroundColor:#87d068" :src="src" />
      <!-- <p>{{$store.state.user.userName}}</p> -->
      <p>{{$store.state.user.userName}}</p>
      <i class="icon icon-logo-out" @click="_loginOut"></i>
    
    </div>
  </header>
</template>
<script>
import { Avatar } from "ant-design-vue";
import src from "../../assets/img/admin.jpg"; 
import { loginOut } from "@/views/js/net/http";
export default {
  name: "AgHeader",
  components: { "a-avatar": Avatar },
  data() {
    return {
      list: [],
      src: src,
    };
  },
  mounted() {},
  methods: {
     _loginOut() {
      loginOut();
    },
  },
};
</script>
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  height: 57px;
  line-height: 57px;
  background: linear-gradient(90deg, #356897, #3b72a8);
  padding: 0 20px;
  color: #fff;
}
.header .t4 {
  font-size: 26px;
}
.user-box p {
  display: inline-block;
  font-size: 12px;
  margin: 0 40px 0 10px;
}
.icon-logo-out {
  display: inline-block;
  width: 20px;
  height: 22px;
  background: url(../../assets/img/tool/sys-logout.png) no-repeat;
  vertical-align: middle;
  cursor: pointer;
}
</style>