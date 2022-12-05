/**
 * Class ProperityBinder  
 * 后端配置,后台建立如下表
 * 图层-属性
 * 图层-表达效果表达
 * 图层-字段映射表
 **/
class ProperityBinder {
    /**
     * 根据图层地址来获得对象的属性，返回的是一个json格式
     * @param {String} url - 图层对应的地址
     */
    getProperityByUrl(url){
        //TODO:return promise
    }
    /**
     * 以表格的形式表示对象的属性
     * @param {*} data 
     * @param {*} panelStyle 面板的样式:enum类型：table/wiki/
     * @param {*} title 
     */
    showProperityPanel(panelStyle,data,title){

    }
}

export default ProperityBinder;

