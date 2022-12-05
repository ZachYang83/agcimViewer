<template>
 <!--<ag-popup
            v-model="visible"
            :title="title"
            :isMove="isMove"
            @onCancel="onCancel"
            class="infoBox"
    >-->

  <a-table
    :columns="columns"
    bordered
    :data-source="statisticsData"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
  >
  </a-table>
 
     <!-- </ag-popup>-->
</template>
<script>
import AgPopup from "@/views/components/AgPopup.vue";
import tableServer from "./../server/tableServer";

const columns = [
  
  {
    title: '类型',
    dataIndex: '类型',
    scopedSlots: { customRender: 'name' },
   
  },
  {
    title: '大类',
    dataIndex: '族类型-大类',
  },
  {
    title: '楼层',
    dataIndex: '楼层',
   
  },
  {
    title: '高度',
    dataIndex: '楼层高度',
    
  },
];

export default {
  components: {"ag-popup": AgPopup,},
  data() {
    return {
      title:"材料统计",
      isMove:false,
   
      statisticsData: [],
      pagination: {},
      loading: false,
      columns,
    };
  },
  props:["selectBinPropety","visible"],
  mounted() {
    this.fetch(this.selectBinPropety);
  },
  watch:{
       selectBinPropety(newV,oldV){
       this.fetch(newV);
},
},

  methods: {
    handleTableChange(pagination, filters, sorter) {
      let param=JSON.stringify(filters);
      this.fetch(this.selectBinPropety,param);
    },
    async fetch(re,param) {
      this.loading = true;
      //let property_url="/getAll/"+re.tableName+"?param="+param;
      //let url="http://192.168.3.21:8080/MongoDBTable/nongfang/"+re.tableName;
      if(!re || !re.tableName){
        return
      }

      let results = await tableServer.findAllByTableName(re.tableName, param);
      let data=results.content;
   
      if(!results.success || results.content.length<1){
           this.columns=[];
          this.statisticsData = [];
         this.loading = false;
        return;
      }
      this.statisticsData = data;
     
      let columnsArr=columns;
      // let columnsArr=[];
      // for(let ii in  data[0]){
      //  columnsArr.push({
      //    title: ii,
      //   dataIndex: ii,
      //   })
      // }
   
      this.loading = false;
      for(let d in columnsArr){
      let setO=new Set();
      data.map(function(item){
      setO.add(item[columnsArr[d].dataIndex])
     })
      var ob={filters: [],title:columnsArr[d].dataIndex,}
      let arr=Array.from(setO)
      arr.map(a=>{
        ob.filters.push( { text: a, value: a })
       })
      columnsArr[d].filters= ob.filters;
      }
      this.columns=columnsArr;
    },
    onCancel(){
   this.$emit('hideStatiscsPanel');
    },
  },
};
</script>
<style scoped>
 
      .infoBox {
        top: 50px;
        width: 800px;
        height:600px;
        
    }
</style>