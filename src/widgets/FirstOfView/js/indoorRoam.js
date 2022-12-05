/**
 * 室内漫游，以人的第一视角行驶
 */
class IndoorRoam {
    constructor() {
        this.range = 1.7;
        this.pitchValue = -30;
        this.speed = 0.000005;   // 坐标以经纬度为单位时的速度值

        // 漫游路线 ,地标集合 根据地标顺序来进行漫游
        // height:相机高度(单位米) flytime:相机两个标注点飞行时间(单位秒)
        this.marks = [
            {lng: 112.21603479121671,lat:22.565620812106133, height:38.8, flytime:5},
            {lng: 112.21606014699537,lat:22.565643399986158, height:38.8, flytime:5},
            {lng: 112.21608724809613,lat:22.565619576128125, height:37.2, flytime:5},
            {lng: 112.21609675077951,lat:22.56562947067924, height:37.2, flytime:5},
            {lng: 112.21606442852486,lat:22.56565257961077, height:35.5, flytime:5},
            {lng: 112.21603394724464,lat:22.565621216995233, height:35.5, flytime:5},
            {lng: 112.21605607329481,lat:22.56560066659166, height:35.5, flytime:5},
            {lng: 112.21606703800482,lat:22.56561094522231, height:35.5, flytime:5}
        ];
        this.marksIndex = 1;
    }

