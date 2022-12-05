/**
 * 获取树的所有key
 * @param {Array} tree - 树结构数据
 * @param {Array} arr - 返回值
 */
const getMenuKeys = function (tree, arr) {
    for (let value of tree) {
        if (value.children) {
            arr.push(value.key);
            getMenuKeys(value.children, arr);
        }
    }
    return arr;
};

/**
 * JS获取树的父节点及祖先节点
 * @param {*} node 
 * @param {Array} tree 树结构数据
 * @param {*} parentNodes 
 * @param {*} index 
 */
const getAllParent = function (node, tree, parentNodes = [], index = 0) {
    if (!node || node.fid === 0) {
        return
    }
    getParentNode(node, parentNodes, tree)
    let parentNode = parentNodes[index]
    getAllParent(parentNode, tree, parentNodes, ++index)
    return parentNodes
}
/**
 * 获取父节点
 * @param {*} node 
 * @param {*} parentNodes 
 * @param {*} tree 
 */
function getParentNode(node, parentNodes, tree) {
    for (let i = 0; i < tree.length; i++) {
        let item = tree[i]
        if (item.id === node.pid) {
            parentNodes.push(item)
            return
        }
        if (item.children && item.children.length > 0) {
            getParentNode(node, parentNodes, item.children)
        }
    }
}


/**
 * 将接口数据转换成 新的树数据
 * @param {Array} data - 树
 * @param {String} pre_index - 拼序号的
 * @param {Array} checkedData - 默认选中的
 */
const restructTreeData = function (data, pre_index, checkedData) {
    for (let i = 0; i < data.length; i++) {
        let v = data[i];
        if (pre_index) {
            v.index = pre_index + "." + (i + 1);
        } else {
            v.index = i + 1;
        } 
        v.key = v.id;
        v.title = v.text;
        v.scopedSlots = {
            title: "title"
        };

        if (v.layers && v.layers.length) {
            let _contact = [...v.layers, ...v.children];
            v.children = Array.from(new Set(_contact));
            //初始化选中的值
            for (let j = 0; j < v.layers.length; j++) {
                if (v.layers[j].state.checked) {
                    checkedData.push(v.layers[j].id);
                }
                v.layers[j].text = v.layers[j].nameCn; //
                v.layers[j].checked = v.layers[j].state.checked;
            }
        }
        if (v.children) {
            if (pre_index) {
                restructTreeData(v.children, pre_index + "." + (i + 1), checkedData);
            } else {
                restructTreeData(v.children, i + 1, checkedData);
            }
        }
    }
    return {
        data,
        checkedData
    };
}

/**
 * 获取父节点的key
 * @param {String} key -节点key
 * @param {Array} tree 树结构数据
 */
const getParentKey = function (key, tree) {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some(item => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
}

/**
 * 获取父+祖父的key
 * @param {*} key 
 * @param {*} tree 
 * @param {*} backupsExpandedKeys 
 */
const getAllParentKey = function (key, tree, backupsExpandedKeys) {
    var parentKey;
    if (key) {
        parentKey = getParentKey(key, tree);
        if (parentKey) {
            //如果父亲节点存在，判断是否已经存在于展开列表里，不存在就进行push
            if (!backupsExpandedKeys.some(item => item === parentKey)) {
                backupsExpandedKeys.push(parentKey);
            }
            //一层一层进行获取
            getAllParentKey(parentKey, tree, backupsExpandedKeys);
        }
    }
    return backupsExpandedKeys;
}


/**
 * 遍历树获取所有层级key
 * @param {Array} tree -树结构数据
 * @param {Number} n - 层级
 * @param {Array} res - 返回值 
 */
const getMenuKeysByLevel = function (tree, n, res) {
    for (let value of tree) {
        if (value.index != undefined) {
            let str = value.index.toString();
            var len = str.split(".").length;
        }
        if (value.key && len < n) {
            res.push(value.key);
            if (value.children) {
                getMenuKeysByLevel(value.children, n, res);
            }
        }
    }
    return res;
}

/**
 * 获取2个数组的差集
 * @param {Array} arr1 
 * @param {Array} arr2 
 */
const getDiffSet = function (arr1, arr2) {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    const newArr1 = [...set1].filter((item) => {
        return !set2.has(item);
    });
    const newArr2 = [...set2].filter(item => {
        return !set1.has(item);
    });

    const newArr = [...newArr1, ...newArr2];
    return newArr;
}

export {
    restructTreeData,
    getMenuKeys,
    getAllParent,
    getParentKey,
    getAllParentKey,
    getMenuKeysByLevel,
    getDiffSet
}