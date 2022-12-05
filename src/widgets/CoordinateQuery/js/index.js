/*
 * @Author: your name
 * @Date: 2020-12-16 09:57:43
 * @LastEditTime: 2020-12-16 15:38:25
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agKnowledgeCity\src\widgets\CoordinateQuery\js\index.js
 */
import Draw from "@/sdk/interactive/draw";

class CoordinateQuery {
    constructor() {
        this.viewer = null;
        this.draw = null;
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 绘制点并获取点的世界坐标
     * @param {*}
     * @return {*}
     */
    initialize(viewer, vm) {
        var _this = this;
        _this.viewer = viewer;
        _this.draw = new Draw(viewer);
        _this.draw.drawPoint().then(result => {
            var positions = result.positions;
            var x = positions[0].x
            var y = positions[0].y
            var z = positions[0].z
            vm.x = x;
            vm.y = y;
            vm.z = z;
        }, error => {
            console.log(error);
        });

    }
    /**
    * @author: pwz（潘文周） 
    * @description: 方法描述 清除结果
    * @param {*}
    * @return {*}
    */
    dispose() {
        if (this.draw) {
            this.draw.dispose();
        }
    }
}

export default new CoordinateQuery();