    /**
     * 初始化


     * @param {Array} viewer  地图 viewer
     * @param {object} modelMatrix  模型矩阵
     */
    Initialize(viewer){
        var _this = this;
        viewer.scene.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(this.marks[0].lng,this.marks[0].lat, this.marks[0].height),  //定位坐标点，建议使用谷歌地球坐标位置无偏差
            duration:2   //定位的时间间隔
        });

        setTimeout(function(){
            _this.flyExtent(viewer);
        },1000);
        
    }


    /**
     * @param {Array} viewer  地图 viewer
     * @param {object} modelMatrix  模型矩阵
     */

    flyExtent(viewer){
        var _this = this;
        // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
        var pitch = Cesium.Math.toRadians(_this.pitchValue);
        // 时间间隔2秒钟
        this.setExtentTime(viewer,_this.marks[_this.marksIndex].flytime);
        var Exection = function TimeExecution() {
            var preIndex = _this.marksIndex - 1;
            var markItem = _this.marks[_this.marksIndex];
            var preMarkItem = _this.marks[preIndex];
            if(_this.marksIndex == 0){
                preIndex = _this.marks.length -1;
            }
            var heading = _this.bearing(preMarkItem.lat, preMarkItem.lng, markItem.lat, markItem.lng);
            heading = Cesium.Math.toRadians(heading);
            // 当前已经过去的时间，单位s
            var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
            var originLat =preMarkItem.lat;
            var originLng = preMarkItem.lng;
            var originHeight = preMarkItem.height;
            var endPosition = Cesium.Cartesian3.fromDegrees(
                (originLng+(markItem.lng-originLng)/markItem.flytime*delTime),
                (originLat+(markItem.lat-originLat)/markItem.flytime*delTime),
                (originHeight+(markItem.height-originHeight)/markItem.flytime*delTime)
            );
            viewer.scene.camera.setView({
                destination: endPosition,
                orientation: {
                    heading: heading,
                    pitch : pitch,
                }
            });
            if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
                viewer.clock.onTick.removeEventListener(Exection);
                _this.changeCameraHeading(viewer);
            }
        };
        viewer.clock.onTick.addEventListener(Exection);
    }
    // 相机原地定点转向
    changeCameraHeading(viewer){
        var _this = this;
        var nextIndex = _this.marksIndex + 1;
        if(_this.marksIndex == _this.marks.length - 1){
          return ;
        }
        var markItem = _this.marks[_this.marksIndex];
        var nextItem = _this.marks[nextIndex];
        // 计算两点之间的方向
        var heading = _this.bearing(markItem.lat, markItem.lng, nextItem.lat,nextItem.lng);
        // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值
        var pitch = Cesium.Math.toRadians(_this.pitchValue);
        // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
        var angle = (heading - Cesium.Math.toDegrees(viewer.camera.heading)) / 2;
        if(angle >90){
            angle = angle - 180;
        }else if(angle<-90){
            angle = angle + 180;
        }
        // 时间间隔2秒钟
        _this.setExtentTime(viewer,2);
        // 相机的当前heading
        var initialHeading = viewer.camera.heading;
        var Exection = function TimeExecution() {
            // 当前已经过去的时间，单位s
            var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
            var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
            viewer.scene.camera.setView({
                orientation: {
                    heading : heading,
                    pitch : pitch,
                }
            });
            if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
                viewer.clock.onTick.removeEventListener(Exection);
                _this.marksIndex = ++_this.marksIndex >= _this.marks.length ? 0 : _this.marksIndex;
                _this.flyExtent(viewer);
            }
        };
        viewer.clock.onTick.addEventListener(Exection);
    }

    /**
     *设置飞行的时间到viewer的时钟里
     * @param {Array} viewer  地图 viewer
     * @param {*} time 时间，单位为秒 
    */
    // 
    setExtentTime(viewer,time){
        var startTime = Cesium.JulianDate.fromDate(new Date());
        var stopTime = Cesium.JulianDate.addSeconds(startTime, time, new Cesium.JulianDate());
        viewer.clock.startTime = startTime.clone();  // 开始时间
        viewer.clock.stopTime = stopTime.clone();     // 结速时间
        viewer.clock.currentTime = startTime.clone(); // 当前时间
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
    }
    /**
     *从度转换为弧度。
    * @param {*} radians 度 
    */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    /**
     * 从弧度转换为度。
    * @param {*} radians 弧度 
    */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    /**
     * 计算两点之间的方向  ,坐标为经纬度坐标，
    * @param {*} radians 弧度 
    */
    bearing(startLat, startLng, destLat, destLng){
        startLat = this.toRadians(startLat);
        startLng = this.toRadians(startLng);
        destLat = this.toRadians(destLat);
        destLng = this.toRadians(destLng);

        let y = Math.sin(destLng - startLng) * Math.cos(destLat);
        let x = Math.cos(startLat) * Math.sin(destLat) - Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
        let brng = Math.atan2(y, x);
        let brngDgr = this.toDegrees(brng);
        return (brngDgr + 360) % 360;
    }


    /**
     * 定点旋转
    * @param {*} position 定点位置 
    */
    _lockView(position) {
        var viewer = CIM.viewer;
        var _this = this;

          _this._isLockViewPoint = true;
          _this.frist = true;
          _this.range = 1.7;
          _this.lockViewPosition = position;
        var angle = 360 / 30;
        var startTime = Cesium.JulianDate.fromDate(new Date());
        viewer.clock.startTime = startTime.clone(); // 开始时间
        viewer.clock.currentTime = startTime.clone(); // 当前时间
        viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; 
        // 相机的当前heading
        var initialHeading = viewer.camera.heading;
        var Exection = function TimeExecution() {
          if(_this._isLockViewPoint){
                position = _this.lockViewPosition;
                  var delTime = Cesium.JulianDate.secondsDifference(
                    viewer.clock.currentTime,
                    viewer.clock.startTime
                  );
                  var heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
                  var pitch = Cesium.Math.toRadians(-30.0);
                //   var range = 5.0;  
                  viewer.camera.lookAt(
                    position,
                    new Cesium.HeadingPitchRange(heading, pitch, _this.range)
                  );
                  viewer.camera.moveUp(1.7);
                  viewer.camera.moveBackward(1);
          }else{
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          }
          if ( Cesium.JulianDate.compare( viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
            viewer.clock.onTick.removeEventListener(Exection);
          }
        };
        viewer.clock.onTick.addEventListener(Exection);
    }

    dispose(){

    }
};
var indoorRoam = new IndoorRoam();
export default indoorRoam;