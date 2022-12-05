/**
 * 坐标转换相关的方法
 * @namespace Coordinate
 */
class Coordinate {
    /**
     *
     * 笛卡尔坐标系转WGS84坐标系
     * @param {object} point 点,笛卡尔坐标{x:x,y:y,z:z}
     * @returns {object} -lat: lat, lng: lng, alt: alt
     * @function Cartesian3_to_WGS84
     * @memberof Coordinate
     */
    Cartesian3_to_WGS84(point) {
        var cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {
            lat: lat,
            lng: lng,
            alt: alt
        };
    }
    /**
     *
     * WGS84坐标系转笛卡尔坐标系
     * @param {object} point 点,笛卡尔坐标{lat: lat, lng: lng, alt: alt}
     * @returns {object} - x:x,y:y,z:z
     * @function WGS84_to_Cartesian3
     * @memberof Coordinate
     */
    WGS84_to_Cartesian3(point) {
        var car33 = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt);
        var x = car33.x;
        var y = car33.y;
        var z = car33.z;
        return {
            x: x,
            y: y,
            z: z
        };
    }

    /**
     * 屏幕坐标转笛卡尔坐标
     * @param {object} viewer viewer
     * @param {object} windowPosition 屏幕坐标
     * @function screenToCartesian
     * @memberof Coordinate
     */
    screenToCartesian(viewer, windowPosition) {
        let ray = viewer.camera.getPickRay(windowPosition);
        let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        return cartesian;
    }

    /**
     * 笛卡尔坐标转经纬度坐标
     * @param {Cartesian3} cartesian3 笛卡尔坐标
     * @param {String } cartographicType 经纬度坐标表示类型（Radians：弧度表示 Degrees：度表示）
     * @function cartesian3ToCartographic
     * @memberof Coordinate
     */
    cartesian3ToCartographic(cartesian3, cartographicType) {
        var cartographic
        if (cartographicType == "Radians") {
            cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        } else if (cartographicType == "Degrees") {
            cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
            cartographic = this.latitude(cartographic);
            // cartographic = Cesium.Cartographic.fromDegrees(point.lng, point.lat, point.alt);
        }
        return cartographic;
    }
    /**
     * @description: 方法描述 笛卡尔坐标批量转经纬度坐标
     * @param {*} cartesian3Arr 笛卡尔坐标数组
     * @param {*} cartographicType 经纬度坐标表示类型（Radians：弧度表示 Degrees：度表示）
     * @return {*}
     */
    cartesian3ToCartographicMany(cartesian3Arr, cartographicType = "Degrees") {
        return cartesian3Arr.map(cartesian3 => this.cartesian3ToCartographic(cartesian3, cartographicType))
    }
    /**
   * @description: 方法描述 批量从经纬度数组获取世界坐标数组
   * @param {Array} points 经纬度数组 例如[[113.37264365, 23.10296901],[113.37264365, 23.10296901],[113.37264365, 23.10296901]]
   * @return {*} 返回世界坐标数组 例如[{"x":-2328476.77310197,"y":5388031.4763123235,"z":2487217.7412398118},{"x":-2328491.464629894,"y":5388025.188779467,"z":2487217.6088169324}]
   */
    WGS84ArraysToCartesian3(points) {
        return points.map(item => Cesium.Cartesian3.fromDegrees(item[0], item[1]))
    }
    /**
     * @description: 方法描述 批量的从经纬度数组转成笛卡尔坐标数组
     * @param {*}
     * @return {*}
     */
    WGS84s_to_Cartesian3(points) {
        return points.map(item => this.WGS84_to_Cartesian3(item))
    }
    /**
     * @description: 方法描述  将世界坐标数组转成用于wfs查询的字符串
     * @param {Cartesian3 []} points 世界坐标数组 例如 [{"x":-2328476.77310197,"y":5388031.4763123235,"z":2487217.7412398118},{"x":-2328491.464629894,"y":5388025.188779467,"z":2487217.6088169324}]
     * @return {*} 返回用于wfs查询的字符串例如  113.37473621,23.10370166 113.37473647,23.1037024 113.37477098,23.10372272
     */
    cartesian3sToWfsWGS84Stsring(points) {
        let p = points.map((point) => this.Cartesian3_to_WGS84(point));
        function wfsGeometry(polygon) {
            let _polygonPoints = "";
            for (let i = 0; i < polygon.length; i++) {
                _polygonPoints += polygon[i].lng + "," + polygon[i].lat + " "
            }
            return _polygonPoints;
        }
        return wfsGeometry(p);
    }
    /**
     * 经纬度坐标转换为笛卡尔坐标
     * @param {object} cartographic 经纬度坐标 
     * @function cartographicToCartesian3
     * @memberof Coordinate
     */
    cartographicToCartesian3(cartographic) {
        var cartesian3;
        if (cartographic.longitude) {
            cartesian3 = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        } else {
            cartesian3 = Cesium.Cartesian3.fromDegrees(cartographic.lng, cartographic.lat, cartographic.alt);
        }
        return cartesian3;
    }

    /**
     * 将以弧度表示的经纬度坐标转换为等效的Web Mercator X，Y，Z坐标（以米表示）
     * @param {object} viewer viewer
     * @param {*} cartographic 以弧度表示的经纬度坐标 
     * @function cartographicToMercatorCartesian3
     * @memberof Coordinate
     */
    cartographicToMercatorCartesian3(viewer, cartographic) {
        var webMercatorProjection = new Cesium.WebMercatorProjection(viewer.scene.globe.ellipsoid);
        var cartesian3 = webMercatorProjection.project(cartographic);
        return cartesian3;
    }

    /**
     * 将以米为单位的Web Mercator X，Y坐标转换为Cartographic 包含大地的椭球坐标。
     * @param {object} viewer viewer
     * @param {*} cartesian 以米为单位的Web Mercator X，Y坐标
     * @function mercatorCartesian3ToCartographic
     * @memberof Coordinate
     */
    mercatorCartesian3ToCartographic(viewer, cartesian) {
        var webMercatorProjection = new Cesium.WebMercatorProjection(viewer.scene.globe.ellipsoid);
        let cartographic = webMercatorProjection.unproject(cartesian);
        return cartographic;
    }
    /**
     * 将世界坐标转换成投影坐标
     * @param {object} viewer viewer
     * @param {object} cartesian3  坐标
     * @function cartesianToMercator
     * @memberof Coordinate
     */
    cartesianToMercator(viewer, cartesian3) {
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        var mercator = this.cartographicToMercatorCartesian3(viewer, cartographic);
        return mercator;
    }
    /**
     * 将投影坐标转换成世界坐标
     * @param {object} viewer viewer
     * @param {object} position 坐标
     * @function mercatorToCartesian
     * @memberof Coordinate
     */
    mercatorToCartesian(viewer, position) {
        let viewPoint = new Cesium.Cartesian3(position.x, position.y, position.z);
        let cartographic = this.mercatorCartesian3ToCartographic(viewer, viewPoint);
        let point = this.latitude(cartographic);
        let cartesian = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt);
        return cartesian;
    }
    /**
     * 根据弧度获取到经纬度
     * @param {object} cartographic 坐标
     * @function latitude
     * @memberof Coordinate
     */
    latitude(cartographic) {
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return {
            lng: lng,
            lat: lat,
            alt: alt
        };
    }
    /**
     *
     * 修改笛卡尔点高度
     * @param {object} cartesian 坐标
     * @param {number} height 高度
     * @function changePointHeight
     * @memberof Coordinate
     */
    changePointHeight(cartesian, height) {
        //将传入的笛卡尔点转换为经纬度高程点
        var position = this.cartesian3ToCartographic(cartesian, "Degrees");
        //将转换后的点高程换成传入的高度
        position.alt = height;
        return this.cartographicToCartesian3(position);
    }
    /**
        *
        * 修改笛卡尔点高度,当前高度增加相对高度
        * @param {object} cartesian 坐标
        * @param {number} height 高度
        * @function changePointHeight
        * @memberof Coordinate
        */
    changePointAddHeight(cartesian, height) {
        //将传入的笛卡尔点转换为经纬度高程点
        var position = this.cartesian3ToCartographic(cartesian, "Degrees");
        //将转换后的点高程换成传入的高度
        position.alt += height;
        return this.cartographicToCartesian3(position);
    }
    /**
     *从度转换为弧度。
     * @param {number} radians 度 
     * @function toRadians
     * @memberof Coordinate
     */
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
    /**
     * 从弧度转换为度。
     * @param {number} radians 弧度 
     * @function toDegrees
     * @memberof Coordinate
     */
    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }
    /**
     * @description: 方法描述 通用的坐标转换，传入世界坐标，经纬度，弧度坐标,4x4矩阵，屏幕坐标的某一种
     * 返回世界坐标，经纬度，弧度坐标
     * @param {Cartesian3/Matrix4/Cartographic/Cartesian2} coords 需要转换的坐标
     * @param {object} viewer viewer
     * @return {*} 返回世界坐标，经纬度，弧度坐标对象
     */
    commomCoordinateTransform(coords, viewer) {
        let cartesian3, radians, degrees;
        if (coords instanceof Cesium.Cartesian3) {//传入的是世界坐标
            cartesian3 = coords;
            radians = this.cartesian3ToCartographic(coords, "Radians");
            degrees = this.cartesian3ToCartographic(coords, "Degrees");
        } else if (coords instanceof Cesium.Cartographic) {
            cartesian3 = this.cartographicToCartesian3(coords);
            radians = coords;
            degrees = this.cartesian3ToCartographic(cartesian3, "Degrees");
        } else if ("lat" in coords && "lng" in coords) {
            cartesian3 = this.cartographicToCartesian3(coords);
            radians = this.cartesian3ToCartographic(cartesian3, "Radians");;
            degrees = coords;
        } else if (coords instanceof Cesium.Matrix4) {
            cartesian3 = Cesium.Matrix4.getTranslation(coords, new Cesium.Cartesian3());
            radians = this.cartesian3ToCartographic(cartesian3, "Radians");
            degrees = this.cartesian3ToCartographic(cartesian3, "Degrees");
        } else if (coords instanceof Cesium.Cartesian2) {
            cartesian3 = this.screenToCartesian(viewer, coords);
            if (cartesian3) {
                radians = this.cartesian3ToCartographic(cartesian3, "Radians");
                degrees = this.cartesian3ToCartographic(cartesian3, "Degrees");
            }
        }
        return {
            cartesian3,
            radians,
            degrees
        }
    }


}

export default new Coordinate();