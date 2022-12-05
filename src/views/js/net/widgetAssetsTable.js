import axios from '@/views/js/net/http.js';

function guid(len) {
    return Number(Math.random().toString().substr(3, len) + Date.now()).toString(36);
}

let defaultParam = {
    "softCode": "agcim-map-cesium", //运维 -> 应用 -> 应用工程编号
}
let url = '/agsupport-rest/agsupport/configManager/widgetAssetsTable';
class WidgetAssets {
    add(params) {
        let p = {
            id: guid(10),
            ...defaultParam,
        };
        for (let key in p) {
            params.append(key, p[key]);
        }
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime()
            }
        }; //支持字符串+文件类型
        return axios.post(`${url}/add`, params, config);
    };
    update(params) {
        let p = {
            ...defaultParam,
        };
        for (let key in p) {
            params.append(key, p[key]);
        }
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data;boundary = ' + new Date().getTime()
            }
        }; //支持字符串+文件类型
        return axios.post(`${url}/update`, params, config);
    };
    delete(params) {
        let p = {
            ...defaultParam,
            ...params
        };
        return axios.delete(`${url}/delete`, {
            params: p
        });
    };
    //分页查
    find(params) {
        let p = {
            ...defaultParam,
            ...params
        };
        return axios.get(`${url}/find`, {
            params: p
        });
    };
    //查全部
    get(params) {
        let p = {
            ...defaultParam,
            ...params
        };
        return axios.get(`${url}/get`, {
            params: p
        });
    };
    download(params) {
        let p = {
            ...defaultParam,
            ...params
        };
        window.location.href = `${url}/download?softCode=${p.softCode}&tableName=${p.tableName}&id=${p.id}&fieldName=${p.fieldName}&fileName=${p.fileName}`;
    };
    preview(params) {
        let p = {
            ...defaultParam,
            ...params
        };
        return `${url}/preview?softCode=${p.softCode}&tableName=${p.tableName}&id=${p.id}&fieldName=${p.fieldName}&fileName=${p.fileName}`;
    };
}
export default new WidgetAssets();