<template>
  <div class="pop-box" :class="{hide:!value}" ref="box">
    <div class="head"  @mousedown="mousedown">
      {{title}}
      <a-icon type="close" class="close" @click="onCancel" />
    </div>
    <div class="body">
      <slot>弹窗内容</slot>
    </div>
    <div class="foot">
      <a-button v-if="confirm" type="primary" @click="onConfirm">{{confirmVal}}</a-button>
      <a-button v-if="cancel" @click="onCancel">{{cancelVal}}</a-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "AgPopup",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    confirm: {
      type: Boolean,
      default: false
    },
    cancel: {
      type: Boolean,
      default: false
    },
    title: {
      default: null
    },
    confirmVal: {
      type: String,
      default: "是"
    },
    cancelVal: {
      type: String,
      default: "否"
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    maskHide: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    maskHandle() {
      if (this.maskHide) {
      }
    },
    onConfirm() {
      if (!this.isDisabled) {
        this.$emit("onConfirm");
      }
    },
    onCancel() {
      this.$emit("onCancel");
    },
    mousedown(event) {
      this.selectElement = this.$refs.box;
      var dom = this.selectElement;
      this.selectElement.style.cursor = "move";
      this.isDowm = true;
      var distanceX = event.clientX - this.selectElement.offsetLeft;
      var distanceY = event.clientY - this.selectElement.offsetTop;
      document.onmousemove = function(ev) {
        var oevent = ev || event;
        dom.style.left = oevent.clientX - distanceX + "px";
        dom.style.top = oevent.clientY - distanceY + "px";
      };
      document.onmouseup = function() {
        document.onmousemove = null;
        document.onmouseup = null;
        dom.style.cursor = "default";
      };
    }
  }
};
</script>
<style scoped>
.pop-box {
  position: fixed;
  z-index: 10;
  top: 112px;
  right: 10px;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgb(92, 175, 255);
  min-width: 250px;
}
.hide {
  display: none;
}
.head {
  position: relative;
  font-size: 14px;
  height: 32px;
  line-height: 32px;
  background: linear-gradient(90deg, #356897, #3b72a8);
  color: #fff;
  text-indent: 10px;
}
.head .close {
  position: absolute;
  top: 7px;
  right: 10px;
  font-size: 18px;
}
.foot {
  text-align: right;
}
.foot button {
  margin: 10px 5px;
}
</style>