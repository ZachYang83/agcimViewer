<template>
  <div class="workbench-page">
    <!--  功能区 -->
    <template v-if="areaList.length >0">
      <a-tabs size="small" hideAdd v-model="activeKey" @change="changeTab" type="editable-card" @edit="onEdit">
        <a-tab-pane v-for="item in areaList" :tab="item.name" :key="item.funcInvokeUrl"></a-tab-pane>
      </a-tabs>
      <div class="func-box">
        <router-view></router-view>
      </div>
    </template>
    <div v-else class="null">
      <a-empty description="暂无打开的功能 ~" />
    </div>
  </div>
</template>
<script>
import { Empty } from "ant-design-vue";
let viewer = null;
export default {
  name: "Workbench",
  components: { "a-empty": Empty },
  data() {
    return {
      //当前列表key
      activeKey: "",
      //功能区列表
      areaList: [],
      size: "small",
    };
  },
  methods: {
    onShow(val) {
      if (!viewer) {
        viewer = CIM.viewer;
      }
      this.activeKey = val.funcInvokeUrl;
      this.getAreaList(val);
      this.$router.push({ path: val.funcInvokeUrl });
    },
    changeTab(o) {
      this.$router.push({ path: o });
    },
    //获取功能区列表
    getAreaList(val) {
      for (let i = 0; i < this.areaList.length; i++) {
        if (this.areaList[i].funcInvokeUrl === val.funcInvokeUrl) {
          return;
        }
      }
      this.areaList.push(val);
    },
    onEdit(targetKey, action) {
      this[action](targetKey);
    },
    remove(targetKey) {
      let activeKey = this.activeKey;
      let lastIndex;
      this.areaList.forEach((pane, i) => {
        if (pane.funcInvokeUrl === targetKey) {
          lastIndex = i - 1;
        }
      });
      const panes = this.areaList.filter(
        (pane) => pane.funcInvokeUrl !== targetKey
      );
      if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
          activeKey = panes[lastIndex].funcInvokeUrl;
        } else {
          activeKey = panes[0].funcInvokeUrl;
        }
      }
      this.areaList = panes;
      this.activeKey = activeKey;
      this.changeTab(activeKey);
    },
  },
};
</script>
<style scoped>
/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-nav-container {
  height: 32px;
}
/deep/ .ant-tabs.ant-tabs-card .ant-tabs-card-bar .ant-tabs-tab {
  line-height: 31px;
  font-size: 12px;
}
.ant-divider {
  background: rgba(0, 0, 0, 0.15);
}
.workbench-page {
  height: 100%;
}
.null {
  padding-top: 50px;
  text-align: center;
}
.func-box {
  height: 100%;
}
</style>