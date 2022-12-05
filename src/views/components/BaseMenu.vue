<template>
  <div class="basemenu-page" id="basemenuPage">
    <a-menu
      :openKeys="openKeys"
      @openChange="onOpenChange"
      mode="inline"
      :inlineIndent="inlineIndent"
      theme="dark"
      class="vscroll"
      :inline-collapsed="collapsed"
    >
      <a-sub-menu v-for="item in sidebarList" :key="item.id">
        <div slot="title">
          <i :class="item.iconClass"></i>
          <span>{{ item.name }}</span>
        </div>
        <a-menu-item
          v-for="p in item.childrenList"
          :key="p.id"
          @click="openMainBox(p)"
        >
          <span :title="p.name">{{ p.name }}</span>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
    <i
      class="btm"
      @click="toggleCollapsed"
      :class="collapsed ? 'icon-unfold' : 'icon-fold'"
    ></i>
  </div>
</template>
<script>
import store from "@/views/js/store";
export default {
  name: "BaseMenu",
  props: {
    sidebarList: { type: Array },
  },
  data() {
    return {
      rootSubmenuKeys: [],
      openKeys: [],
      collapsed: false,
      inlineIndent: 20,
    };
  },
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
      if (this.collapsed) {
        document.getElementById("mainBox").style.left = "50px";
        document.getElementById("searchMdBox").style.left = "75px";
        document.getElementById("fastNav").style.left = "375px";
        this.openKeys = [];
      } else {
        document.getElementById("mainBox").style.left = "142px";
        document.getElementById("searchMdBox").style.left = "140px";
        document.getElementById("fastNav").style.left = "470px";
      }
    },
    onOpenChange(openKeys) {
      if (this.rootSubmenuKeys.length == 0) {
        this.getRootSubmenuKeys(this.sidebarList);
      }
      const latestOpenKey = openKeys.find(
        (key) => this.openKeys.indexOf(key) === -1
      );
      if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.openKeys = openKeys;
      } else {
        this.openKeys = latestOpenKey ? [latestOpenKey] : [];
      }
    },
    //跳转
    openMainBox(o) {
      this.$emit("openMainBox", o);
    },
    //收缩功能区
    setMainBoxState() {
      this.$store.state.mainBoxState = !this.$store.state.mainBoxState;
    },
    getRootSubmenuKeys(val) {
      val.forEach((element) => {
        this.rootSubmenuKeys.push(element.id);
      });
    },
  },
};
</script>
<style scoped>
.basemenu-page {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #32363e;
  z-index: 6;
  height: 100%;
  max-width: 142px;
}
.basemenu-page .vscroll {
  height: calc(100% - 40px);
  overflow-x: hidden;
  overflow-y: scroll;
  padding-top: 5px;
}

.ant-menu-inline-collapsed {
  width: 50px;
}
/deep/
  .ant-menu-inline-collapsed
  > .ant-menu-submenu
  > .ant-menu-submenu-title {
  padding: 0 14px !important;
}
.ant-menu-inline-collapsed
  > .ant-menu-submenu
  > .ant-menu-submenu-title
  > div
  > span {
  display: inline-block;
  max-width: 0;
  opacity: 0;
}
.ant-menu-dark,
.ant-menu-dark .ant-menu-sub {
  background: #32363e;
}
.btm {
  display: block;
  margin: 0 auto;
  width: 24px;
  height: 18px;
  cursor: pointer;
}

.icon {
  display: inline-block;
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin-right: 8px;
  opacity: 0.65;
}
.icon-fold {
  background: url(../../assets/img/menu/fold.png) no-repeat;
  background-size: 100%;
}
.icon-unfold {
  background: url(../../assets/img/menu/unfold.png) no-repeat;
  background-size: 100%;
}
.icon-citySafe {
  background: url(../../assets/img/menu/citySafe.png) no-repeat;
  background-size: 100%;
}
.icon-dataMan {
  background: url(../../assets/img/menu/dataMan.png) no-repeat;
  background-size: 100%;
}
.icon-houseAna {
  background: url(../../assets/img/menu/houseAna.png) no-repeat;
  background-size: 100%;
}
.icon-roadAna {
  background: url(../../assets/img/menu/roadAna.png) no-repeat;
  background-size: 100%;
}
.icon-suPlan {
  background: url(../../assets/img/menu/suPlan.png) no-repeat;
  background-size: 100%;
}
.icon-terrianAna {
  background: url(../../assets/img/menu/terrianAna.png) no-repeat;
  background-size: 100%;
}
.icon-viewPlan {
  background: url(../../assets/img/menu/viewPlan.png) no-repeat;
  background-size: 100%;
}
.icon-bimManager {
  background: url(../../assets/img/menu/bimManager.png) no-repeat;
  background-size: 100%;
}
</style>