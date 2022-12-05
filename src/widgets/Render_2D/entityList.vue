<!--
 * @author: 张瀚
 * @description: 这里通用的通过id管理和删除entity的列表
-->
<template>
  <agList :dataList="entityList" v-slot="data">
    <div class="entity" @click="flyToEntityId(data.item.id)">
      <a-row>
        <a-col :span="23">
          {{data.item.name}}
        </a-col>
        <a-col :span="1" @click.stop="removeByEntityId(data.item.id)">
          <a-tooltip>
            <template slot="title">
              删除
            </template>
            ✖
          </a-tooltip>
        </a-col>
      </a-row>
    </div>
  </agList>
</template>
<script>
import agList from '@/views/components/AgList.vue'
export default {
  components: { agList },
  props: {
    //id和name字段即可
    entityList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {};
  },
  created() { },
  mounted() { },
  destroyed() { },
  computed: {},
  watch: {},
  methods: {
    flyToEntityId(entityId) {
      CIM.viewer.flyTo(CIM.viewer.entities.getById(entityId))
    },
    removeByEntityId(entityId) {
      CIM.viewer.entities.removeById(entityId)
      this.$emit("removeByEntityId",entityId)
    }
  },
};
</script>
<style scoped>
.entity {
  cursor: pointer;
}
</style>