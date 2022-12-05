/*
 * @author: ML（梅兰）
 * @description: 颜色渲染
 */
class RenderColor {


        constructor(option) {
            this.viewer = option.viewer;
            this.dataList = option.dataList;
        }

        /**
         * @author: ML（梅兰）
         * @description: 方法描述  渲染色带颜色
         * @param {*} index 选择的色带数组下标
         * @param {*} type top 表示竖直方向  right 表示水平方向
         * @return {*}
         */
        spliceColor(index,type) {
            let colorArray = this.dataList[index].colorArray;
            var colorObj="";
            if(type == "right")
            {
                colorObj="linear-gradient(to right, ";
                for(var i=colorArray.length-1;i >= 0;i--)
                    colorObj = colorObj + colorArray[i].color +","
            }
            else
            {
                colorObj="linear-gradient(to top, ";
                colorArray.forEach(function(item){
                    colorObj = colorObj + item.color +" "+item.opacity+"%,"
                });
            }
            colorObj = colorObj.substr(0,colorObj.length-1)+")";
            console.log(colorObj);
            return colorObj;
        }



    /**
     * @author: ML（梅兰）
     * @description: 方法描述  更新色带颜色
     * @param {*} params.colorTargetInfo 所选择的色带
     * @param {*} params.colorSlideVal 设置色差值滑块值
     * @param {*} params.colorSliderMax 设置色差值滑块最大值
     * @param {*} params.colorSliderMin 设置色差值滑块最小值
     * @return {*}
     */
    changeColorSlideVal(params) {
        let percentage=0,avgePerce=0;
        var arry = params.colorTargetInfo.colorArray;
        if( params.colorSlideVal > 0)
        {
            percentage = (params.colorSlideVal / (params.colorSliderMax - params.colorSliderMin)).toFixed(2); //最上头设置的比例值
            avgePerce = ((1 - percentage)/(arry.length-1)).toFixed(2);
        }
        else
            avgePerce = ((1 - percentage)/arry.length).toFixed(2);
        var colorObj="linear-gradient(to right, ";
        colorObj = colorObj + arry[arry.length-1].color +" "+( percentage* 100).toFixed(0)+"%,"
        for(var i=arry.length-1,j=1;i > 0;i--,j++)
            colorObj = colorObj + arry[i].color +" "+((Number(percentage)+Number(avgePerce)*j) * 100 ).toFixed(0)+"%,"
        colorObj = colorObj + arry[0].color +" "+( 1* 100).toFixed(0)+"%)"
        //console.log(colorObj);
        return colorObj;
    }



};
export default RenderColor;