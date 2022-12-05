/**
 * 支持缓冲的控制 陈彪 2020年7月2日
 */
import axiosWraper from '../net/axiosWraper';

class serverData4Config {
    /**
     * 获得后台的图层树数据
     */
    getLayerTreeData(params) {
        let res = axiosWraper.getData(`/agsupport-rest/agsupport/project/getProjectLayerTree`, params);
        return this._saveToCache(res,"layerTree_09728");
    }

    _saveToCache(res,code) {
        var promise = new Promise(function (accept,reject) {
            res.then(function (data) {
                window.sessionStorage.setItem(code, JSON.stringify(data));
                accept(data);
            }).catch(function (error) {
                var data = window.sessionStorage.getItem(code);
                if (!data) {
                    reject();
                    return
                };
                data = JSON.parse(data);
                accept(data);
            })
        })
        return promise;
    }

   getMenuData() {

    }

    getFunctionData(userId) {
        let params = {
            isTree: true,
            isAdmin: 0,
            isCloudSoft: 0,
            appSoftCode: "agcim-map-cesium"
        };

        var url = `/agsupport-rest/agsupport/func/findFuncByUser/` + userId;
        let res = axiosWraper.getData(url, params);
        return this._saveToCache(res,"functions_097285");
    }

     getViewPointData() {

    }

    getRoamData() {


    }

    saveViewPointData() {

    }

    saveRoamData() {

    }

    getKeyValueData() {

    }

    saveKeyValueData() {

    }

    getJsonData() {

    }

    saveJsonData() {

    }

}
export default new serverData4Config();