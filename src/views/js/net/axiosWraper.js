/*
 * @Author: your name
 * @Date: 2020-10-14 13:39:40
 * @LastEditTime: 2020-10-14 13:39:41
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \village-building-designc:\Users\Augur\Desktop\axios.js
 */
import axios from './http';
/**
 * class AxiosWraper
 */
class AxiosWraper {
    constructor() {
        // this.proxyKeys = [{
        //     pre: 'http://192.168.3.203:7280',
        //     // baseKey: '/Models/'
        // }] 
        this.proxyKeys = [];
        this.getConfigProxyUrl();
    }
    put(url, data){
        var resUrl = this.getProxyUrl(url);
        return axios.put(resUrl, data, {timeout: 1000 * 60 * 5});
    }
    getConfigProxyUrl(param = CIM_LAYERTREE_NAME, isProxy) {
        let _t = this;
        _t.proxyKeys = [];
        if (isProxy) {
            let key = param;
            let res = axios.get(`/agsupport-rest/agsupport/projectManager/get?name=${key}`);
            res.then(function (data) {
                if (data.success) {
                    let arr = JSON.parse(data.content).netConfig;
                    for (let i = 0; i < arr.length; i++) {
                        let o = {};
                        let a = arr[i].key;
                        o[a] = arr[i].value;
                        _t.proxyKeys.push(o);
                    }
                }
            });
        }
    }
    getProxyUrl(url) {
        var resUrl = url;
        for (var i = 0; i < this.proxyKeys.length; i++) {
            var tv = url.startsWith(this.proxyKeys[i].pre);
            if (!tv) continue;
            var turl = url.substring(this.proxyKeys[i].pre.length + 1);
            // resUrl = `${base[this.proxyKeys[i].baseKey]}${turl}`;
            //  resUrl = `${this.proxyKeys[i].baseKey}${turl}`;
            resUrl = `${turl}`;
            break;
        }
        return resUrl;
    }

    getData(url, params) {
        var resUrl = this.getProxyUrl(url);
        return axios.get(resUrl, {
            params: params
        });
    }
    getDataByPost(url, data, params) {
        var resUrl = this.getProxyUrl(url);
        return axios(
            {
                method: 'POST',
                url: resUrl,
                data: data,
                timeout: 1000 * 60 * 5,
            }
        );
    }
    delete(url, data){
        var resUrl = this.getProxyUrl(url);
        return axios.delete(resUrl, {data: data,  timeout: 1000 * 60 * 5});
    }
    uploadFile(url, file, id) {

    }
    /**
     * 获得兄弟文件(可以深度)的地址
     * @param {*} url 
     */
    getSibleFileUrl(url, fileName) {
        return url.substr(0, url.lastIndexOf('/')) + "/" + fileName;
    }
    downFile(url, params) {
        var resUrl = this.getProxyUrl(url);
        return axios.post(resUrl, params,{
            responseType:'blob',
            // "Content-Type": "application/x-www-form-urlencoded"
            headers: {
                'content-type': 'application/json',
              }
        });
    }
};

export default new AxiosWraper();