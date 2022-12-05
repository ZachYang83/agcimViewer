class legend {
    constructor() {
        this.currentLegendLayer = null;
        this.parentVue = null;
        this._isInitializedLayerHandler = false;
        this.isVisible = false;
        this.legendList = [];
        this.legengInfo = {};
    }
    initializeLayerHandler() {
        if (this._isInitializedLayerHandler) return;
        let _this = this;
        this._isInitializedLayerHandler = true;
        CIM.layerTree.addLayerShowHandler(function (layer, isVisible) {
            if (!isVisible) {
                _this.selLengendById(layer.id);
                return;
            }else{
                //已存在---则设置为true 
                for (let i = 0; i < _this.legendList.length; i++) {
                    var id = layer.id ? layer.id : layer;
                    if (id == _this.legendList[i].id ) { 
                        _this.legendList[i].islyChecked = true;
                        return;
                    }
                }
                //不存在---则去取图例
                if(layer && layer.getLegendData){
                    layer.getLegendData(_this.showLegend.bind(_this));
                }
            } 
        })
    }
    selLengendById(id) {
        var isHash = false;
        for (var i = 0; i < this.legendList.length; i++) {
            if (this.legendList[i].id == id) {
                isHash = true;
                // this.legendList.splice(i, 1);
                this.legendList[i].islyChecked = false;
            }
        }
        if (this.legendList.length && this.legendList.length == 0) {
            this.parentVue.isShowLegend = false;
        }
    }
    showLegendByIds(ids, parentVue) {
        this._isInitializedLayerHandler = false;
        this.initializeLayerHandler();
        this.parentVue = parentVue;
        for (var i = 0; i < ids.length; i++) {
            var layer = CIM.layerTree.getLayerById(ids[i]);
            if (!layer) continue;
            var ok = layer.getLegendData(this.showLegend.bind(this));
            if (ok) {
                break;
            }
        }
    }
    showLegend(data, layer) {
        if (!data || !data.legend) return;
        this.parentVue.isShowLegend = true;
        var type = null;
        var title = null;
        var lengendData;
        if (data.legend.legendList instanceof Array) {
            type = "list";
            title = layer.title;
            if (data.legend.title) {
                title = data.legend.title;
            }
            lengendData = data.legend.legendList;
        } else {
            type = "imgSrc";
            title = layer.agMetaData.nameCn;
            if (data.legend.title) {
                title = data.legend.title;
            }
            lengendData = data.legend;
        }
        this.legendList.push({
            id: layer.id,
            type: type,
            lengendData: lengendData,
            title: title,
            isShow: true,
            islyChecked: true
        })
        this.parentVue.legendList = this.legendList;
    }
}
export default new legend();