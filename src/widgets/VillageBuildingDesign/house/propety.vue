<template>
  <a-descriptions title="" layout="vertical" bordered
   :column="1"
  >
    <a-descriptions-item :label="item.name" v-for="item in propetyData" :key="item.value">
    {{item.value}}
    </a-descriptions-item>
  
  </a-descriptions>
</template>
<script>
import axiosWraper from "@/views/js/net/axiosWraper";
;
export default {
  props:["selectBinPropety"],
data(){
  return{
    propetyData:[
     
    ]
  }
},
mounted(){
   this.setPropety(this.selectBinPropety)
// this.getPropetyData()
},
watch:{
selectBinPropety(newV,oldV){
    this.setPropety(newV)
},
},
methods:{
  async getPropetyData(){
        if(!this.selectBinPropety){
          return
        }
        let data=this.selectBinPropety;
        setPropety(data)
  },
  setPropety(data){
     let result=[data];
        let arr=[];
        result.map((item)=>{  
          for(let ii in item){
            let filterItem={};
            filterItem.key=ii;
            filterItem.value=item[ii]
            switch(ii){
              case "sourseName":
              filterItem.name="模型";
              arr.push(filterItem)
              break;
          
                   case "hourseName":
              filterItem.name="房屋名称";
              arr.push(filterItem)
              break;
                   case "homesteadArea":
              filterItem.name="宅基地面积（平方米）";
              arr.push(filterItem)
              break;
                   case "floorArea":
              filterItem.name="占地面积（平方米）";
              arr.push(filterItem)
              break;
                   case "coveredArea":
              filterItem.name="建筑面积（平方米）";
              arr.push(filterItem)
              break;
                   case "costEstimates":
              filterItem.name="造价面积（万元）";
              arr.push(filterItem)
              break;
                   case "remark":
              filterItem.name="房屋简介";
              arr.push(filterItem)
              break;
            
            } 
          }
       
        })
         this.propetyData=arr;
      
  }

}

}
</script>
<style>

.supermarket .ant-descriptions-bordered .ant-descriptions-item-label {
    background-color: #faf6f6 !important;
    font-weight: 500 !important;
    font-size: 16px !important;
}
</style>