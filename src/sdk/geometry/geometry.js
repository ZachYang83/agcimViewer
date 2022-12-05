/**
 * class Geometry 图形相关
 */
class Geometry {
    /**
     * 根据矩形来创建基层元素
     * @param {number} west 西经
     * @param {number} south 南纬
     * @param {number} east 东经
     * @param {number} north 北纬
     * @return {primitive} primitive实体对象
     */
    buildPrimitiveFromRectangle(west, south, east, north) {
        var newPrimitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.RectangleGeometry({
                    rectangle: Cesium.Rectangle.fromDegrees(
                        west,
                        south,
                        east,
                        north
                    ),
                    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
                })
            }),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: false
            })
        });
        return newPrimitive;
    }
}

export default new Geometry();