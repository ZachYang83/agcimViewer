<template>
  <a-carousel arrows dots-class="slick-dots slick-thumb" autoplay>
    <a slot="customPaging" slot-scope="props">
      <img :src="getImgUrl(props.i)" />
    </a>
    <div v-for="item in arr" :key="item.id">
      <a :href="item.src" target="_blank"><img :src="item.src" width="100%" /></a>
    </div>
  </a-carousel>
</template>
<script>
import { Carousel } from "ant-design-vue";
const baseUrl = "./img/";
export default {
  components: { "a-carousel": Carousel },
  data() {
    return {
      baseUrl,
      arr: [
        { id: "1", src: require(`${baseUrl}img1.png`) },
        { id: "2", src: require(`${baseUrl}img2.png`) },
      ],
    };
  },
  methods: {
    getImgUrl(i) {
      return require(`${baseUrl}img${i + 1}.png`);
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
  max-width: 80%;
}
.ant-carousel >>> .slick-thumb {
  bottom: -45px;
}
.ant-carousel >>> .slick-thumb li {
  width: 60px;
  height: 45px;
}
.ant-carousel >>> .slick-thumb li img {
  width: 100%;
  height: 100%;
  filter: grayscale(100%);
}
.ant-carousel >>> .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}

.ant-carousel >>> .slick-prev{
    left: 10px;
}
.ant-carousel >>> .slick-next{
    right: 10px;
}
</style>