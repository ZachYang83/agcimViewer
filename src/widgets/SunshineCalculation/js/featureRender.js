class FeatureRender{
    constructor(colors){
        this.colors = colors;
    }
    setWindowColorByValue(statisticalTable,selectedFeatures){
        for(var i=0;i<selectedFeatures.length;i++){
            for(var j=0;j<statisticalTable.length;j++){
                if(selectedFeatures[i].id==statisticalTable[j].窗户编号){
                    selectedFeatures[i].object.color=this.getColor2(statisticalTable[j].累计有效日照时长);
                    break;
                }
            }
        }
    }
    getColor(value){
        var colors=["15bf05","28ad03","419600","5e7900","7c5d00","9b4000","b92600",
    "d21300","ea0400","fb0000"];
        var t=parseInt(value)-1;
        if(t<0)t=0;
        if(t>colors.length-1)t=colors.length-1;
        return Cesium.Color.fromCssColorString("#"+colors[t]);
    }
    getColor2(value){
        var colors=["ff0000","ffff00","008000","00ffff","0000ff","800080"];
        colors = this.colors || colors;
        var t=parseInt(value);
        if(t<3){
            return Cesium.Color.fromCssColorString("#"+colors[0]);
        }
        for(var i=1;i<colors.length-1;i++){
            if(t<3+i){
                return Cesium.Color.fromCssColorString("#"+colors[i]);
            }
        }
        return Cesium.Color.fromCssColorString("#"+colors[colors.length-1]);
    }
}
export default new FeatureRender();