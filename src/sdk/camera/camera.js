/**
 * 相机相关的方法
 * @namespace Camera
 */
class Camera {
    /**
     * 定位到位置
     * @function setCamera
     * @memberof Camera
     * @param {viewer} viewer 场景
     * @param {Object} val 位置参数,俯仰角
     */
    setCamera(viewer, val) {
        if (val.heading) {
            viewer.camera.setView({
                destination: val.position,
                orientation: {
                    heading: val.heading,
                    roll: val.roll,
                    pitch: val.pitch
                }
            });
        } else {
            viewer.camera.setView({
                destination: val.position
            });
        }
    }
    /**
     * 定位到一个位置
     * @function setCameraByPosition
     * @memberof Camera
     * @param {viewer} viewer 场景
     * @param {array} position 位置 
     */
    setCameraByPosition(viewer, position) {
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2])
        })
    }
    /**
     * 定位到一个位置
     * @function setCameraByPosition
     * @memberof Camera
     * @param {viewer} viewer 场景
     * @param {object} position 位置 
     */
    cameraFlyTo(viewer, val) {
        viewer.camera.flyTo(val);
    }
    /**
     * 通过经纬度定位到位置（适用2维和3维）
     * @function setCameraByLongitude
     * @memberof Camera
     * @param {viewer} viewer viewer
     * @param {Object} val 相机参数 
     */
    setCameraByLongitude(viewer, val) {
        if (val.heading) {
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    val.longitude,
                    val.latitude,
                    val.height
                ),
                orientation: {
                    heading: val.heading,
                    roll: val.roll,
                    pitch: val.pitch
                }
            });
        } else {
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    val.longitude,
                    val.latitude,
                    val.height
                )
            });
        }
    }
    /**
     * 根据矩形形设置区域范围
     * @function setCameraByRectangle
     * @memberof Camera
     * @param {viewer} viewer viewer 视图对象
     * @param {number} west 西经（以弧度为单位）[-Pi, Pi]
     * @param {number} south 南纬（以弧度为单位）[-Pi/2, Pi/2]
     * @param {number} east 东经（以弧度为单位）[-Pi, Pi]
     * @param {number} north 北纬（以弧度为单位）[-Pi/2, Pi/2]
     */
    setCameraByRectangle(viewer, west, south, east, north) {
        viewer.camera.setView({
            destination: Cesium.Rectangle.fromDegrees(
                west,
                south,
                east,
                north
            )
        });
    }
    /**
     * 设置控制相机操作
     * @function setCameraController
     * @memberof Camera
     * @param {viewer} _viewer 场景
     * @param {Object} _val screenSpaceCameraController参数 以及设置的值 
     */
    setCameraController(_viewer, _val) {
        if (_val != undefined && _val != null) {
            for (var element in _val) {
                _viewer.scene.screenSpaceCameraController[element] = _val[element];
            };
        }

    }
    /**
     * 飞到tileset位置
     * @function flyToTileset
     * @memberof Camera
     * @param {viewer} viewer 场景
     * @param {Cesium3DTileset} tileset 3dtiles模型
     * @param {Object} val 南纬
     */
    flyToTileset(viewer, tileset, val) {
        viewer.flyTo(tileset, val);
    }
    /**
     * 重置摄像机
     * @function resetCamera
     * @memberof Camera
     * @param {object} viewer viewer
     */
    resetCamera(viewer) {
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
    /**
     * 当前的位置转字符串 
     * @function getCameraAsJSON
     * @memberof Camera
     * @param {viewer} viewer 场景
     * @returns {object} 返回json数据
     */
    getCameraAsJSON(viewer) {
        var s = {};
        s.position = viewer.camera.positionWC.clone();
        s.heading = viewer.camera.heading;
        s.pitch = viewer.camera.pitch;
        s.roll = viewer.camera.roll;
        return s;
    }
    /**
   * @description: 方法描述 获取当前可见视图范围
   * @param {viewer} viewer 场景
   * @return {*}
   */
    getViewExtent(viewer) {
        return viewer.camera.computeViewRectangle();
    }

    /**
    * @description: 方法描述 获取视图中心点位置，返回经纬度坐标
    * @param {viewer} viewer 场景
    * @return {*}
    */
    getCenterPosition(viewer) {
        var result = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas
            .clientHeight / 2));
        var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
        var lon = curPosition.longitude * 180 / Math.PI;
        var lat = curPosition.latitude * 180 / Math.PI;
        var height = this.getCameraHeight(viewer);
        return {
            lon: lon,
            lat: lat,
            height: height
        };
    }
    /**
     * @author: pwz（潘文周） 
     * @description: 方法描述 获取相机离地面高度
     * @param {*} viewer
     * @return {*}
     */
    getCameraHeight(viewer) {
        return viewer.camera._positionCartographic.height;
    }

}

export default new Camera();