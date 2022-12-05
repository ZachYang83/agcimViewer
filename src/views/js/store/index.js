import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import user from './user'
export default new Vuex.Store({
  state: {
    //功能区缩放状态
    mainBoxState: false,
    //选中的模型
    selectedModel: null,
    //加载框状态
    loadingState: false, 
    //临时演示图例
    isLegendShow: false
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user,
  }
})