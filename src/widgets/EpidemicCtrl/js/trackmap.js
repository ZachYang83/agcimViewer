
class TrackMapInit {
    /**
     * 创建追踪地图
     * @param {*} viewer 
     * @param {*} cityEntitiesStore 
     */
    createTrackMap(viewer, cityEntitiesStore){
        var trackviewer = new Cesium.Viewer("trackContainer",{
            infoBox: false,
            selectionIndicator: false,
            shouldAnimate: true,
            fullscreenButton: false
          });
        viewer = trackviewer;
        cityEntitiesStore = [];
        this.createCityPoints(viewer, cityEntitiesStore);
    }
    /**
     * 创建路径城市点
     * @param {*} viewer 
     * @param {*} cityEntitiesStore 
     */
    createCityPoints(viewer, cityEntitiesStore) {
        var travelPoints = [
            {
            city: "珠海",
            date: "2020-03-01",
            lng: 113.362649674132,
            lat: 22.1503689182871
            },
            {
            city: "深圳",
            date: "2020-03-05",
            lng: 114.142018714885,
            lat: 22.6425973654546
            },
            {
            city: "广州",
            date: "2020-03-07",
            lng: 113.54,
            lat: 23.33
            }
        ];
        var tracks = [];
        var cameraLng;
        var cameraLat;
        var cameraLngMax = travelPoints[0].lng;
        var cameraLngMin = travelPoints[0].lng;
        var cameraLatMax = travelPoints[0].lat;
        var cameraLatMin = travelPoints[0].lat;
        for (var i = 0; i < travelPoints.length; i++) {
            var travelcity = travelPoints[i];
            var lng = travelcity.lng;
            if(lng >= cameraLngMax){
                cameraLngMax = lng;
            }
            else if(lng <= cameraLngMin){
                cameraLngMin = lng;
            }
            var lat = travelcity.lat;
            if(lat >= cameraLatMax){
                cameraLatMax = lat;
            }
            else if(lat <= cameraLatMin){
                cameraLatMin = lat;
            }
            var position = Cesium.Cartesian3.fromDegrees(lng, lat, 2000);
            var travelpoint = viewer.entities.add({
            id: travelcity.date,
            position: position,
            point: {
                pixelSize: 15,
                color: Cesium.Color.SKYBLUE
            },
            label:{
                font: '20px',
                text: travelcity.city,
                pixelOffset : new Cesium.Cartesian2(25.0, 0)
            }
            });
            if(i >= 1)
            {
                var orientCity = travelPoints[i - 1];
                var trackline = Cesium.Cartesian3.fromDegreesArray([
                    orientCity.lng,orientCity.lat,
                    travelcity.lng,travelcity.lat]);
                var traveltrack = viewer.entities.add({
                    //id: travelcity.date + travelcity.city,
                    polyline: {
                        positions: trackline,
                        width: 2,
                        clampToGround: true,
                        material: Cesium.Color.HONEYDEW
                    }
                        
                });
                tracks[i - 1] = {
                    lng: orientCity.lng,
                    lat: orientCity.lat,
                    height: 0,
                    time: (i - 1) * 300
                };
                tracks[i] = {
                    lng: travelcity.lng,
                    lat: travelcity.lat,
                    height: 0,
                    time: i * 300
                };
            }
            var cityID = viewer.entities.getById(travelcity.date);
            cityEntitiesStore.push(cityID);
            
        }
        cameraLng = (cameraLngMax + cameraLngMin) * 0.5;
        cameraLat = (cameraLatMax + cameraLatMin) * 0.5;
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(cameraLng, cameraLat, 400000.0)
            });    
        this.showTrack(tracks, viewer);
    }
    /**
     * 显示路径
     * @param {*} tracks 
     * @param {*} viewer 
     */
    showTrack(tracks, viewer){
        var len = tracks.length;
        let start = Cesium.JulianDate.fromDate(new Date(2020,4,8));
        let stop = Cesium.JulianDate.addSeconds(start, len * 300, new Cesium.JulianDate());
        viewer.clock.startTime = start.clone();
        viewer.clock.currentTime = start.clone();
        viewer.clock.stopTime  = stop.clone();
        viewer.clock.multiplier = 100;
        // viewer.timeline.zoomTo(start,stop);  //初始化地图时已经把时间轴禁用，暂时注释
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        var travelingHistory = this.trackingTravel(tracks);
        let travelingModel = viewer.entities.add({
            availablity: new Cesium.TimeIntervalCollection([
                new Cesium.TimeInterval({
                    start: start,
                    stop: stop
                })]),
                position: travelingHistory,
                orientation: new Cesium.VelocityOrientationProperty(travelingHistory),
                model: {
                    uri:'./model3d/CesiumMan/Cesium_Man.glb',
                    minimumPixelSize: 88
                }
        });
        
    }
    /**
     * 计算追踪路线
     * @param {*} tracks 
     */
    trackingTravel(tracks){
        let travelingHistory = new Cesium.SampledPositionProperty();
        for(let i = 0; i < tracks.length; i++){
            let time = Cesium.JulianDate.addSeconds(Cesium.JulianDate.fromDate(new Date(2020,4,8)), tracks[i].time, new Cesium.JulianDate);
            let position = Cesium.Cartesian3.fromDegrees(tracks[i].lng,tracks[i].lat,tracks[i].height);
            travelingHistory.addSample(time, position);
        }
        return travelingHistory;
    }
}
export default new TrackMapInit();