/*
 * @Author: your name
 * @Date: 2021-01-12 15:08:54
 * @LastEditTime: 2021-01-21 11:24:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \agcimViewer\src\widgets\SunshineCalculation\js\visibility.js
 */
class Visibility {
  constructor(viewer, entities) {
    this.viewer = viewer;
    this.entities = entities;
  }

  /**
   * @description: 碰撞检测
   * @param {*} targetPos 源目标位置
   * @param {*} direction 方向
   */
  isIntersect(targetPos, direction) {
    var ray = new Cesium.Ray(targetPos, direction);
    var objectsToExclude = [];
    const result = this.viewer.scene.pickFromRay(ray, objectsToExclude);
    if (
      Cesium.defined(result) && Cesium.defined(result.object) && result.position
    ) {
      return true;
    }
    return false;
  }

  getIntersect(ori, des) {
    var direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(des, ori, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    var ray = new Cesium.Ray(ori, direction);
    var objectsToExclude = [];
    var result = this.viewer.scene.pickFromRay(ray, objectsToExclude);
    if (Cesium.defined(result)) {
      this.showIntersection(result, des, ori);
    } else {
      this.drawLine(ori, des, Cesium.Color.GREEN);
    }
  }

  drawLine(leftPoint, secPoint, color) {
    var entity = this.viewer.entities.add({
      polyline: {
        positions: [leftPoint, secPoint],
        width: 2,
        material: color,
      },
    });
    this.entities.push(entity);
  }

  showIntersection(result, des, ori) {
    // 如果是场景模型的交互点，排除交互点是地球表面
    this.clearLinesByName(["agPolyline"]);
    if (Cesium.defined(result.object) && Cesium.defined(result.position)) {
      this.drawLine(result.position, ori, Cesium.Color.RED); // 可视区域
      this.drawLine(result.position, des, Cesium.Color.GREEN); // 不可视区域
      return true;
    } else {
      return false;
    }
  }

  clearLinesByName(type) {
    let et = this.viewer.entities.values;
    for (let i = 0; i < et.length; i++) {
      type.map((value) => {
        if (et[i].name == value) {
          this.viewer.entities.remove(et[i]);
          i--;
        }
      });
    }
  }
}

export default Visibility;