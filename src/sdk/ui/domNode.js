/**
 * 和dom相关的类，界面
 * @namespace DomNode 
 */
class DomNode {
    /**
     * 获取div距离上和左边的距离
     * @function getDomTopLeft
     * @memberof DomNode
     * @param {Object} dom - dom对象
     */
    getDomTopLeft(dom) {
        var top = dom.offsetTop;
        var left = dom.offsetLeft;
        var current = dom.offsetParent;
        while (current !== null) {
            top += current.offsetTop;
            left += current.offsetLeft;
            current = current.offsetParent;
        }
        return {
            left: left,
            top: top
        };
    }
    /**
     * 创建标签<a>用来下载文件
     * @param {string} href 下载链接
     * @param {string} name 文件名，带后缀
     */
    downloadByA(href, name) {
        var a = document.createElement("a");
        a.download = name;
        a.target = "_blank";
        a.style.display = "none";
        a.href = href;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

}
export default new DomNode();