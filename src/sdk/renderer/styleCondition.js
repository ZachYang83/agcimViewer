import commonUtils from "@/sdk/utils/commonUtils";
/**
 * class StyleCondition
 */


class StyleCondition {
    constructor(tileset) {
        this.style = new Cesium.Cesium3DTileStyle();
        this.tileset = tileset;
    }

    /**
    * 添加显示条件
    * @param {condition} condition 显示条件，一个表达式 "${id}===1&& ${level}===1"
   */
    addShowCondition(condition) {
        var conds = [];
        conds.push([condition, true]);

        var lastConditon = this._getRestCondition("show", condition, this.tileset);
        if (lastConditon.length <= 0) lastConditon.push([true, true]);

        conds = conds.concat(lastConditon);
        this.setShowStyle( conds);
    }


    /**
    * 添加隐藏条件
    * @param {condition} condition 隐藏条件，一个表达式 "${id}===1&& ${level}===1"
    */
    addHideCondition(condition) {
        var conds = [];
        conds.push([condition, false]);

        var lastConditon = this._getRestCondition("show", condition, this.tileset);
        if (lastConditon.length <= 0) lastConditon.push([true, true]);

        conds = conds.concat(lastConditon);
        this.setShowStyle( conds);
    }

    /**
    * 重置整个3dtiles的显隐
    * @param {show} show  布尔值：true/false
    */
    resetVisible(show) {
        var conds = [];
        conds.push([true, show]);
        this.setShowStyle( conds);
    }

     /**
     * 设置3dtiles显隐
     * @param {conds} conds 显隐条件，一个数组 [["${id}===1",true]]
     */
    setShowStyle(conds) {
        this.style = new Cesium.Cesium3DTileStyle();
        if (this.tileset.style)
            this.style.color = this.tileset.style.color;
        else
            this.style.color = undefined;

        this.style.show = {
            conditions: conds
        };
        this.tileset.style = this.style;
    }


    /**
    * 追加颜色样式
    * @param {condition} condition 条件 "${id}===1"
    * @param {color}   color  WHITE、#ffffff等颜色值
    */
    addColorStyle(condition, color) {

        var conds = []; conds.push([condition, `color('${color}')`]);

        var lastConditon = this._getRestCondition("color", condition, this.tileset);
        if (lastConditon.length <= 0) lastConditon.push([true, `color('WHITE')`]);

        conds = conds.concat(lastConditon);
        this.setColorStyle(conds);
    }

    /**
    * 追加颜色样式
    * @param {field} field 条件 "${id}===1"
    * @param {value} value 条件 "${id}===1"
    * @param {color} color  WHITE、#ffffff等颜色值
    */
    addColorStyleByKeyValue(field,value,color){
        var condition=null;
        if(typeof(value)=="number") condition="${"+field+"}==="+value;
        else   condition="${"+field+"}==='"+value+"'";

        this.addColorStyle(condition,color);
    }

    /**
    * 移除3dtiles的颜色条件
    * @param {condition} condition 条件 "${id}===1"
    */
    removeColorCondition(condition) {
        var conds = [];
        var lastConditon = this._getRestCondition("color", condition);
        if (lastConditon.length <= 0) lastConditon.push([true, `color('WHITE')`]);

        conds = conds.concat(lastConditon);
        this.setColorStyle(conds);
    }

    /**
    * 重置整个3dtiles的颜色
    * @param {color} color  颜色值，默认为白色，即3dtiles的初始颜色
    * @param {opacity} opacity 透明度
    */
    resetColorStyle( color = "WHITE", opacity = 1) {
        var conds = [];
        conds.push([true, `color('${color}',${opacity})`]);

        this.setColorStyle( conds);
    }


    /**
     * 设置颜色样式
     * @param {conds} conds 样式条件,一个数组  [["${id}===1",color('WHITE')]]
     */
    setColorStyle(conds) {
        this.style = new Cesium.Cesium3DTileStyle();
        if (this.tileset.style)
            this.style.show = this.tileset.style.show;
        else
            this.style.show = undefined;

        this.style.color = {
            conditions: conds
        };

        this.tileset.style = this.style;
    }


    /**
     * 设置3dtiles透明度
     * @param {opacity} opacity 透明度(0-1之间的数值)
     */
    setOpacity(opacity) {
        this.style = new Cesium.Cesium3DTileStyle();
        if (this.tileset.style)
            this.style.show = this.tileset.style.show;
        else
            this.style.show = undefined;

        var conds = [];
        if (this.tileset.style.color && this.tileset.style.color._conditions) {
            var lastColorCons = this.tileset.style.color._conditions;
            for (let i = 0; i < lastColorCons.length; i++) {
                var color = this._parseColor(lastColorCons[i][1]);
                conds.push([lastColorCons[i][0], `color(${color},${opacity})`]);
            }

        } else if (this.tileset.style.color && this.tileset.style.color._expression) {
            var color = this._parseColor(this.tileset.style.color._expression);
            conds.push([true, `color(${color},${opacity})`]);
        }
        else
            conds.push([true, `color('WHITE',${opacity})`]);

        this.style.color = {
            conditions: conds
        };

        this.tileset.style = this.style;
    }
    /**
    * 获取表达式中的颜色值
    * @param {expression} expression 样式中的颜色表达式
    * @private
    */
    _parseColor(expression) {
        var color = null;
        var aPos = expression.indexOf('(');
        var bPos = expression.indexOf(',');
        var cPos = expression.indexOf(')');
        if (bPos > 0)
            color = expression.substr(aPos + 1, bPos - aPos - 1);
        else
            color = expression.substr(aPos + 1, cPos - aPos - 1);

        return color
    }

    /**
    * 获取原有的条件
    * @param {type} type 类型：color颜色、show显示
    * @param {condition} expression 样式中的颜色表达式
    * @private
    */
    _getRestCondition(type, condition) {

        var lastConditon = null;
        if(!this.tileset.style) return [];
        if (type == "color") 
            lastConditon = this.tileset.style.color;
        else if (type == "show")
            lastConditon = this.tileset.style.show;

        if (!lastConditon) return [];

        //移除当前设置的条件
        var repeatIndex = -1; var conds = [];
        if (lastConditon._conditions) {  //如果样式条件是一个数组
            var conditions = lastConditon._conditions;
            for (let i = 0; i < conditions.length; i++) {
                if (conditions[i][0] != condition)
                    continue;
                repeatIndex = i;
            }
            if (repeatIndex >= 0)
                conditions.splice(repeatIndex, 1);

            conds = conds.concat(conditions);

        } else if (lastConditon._expression) {  //如果样式条件是一个表达式
            conds.push(true, lastConditon._expression)
        }
        return conds;
    }
}

export default StyleCondition