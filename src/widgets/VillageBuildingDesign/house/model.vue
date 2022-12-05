<template>
    <div id="model_dom" class="initViewer" ref='model_dom'>
      
       <div class="tools_panel">
       <a-icon type="home" v-on:click="zoomToHome" title="复位" v-if="false"
       :style="{ fontSize: '20px' }"
       />
       <a-tag class="home_in" v-on:click="zoomToHome">
        初始化
      </a-tag>
       </div>
       </div>
</template>
<script>
import {init} from "./../js/superMarkethouse"
export default {
  props:["selectBin"],
data(){
  return{
   binInter:null,
  }
},
mounted(){
   if(!this.binInter){
        let _this=this;
        setTimeout(()=>{
         let binInter=init(_this.$refs.model_dom.id,_this.selectBin);
         _this.binInter=binInter;
        },500)  
    }
},
watch:{
// selectBinPropety(newV,oldV){
//     this.setPropety(newV)
// },
selectBin(newV,oldV){ 
    this.selectBin=newV;  
    if(this.binInter){
        this.binInter.add3DTiles(newV.url);    
    }
}
},
methods:{
 zoomToHome(){  
    if(this.binInter){
            this.binInter.zoomToHome();
        }
    },
}

}
</script>
<style scoped>
.initViewer{
width:100%;
height:100%;
}
.tools_panel{
      position: absolute;
    z-index: 1000;
    right: 30px;
    /* top: 10px; */
    margin-top: 10px;


}
.home_in{
    width: 70px;
    height: 30px;
    background: rgba(0,150,135,1);
    border-radius: 2px;
    font-size: 16px;

    font-weight: 400;
    color: rgba(255,255,255,1);
    line-height: 30px;
}
</style>