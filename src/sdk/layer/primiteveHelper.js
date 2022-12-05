/**
 * Class PrimiteveHelper 类
 */
class PrimiteveHelper {
  constructor() {

  }

  /**
   * 获取3dtiles或gltf模型矩阵
   * @param {object} model 3dtiles/gltf
   */
  getModelMatrix(model) {
    var modelMatrix = null;
    if (model._content) {
      modelMatrix = model.primitive._root.transform;
    } else if (model.id) {
      modelMatrix = model.primitive.modelMatrix;
    }
    return modelMatrix;
  }

  updateModeMatrix() {

  }
}
export default new PrimiteveHelper();