<template>
     <div class="detail-box" > 
       <div class="h4">概况</div>
      <div>{{area.name}}</div>
      <div>{{area.addr}}</div>
      <div>{{area.primary_uid}}</div>
      <div>{{area.x}}</div>
      <div>{{area.y}}</div>
    </div> 
</template>
<script>
export default {
  props:{
    area:{
      type:Object
    }
  },
  methods: { 
    
  }
}
</script>
<style scoped> 
.detail-box { 
  background: #fff;
  width: 100%;
  border-radius: 2px;
  padding: 10px; 
  margin-bottom: 0;
} 
</style>