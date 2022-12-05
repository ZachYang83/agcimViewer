import canvas2image from '@/views/js/extension/canvas2Image.js';
import ok from "@/assets/img/sdk/utils/ok.png";
import cancel from "@/assets/img/sdk/utils/cancel.png";
/**
* class Snapshot
*/
class Snapshot {
    constructor() {
        this.isCameraShow = false;
        this.okIcon = ok;
        this.cancelIcon = cancel;
        this.okCallback = null;
        this.cancelCallback = null;
        this.area = {
            x: 0,
            y: 0,
            x1: 0,
            y1: 0,
            isDown: false
        };
        this.beforeXY = {
            x: 0,
            y: 0
        };
        this.area1 = {
            x: 0,
            y: 0,
            x1: 0,
            y1: 0,
            isDragBig: false
        }
        this.isCanMove = false;
        this.bindLi = -1;
        this.fomartArr = [{
            type: 'png',
            label: 'PNG',
            active: true
        }, {
            type: 'jpg',
            label: 'JPG',
            active: false
        }, {
            type: 'bmp',
            label: 'BMP',
            active: false
        }];

        this.canvas = null;
        this.ctx = null;
        this.drawBox = null;
        this.rectBox = null;
        this.wDom = null;
        this.hDom = null;
    }
    /**
     * @description: 初始化截图工具
     * @param {Function} okCallback  确定回调方法
     * @param {Function} cancelCallback  取消回调方法
     */
    initialize(okCallback, cancelCallback) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
        if (this.isCameraShow) {
            return;
        } else {
            document.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            }, false);
            this._createCanvasUI();
            this._createDrawBoxUI();
            this._bind()
        }
    }
    /**
     * @description: 退出截图功能
     */
    dispose() {
        if (this.cancelCallback) {
            this.cancelCallback()
        }
        this.isCameraShow = false;
        this.area.isDown = false;
        this.drawBox.style.display = "none";
        this.canvas.style.display = "none";
        this.drawBox.remove();
        if (document.getElementById("canvasui")) {
            setTimeout(() => {
                document.getElementById("canvasui").style.display = "none";
                document.getElementById("canvasui").remove();
            }, 10)
        }
    }
    /**
     * @description: 截图功能事件监听绑定
     * @private
     */
    _bind() {
        // 解除选框
        let _t = this;
        this.drawBox.addEventListener("mousedown", (e) => {
            _t.area.isDown = false;
        }, false);

        this.canvas.addEventListener('mousedown', (e) => {
            this.drawBox.style.display = 'block';
            _t.area.x = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
            _t.area.y = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
            this.area.isDown = true

            document.body.addEventListener('mousemove', _docMoveEvent, false);
        }, false);

        function _docMoveEvent(e) {
            if (_t.area.isDown) {
                _t.area.x1 = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
                _t.area.y1 = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
                _t._draw();
            }else{
                var nx = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
                var ny = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
                // 拖动小方块
                if (_t.isCanMove) {
                    switch (_t.bindLi) {
                        case '0':
                            _t.area.x = nx
                            _t.area.y = ny
                            break;
                        case '1':
                            _t.area.y = ny
                            break;
                        case '2':
                            _t.area.x1 = nx
                            _t.area.y = ny
                            break;
                        case '3':
                            _t.area.x = nx
                            break;
                        case '4':
                            _t.area.x1 = nx
                            break;
                        case '5':
                            _t.area.x = nx
                            _t.area.y1 = ny
                            break;
                        case '6':
                            _t.area.y1 = ny
                            break;
                        case '7':
                            _t.area.x1 = nx
                            _t.area.y1 = ny
                            break;
                        default:
                            break;
                    }
                    _t._draw();
                }
                // 拖拽正个移动框
                if (_t.area1.isDragBig) {
                    var nw = nx - _t.beforeXY.x;
                    var nh = ny - _t.beforeXY.y;
                    _t.area.x = _t.area1.x + nw;
                    _t.area.y = _t.area1.y + nh;
                    _t.area.x1 = _t.area1.x1 + nw;
                    _t.area.y1 = _t.area1.y1 + nh;
                    _t._draw();
                }
            }
        }
        
        document.body.addEventListener('mouseup', (e) => {
            this.area.isDown = false;
            this.bindLi = -1;
        }, false);
    }
    /**
     * @description: 获取鼠标点击的位置（相对canvas元素）坐标，即在这个canvas的位置坐标点
     * @param {Object} canvas 
     * @param {Number} x 鼠标相对浏览器页面的水平坐标
     * @param {Number} y 鼠标相对浏览器页面的垂直坐标
     * @private
     */
    _getPointOnCanvas(canvas, x, y){
        let bbox = canvas.getBoundingClientRect();
        return {
            x: x - bbox.left * (canvas.width / bbox.width),
            y: y - bbox.top * (canvas.height / bbox.height)
        };
    }
    /**
     * @description: 画截图区域
     * @private
     */
    _draw() {
        // 区域位置
        let left = this.area.x1 < this.area.x ? this.area.x1 : this.area.x;
        let top = this.area.y1 < this.area.y ? this.area.y1 : this.area.y;
        this.drawBox.style.left = left + 'px';
        this.drawBox.style.top = top + 'px';
        // 设置input显示宽高
        this.wDom.value = this._getLength(this.area.x1, this.area.x);
        this.hDom.value = this._getLength(this.area.y1, this.area.y);
        // 区域宽高
        this.rectBox.style.width = this.wDom.value + 'px';
        this.rectBox.style.height = this.hDom.value + 'px';

        // 设置区域的8个小方块位置
        this._layoutPoints(this.wDom.value, this.hDom.value)
    }
    /**
     * @description：基于cesium 场景中的 canvas创建一个canvas画布
     * @private
     */
    _createCanvasUI() {
        let d = document.getElementById("containCesium");
        let w = d.clientWidth,
            h = d.clientHeight;
        this.canvas = document.createElement("canvas");
        d.appendChild(this.canvas);
        this.canvas.setAttribute("id", "canvasui")
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.cssText = "position: absolute; top: 0; left: 0; cursor: crosshair";

        let cimCanvas = CIM.viewer.scene.canvas;
        let cimImg = canvas2image.convertToImage(cimCanvas, w, w * cimCanvas.height / cimCanvas.width, 'bmp');
        let img = new Image();
        img.src = cimImg.src;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0)
        }
    }
    /**
     * @description：创建截图区域的div
     * @private
     */
    _createDrawBoxUI() {
        let div = document.createElement('div');
        document.getElementById("containCesium").appendChild(div);
        div.setAttribute('id', 'drawBox');
        div.style.cssText =
            "display:none;position: absolute; top: 0; left: 0; border: 1px solid #1aad19; outline: rgba(0, 0, 0, 0.5) dashed 10000px;user-select: none;";
        this.drawBox = div;
        let rectBox = document.createElement('div');
        let inputBox = document.createElement('div');
        let menuBox = document.createElement('div');
        inputBox.style.cssText = "position: absolute; bottom: 0; left: 0; color: #fff; width: 250px;";
        menuBox.style.cssText =
            " position: absolute; bottom: 0; right: 0; background: rgba(255, 255, 255, 0.7); padding: 5px; border-radius: 2px; min-width: 200px;cursor:pointer;";
        this.drawBox.appendChild(rectBox);
        this.drawBox.appendChild(inputBox);
        this.drawBox.appendChild(menuBox);
        this._createDragPointUI(rectBox);
        this._createDragBoxMove(rectBox);
        this._createInputUI(inputBox);
        this._createMenuUI(menuBox);

        //8个原点拖拉调整
        let _t = this;
        rectBox.addEventListener('mousedown', function (e) {
            var event = e || window.event;
            var target = event.target;
            _t.beforeXY.x = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
            _t.beforeXY.y = _t._getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;

            if (target.nodeName.toLocaleLowerCase() === 'li') {
                _t.isCanMove = true;
                _t.bindLi = target.dataset.type;
            } else {
                _t.isCanMove = false;
                _t.bindLi = -1;
            }
        }, false);

        this.rectBox = rectBox;
    }
    /**
     * @description: 创建8个可拖动的小方块
     * @param {Object} rectBox  截图区域div盒子
     * @private
     */
    _createDragPointUI(rectBox) {
        let css =
            "position: absolute; list-style: none; width: 6px; height: 6px; background: #1aad19;";
        for (let i = 0; i < 8; i++) {
            let li = document.createElement('li');
            li.setAttribute("data-type", i);
            rectBox.appendChild(li);
            switch (i) {
                case 1:
                case 6:
                    li.style.cssText = css + "cursor: s-resize;"
                    break;
                case 0:
                case 7:
                    li.style.cssText = css + "cursor: se-resize;"
                    break;
                case 2:
                case 5:
                    li.style.cssText = css + "cursor: ne-resize;"
                    break;
                case 3:
                case 4:
                    li.style.cssText = css + "cursor: w-resize;"
                    break;
            }

        }
    }
    /**
     * @description: 8个可拖动的小方块 位置布局
     * @param {String} w 数字类型的字符串或数字 截图区域的宽
     * @param {String} h 数字类型的字符串或数字 截图区域的高
     * @private
     */
    _layoutPoints(w, h) {
        let arr = this.rectBox.children;
        let arr1 = [{ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, { x: 0, y: 1 }, { x: 0.5, y: 1 }, { x: 1, y: 1 }];
        for (let i = 0; i < arr1.length; i++) {
            arr[i].style.left = parseInt(arr1[i].x * parseInt(w) - 3) + 'px';
            arr[i].style.top = parseInt(arr1[i].y * parseInt(h) - 3) + 'px';
        }
    }
    /**
     * @param {Object} rectBox  截图区域div盒子
     * @private
     */
    _createDragBoxMove(rectBox) {
        let _t = this
        let dom = document.createElement("div");
        rectBox.appendChild(dom)
        dom.style.cssText = "width: 100%;height: 100%; margin: 0 auto;cursor: move;";

        dom.addEventListener('mousedown', (e) => {
            if (!this.area.isDown) {
                this.area1.isDragBig = true;
                this.area1.x = this.area.x;
                this.area1.y = this.area.y;
                this.area1.x1 = this.area.x1;
                this.area1.y1 = this.area.y1;
            }
        }, false)
        dom.addEventListener('dblclick', (e)=>{
            _t.dispose()
            _t._downloadImg()
        }, false)
        dom.addEventListener('mouseup', (e) => {
            _t.area1.isDragBig = false
        }, false)
    }
    /**
     * @description: 截图工具的输入框
     * @param {Object} dom div盒子，包着可自定义配置截取区域的两个input标签
     * @private
     */
    _createInputUI(dom) {
        let wDom = document.createElement('input');
        let hDom = document.createElement('input');
        let spanX = document.createElement("span");
        spanX.innerHTML = '×';
        spanX.style.cssText = "display: inline-block; font-size: 12px; padding: 0 5px; color: #666;";
        wDom.style.cssText =
            " border: none; outline: none; background-color: rgba(0, 0, 0, 0.3); height: 24px; line-height: 24px; color: #fff; display: inline-block; width: 50px; text-align: center;";
        hDom.style.cssText =
            " border: none; outline: none; background-color: rgba(0, 0, 0, 0.3); height: 24px; line-height: 24px; color: #fff; display: inline-block; width: 50px; text-align: center;";

        dom.appendChild(wDom);
        dom.appendChild(spanX)
        dom.appendChild(hDom);

        wDom.addEventListener("input", (e) => {
            if (e.target.value !== '') {
                this._getPositionFromWh({w: e.target.value})
            }
        })
        hDom.addEventListener("input", (e) => {
            if (e.target.value !== '') {
                this._getPositionFromWh({h: e.target.value});
            }
        })
        this.wDom = wDom;
        this.hDom = hDom;
    }
    /**
     * @description: input输入的宽高值 配置截图区域
     * @param {Object}  input的值 {w: 宽, h: 高}
     * @private
     */
    _getPositionFromWh({w, h}) {
        this.area.x1 = w ? this.area.x + Number(w) : this.area.x1;
        this.area.y1 = h ? this.area.y + Number(h) : this.area.y1;
        if (w > this.canvas.width - this.area.x) {
            this.area.x1 = this.canvas.width
        }
        if (h > this.canvas.height - this.area.y) {
            this.area.y1 = this.canvas.height
        }
        this._draw();
    }
    /**
     * @description: 创建菜单功能（8个小方块，截图格式等)
     * @param {Object} menuBox 装菜单功能的盒子
     * @private
     */
    _createMenuUI(menuBox) {
        let _t = this;
        let css =
            "display: inline-block; color: #666; padding: 2px 5px; font-size: 12px; vertical-align: middle; background: #ccc; border-radius: 2px; margin: 0 2px;";
        let arr = _t.fomartArr;
        for (let i = 0; i < arr.length; i++) {
            let li = document.createElement('li');
            li.innerHTML = arr[i].label;
            li.setAttribute("data-type", arr[i].type);
            menuBox.appendChild(li);

            if (arr[i].active) {
                li.style.cssText = css + 'background: #1aad19; color: #fff;';
            } else {
                li.style.cssText = css;
            }
        }
        let css1 = ' display: inline-block; width: 24px; height: 24px;  vertical-align: middle;margin:0 5px;';
        let i1 = document.createElement('i');
        i1.setAttribute("data-type", 'cancel');
        menuBox.appendChild(i1);
        i1.style.cssText = css1 + 'background: url(' + this.cancelIcon + ') no-repeat; background-size: 100%;';
        let i2 = document.createElement('i');
        i2.setAttribute("data-type", 'ok');
        menuBox.appendChild(i2);
        i2.style.cssText = css1 + 'background: url(' + this.okIcon + ') no-repeat; background-size: 100%;';

        menuBox.addEventListener('click', function (e) {
            let event = e || window.event;
            let target = event.target;
            if (target.nodeName.toLocaleLowerCase() === 'li') {
                let type = target.dataset.type;
                for (let i = 0; i < _t.fomartArr.length; i++) {
                    _t.fomartArr[i].active = false;
                    if (_t.fomartArr[i].type === type) {
                        _t.fomartArr[i].active = true;
                        target.style.background = '#1aad19';
                        target.style.color = '#fff';
                    } else {
                        let d = menuBox.childNodes[i];
                        d.style.background = '#ccc';
                        d.style.color = '#666';
                    }
                }
            }

            //按钮
            switch (target.dataset.type) {
                case 'cancel':
                    _t.dispose();
                    break;
                case 'ok':
                    _t.dispose();
                    _t._downloadImg();
                    break;
            }
        }, false);
    }
    /**
     * @description: 宽高长度计算
     * @param {Number} a 坐标1
     * @param {Number} b 坐标2
     * @private
     */
    _getLength(a, b) {
        return a > b ? a-b : b-a;
    }
    /**
     * @description: 确定截图区域调用方法，触发确认回调方法（回调参数返回：图片路径、类型）
     * @private
     */
    _downloadImg() {
        let imgData = this.ctx.getImageData(this.area.x, this.area.y, this.wDom.value, this.hDom.value);
        let canvas = this._convertImageToCanvas(imgData);
        for (let i = 0; i < this.fomartArr.length; i++) {
            if (this.fomartArr[i].active) {
                let type = this.fomartArr[i].type;
                let image = canvas2image.convertToImage(canvas, canvas.width, canvas.height, type);
                this.okCallback(image.src, type)
            }
        }
    }
    /**
     * @description: 把图片转成画布
     * @param {Object} image 图片数据, 由getImageData()方法返回ImageData对象,此对象返回画布指定矩形的像素数据
     * @private
     */
    _convertImageToCanvas(image) {
        let canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").putImageData(image, 0, 0);
        return canvas;
    }
}

export default Snapshot;