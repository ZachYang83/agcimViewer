/**
 * @author:shan
 * CreateDate：2020-04-20
 * Description: 相机快照
 */
import axios from '@/views/js/net/http';
import canvas2image from '@/views/js/extension/canvas2Image.js';
import ok from "./img/ok.png";
import cancel from "./img/cancel.png";
var vm = null;
class CameraSnapshot {
    constructor() {
        this.isCameraShow = false;
        this.area = {
            x: 0,
            y: 0,
            x1: 0,
            y1: 0,
            isDown: false,
        };
        this.isCanMove = false;
        this.bindLi = -1;
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
    initialize(param) {
        vm = param;
        let _t = this;
        if (_t.isCameraShow) {
            return;
        } else {
            _t.isCameraShow = true;
            document.addEventListener('contextmenu', function (event) {
                event.preventDefault();
                _t.area.isDown = false;
            }, false);
            _t.createCanvasUI();
            _t.createDrawBoxUI();
            _t.bind();
        }
    }
    //退出截图功能
    off() {
        this.isCameraShow = false;
        this.area.isDown = false;
        this.drawBox.style.display = "none";
        this.canvas.style.display = "none";
        this.drawBox.remove();
        this.canvas.remove();
        vm.$emit("close", { code: "Snapshot" });
    }
    bind() {
        let _t = this;
        //解除选区
        this.drawBox.addEventListener('click', function (e) {
            _t.area.isDown = false;
        }, false);

        this.canvas.addEventListener('mousedown', function (e) {
            _t.drawBox.style.display = "block";
            _t.area.x = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
            _t.area.y = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
            _t.area.isDown = true;
        }, false);

        document.body.addEventListener('mousemove', function (e) {
            if (_t.area.isDown) {
                _t.area.x1 = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
                _t.area.y1 = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
                _t.draw();
            } else {

                var nx = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
                var ny = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
                //拖动8个点
                if (_t.isCanMove) {
                    switch (_t.bindLi) {
                        case '0':
                            _t.area.x = nx;
                            _t.area.y = ny;
                            break;
                        case '1':
                            _t.area.y = ny;

                            break;
                        case '2':
                            _t.area.x1 = nx;
                            _t.area.y = ny;
                            break;
                        case '3':
                            _t.area.x = nx;
                            break;
                        case '4':
                            _t.area.x1 = nx;
                            break;
                        case '5':
                            _t.area.x = nx;
                            _t.area.y1 = ny;
                            break;
                        case '6':
                            _t.area.y1 = ny;
                            break;
                        case '7':
                            _t.area.x1 = nx;
                            _t.area.y1 = ny;
                            break;
                    }
                    _t.draw();
                }
                //拖动大框
                if (_t.area1.isDragBig) {
                    var nw = nx - _t.beforeXY.x;
                    var nh = ny - _t.beforeXY.y;
                    _t.area.x = _t.area1.x + nw;
                    _t.area.y = _t.area1.y + nh;
                    _t.area.x1 = _t.area1.x1 + nw;
                    _t.area.y1 = _t.area1.y1 + nh;
                    _t.draw();
                }
            }

        }, false);

        document.body.addEventListener('mouseup', function (e) {
            _t.isCanMove = false;
            _t.area.isDown = false;
            _t.bindLi = -1;
        }, false);

    };
    /** 画区域 */
    draw() {
        //区域位置
        var left = this.area.x1 < this.area.x ? this.area.x1 : this.area.x;
        var top = this.area.y1 < this.area.y ? this.area.y1 : this.area.y;
        this.drawBox.style.left = left + 'px';
        this.drawBox.style.top = top + 'px';
        //设置input显示宽高
        this.wDom.value = this.getLength(this.area.x1, this.area.x);
        this.hDom.value = this.getLength(this.area.y1, this.area.y);
        //区域宽高
        this.rectBox.style.width = this.wDom.value + 'px';
        this.rectBox.style.height = this.hDom.value + 'px';
        //设置8个可以拖动大小的点
        this.layoutPoint(this.wDom.value, this.hDom.value);
    }
    /**下载 */
    downloadImg() {
        let _t = this;
        var imgData = this.ctx.getImageData(this.area.x, this.area.y, this.area.x1 - this.area.x, this.area.y1 - this.area.y);
        let canvas = this.convertImageToCanvas(imgData);
        for (var i = 0; i < this.fomartArr.length; i++) {
            if (this.fomartArr[i].active) {
                var type = this.fomartArr[i].type;
                // canvas2image.saveAsImage(canvas, canvas.width,canvas.width * canvas.height / canvas.width, type);
                canvas.toBlob(function (blob) {
                    if (type === 'png') {
                        agcim.ui.domNode.downloadByA(URL.createObjectURL(blob), Math.random() + '.' + type);
                    } else {
                        var myFile = new File([blob], Math.random() + '.' + type, {
                            type: 'image/png'
                        });
                        var fdata = new FormData();
                        fdata.append('imageType', type);
                        fdata.append('file', myFile);
                        //var url = "http://192.168.21.168:8292/agsupport-rest/io/imagestore/convertImageTypes"  
                        var url = `/agsupport-rest/io/imagestore/convertImageTypes`;
                        axios.post(url, fdata, {
                            headers: {
                                "Content-Type": "multipart/form-data"
                            },
                            responseType: 'blob'
                        }).then(response => {
                            let href = window.URL.createObjectURL(new Blob([response]));
                            let name = Math.random() + '.' + type;
                            agcim.ui.domNode.downloadByA(href, name);
                        }, function (err) {
                        });
                    }
                }, 'image/png');
            }
        }
    }

    /** 创建canvas */
    createCanvasUI() {
        let d = document.getElementById("containCesium");
        var w = d.clientWidth,
            h = d.clientHeight;

        this.canvas = document.createElement('canvas');
        d.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = w;
        this.canvas.height = h;
        this.canvas.style.cssText = "position: absolute; top: 0; left: 0;cursor:crosshair;";

        var canvas = CIM.viewer.scene.canvas; 
        var genimg = canvas2image.convertToImage(canvas, w, w * canvas.height / canvas.width, 'bmp');
        var img = new Image();
        img.src = genimg.src;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        }
    }
    /** 主框 */
    createDrawBoxUI() {
        var div = document.createElement('div');
        document.getElementById("containCesium").appendChild(div);
        div.setAttribute('id', 'drawBox');
        div.style.cssText =
            "display:none;position: absolute; top: 0; left: 0; border: 1px solid #1aad19; outline: rgba(0, 0, 0, 0.5) dashed 10000px;user-select: none;";
        this.drawBox = div;
        var rectBox = document.createElement('div');
        var inputBox = document.createElement('div');
        var menuBox = document.createElement('div');
        inputBox.style.cssText = "position: absolute; bottom: 0; left: 0; color: #fff; width: 250px;";
        menuBox.style.cssText =
            " position: absolute; bottom: 0; right: 0; background: rgba(255, 255, 255, 0.7); padding: 5px; border-radius: 2px; min-width: 200px;cursor:pointer;";
        this.drawBox.appendChild(rectBox);
        this.drawBox.appendChild(inputBox);
        this.drawBox.appendChild(menuBox);
        this.createDragPointUI(rectBox);
        this.createDragBigUI(rectBox);
        this.createInputUI(inputBox);
        this.createMenuUI(menuBox);

        //8个原点拖拉调整
        let _t = this;
        rectBox.addEventListener('mousedown', function (e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            _t.beforeXY.x = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
            _t.beforeXY.y = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;

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
     * 输入框
     * @param {*} dom 
     */
    createInputUI(dom) {
        let _t = this;
        //设置宽高值
        var wDom = document.createElement('input');
        var hDom = document.createElement('input');
        var span = document.createElement('span');
        span.innerHTML = "x";
        span.style.cssText = "display: inline-block; font-size: 12px; padding: 0 5px; color: #666;";
        wDom.style.cssText =
            " border: none; outline: none; background-color: rgba(0, 0, 0, 0.3); height: 24px; line-height: 24px; color: #fff; display: inline-block; width: 50px; text-align: center; }";
        hDom.style.cssText =
            " border: none; outline: none; background-color: rgba(0, 0, 0, 0.3); height: 24px; line-height: 24px; color: #fff; display: inline-block; width: 50px; text-align: center; }";
        dom.appendChild(wDom);
        dom.appendChild(span);
        dom.appendChild(hDom);

        wDom.addEventListener('input', function (e) {
            var num = parseInt(e.target.value);
            if (num < 0 || isNaN(num)) {
                return;
            }
            _t.area.x1 = _t.fromWtoX(num, _t.canvas.width, _t.area.x);
            _t.draw();
        }, false);
        hDom.addEventListener('input', function (e) {
            var num = parseInt(e.target.value);
            if (num < 0 || isNaN(num)) {
                return;
            }
            _t.area.y1 = _t.fromWtoX(num, _t.canvas.height, _t.area.y);
            _t.draw();
        }, false);

        _t.wDom = wDom;
        _t.hDom = hDom;
    }
    /**
     * menu
     * @param {*} menuBox 
     */
    createMenuUI(menuBox) {
        var _t = this;
        var css =
            "display: inline-block; color: #666; padding: 2px 5px; font-size: 12px; vertical-align: middle; background: #ccc; border-radius: 2px; margin: 0 2px;";
        var arr = _t.fomartArr;
        for (var i = 0; i < arr.length; i++) {
            var li = document.createElement('li');
            li.innerHTML = arr[i].label;
            li.setAttribute("data-type", arr[i].type);
            menuBox.appendChild(li);

            if (arr[i].active) {
                li.style.cssText = css + 'background: #1aad19; color: #fff;';
            } else {
                li.style.cssText = css;
            }
        }
        var css1 = ' display: inline-block; width: 24px; height: 24px;  vertical-align: middle;margin:0 5px;';
        var i1 = document.createElement('i');
        i1.setAttribute("data-type", 'cancel');
        menuBox.appendChild(i1);
        i1.style.cssText = css1 + 'background: url(' + cancel + ') no-repeat; background-size: 100%;';
        var i2 = document.createElement('i');
        i2.setAttribute("data-type", 'ok');
        menuBox.appendChild(i2);
        i2.style.cssText = css1 + 'background: url(' + ok + ') no-repeat; background-size: 100%;';

        menuBox.addEventListener('click', function (e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            if (target.nodeName.toLocaleLowerCase() === 'li') {
                var type = target.dataset.type;
                for (var i = 0; i < _t.fomartArr.length; i++) {
                    _t.fomartArr[i].active = false;
                    if (_t.fomartArr[i].type === type) {
                        _t.fomartArr[i].active = true;
                        target.style.background = '#1aad19';
                        target.style.color = '#fff';
                    } else {
                        var d = menuBox.childNodes[i];
                        d.style.background = '#ccc';
                        d.style.color = '#666';
                    }
                }
            }

            //按钮
            switch (target.dataset.type) {
                case 'cancel':
                    _t.off();
                    break;
                case 'ok':
                    _t.off();
                    _t.downloadImg();
                    break;
            }
        }, false);
    }
    /**
     * 拖拽整个框移动
     * @param {*} rectBox 
     */
    createDragBigUI(rectBox) {
        let _t = this;
        var dom = document.createElement('div');
        rectBox.appendChild(dom);
        dom.style.cssText = "width: 100%;height: 100%; margin: 0 auto;cursor: move;";

        dom.addEventListener('mousedown', function (e) {
            if (!_t.area.isDown) {
                _t.area1.isDragBig = true;
                _t.area1.x = _t.area.x;
                _t.area1.y = _t.area.y;
                _t.area1.x1 = _t.area.x1;
                _t.area1.y1 = _t.area.y1;
            }
        }, false);

        dom.addEventListener('dblclick', function (e) {
            _t.off();
            _t.downloadImg();
        }, false);

        dom.addEventListener('mouseup', function (e) {
            _t.area1.isDragBig = false;
        }, false);
    }
    /**
     * 创建8个可拖动的圆圈
     * @param {*} dom 
     */
    createDragPointUI(dom) {
        var css =
            "position: absolute; list-style: none; width: 6px; height: 6px; background: #1aad19;";
        for (var i = 0; i < 8; i++) {
            var li = document.createElement('li');
            li.setAttribute("data-type", i);
            dom.appendChild(li);
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
     * 由矩形宽高决定8个点的位置
     * @param {*} w 
     * @param {*} h 
     */
    layoutPoint(w, h) {
        var arr = this.rectBox.children;
        var arr1 = [{ x: 0, y: 0 }, { x: 0.5, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0.5 }, { x: 1, y: 0.5 }, { x: 0, y: 1 }, { x: 0.5, y: 1 }, { x: 1, y: 1 }];
        for (var i = 0; i < arr1.length; i++) {
            arr[i].style.left = parseInt(arr1[i].x * parseInt(w) - 3) + 'px';
            arr[i].style.top = parseInt(arr1[i].y * parseInt(h) - 3) + 'px';
        }
    }
    /**
     * 位置
     * @param {*} canvas 
     * @param {*} x 
     * @param {*} y 
     */
    getPointOnCanvas(canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: x - bbox.left * (canvas.width / bbox.width),
            y: y - bbox.top * (canvas.height / bbox.height)
        };
    }
    /**
     * 取2个值的距离
     * @param {*} a 
     * @param {*} b 
     */
    getLength(a, b) {
        return a > b ? a - b : b - a;
    }
    /**
     * 根据宽高-->求坐标x,y
     * @param {*} range 
     * @param {*} max 
     * @param {*} min 
     */
    fromWtoX(range, max, min) {
        if (range > max - min) {
            range = max - min;
        } else {
            range = range;
        }
        return range + min
    }
    /**
     * 根据图片生成画布
     * @param {Object} image 
     */
    convertImageToCanvas(image) {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").putImageData(image, 0, 0);
        return canvas;
    }
}

export default new CameraSnapshot()