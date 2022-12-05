<template>
  <div>
    <a-tabs default-active-key="1" size="small">
        <a-tab-pane key="1" tab="二维绘制">
            <render-twoD></render-twoD>
        </a-tab-pane>
        <a-tab-pane key="2" tab="三维绘制" force-render>
            <render-thereD></render-thereD>
        </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import RenderTwoD from '../Render_2D/index';
import RenderThereD from '../Render_3D/index';
export default {
    name:"draw",
    components: {
        RenderTwoD,
        RenderThereD
    },
    data(){
        return{
        }
    },
}
</script>

<style scoped>
p{
  padding: 5px;
}
::v-deep .render {
  padding: 0 5px;
}
::v-deep .ant-input,::v-deep .ant-input-number {
  margin: 5px 0;
  width: 80%;
  text-align: center;
}
::v-deep .ant-input-affix-wrapper .ant-input{
  width: 100%;
}
::v-deep .ant-btn {
  margin: 5px 0;
}
::v-deep .ant-tabs-nav .ant-tabs-tab {
  margin: 0 4px;
}
</style>