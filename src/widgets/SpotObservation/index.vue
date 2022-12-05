<!--
 * @author: 张瀚
 * @description: 定点观察
-->

<template>
  <div class="render">
    <a-row type="flex" justify="space-around" align="middle">
      <a-col :span="24">
        <h5>绘制观察点和景点，从观察点观察景点</h5>
      </a-col>
      <a-col :span="12">
        <a-button type="primary" @click="pickPoint(watcherHeight)" v-show="!editing">地图选点</a-button>
        <a-button @click="reset" v-show="editing">重新选点</a-button>
      </a-col>
      <a-col :span="12">
        <a-button type="danger" @click="clear" v-show="editing">退出</a-button>
      </a-col>

      <template v-if="editing">
        <a-col :span="12">
          <h5>每次移动步长(米)</h5>
        </a-col>
        <a-col :span="12">
          <a-input-number v-model="stepLength" :step="0.1" :min="0.1" />
        </a-col>
        <a-col :span="12">
          <h5>初始观察点高度(米)</h5>
        </a-col>
        <a-col :span="12">
          <a-input-number v-model="watcherHeight" :step="0.1" :min="0.1" />
        </a-col>
        <template v-if="pickOver">
          <a-col :span="24">
            <a-button type="primary" @click="isWatcher = !isWatcher">{{isWatcher?'切换到景点视角':'切换到观察者视角'}}</a-button>
          </a-col>
          <a-col :span="24">
            <h5>使用键盘操作水平面移动，鼠标右键拖拽视角。</h5>
          </a-col>
          <a-col :span="8">
            <p class="looklr">Q</p>
            <p class="tips">上升</p>
          </a-col>
          <a-col :span="8">
            <p class="move">W</p>
            <p class="tips">前进</p>
          </a-col>
          <a-col :span="8">
            <p class="looklr">E</p>
            <p class="tips">下降</p>
          </a-col>
          <a-col :span="8">
            <p class="move">A</p>
            <p class="tips">向左</p>
          </a-col>
          <a-col :span="8">
            <p class="move">S</p>
            <p class="tips">后退</p>
          </a-col>
          <a-col :span="8">
            <p class="move">D</p>
            <p class="tips">向右</p>
          </a-col>
          <a-col :span="24">
            <p class="lookud">↑</p>
            <p class="tips">视角抬升</p>
          </a-col>
          <a-col :span="8">
            <p class="lookud">←</p>
            <p class="tips">视角左转</p>
          </a-col>
          <a-col :span="8">
            <p class="lookud">↓</p>
            <p class="tips">视角向下</p>
          </a-col>
          <a-col :span="8">
            <p class="lookud">→</p>
            <p class="tips">视角右转</p>
          </a-col>
        </template>
      </template>
    </a-row>
  </div>
</template>
<script>
import SpotObservation from "@/adk/SpotObservation.js";
let spotObservation = new SpotObservation(CIM.viewer);
export default {
  components: {},
  data() {
    return {
      stepLength: 1,
      watcherHeight: 1.7,
      isWatcher: true,
      pickOver: false,
      editing: false,
    };
  },
  created() {
  },
  mounted() {
  },
  computed: {
    visionList() {
      return this.$store.state.spotObservation.visionList
    }
  },
  beforeDestroy() {
    this.clear()
  },
  watch: {
    isWatcher(nv, ov) {
      if (nv) {
        spotObservation.flyToWatcher()
      } else {
        spotObservation.flyToTargeter()
      }
    },
    stepLength(nv, ov) {
      spotObservation.setMoveStep(nv)
    },
    watcherHeight(nv, ov) {
      this.clear()
      this.pickPoint(nv)
    }
  },
  methods: {
    pickPoint(watcherHeight) {
      this.editing = true
      this.pickOver = false
      this.isWatcher = true
      spotObservation.startPickPoint(watcherHeight).then(() => {
        this.pickOver = true
        spotObservation.flyToWatcher()
        spotObservation.setMoveStep(this.stepLength)
      })
    },
    reset() {
      spotObservation.cancel()
      this.pickPoint()
    },
    clear() {
      this.editing = false
      this.pickOver = false
      spotObservation.cancel()
    },
    intoEdit() {
      this.editing = true
    }
  }
};
</script>
<style scoped>
.render {
  padding: 5px;
}
.ant-col {
  margin-bottom: 5px;
}
.vision-item {
  cursor: pointer;
  padding: 5px 0;
}
.move {
  color: blue;
}
.looklr {
  color: orange;
}
.lookud {
  color: rebeccapurple;
}
.move,
.looklr,
.lookud {
  text-align: center;
  font-weight: bold;
}
.tips {
  text-align: center;
}
</style>