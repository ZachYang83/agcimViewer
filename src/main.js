import Vue from 'vue'
import App from './App.vue'
import router from './views/js/router'
import store from './views/js/store'

import * as Cesium from "cesium/Cesium";
import widget from "cesium/Widgets/widgets.css";
window.Cesium = Cesium;
window.CIM = {};
window.isFlat = false;
window.currentPlanId = "";
window.designPlanChange = false;
//设置地形压平缓存对象
CIM.flat = {
  tilesEditor: {
    IsYaPing: false,
    height: [],
    polygonBounds: []
  },
  resetTilesEditor: function () {
    this.tilesEditor.IsYaPing = false;
    this.tilesEditor.height = [];
    this.tilesEditor.polygonBounds = [];
  },
};
// 添加indexedDB 缓存过滤器
// import "./net/IndexedDB/index.js";

//ֱ直接全局引入 
// import Antd from 'ant-design-vue'
// import 'ant-design-vue/dist/antd.css'
// Vue.use(Antd)

//按需引入,将在页面上会多次使用的组件引入   待项目具体情况加
import {
  Button,
  Input,
  InputNumber,
  Menu,
  Form,
  Select,
  Table,
  Icon,
  Switch,
  Tree,
  Tooltip,
  Popover,
  Layout,
  Tabs,
  Dropdown,
  Modal,
  Row,
  Col,
  Radio,
  Checkbox,
  Message,
  Divider,
  Slider,
  Spin,
  Popconfirm,
  Carousel,
  Upload,
  DatePicker,
  TimePicker,
  Timeline,
  Tag,
  Card,
  ConfigProvider,
  drawer,
  collapse,
  FormModel,
  Descriptions,
  Progress,
  List,
  Alert
} from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';
Vue.use(Button)
Vue.use(Icon)
Vue.use(Menu)
Vue.use(Form)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Select)
Vue.use(Tree)
Vue.use(Tooltip)
Vue.use(Popover)
Vue.use(Layout)
Vue.use(Table)
Vue.use(Switch)
Vue.use(Tabs)
Vue.use(Dropdown)
Vue.use(Modal)
Vue.use(Row)
Vue.use(Col)
Vue.use(Radio)
Vue.use(Checkbox)
Vue.use(Divider)
Vue.use(Slider)
Vue.use(Spin)
Vue.use(Popconfirm)
Vue.use(Carousel)
Vue.use(Upload)
Vue.use(DatePicker)
Vue.use(TimePicker)
Vue.use(Timeline)
Vue.use(Tag)
Vue.use(Card)
Vue.use(ConfigProvider)
Vue.use(drawer)
Vue.use(collapse)
Vue.use(Descriptions)
Vue.use(FormModel)
Vue.use(Progress)
Vue.use(List)
Vue.use(Alert)


Vue.prototype.$message = Message;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$info = Modal.info;


Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')