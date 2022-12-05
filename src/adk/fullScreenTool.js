/**
 * @lastUpdateBy : 张瀚
 * @description: 全屏展示
 */

export default new class {
    constructor(){
        //拦截默认的F11的全屏，F11全屏是没法代码直接退出的
        document.addEventListener('keydown',event=>{
            if (event.key == 'F11') {
                event.preventDefault()
                this.toggleFullScreen()
            }
        })
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 切换全屏/非全屏
     */
    toggleFullScreen() {
        if (this.isFullScreen()) {
            this.exitFullScreen()
        } else {
            this.intoFullScreen()
        }
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 进入全屏
     * @param {*} element
     * @return {*}
     */
    intoFullScreen(element = document.documentElement) {
        let rfs = element.requestFullScreen || element.webkitRequestFullScreen ||
            element.mozRequestFullScreen || element.msRequestFullScreen;
        if (rfs) {
            rfs.call(element);
        } else if (window.ActiveXObject) {
            let wscript = new ActiveXObject("WScript.Shell");
            if (wscript) {
                wscript.SendKeys("{F11}");
            }
        }
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 退出全屏
     * @param {*} element
     */
    exitFullScreen(element = document) {
        let cfs = element.cancelFullScreen || element.webkitCancelFullScreen ||
            element.mozCancelFullScreen || element.exitFullScreen;
        if (cfs) {
            cfs.call(element);
        } else if (window.ActiveXObject) {
            let wscript = new ActiveXObject("WScript.Shell");
            if (wscript != null) {
                wscript.SendKeys("{F11}");
            }
        }
    }
    /**
     * @lastUpdateBy : 张瀚
     * @description: 判断当前是否全屏状态中，建议判断再决定执行什么操作
     * @return {*}
     */
    isFullScreen() {
        //判断浏览器是否处于全屏状态 （需要考虑兼容问题）
        //火狐浏览器
        var isFull = document.mozFullScreen ||
            document.fullScreen ||
            //谷歌浏览器及Webkit内核浏览器
            document.webkitIsFullScreen ||
            document.webkitRequestFullScreen ||
            document.mozRequestFullScreen ||
            document.msFullscreenEnabled
        if (isFull == true) {
            return true
        }
        return false
    }
}