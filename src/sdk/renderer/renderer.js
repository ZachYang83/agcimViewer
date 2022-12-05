class Renderer {
    /**
     * 设置对象的材质为图片
     * @param {*} primitive 
     * @param {*} img 
     */
    setMaterialFromImage(primitive, img) {
        primitive.appearance.material = new Cesium.Material({
            fabric: {
                type: "Image",
                uniforms: {
                    image: img
                }
            }
        });
    }
    /**
     * 设置对象透明度
     * @param {*} primitive 
     * @param {*} alpha 
     */
    setOpacity(primitive,alpha){
        primitive.appearance.material.uniforms.color.alpha = alpha;
    }
}
export default new Renderer();