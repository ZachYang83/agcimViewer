<template>
  <ag-popup
            v-model="visible"
            :title="title"
            @onCancel="onCancel"
            class="infoBox-site"
    >
    <div class="site-main">
        <div class="site-content">
            <label>
                1、鼠标左键依次点击地面绘制分析区域；
                <br />
                2、点击绘制点旁的X 移除该绘制点。
            </label>
        </div>
        <div class="site-footer">
            <a-button @click="onOk">完成</a-button>
            <a-button @click="onCancel">取消</a-button>
        </div>
    </div>
  </ag-popup>
</template>

<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
    components: {"ag-popup": AgPopup,},
    props: ["visible"],
    data(){
        return {
            title:"绘制要分析的区域",
        }
    },
    methods:{
        onOk(){

        },
        onCancel(){
            this.$emit('hideModel', false);
        },
    }
}
</script>

<style scoped>
    .infoBox-site {
        width: 300px;
        height: auto;
    }

    .infoBox-site .site-main{
        padding:10px
    }

    .site-main .site-footer{
        text-align: center;
    }

    .site-main .site-footer button{
        margin-top:10px;
        margin-right:10px;
    }

    .site-main .site-footer button:last-child{
        margin-right:0px;
    }

</style>