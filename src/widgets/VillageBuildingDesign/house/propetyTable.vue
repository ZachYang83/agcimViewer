<!--
 * @Author: pwz
 * @Date: 2020-09-23 11:24:46
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-23 13:42:16
 * @FilePath: \village-building-design\src\widgets\villageBuilding\widgets\house\propetyTable.vue
-->
<template>
  <a-table
    :columns="columns"
    bordered
    :data-source="data"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
  >
   
  </a-table>
</template>
<script>

;
import axiosWraper from "@/views/js/net/axiosWraper";
const columns = [
  {
    title: '类型',
    dataIndex: '类型',
    sorter: true,
    width: '20%',
    scopedSlots: { customRender: 'name' },
  },
  {
    title: '族类型-大类',
    dataIndex: '族类型-大类',
    filters: [
      { text: '单层', value: 'male' },
      { text: '双层', value: 'female' },
    ],
    width: '20%',
  },
  {
    title: '楼层',
    dataIndex: '楼层',
  },
];

export default {
  data() {
    return {
      data: [],
      pagination: {},
      loading: false,
      columns,
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {

      
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;
  
    },
    async fetch(params = {}) {
      
      let property_url="/getAll/nongfang1";
      let data = await axiosWraper.getData("/MongoDBTable" + property_url);
      this.data = data;

    },
  },
};
</script>