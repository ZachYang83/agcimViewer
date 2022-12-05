import axios from "@/views/js/net/http";
import canvas2image from "@/views/js/extension/canvas2Image.js";
import blowup from "blowup/lib/blowup";
import jquery from "jquery";

class CameraSnapshot {
  constructor() {
    this.href = null;
    this.isCameraShow = false;
    this.area = {
      x: 0,
      y: 0,
      x1: 0,
      y1: 0,
      isDown: false,
    };
    this.isCanMove = false;
    this.isDragBig = false;
    this.bindLi = -1;
    this.beforeXY = {
      x: 0,
      y: 0,
    };
    this.area1 = {
      x: 0,
      y: 0,
      x1: 0,
      y1: 0,
      isDragBig: false,
    };
    this.fomartArr = "png";

    this.canvas = null; 
    this.ctx = null;
    this.drawBox = null;
    this.rectBox = null;
    this.wDom = null;
    this.hDom = null;

    this.record = [];
    this.points = [];
    this.beginPoint = null;
    this.recs = [];
    this.arcs = [];
    this.arrows = [];
    this.temporary = null;
    this.canvas_line = null;
    this.canvas_rce = null;
    this.canvas_arc = null;
    this.canvas_arrows = null;
    this.c_x = null;
    this.c_y = null;
    this.isAllowDrawLine = false;
    this.focusX = null;
    this.focusY = null;

    this.options = {
      home_bg: "", //背景
      line: {
        spec: "small",
        lineCap: "round",
        lineJoin: "round",
        pattern: "line",
        color: "#d81e06",
      }, //画笔
      rec: {
        spec: "small",
        lineCap: "round",
        lineJoin: "round",
        pattern: "line",
        color: "#d81e06",
      }, //默认矩形参数
      arc: {
        spec: "small",
        lineCap: "round",
        lineJoin: "round",
        pattern: "line",
        color: "#d81e06",
      }, //默认圆参数
      font: { color: "#d81e06", spec: "small" }, //默认圆参数 small middle big
      arrows: { color: "#d81e06", spec: "small" }, //默认箭头参数 小 12px 中 16px 大 24px
      pattern: "", //默认模式 line:线 rec：矩形 arc：圆 arrows:箭头 font:字
    };
  }
  initialize() {
    let _t = this;
    if (_t.isCameraShow) {
      return;
    } else {
      _t.isCameraShow = true;
      document.addEventListener(
        "contextmenu",
        function(event) {
          event.preventDefault();
          _t.area.isDown = false;
        },
        false
      );
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
    this.record = [];
    this.recs = [];
    this.arcs = [];
    this.arrows = [];
    this.drawBox.remove();
    this.canvas.remove();
  }
  bind() {
    let _t = this;
    //解除选区
    this.drawBox.addEventListener(
      "click",
      function(e) {
        _t.area.isDown = false;
      },
      false
    );

    this.canvas.addEventListener(
      "mousedown",
      function(e) {
        _t.drawBox.style.display = "block";
        _t.area.x = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
        _t.area.y = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;
        _t.area.isDown = true;
      },
      false
    );

    document.body.addEventListener(
      "mousemove",
      function(e) {
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
              case "0":
                _t.area.x = nx;
                _t.area.y = ny;
                break;
              case "1":
                _t.area.y = ny;

                break;
              case "2":
                _t.area.x1 = nx;
                _t.area.y = ny;
                break;
              case "3":
                _t.area.x = nx;
                break;
              case "4":
                _t.area.x1 = nx;
                break;
              case "5":
                _t.area.x = nx;
                _t.area.y1 = ny;
                break;
              case "6":
                _t.area.y1 = ny;
                break;
              case "7":
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
      },
      false
    );

    document.body.addEventListener(
      "mouseup",
      function(e) {
        _t.isCanMove = false;
        _t.area.isDown = false;
        _t.bindLi = -1;
      },
      false
    );
  }
  /** 画区域 */
  draw() {
    //区域位置
    var left = this.area.x1 < this.area.x ? this.area.x1 : this.area.x;
    var top = this.area.y1 < this.area.y ? this.area.y1 : this.area.y;
    this.drawBox.style.left = left + "px";
    this.drawBox.style.top = top + "px";
    //设置input显示宽高
    this.wDom.value = this.getLength(this.area.x1, this.area.x);
    this.hDom.value = this.getLength(this.area.y1, this.area.y);
    //区域宽高
    this.rectBox.style.width = this.wDom.value + "px";
    this.rectBox.style.height = this.hDom.value + "px";
    //设置8个可以拖动大小的点
    this.layoutPoint(this.wDom.value, this.hDom.value);
  }

  getImgSrc() {
    let _t = this;

    var thumbnail = document.getElementById("thumbnail");
    var scissor = document.getElementById("scissor");
    scissor.style.display = "none";
    var label_img = document.createElement("img");
    label_img.id = "label_img";
    thumbnail.appendChild(label_img);
    label_img.style.maxWidth = "194px";
    label_img.style.maxHeight = "194px";
    label_img.style.position = "absolute";
    label_img.style.top = "0px";
    label_img.style.bottom = "0px";
    label_img.style.left = "0px";
    label_img.style.right = "0px";
    label_img.style.margin = "auto";

    var imgData = this.ctx.getImageData(
      this.area.x,
      this.area.y,
      this.area.x1 - this.area.x,
      this.area.y1 - this.area.y
    ); //返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据。
    let canvas = this.convertImageToCanvas(imgData); //把图像数据（从指定的 ImageData 对象）放回画布上。
    var type = _t.fomartArr;
    label_img.src = canvas.toDataURL()
  }

  /**下载 */
  downloadImg() {
    let _t = this;
    var imgData = this.ctx.getImageData(
      this.area.x,
      this.area.y,
      this.area.x1 - this.area.x,
      this.area.y1 - this.area.y
    ); //返回 ImageData 对象，该对象为画布上指定的矩形复制像素数据。
    let canvas = this.convertImageToCanvas(imgData); //把图像数据（从指定的 ImageData 对象）放回画布上。
    var type = _t.fomartArr;
    // canvas2image.Canvas2Image.saveAsImage(canvas, canvas.width,canvas.width * canvas.height / canvas.width, type);
    canvas.toBlob(function(blob) {
      if (type === "png") {
        _t.downloadByA(URL.createObjectURL(blob), Math.random() + "." + type);
      } else {
        var myFile = new File([blob], Math.random() + "." + type, {
          type: "image/png",
        });
        var fdata = new FormData();
        fdata.append("imageType", type);
        fdata.append("file", myFile);
        //var url = "http://192.168.21.168:8292/agsupport-rest/io/imagestore/convertImageTypes"
        var url = `/agsupport-rest/io/imagestore/convertImageTypes`;
        axios
          .post(url, fdata, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
          })
          .then(
            (response) => {
              let href = window.URL.createObjectURL(new Blob([response]));
              let name = Math.random() + "." + type;
              _t.downloadByA(href, name);
            },
            function(err) {
            }
          );
      }
    }, "image/png");
  }
  /**通过创建标签<a>下载 */
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
  /** 创建canvas */
  createCanvasUI() {
    let d = document.getElementById("containCesium");
    var w = d.clientWidth,
      h = d.clientHeight;

    this.canvas = document.createElement("canvas"); //创建画布标签
    d.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d"); //返回一个对象，该对象提供了用于在画布上绘图的方法和属性。
    this.canvas.width = w;
    this.canvas.height = h;
    this.canvas.style.cssText =
      "position: absolute; top: 0; left: 0;cursor:crosshair;";

    var canvas = CIM.viewer.scene.canvas;
    var genimg = canvas2image.convertToImage(
      canvas,
      w,
      (w * canvas.height) / canvas.width,
      "bmp"
    );
    var img = new Image();
    img.src = genimg.src;
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0); //图片加载完成后立即执行画布绘制图像的方法。
      this.record.push(this.ctx.getImageData(0, 0, w, h));
    };
  }
  /** 主框 */
  createDrawBoxUI() {
    require("../css/scnapshot.css");

    var div = document.createElement("div");
    document.getElementById("containCesium").appendChild(div);
    div.setAttribute("id", "drawBox");
    div.style.cssText =
      "display:none;position: absolute; top: 0; left: 0; border: 1px solid #1aad19; outline: rgba(0, 0, 0, 0.5) dashed 10000px;user-select: none;";
    this.drawBox = div;
    var rectBox = document.createElement("div");
    rectBox.id = "rectBox";
    var inputBox = document.createElement("div");
    var nameBox = document.createElement("input");
    inputBox.style.cssText =
      "position: absolute; bottom: 0; left: 0; color: #fff; width: 250px;";
    // nameBox.style.cssText =
    //   "position: absolute; top: 0; left: 0; background: rgba(255, 255, 255, 0.7); padding: 5px; border-radius: 2px; min-width: 205px;cursor:pointer;";
    // nameBox.placeholder = "请输入截图名称...";
    // nameBox.id = "nameInput";
    this.drawBox.appendChild(rectBox);
    this.drawBox.appendChild(inputBox);
    // this.drawBox.appendChild(nameBox);
    this.createDragPointUI(rectBox); //创建8个可拖动的圆圈
    this.createDragBigUI(rectBox); //拖拽整个框移动
    this.createInputUI(inputBox);
    this.setNav();
    this.watchEvent();

    //8个原点拖拉调整
    let _t = this;
    rectBox.addEventListener(
      "mousedown",
      function(e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;
        _t.beforeXY.x = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).x;
        _t.beforeXY.y = _t.getPointOnCanvas(_t.canvas, e.clientX, e.clientY).y;

        if (target.nodeName.toLocaleLowerCase() === "li") {
          _t.isCanMove = true;
          _t.bindLi = target.dataset.type;
        } else {
          _t.isCanMove = false;
          _t.bindLi = -1;
        }
      },
      false
    );

    this.rectBox = rectBox;
  }
  /**
   * 输入框
   * @param {*} dom
   */
  createInputUI(dom) {
    let _t = this;
    //设置宽高值
    var wDom = document.createElement("input");
    var hDom = document.createElement("input");
    var span = document.createElement("span");
    span.innerHTML = "x";
    span.style.cssText =
      "display: inline-block; font-size: 12px; padding: 0 5px; color: #666;";
    wDom.style.cssText =
      " border: none; outline: none; background-color: rgba(0, 0, 0, 0.3); height: 24px; line-height: 24px; color: #fff; display: inline-block; width: 50px; text-align: center; }";
    hDom.style.cssText =
      " border: none; outline: none; background-color: rgba(0, 0, 0, 0.3); height: 24px; line-height: 24px; color: #fff; display: inline-block; width: 50px; text-align: center; }";
    dom.appendChild(wDom);
    dom.appendChild(span);
    dom.appendChild(hDom);

    wDom.addEventListener(
      "input",
      function(e) {
        var num = parseInt(e.target.value);
        if (num < 0 || isNaN(num)) {
          return;
        }
        _t.area.x1 = _t.fromWtoX(num, _t.canvas.width, _t.area.x);
        _t.draw();
      },
      false
    );
    hDom.addEventListener(
      "input",
      function(e) {
        var num = parseInt(e.target.value);
        if (num < 0 || isNaN(num)) {
          return;
        }
        _t.area.y1 = _t.fromWtoX(num, _t.canvas.height, _t.area.y);
        _t.draw();
      },
      false
    );

    _t.wDom = wDom;
    _t.hDom = hDom;
  }

  watchEvent() {
    let _t = this;
    var flag = true;
    let rectBoxChild = document.getElementById("rectBoxChild");
    rectBoxChild.onmousedown = function(e) {
      //鼠标点击
      if(_t.options.pattern == "line"){
        _t.isAllowDrawLine = true;
        //获取鼠标按下的点相对canvas的坐标。
        let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        let {x,y} = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        //es6的解构赋值
        _t.c_x  = ele['x'];
        _t.c_y  = ele['y'];
        //创建线条画布
        _t.canvas_line = _t.canvasParameter('line');
        //绘制起点。
        // _t.canvas_line.beginPath();
        // _t.canvas_line.moveTo(_t.c_x, _t.c_y);
        _t.points.push({x,y});
        _t.beginPoint = {x,y};
      }else if (_t.options.pattern == "rec") {
        _t.isAllowDrawLine = true;
        let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        //es6的解构赋值
        _t.c_x = ele["x"];
        _t.c_y = ele["y"];
        _t.canvas_rce = _t.canvasParameter("rec");
      } else if (_t.options.pattern == "arc") {
        _t.isAllowDrawLine = true;
        //获取鼠标按下的点相对canvas的坐标。
        let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        //es6的解构赋值
        _t.c_x = ele["x"];
        _t.c_y = ele["y"];
        _t.canvas_arc = _t.canvasParameter("arc"); //创建圆画布
      } else if (_t.options.pattern == "arrows") {
        //画箭头
        _t.isAllowDrawLine = true;
        //获取鼠标按下的点相对canvas的坐标。
        let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        //es6的解构赋值
        _t.c_x = ele["x"];
        _t.c_y = ele["y"];
        //创建箭头画布
        _t.canvas_arrows = _t.ctx;
      } else if (_t.options.pattern == "font") {
        let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        let textarea = document.querySelector("#drawBox .canvas-textarea");
        if (flag) {
          _t.focusX = ele["x"];
          _t.focusY = ele["y"];
          flag = false;
        } else {
          flag = true;
        }
        //创建富文本框
        if (!textarea) {
          textarea = document.createElement("textarea");
          textarea.style.cssText =
            "margin:0 auto;padding:3px; color:red;outline: 0 none;border-color: rgba(255, 0, 0, 0.8);background-color:transparent;resize:none;";
          if (_t.area.x1 - _t.focusX > 250) {
            textarea.style.width = "250px";
          } else {
            textarea.style.width = _t.area.x1 - _t.focusX + "px";
          }
          textarea.setAttribute("class", "canvas-textarea");
          rectBoxChild.appendChild(textarea);
          _t.autoTextHeight(textarea);
          textarea.style.left = ele["x"] - _t.area.x + "px";
          textarea.style.top = ele["y"] - _t.area.y + "px";
          textarea.onfocus = (e) => {
            flag = false;
          };
          textarea.addEventListener(
            "input",
            function(e) {
              var textLength = textarea.value.length;
              var fontSize = textarea.style.fontSize;
              if (parseInt(textarea.style.width) < _t.area.x1 - _t.focusX) {
                if (
                  textLength * parseInt(fontSize) >
                  parseInt(textarea.style.width)
                ) {
                  textarea.style.width =
                    parseInt(textarea.style.width) + parseInt(fontSize) + "px";
                }
              } else {
                textarea.style.width = _t.area.x1 - _t.focusX + "px";
              }
            },
            true
          );
        } else {
          //处理焦点离开的事情
          textarea.onblur = function(e) {
            if (textarea.value) {
              //有值的情况
              let canvas_font = _t.ctx;
              let m_top = 0;
              switch (_t.options.font.spec) {
                case "small":
                  canvas_font.font = "18px Georgia normal";
                  m_top = 18;
                  break;
                case "middle":
                  canvas_font.font = "22px Georgia normal";
                  m_top = 22;
                  break;
                default:
                  canvas_font.font = "26px Georgia bold";
                  m_top = 26;
                  break;
              }

              canvas_font.fillStyle = _t.options["font"]["color"];
              let valueArr = textarea.value.split(/[(\r\n)\r\n]+/);
              let maxWidth = _t.area.x1 - _t.focusX;
              for(var i = 0 ; i < valueArr.length ; i++){
                if(i > 0){
                  canvas_font.wrapText(valueArr[i], _t.focusX, _t.focusY + m_top * (i+1) + i*5, maxWidth,m_top+5);
                }else{
                  canvas_font.wrapText(valueArr[i], _t.focusX, _t.focusY + m_top * (i+1), maxWidth,m_top+5);
                }
              }
              rectBoxChild.removeChild(textarea); //删除节点
              //添加 imgData
              _t.record.push(
                _t.ctx.getImageData(0, 0, _t.canvas.width, _t.canvas.height)
              ); //保存画布的像素值
            } else {
              rectBoxChild.removeChild(textarea); //删除节点
            }
          };
        }

        (function() {
          //处理文本框的样式问题
          textarea.style.color = _t.options["font"]["color"];
          switch (_t.options.font.spec) {
            case "small":
              textarea.style.fontSize = "18px";
              textarea.style.height = "38px";
              break;
            case "middle":
              textarea.style.fontSize = "22px";
              textarea.style.height = "42px";
              break;
            default:
              textarea.style.fontSize = "26px";
              textarea.style.height = "46px";
              break;
          }
        })();
      }
    };

    rectBoxChild.onmousemove = (e) => {
      //鼠标移动
      if(_t.options.pattern == "line"){
        if (_t.isAllowDrawLine) {
            //移动时获取新的坐标位置，用lineTo记录当前的坐标，然后stroke绘制上一个点到当前点的路径
            let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
            let {x, y} = ele;
            //设置该画布的最后一个状态
            // _t.canvas_line.lineTo(x, y);
            // _t.canvas_line.stroke();
            _t.points.push({x,y});
            if(_t.points.length > 3){
              const lastTwoPoints = _t.points.slice(-2);
              const controlPoint = lastTwoPoints[0];
              const endPoint = {
                  x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
                  y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
              }
              _t.drawLine(_t.beginPoint, controlPoint, endPoint);
              _t.beginPoint = endPoint;
            }
        }
      }else if (_t.options.pattern == "rec") {
        if (_t.isAllowDrawLine) {
          let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
          //清空画布
          _t.canvas_rce.clearRect(0, 0, _t.canvas.width, _t.canvas.height);
          if (_t.record.length > 0) {
            _t.canvas_rce.putImageData(_t.record[_t.record.length - 1], 0, 0);
          }
          //循环画矩形
          _t.recs.forEach(function(v, i, arr) {
            _t.canvas_rce.lineWidth = _t.getSize(v.spec); //设置画笔的粗细
            _t.canvas_rce.strokeStyle = v.color; //设置触笔的颜色
            _t.canvas_rce.strokeRect(v.x, v.y, v.width, v.height);
          });
          _t.canvas_rce.lineWidth = _t.getSize(_t.options["rec"].spec); //设置画笔的粗细
          _t.canvas_rce.strokeStyle = _t.options["rec"].color; //设置触笔的颜色

          let w = ele["x"] - _t.c_x,
            h = ele["y"] - _t.c_y;
          _t.canvas_rce.strokeRect(_t.c_x, _t.c_y, w, h);
          _t.temporary = new RecXy(
            _t.c_x,
            _t.c_y,
            w,
            h,
            _t.options["rec"].color,
            _t.options["rec"].spec
          ); //构造临时矩形
        }
      } else if (_t.options.pattern == "arc") {
        if (_t.isAllowDrawLine) {
          //移动时获取新的坐标位置，用lineTo记录当前的坐标，然后stroke绘制上一个点到当前点的路径
          let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
          //清空画布
          _t.canvas_arc.clearRect(0, 0, _t.canvas.width, _t.canvas.height);
          if (_t.record.length > 0) {
            _t.canvas_arc.putImageData(_t.record[_t.record.length - 1], 0, 0);
          }
          //循环画
          _t.arcs.forEach(function(v, i, arr) {
            _t.canvas_arc.lineWidth = _t.getSize(v.spec); //设置画笔的粗细
            _t.canvas_arc.strokeStyle = v.color; //设置触笔的颜色
            _t.EllipseTwo(_t.canvas_arc, v["x"], v["y"], v["xr"], v["yr"]);
          });

          _t.canvas_arc.lineWidth = _t.getSize(_t.options["arc"].spec); //设置画笔的粗细
          _t.canvas_arc.strokeStyle = _t.options["arc"].color; //设置触笔的颜色

          //中心坐标的位置
          let xr = Math.abs((ele["x"] - _t.c_x) / 2),
            yr = Math.abs((ele["y"] - _t.c_y) / 2),
            xx = ele["x"] - (ele["x"] - _t.c_x) / 2,
            yy = ele["y"] - (ele["y"] - _t.c_y) / 2;
          _t.EllipseTwo(_t.canvas_arc, xx, yy, xr, yr);
          _t.temporary = new ArcXy(
            xx,
            yy,
            xr,
            yr,
            _t.options["arc"].color,
            _t.options["arc"].spec
          ); //构造临时圆形
        }
      } else if (_t.options.pattern == "arrows") {
        //鼠标移动事件
        if (_t.isAllowDrawLine) {
          //移动时获取新的坐标位置，用lineTo记录当前的坐标，然后stroke绘制上一个点到当前点的路径
          let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
          //清空画布
          _t.canvas_arrows.clearRect(0, 0, _t.canvas.width, _t.canvas.height);
          if (_t.record.length > 0) {
            _t.canvas_arrows.putImageData(
              _t.record[_t.record.length - 1],
              0,
              0
            );
          }
          //循环画
          _t.arrows.forEach(function(v, i, arr) {
            _t.drawArrow(
              _t.canvas_arrows,
              v["fromX"],
              v["fromY"],
              v["toX"],
              v["toY"],
              v["theta"],
              v["headlen"],
              v["width"],
              v["color"]
            );
          });

          let w = 1,
            color = _t.options["arrows"]["color"];
          switch (_t.options.arrows.spec) {
            case "small":
              w = 2;
              break;
            case "middle":
              w = 4;
              break;
            default:
              w = 6;
              break;
          }
          _t.drawArrow(
            _t.canvas_arrows,
            _t.c_x,
            _t.c_y,
            ele["x"],
            ele["y"],
            30,
            20,
            w,
            color
          );
          _t.temporary = {
            fromX: _t.c_x,
            fromY: _t.c_y,
            toX: ele["x"],
            toY: ele["y"],
            theta: 30,
            headlen: 20,
            width: w,
            color: color,
          }; //构造临时圆形
        }
      }
    };

    rectBoxChild.onmouseup = function(e) {
      //鼠标离开
      if(_t.options.pattern == "line"){
        if (!_t.isAllowDrawLine) return;
        let ele = _t.windowToCanvas(_t.rectBox, e.clientX, e.clientY);
        let {x, y} = ele;
        _t.points.push({x,y});
        if (_t.points.length > 3) {
            const lastTwoPoints = _t.points.slice(-2);
            const controlPoint = lastTwoPoints[0];
            const endPoint = lastTwoPoints[1];
            _t.drawLine(_t.beginPoint, controlPoint, endPoint);
        }
        _t.beginPoint = null;
        _t.points = [];
        _t.isAllowDrawLine = false;
        _t.record.push(_t.ctx.getImageData(0, 0, _t.canvas.width, _t.canvas.height));//保存画布的像素值
    }else if (_t.options.pattern == "rec") {
        _t.isAllowDrawLine = false;
        _t.recs.push(_t.temporary); //添加矩形
        _t.record.push(
          _t.ctx.getImageData(0, 0, _t.canvas.width, _t.canvas.height)
        ); //保存画布的像素值
      } else if (_t.options.pattern == "arc") {
        _t.isAllowDrawLine = false;
        _t.arcs.push(_t.temporary); //添加
        _t.record.push(
          _t.ctx.getImageData(0, 0, _t.canvas.width, _t.canvas.height)
        ); //保存画布的像素值
      } else if (_t.options.pattern == "arrows") {
        _t.isAllowDrawLine = false;
        _t.arrows.push(_t.temporary); //
        _t.record.push(
          _t.ctx.getImageData(0, 0, _t.canvas.width, _t.canvas.height)
        ); //保存画布的像素值
      }
    };
  }

  setNav() {
    let _t = this;
    let navs = `
      <div id="menu" class="canvas-nav">
        <li class="pic _png active" data-type="png">PNG</li>
        <li class="pic jpg"  data-type="jpg">JPG</li>
        <li class="pic bmp" data-type="bmp">BMP</li>
        <div class="item _rec" data-value="rec"></div>
        <div class="item _arc" data-value="arc"></div>
        <div class="item _arrows" data-value="arrows"></div>
        <div class="item _line" data-value="line"></div>
        <div class="item _font" data-value="font"></div>
        <div class="item _withdraw" data-value="withdraw"></div>
        <div class="item _download" data-value="download"></div>
        <div class="item _delete" data-value="delete"></div>
      </div>
    `;
    this.drawBox.insertAdjacentHTML("afterbegin", navs);
    var menu = document.getElementById("menu");
    // let nameInput = document.getElementById("nameInput");
    menu.addEventListener("click", function(e) {
      var event = e || window.event;
      var target = event.target || event.srcElement;
      var picType = document.getElementsByClassName("pic");
      let value = target.getAttribute("data-value");
      if (target.nodeName.toLocaleLowerCase() === "li") {
        for (var i = 0; i < picType.length; i++) {
          picType[i].classList.remove("active");
        }
        target.classList.add("active");
        _t.fomartArr = target.dataset.type;
      } else if (value == "delete") {
        _t.off();
      } else if (value == "download") {
        // _t.downloadImg();
        _t.getImgSrc();
        _t.record = [];
        _t.off();
      } else if (value == "withdraw") {
        if (_t.record.length > 0) {
          _t.recs = []; //清空矩形数组
          _t.arcs = []; //清空圆数组
          _t.arrows = []; //清空箭头数组
          if (_t.record.length == 1) {
            if (_t.options.home_bg == "") {
              _t.record.pop(); //移除最后一项
              _t.ctx.clearRect(0, 0, _t.canvas.width, _t.canvas.height);
            }
          } else {
            _t.record.pop(); //移除最后一项
            _t.ctx.putImageData(_t.record[_t.record.length - 1], 0, 0);
          }
        }
      } else if (
        value == "font" ||
        value == "line" ||
        value == "rec" ||
        value == "arc" ||
        value == "arrows"
      ) {
        _t.isDraging = true;
        var rectBoxChild = document.getElementById("rectBoxChild");
        rectBoxChild.style.cursor = "default";
        _t.options.pattern = value;
        _t.setNodeOptions();
      }
    });
  }

  setNodeOptions() {
    let _t = this;
    let node = this.options.pattern;
    let options_node = `
           <div class="_option"> 
               <div class="_top_a"></div>
               <div class="_item _size"><div class="main _small" data-value="small"></div> </div>  
               <div class="_item _size"><div class="main _middle" data-value="middle"></div></div> 
               <div class="_item _size"><div class="main _big" data-value="big"></div></div> 
               <div class="_item _color"><div class="color _d81e06" data-value="d81e06"></div></div>  
               <div class="_item _color"><div class="color _ea9518" data-value="ea9518"></div></div> 
               <div class="_item _color"><div class="color _2aa515" data-value="2aa515"></div></div> 
               <div class="_item _color"><div class="color _1296db" data-value="1296db"></div></div> 
               <div class="_item _color"><div class="color _2c2c2c" data-value="2c2c2c"></div></div> 
               <div class="_item _color"><div class="color _515151" data-value="515151"></div></div> 
               <div class="_item _color"><div class="color _bfbfbf" data-value="bfbfbf"></div></div> 
           </div>
        `;

    //清空
    var fatherNode = document.querySelectorAll("#drawBox .canvas-nav .item");
    fatherNode.forEach(function(v, i, arr) {
      v.innerHTML = "";
    });

    //重新赋值
    var innerNode = document.querySelector("#drawBox .canvas-nav ._" + node);
    innerNode.innerHTML = options_node; //插入节点

    //修改默认状态
    let code = _t.options.pattern;
    let argument = _t.options[node];
    let color = argument["color"].substr(1),
      spec = argument["spec"];
    document
      .querySelector("#drawBox .canvas-nav .item._" + code)
      .classList.add("action");
    _t.emptyInitialization(color, spec);

    //初始化点击事件
    var sizeLi = document.querySelectorAll(
      "#drawBox .canvas-nav .item ._option ._size .main"
    );
    sizeLi.forEach(function(v, i, arr) {
      v.onclick = function(e) {
        let value = v.getAttribute("data-value");
        _t.options[node].spec = value; //赋值
        _t.emptyInitialization("", value, "spec");
        e.stopPropagation();
      };
    });

    var colorLi = document.querySelectorAll(
      "#drawBox .canvas-nav .item ._option ._color .color"
    ); //获取所有的颜色列表选项
    colorLi.forEach(function(v, i, arr) {
      v.onclick = function(e) {
        let value = v.getAttribute("data-value");
        _t.options[node].color = "#" + value; //赋值
        _t.emptyInitialization(value, "", "color");
        e.stopPropagation();
      };
    });
  }

  //设置选项的选中状态
  emptyInitialization(color, spec, code = "all") {
    let colors = document.querySelectorAll(
      "#drawBox .canvas-nav .item ._option ._color .color"
    );
    let sizes = document.querySelectorAll(
      "#drawBox .canvas-nav .item ._option ._size .main"
    );
    if (code == "all") {
      colors.forEach(function(v, i, arr) {
        v.classList.remove("action");
      });
      sizes.forEach(function(v, i, arr) {
        v.classList.remove("action");
      });
      document
        .querySelector(
          "#drawBox .canvas-nav .item ._option ._color .color._" + color
        )
        .classList.add("action"); //颜色默认选中状态
      document
        .querySelector(
          "#drawBox .canvas-nav .item ._option ._size .main._" + spec
        )
        .classList.add("action"); //
    } else if (code == "color") {
      colors.forEach(function(v, i, arr) {
        v.classList.remove("action");
      });
      document
        .querySelector(
          "#drawBox .canvas-nav .item ._option ._color .color._" + color
        )
        .classList.add("action"); //颜色默认选中状态
    } else if (code == "spec") {
      sizes.forEach(function(v, i, arr) {
        v.classList.remove("action");
      });
      document
        .querySelector(
          "#drawBox .canvas-nav .item ._option ._size .main._" + spec
        )
        .classList.add("action");
    }
  }

  /**
   * 拖拽整个框移动
   * @param {*} rectBox
   */
  createDragBigUI(rectBox) {
    let _t = this;
    var dom = document.createElement("div");
    dom.id = "rectBoxChild";
    rectBox.appendChild(dom);
    dom.style.cssText =
      "width: 100%;height: 100%; margin: 0 auto;cursor: move;";

    dom.addEventListener(
      "mousedown",
      function(e) {
        if (!_t.area.isDown && !_t.isDraging) {
          _t.area1.isDragBig = true;
          _t.area1.x = _t.area.x;
          _t.area1.y = _t.area.y;
          _t.area1.x1 = _t.area.x1;
          _t.area1.y1 = _t.area.y1;
        }
      },
      false
    );

    dom.addEventListener(
      "mouseup",
      function(e) {
        _t.area1.isDragBig = false;
      },
      false
    );
  }

  getPos(evt) {
    return {
      x: evt.clientX,
      y: evt.clientY,
    };
  }

  /**
   * 创建8个可拖动的圆圈
   * @param {*} dom
   */
  createDragPointUI(dom) {
    var css =
      "position: absolute; list-style: none; width: 6px; height: 6px; background: #1aad19;";
    for (var i = 0; i < 8; i++) {
      var li = document.createElement("li");
      li.setAttribute("data-type", i);
      dom.appendChild(li);
      switch (i) {
        case 1:
        case 6:
          li.style.cssText = css + "cursor: s-resize;";
          break;
        case 0:
        case 7:
          li.style.cssText = css + "cursor: se-resize;";
          break;
        case 2:
        case 5:
          li.style.cssText = css + "cursor: ne-resize;";
          break;
        case 3:
        case 4:
          li.style.cssText = css + "cursor: w-resize;";
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
    var arr1 = [
      { x: 0, y: 0 },
      { x: 0.5, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0.5 },
      { x: 1, y: 0.5 },
      { x: 0, y: 1 },
      { x: 0.5, y: 1 },
      { x: 1, y: 1 },
    ];
    for (var i = 0; i < arr1.length; i++) {
      arr[i].style.left = parseInt(arr1[i].x * parseInt(w) - 3) + "px";
      arr[i].style.top = parseInt(arr1[i].y * parseInt(h) - 3) + "px";
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
      y: y - bbox.top * (canvas.height / bbox.height),
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
    return range + min;
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

  //计算大小
  getSize = (code) => {
    //small middle big
    if (code == "small") {
      return 2;
    } else if (code == "middle") {
      return 4;
    } else if (code == "big") {
      return 10;
    }
  };

  //设置画布的参数
  canvasParameter = (c) => {
    //设置参数
    let tier = this.ctx; //2d
    tier.lineCap = this.options[c].lineCap; //设置结束端点样式。
    tier.lineJoin = this.options[c].lineJoin; //拐角类型
    tier.lineWidth = this.getSize(this.options[c].spec); //设置画笔的粗细
    tier.strokeStyle = this.options[c].color; //设置触笔的颜色
    return tier;
  };

  //计算鼠标相对于画布的位置
  windowToCanvas = (rectBox, x, y) => {
    //获取canvas元素距离窗口的一些属性，MDN上有解释
    let rect = rectBox.getBoundingClientRect();
    //x和y参数分别传入的是鼠标距离窗口的坐标，然后减去canvas距离窗口左边和顶部的距离。
    return {
      x: x ,
      y: y -57,
    };
  };

  //均匀压缩法
  EllipseTwo(context, x, y, a, b) {
    context.save();
    var r = a > b ? a : b;
    var ratioX = a / r;
    var ratioY = b / r;
    context.scale(ratioX, ratioY);
    context.beginPath();
    context.arc(x / ratioX, y / ratioY, r, 0, 2 * Math.PI, false);
    context.closePath();
    context.restore();
    context.stroke();
  }

  //画曲线
  drawLine(beginPoint, controlPoint, endPoint) {
    this.canvas_line.beginPath();
    this.canvas_line.moveTo(beginPoint.x, beginPoint.y);
    this.canvas_line.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
    this.canvas_line.stroke();
    this.canvas_line.closePath();
  } 

  drawArrow(ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
    theta = typeof theta != "undefined" ? theta : 30;
    headlen = typeof theta != "undefined" ? headlen : 10;
    width = typeof width != "undefined" ? width : 1;
    color = typeof color != "color" ? color : "#000";
    // 计算各角度和对应的P2,P3坐标
    var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
      angle1 = ((angle + theta) * Math.PI) / 180,
      angle2 = ((angle - theta) * Math.PI) / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);
    ctx.save();
    ctx.beginPath();
    var arrowX = fromX - topX,
      arrowY = fromY - topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    arrowX = toX + topX;
    arrowY = toY + topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(toX, toY);
    arrowX = toX + botX;
    arrowY = toY + botY;
    ctx.lineTo(arrowX, arrowY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }

  autoTextHeight(elem, extra, maxHeight) {
    extra = extra || 0;
    var isFirefox = !!document.getBoxObjectFor || "mozInnerScreenX" in window,
      isOpera = !!window.opera && !!window.opera.toString().indexOf("Opera"),
      addEvent = function(type, callback) {
        elem.addEventListener
          ? elem.addEventListener(type, callback, false)
          : elem.attachEvent("on" + type, callback);
      },
      getStyle = elem.currentStyle
        ? function(name) {
            var val = elem.currentStyle[name];
            if (name === "height" && val.search(/px/i) !== 1) {
              var rect = elem.getBoundingClientRect();
              return (
                rect.bottom -
                rect.top -
                parseFloat(getStyle("paddingTop")) -
                parseFloat(getStyle("paddingBottom")) +
                "px"
              );
            }
            return val;
          }
        : function(name) {
            return getComputedStyle(elem, null)[name];
          },
      minHeight = parseFloat(getStyle("height"));
    elem.style.resize = "none";
    var change = function() {
      var scrollTop,
        height,
        padding = 0,
        style = elem.style;
      if (elem._length === elem.value.length) return;
      elem._length = elem.value.length;
      if (!isFirefox && !isOpera) {
        padding =
          parseInt(getStyle("paddingTop")) +
          parseInt(getStyle("paddingBottom"));
      }
      scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      elem.style.height = minHeight + "px";
      if (elem.scrollHeight > minHeight) {
        if (maxHeight && elem.scrollHeight > maxHeight) {
          height = maxHeight - padding;
          style.overflowY = "auto";
        } else {
          height = elem.scrollHeight - padding;
          style.overflowY = "hidden";
        }
        style.height = height + extra + "px";
        scrollTop += parseInt(style.height) - elem.currHeight;
        document.body.scrollTop = scrollTop;
        document.documentElement.scrollTop = scrollTop;
        elem.currHeight = parseInt(style.height);
      }
    };
    addEvent("propertychange", change);
    addEvent("input", change);
    addEvent("focus", change);
    change();
  }
}

class RecXy {
  constructor(xx, yy, xr, yr, color, spec) {
    this.x = xx;
    this.y = yy;
    this.xr = xr;
    this.yr = yr;
    this.color = color;
    this.spec = spec;
  }
}

RecXy.prototype = {
  constructor: RecXy,
  getConfig: function() {
    return this;
  },
};

class ArcXy {
  constructor(xx, yy, xr, yr, color, spec) {
    this.x = xx;
    this.y = yy;
    this.xr = xr;
    this.yr = yr;
    this.color = color;
    this.spec = spec;
  }
}

ArcXy.prototype = {
  constructor: ArcXy,
  getConfig: function() {
    return this;
  },
};

//创建一个API，使得画布上的文本可以换行
CanvasRenderingContext2D.prototype.wrapText = function(
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {
  if (typeof text != "string" || typeof x != "number" || typeof y != "number") {
    return;
  }

  var context = this;
  var canvas = context.canvas;
  if (typeof lineHeight == "undefined") {
    lineHeight =
      (canvas && parseInt(window.getComputedStyle(canvas).lineHeight)) ||
      parseInt(window.getComputedStyle(document.body).lineHeight);
  }

  // 字符分隔为数组
  var arrText = text.split("");
  var line = "";

  for (var n = 0; n < arrText.length; n++) {
    var testLine = line + arrText[n];
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = arrText[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
};

export default new CameraSnapshot();
