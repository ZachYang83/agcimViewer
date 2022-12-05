

/*
 * @author: pwz（潘文周）
 * @description: 高亮entity
 */
const geometryTypeArr = ["ellipsoid", "cylinder", "cylinder", "box", "model"]
export default class Highlight {
    constructor(option) {
        this.option = option;
        this.entitySet = {};
    }
    add(entity) {
        if (Array.isArray(entity)) return this.addMany(entity);
        this.removeAll();
        geometryTypeArr.forEach(geometryType => {
            if (entity[geometryType]) {
                let oldStyle
                if (entity[geometryType]._material) {
                    oldStyle = entity[geometryType]._material._color.getValue();
                    entity[geometryType]._material._color.setValue(this.option.material)
                } else {
                    oldStyle = entity[geometryType]._color.getValue();
                    entity[geometryType]._color.setValue(this.option.material)
                }
                if (!this.entitySet[entity._id]) this.entitySet[entity._id] = { entity, oldStyle };
            }
        })
    }
    addMany(entityArr) {
        this.removeAll();
        geometryTypeArr.forEach(geometryType => {
            entityArr.forEach((entity) => {
                if (entity[geometryType]) {
                    let oldStyle
                    if (entity[geometryType]._material) {
                        oldStyle = entity[geometryType]._material._color.getValue();
                        entity[geometryType]._material._color.setValue(this.option.material)
                    } else {
                        oldStyle = entity[geometryType]._color.getValue();
                        entity[geometryType]._color.setValue(this.option.material)
                    }
                    if (!this.entitySet[entity._id]) this.entitySet[entity._id] = { entity, oldStyle };
                }
            })
        })
    }
    remove(entity, oldStyle) {
        geometryTypeArr.forEach(geometryType => {
            if (entity[geometryType]) {
                if (entity[geometryType]._material) {
                    entity[geometryType]._material._color.setValue(oldStyle)
                } else {
                    entity[geometryType]._color.setValue(oldStyle)
                }
            }
        })
    }
    removeAll() {
        for (let key in this.entitySet) {
            this.remove(this.entitySet[key].entity, this.entitySet[key].oldStyle)
        }
        this.entitySet = {};
    }

}
