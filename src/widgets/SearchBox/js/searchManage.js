import Ows from './ows';
import agCamera from "@/sdk/camera/camera";

 class SearchManage {
     constructor(vm) {
         this._entities = [];
         this.vm = vm;
         this.curEntity = {}; 
     }
     resetMapUI(){
        this.flyTo(this.vm.sList[0].location);
        this.curEntity.billboard.image._value = require(`../img/location.png`);
    }
    addMany(list, viewer) {
        //list============ 展示对应图层等等  ---3d tiles wms  
        //1.加载图层  调图层树的展示+定位   
        //2.定位到对应点   

        for (let i = 0; i < list.length; i++) {
            let ows = new Ows();
            let o = {
                id: list[i].id,
                name: (i + 1) + '.' + list[i].name,
                location: list[i].location,
                image: require(`../img/location.png`),
            }

            let entityJson = {
                id: o.id,
                name: o.name,
                position: Cesium.Cartesian3.fromDegrees(o.location[0], o.location[1]),
                billboard: {
                    image: o.image
                },
                label: {
                    text: o.name,
                    font: '500 14px Helvetica',
                    fillColor: Cesium.Color.WHITE,
                    pixelOffset: new Cesium.Cartesian2(-8, -35), //偏移量 
                }
            }

            let entity = ows.addEntity(viewer, entityJson);
            this._entities.push(entity);
        }
        this.flyTo(list[0].location);
        this.clickBillboard(viewer);
    }

    clickBillboard(viewer) {
        var _this = this;
        var handlerVideo = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handlerVideo.setInputAction(function (click) {
            var pick = viewer.scene.pick(click.position);
            if (pick) {
                _this.mapDetail(pick);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    mapDetail(pick) {
        var _this = this;
        for (let i = 0; i < _this._entities.length; i++) {
            let o = _this._entities[i];
            if (o == pick.id || o.id === pick.id) {
                _this.curEntity = o;
                _this.curEntity.billboard.image._value = require(`../img/location1.png`);
                CIM.viewer.zoomTo(_this.curEntity);
                for (let j = 0; j < _this.vm.sList.length; j++) {
                    if (_this.vm.sList[j].id == _this.curEntity.id) {
                        _this.vm.showDetailUI(_this.vm.sList[j]);
                    }
                }
            } else {
                if (o.billboard.image._value == require(`../img/location1.png`)) {
                    o.billboard.image._value = require(`../img/location.png`);
                }
            }
        }
    }

    flyTo(position) {
        agCamera.setCameraByPosition(CIM.viewer, position);
    }

     //清除已存在的定位点
     clearAll(){ 
        // this.viewer.entities.removeAll();   
     }
 }
 export default SearchManage
