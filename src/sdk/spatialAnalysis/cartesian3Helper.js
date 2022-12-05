/**
 * 临时的，即将删除
 * @author 蔡周峻
 */
class Cartesian3Helper{
    constructor(){

    }
    subtract(left,right){
        return Cesium.Cartesian3.subtract(left,right,new Cesium.Cartesian3(0,0,0));
    }
    add(left,right){
        return Cesium.Cartesian3.add(left,right,new Cesium.Cartesian3(0,0,0));
    }
    normalize(input){
        if(input.x==0&&input.y==0){
            return new Cesium.Cartesian3(0,0,0);
        }
        else{
            return Cesium.Cartesian3.normalize(input,new Cesium.Cartesian3(0,0,0));
        }
    }
    cross(left,right){
        return Cesium.Cartesian3.cross(left, right,new Cesium.Cartesian3(0,0,0))
    }
    multiplyByScalar (input,scalar){
        return Cesium.Cartesian3.multiplyByScalar(input,scalar,new Cesium.Cartesian3(0,0,0))
    }

}
export default new Cartesian3Helper;