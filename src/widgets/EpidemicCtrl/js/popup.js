import $ from "jquery";
import '../css/popup.css'

class PopUp {
  constructor() {
    this.viewer = null;
    this.removeHandler = null;
    this.infoDiv = null;
  }

  /**
   *
   *初始化popup元素
   * @param viewer
   * @memberof PopUp
   */
  initialize(viewer) {
    this.viewer = viewer;
    var viewerContainer = this.viewer._element;
    let infoDiv = document.createElement("div");
    infoDiv.setAttribute("id", "trackPopUp");
    infoDiv.innerHTML =
      '<div id="trackPopUpContent" class="leaflet-popup" style="top:-10px;left:0;">' +
      '<p class="leaflet-popup-content-title"></p>' +
      '<a class="leaflet-popup-close-button" href="#">×</a>' +
      '<div class="leaflet-popup-content-wrapper">' +
      '<div id="trackPopUpLink" class="leaflet-popup-content" style="max-width: 500px;"></div>' +
      '</div>' +
      '<div class="leaflet-popup-tip-container">' +
      '<div class="leaflet-popup-tip"></div>' +
      '</div>' +
      '</div>';
    this.infoDiv = infoDiv;
    viewerContainer.appendChild(infoDiv);
    this.infoDiv.style.display = "none";
  }

  /**
   *
   *显示弹出框方法
   * @param viewer 视图对象
   * @param movement 鼠标点击物体
   * @param content 弹出框内容
   * @param title 弹出框标题
   * @memberof PopUp
   */
  show(viewer, movement, content, title) {
    $('#trackPopUp').show();
    $(".leaflet-popup-content-title").html(title);
    var obj = {
      position: movement.position,
      content: content,
    };
    var picked = viewer.scene.pick(obj.position);
    if (Cesium.defined(picked)) {
      var id = Cesium.defaultValue(picked.id, picked.primitive.id);
      if (id instanceof Cesium.Entity) {
        $('#trackPopUpLink').empty();
        $('#trackPopUpLink').append(obj.content);
        //popup位置
        function positionPopUp(c) {
          var x = c.x - ($('#trackPopUpContent').width()) / 2;
          var y = c.y - ($('#trackPopUpContent').height());
          $('#trackPopUpContent').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
        }
        var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
        $('#trackPopUp').show();
        positionPopUp(c); // 初始化位置
        //添加监听事件
        this.removeHandler = viewer.scene.postRender.addEventListener(function () {
          if (picked.id._polyline != null) {
            var pos = {};
            pos.x = (id._polyline._positions._value["0"].x + id._polyline._positions._value[1].x) / 2;
            pos.y = (id._polyline._positions._value["0"].y + id._polyline._positions._value[1].y) / 2;
            pos.z = (id._polyline._positions._value["0"].z + id._polyline._positions._value[1].z) / 2;
            var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, pos);
          } else {
            var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, id._position
              ._value);
          }
          if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
            positionPopUp(changedC);
            c = changedC;
          }
        });
        // PopUp close button event handler
        $('.leaflet-popup-close-button').click(function () {
          $('#trackPopUp').hide();
          $('#trackPopUpLink').empty();
          this.removeHandler.call();
          return false;
        });
        return id;
      }
    }
  }

  hide() {
    //关闭popup
    $('#trackPopUp').hide();
    $("#trackPopUpLink").empty();
    //停止监听
    if (this.removeHandler != null) {
      this.removeHandler.call();
      return false;
    }
  }
}
export default new PopUp();