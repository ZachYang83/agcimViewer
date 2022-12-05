/**
 * 获取条纹树
 * @date 2020-08-18
 * @param {JSON} _data
 * @returns {JSON} 
 */
export function getArticleTree(_data) {
    let result = []
    let loop = function(item) {
        let loopResult = []
        _data.forEach((el) => {
            if (el.ParentsID == item.ID) {
                if (!isNullOrEmpty(el.ParentsID)) {
                    if (el.hasChild == true) {
                        el.children = loop(el)
                    } else {
                        el.title = el.title + el.detail
                    }
                    loopResult.push(el)
                }
            }
        })
        return loopResult;
    }
    _data.forEach(el => {
        if (el.hasChild == true && isNullOrEmpty(el.ParentsID)) {
            el.children = loop(el)
            result.push(el)
        }
    });
    return result
}


/**
 * 判断参数是否为空
 * @date 2020-08-18
 * @param {any} _data
 * @returns {any} 
 */

export function isNullOrEmpty(_data) {
    return _data === undefined || _data === '' || _data === null || _data.length === 0
}

export class CalculationStandard {
    constructor() {

    }

    // 规则编号：5.6.3
    // 规则：阳台栏板或栏杆净高，六层及六层以下不应低于1.05m；七层及七层以上不应低于1.10m。
    JZ563(_data) {
        // 返回值
        var result = []

        //六层及六层以下不应低于1.05m
        var lowMinHeight = 1.05

        // 七层及七层以上不应低于1.10m
        var heightMinHeight = 1.10

        //获取栏杆所在楼层
        function getLevel(str) {
            let wz = str.indexOf('F')
            let res = str.substring(0, wz)
            return res
        }
        //获取栏杆高度
        function getHeight(_elementattributes) {
            let height = 0

            _elementattributes.forEach(element => {
                if (element.BuiltInParameter == "ELEM_FAMILY_AND_TYPE_PARAM") {
                    let wz = element.AttrValue.indexOf('mm')
                    let res = element.AttrValue.substring(0, wz)
                    height = res
                }
            });
            return height;
        }

        _data.forEach(el => {
            let floorNumber = getLevel(el.level)
            let height = getHeight(JSON.parse(el.elementattributes)) * 0.001
            if (floorNumber <= 6) {
                if (height < lowMinHeight) {
                    result.push({
                        title: `问题构件${result.length + 1}`,
                        key: el.id,
                        detail: el,
                    })
                }
            } else {
                if (height < heightMinHeight) {
                    result.push({
                        title: `问题构件${result.length + 1}`,
                        key: el.id,
                        detail: el,
                    })
                }
            }
        });
        return result
    }
    JZ815(_data) {
        // alert(111)
    }
}