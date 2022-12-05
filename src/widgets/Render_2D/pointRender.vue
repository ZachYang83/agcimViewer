<!--
 * @author: 张瀚
 * @description: 点绘制
-->
<template>
  <div class="render">
    <a-tabs type="card">
      <a-tab-pane key="1" tab="基础点">
        <a-row align="middle">
          <a-col :span="8">
            <h5>点直径(像素)</h5>
          </a-col>
          <a-col :span="8">
            <h5>点颜色</h5>
          </a-col>
          <a-col :span="8">
            <h5>轮廓颜色</h5>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <a-input-number :min="1" v-model="pointWidth" />
          </a-col>
          <a-col :span="8">
            <a-input type="color" v-model="pointColorString" />
          </a-col>
          <a-col :span="8">
            <a-input type="color" v-model="outlineColorString" />
          </a-col>
        </a-row>
        <a-row align="middle">
          <a-col :span="8">
            <h5>轮廓宽度(像素)</h5>
          </a-col>
          <a-col :span="8">
            <h5>透明度(1-100)%</h5>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <a-input-number :min="0" v-model="outlineWidth" />
          </a-col>
          <a-col :span="8">
            <a-input-number :min="1" :max="100" v-model="alpha" />
          </a-col>
        </a-row>
        <a-button type="primary" @click="drawPoint">开始绘制</a-button>
        <entityList class="point-list" :entityList="pointList" @removeByEntityId="reloadEntityList" />
      </a-tab-pane>
      <a-tab-pane key="2" tab="图例">
        <a-row>
          <a-col :span="8">
            <h5>图例宽度(米)</h5>
          </a-col>
          <a-col :span="8">
            <h5>图例高度(米)</h5>
          </a-col>
          <a-col :span="8">
            <h5>透明度(1-100)%</h5>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <a-input-number v-model="imgWidth" :min="1" />
          </a-col>
          <a-col :span="8">
            <a-input-number v-model="imgHeight" :min="1" />
          </a-col>
          <a-col :span="8">
            <a-input-number v-model="imageAlpha" :min="1" :max="100" />
          </a-col>
        </a-row>
        <div class="image-list ag-scrollbar">
          <a-row type="flex" align="middle">
            <a-col :span="6" v-for="(item,index) in imageList" :key="index" @click="drawPlane(item)">
              <a-tooltip>
                <template slot="title">
                  点击选中图例后在地图上绘制
                </template>
                <img :src="item">
              </a-tooltip>
            </a-col>
          </a-row>
        </div>
        <entityList class="plane-list" :entityList="planeList" @removeByEntityId="reloadEntityList" />
      </a-tab-pane>
    </a-tabs>
  </div>

</template>
<script>
import PointRender from "@/adk/render_2D/PointRender.js"
import PlaneRender from "@/adk/render_2D/PlaneRender.js"
import entityList from './entityList.vue'
let pointRender = new PointRender(CIM.viewer)
let planeRender = new PlaneRender(CIM.viewer)
export default {
  components: {
    entityList
  },
  props: {},
  data() {
    return {
      pointColorString: "#FFA200",
      outlineColorString: "#B7B7B7",
      pointWidth: 20,
      outlineWidth: 2,
      alpha: 100,
      imgWidth: 100,
      imgHeight: 100,
      imageAlpha: 100,
      pointList: [],
      planeList: [],
      imageList: [
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "http://localhost:8090/Assets/Images/ion-credit.png",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
        "img/admin.9bb478ba.jpg",
      ],
    };
  },
  created() {

  },
  mounted() {
    this.reloadEntityList()
  },
  destroyed() {
    pointRender.cancel()
    planeRender.cancel()
  },
  computed: {
  },
  watch: {
    pointWidth(nv, ov) {
      if (!nv || nv < 0) {
        this.pointWidth = 1;
      }
    },
    outlineWidth(nv, ov) {
      if (!nv || nv < 0) {
        this.outlineWidth = 0;
      }
    },
    alpha(nv, ov) {
      if (!nv || nv > 100) {
        this.alpha = 100;
      } else if (nv < 1) {
        this.alpha = 1;
      }
    },
    imageAlpha(nv, ov) {
      if (!nv || nv > 100) {
        this.imageAlpha = 100;
      } else if (nv < 1) {
        this.imageAlpha = 1;
      }
    },
  },
  methods: {
    reloadEntityList() {
      this.pointList = pointRender.getEntityList().map(item => {
        return { id: item.id, name: item.name }
      })
      this.planeList = planeRender.getEntityList().map(item => {
        return { id: item.id, name: item.name }
      })
    },
    drawPoint() {
      pointRender.pickAndDrawPointOnce(undefined, {
        colorString: this.pointColorString,
        pixelSize: this.pointWidth,
        outlineColorString: this.outlineColorString,
        outlineWidth: this.outlineWidth,
        alpha: this.alpha / 100,
      }).then(this.reloadEntityList)
    },
    drawPlane(imgUrl) {
      planeRender.pickAndDrawImageOnce(imgUrl, {
        width: this.imgWidth,
        height: this.imgHeight,
        alpha: this.imageAlpha / 100
      }).then(this.reloadEntityList)
    }
  },
};
</script>
<style scoped>
.image-list {
  overflow-y: auto;
  height: 300px;
  margin-top: 10px;
}

.image-list img {
  min-width: 20px;
  max-height: 60px;
  max-width: 60px;
  margin: 5px;
  cursor: pointer;
}
.point-list {
  height: 450px;
}
.plane-list {
  height: 200px;
  margin-top: 10px;
}
</style>