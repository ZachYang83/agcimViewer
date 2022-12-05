<template>
  <div>
    <div class="menu-box">
      <li v-for="item in menuArr" :key="item.id" @click="MenuClick(item)">
        <a-dropdown>
          <a-menu slot="overlay" @click="MenuClick">
            <template v-for="ch in item.children">
              <a-menu-item v-if="!ch.isInit" :key="ch.key">
                <span class="menu_item_font">{{ch.name}}{{ch.isInit}}</span>
              </a-menu-item>
            </template>
          </a-menu>
          <span>
            <span class="_label_t">{{item.name}}</span>
          </span>
        </a-dropdown>
      </li>
    </div>
    <div v-for="(item,index) in curToolList" :key="index">
      <component v-bind:is="item.app" :ref="item.key"></component>
    </div>
  </div>
</template>
<script>
let viewer = null;
import  {menuArr}  from './js/config';
let appComponents = {};
export default {
  data() {
    return {
      menuArr: menuArr,
      curToolList: [],
    };
  },
  mounted() {
    viewer = CIM.viewer;
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        113.37382383288637,
        23.105249672380047,
        1000
      ),
    });

    this.addComponets();
  },
  methods: {
    addComponets() {
      let arr = menuArr;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key) {
          let app = arr[i].key;
          appComponents[
            app
          ] = require(`@/widgets/CommunityCIM/${app}/index.vue`).default;
        }

        let arr1 = arr[i].children;
        for (let j = 0; j < arr1.length; j++) {
          if (arr1[j].key) {
            let app = arr1[j].key;
            appComponents[
              app
            ] = require(`@/widgets/CommunityCIM/${app}/index.vue`).default;

            if (arr1[j].isInit) {
              arr1[j].app = appComponents[app];
              this.curToolList.push(arr1[j]);
            }
          }
        }
      }
    },
    MenuClick(o) {
      for (let i = 0; i < this.curToolList.length; i++) {
        if (this.curToolList[i].isInit) {
          continue; 
        } else {
          if (this.curToolList[i].key === o.key) {
            return this.$refs[o.key][0].onShow();
          } else {
            this.curToolList.splice(i, 1);
          }
        }
      }
      //添加
      if (o.key) {
        o.app = appComponents[o.key];
        this.curToolList.push(o);
      }
    },
  },
};
</script> 
<style scoped>
.menu-box {
  position: fixed;
  bottom: 20px;
  left: 200px;
  background: #fff;
  color: #666;
  padding: 10px;
  border-radius: 2px;
}
.menu-box li {
  display: inline-block;
  list-style: none;
  padding: 0 10px;
  line-height: 1;
  cursor: pointer;
  border-radius: 2px;
}
.menu-box li + li {
  border-left: 1px solid #666;
}

.ant-dropdown-menu {
  background: #001529;
}
.ant-dropdown-menu-item {
  font-size: 14px;
  text-align: center;
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
  padding: 8px 20px;
}
.ant-dropdown-menu-item-active {
  background-color: #1890ff;
  color: #fff;
}
.ant-dropdown-menu li:last-child {
  border: 0px;
}
</style>