/**
 * @lastUpdateBy : 张瀚
 * @description: 清除工具
 */
export default new class {
    /**
     * @lastUpdateBy : 张瀚
     * @description: 移除所有内容，还原默认地图
     * @param {*} viewer
     * @param {*} excludeFunctions 根据不同类型，提供不同的回调方法，接受对应类型的参数，返回true则不会被移除
     */
    removeAll(viewer, excludeFunctions = {}) {
        //清理entity
        this.removeEntity(viewer, excludeFunctions.entities)
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 移除所有的entity
     * @param {*} viewer
     * @param {*} excludeFunction 接受一个entity，返回true则不会被移除
     */
    removeEntity(viewer, excludeFunction = entity => false) {
        let needRemoveEntites = []
        viewer.entities.values.forEach(entity => {
            if (!excludeFunction(entity)) {
                needRemoveEntites.push(entity)
            }
        })
        needRemoveEntites.forEach(entity => {
            viewer.entities.remove(entity)
        })
    }
}