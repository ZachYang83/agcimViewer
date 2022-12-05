<template>
  <a-carousel dots-class="slick-dots slick-thumb" arrows>
    <div
      slot="prevArrow"
      slot-scope="props"
      class="custom-slick-arrow"
      style="left: 10px; zindex: 1"
    >
      <a-icon type="left-circle" />
    </div>
    <div
      slot="nextArrow"
      slot-scope="props"
      class="custom-slick-arrow"
      style="right: 10px"
    >
      <a-icon type="right-circle" />
    </div>
    <a slot="customPaging" slot-scope="props">
      <img :src="getImgUrl(props.i)" />
    </a>
    <div v-for="item in statictisImgArr">
      <img :src="item" width="400" height="300" />
    </div>
  </a-carousel>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
import projectServer from "./../server/projectServer";

export default {
  props: ["selectBinPropety"],
  data() {
    return {
      statictisImgArr: [],
      beferPath: null,
    };
  },
  mounted() {
    if (this.selectBinPropety) this.findThumb(this.selectBinPropety);
  },
  watch: {
    selectBinPropety(newV, oldV) {
      this.findThumb(newV);
    },
  },
  methods: {
    getImgUrl(i) {
      return this.statictisImgArr[i];
    },
    async findThumb(newV) {
      this.beferPath = newV.beferPath;
      let da = await projectServer.findProjectById({
        paramType: 1,
        id: newV.id,
      });
      if (da.success) {
        if (!da.content || da.content.length < 1) {
          return;
        }
        let result = da.content.map((item) => {
          return newV.beferPath + item.storeFullPath;
        });
        this.statictisImgArr = result;
      }
    },
  },
};
</script>
<style scoped>
/* For demo */
.ant-carousel >>> .slick-dots {
  height: auto;
}
.ant-carousel >>> .slick-slide img {
  border: 5px solid #fff;
  display: block;
  margin: auto;
  max-width: 87%;
}
.ant-carousel >>> .slick-thumb {
  bottom: -100px;
}
.ant-carousel >>> .slick-thumb li {
  width: 60px;
  height: 45px;
  margin: 10px 20px;
}
.ant-carousel >>> .slick-thumb li img {
  width: 100%;
  height: 100%;
  filter: grayscale(100%);
}
.ant-carousel >>> .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}
.ant-carousel >>> .slick-thumb li.slick-active {
  border: 1px solid rgb(0, 150, 136);
}

.ant-carousel >>> .slick-slide {
  text-align: center;

  overflow: hidden;
}

.ant-carousel >>> .custom-slick-arrow {
  width: 35px;
  height: 35px;
  font-size: 25px;
  color: rgb(0, 150, 136);

  opacity: 0.3;
}
.ant-carousel >>> .custom-slick-arrow:before {
  display: none;
}
.ant-carousel >>> .custom-slick-arrow:hover {
  opacity: 0.5;
}

.ant-carousel >>> .slick-slide h3 {
  color: #fff;
}
</style>