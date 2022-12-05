<template>
    <ag-popup v-model="previewVisible" :title="title" @onCancel="onCancel" class="previewModel">
        <div class="wraper">
            <img id="preImg" :src="imageUrl">
        </div>
    </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
    name:"preview",
    components: {
        "ag-popup": AgPopup,
    },
    data(){
        return{
            previewVisible:false,
            title:"预览标签",
            imageUrl:null,
        }
    },
    methods:{
        open(item){
            this.previewVisible = true;
            this.imageUrl = item.url;
        },
        onCancel(){
            this.previewVisible = false;
        },
    }
}
</script>

<style scoped>
.previewModel .wraper {
  display: block;
  padding: 10px;
  box-sizing: border-box;
}
.previewModel .wraper img{
  width:100%;
  margin:0 auto;
  display:inline-block;
}
</style>