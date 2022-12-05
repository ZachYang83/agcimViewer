<!--
 * @Author: your name
 * @Date: 2020-11-19 11:30:10
 * @LastEditTime: 2020-11-24 14:14:49
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \village-building-designd:\agcim\agcimViewer\src\App.vue
-->
<template>

  <div id="app">
    <a-config-provider :locale="locale">
      <router-view></router-view>
    </a-config-provider>
  </div>
</template>
<script>
import "./assets/style.css";
import zhCN from "ant-design-vue/lib/locale-provider/zh_CN";
import { setCookie, getCookie } from "@/views/js/net/cookies";

export default {
   mounted() {
    
    //從緩存裏獲取用戶信息
    let _user = getCookie("user");
    if (_user) {
      _user = JSON.parse(_user);
      this.$store.commit("handleUserId", _user.userId);
      this.$store.commit("handleUserName", _user.userName);
    }
    //判斷是否需要登錄
    let _token = getCookie("token");
    if (!_token) {
      this.$router.push("/login");
    }
  },
  data() {
    return {
      locale: zhCN,
    };
  },
};
</script>
<style scoped>
#app {
  width: 100%;
  height: 100%;
}
</style>
