<template>
  <ag-popup v-model="labelVisible" :title="labelInfo?labelInfo.name:''" @onCancel="onCancel" class="labelDetail">
    <div class="wraper" v-if="labelInfo">
      <p> 标注内容：{{labelInfo.content}} </p>
      <p> 标注人：{{labelInfo.user_name}} </p>
      <p> 最后修改时间：{{labelInfo.modify_time ? labelInfo.modify_time : labelInfo.create_time}} </p>
    </div>
  </ag-popup>
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
export default {
    name: "labelDetail",
    data(){
        return{
            labelVisible: false,
            labelInfo: null
        }
    },
    components: {
        "ag-popup": AgPopup,
    },
    methods: {
        open(_labelInfo) {
            this.labelVisible = true
            this.labelInfo = _labelInfo
        },
        onCancel(){
            this.labelVisible = false
            this.labelInfo = {
                name: '',
                content: '',
                user_name: '',
                update_time: '',
                create_time: ''
            }
        }
    }
}
</script>

<style>
.labelDetail{
    width: 250px;
}
.labelDetail .head{
    background: #fff;
    color: #000;
    border-bottom: 1px solid #ccc;
}
.labelDetail .body{
    padding: 10px;
}
.labelDetail .body .wraper p:first-child{
    color: rgb(15, 9, 9);
}
.labelDetail .body .wraper p{
    font-size: 16px;
}
</style>