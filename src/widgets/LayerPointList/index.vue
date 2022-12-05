<template>
  <ag-popup v-model="visible" :title="title" @onCancel="onCancel" class="popup-box">
    <div class="content">
      <dl>
        <dt>总数：{{list.length}}</dt>
        <div class="vscroll">
          <dd v-for="item in list" :key="item.id">
            编号：{{item.编号}}
            楼层：{{item.楼层}}
            坐标：{{item.coordinates}}
          </dd>
        </div>
      </dl>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
  components: {
    "ag-popup": AgPopup,
  },
  data() {
    return {
      visible: false,
      title: "信息",
      list: [],
    };
  },
  mounted() {},
  methods: {
    onShow(layer) {
      this.visible = true;
      this.title = layer.title;

      this.getInfo(layer);
    },
    onCancel() {
      this.visible = false;
    },
    getInfo(ly) {
      let vm = this;
      let resource = Cesium.Resource.fetchJson({
        url: ly.url + "?service=WFS",
        id: ly.id,
        queryParameters: {
          request: "GetFeature",
          version: "1.0.0",
          typeName: ly.layerTable,
          outputFormat: "application/json",
          cql_filter: "1=1",
        },
      });
      resource.then((res) => {
        vm.list = [];
        let arr = res.features;
        for (let i = 0; i < arr.length; i++) {
          let o = {
            id: arr[i].id,
            coordinates: arr[i].geometry.coordinates,
          };
          let arr1 = arr[i].properties;
          for (let j in arr1) {
            if (j === "OBJECTID") {
              o["编号"] = arr1[j];
            }
            if (j === "floor") {
              o["楼层"] = arr1[j];
            }
          }
          vm.list.push(o);
        }
      });
    },
  },
};
</script>
<style scoped>
.popup-box {
  width: 470px;
}
.popup-box .content {
  padding: 20px 0;
}
.popup-box dl {
  padding-left: 20px;
}
.popup-box .vscroll {
  height: 500px;
  overflow: auto;
}
.popup-box dd {
  border-bottom: 1px solid #ccc;
  padding: 5px 10px;
  margin-right: 20px;
}
</style>