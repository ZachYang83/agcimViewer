/*
 * @Author: luojh
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-22 18:05:04
 * @FilePath: \village-building-design\src\net\server\componentServer.js
 */

import axiosWraper from "@/views/js/net/axiosWraper";
import axios from 'axios';

let proxyUrl = '/agsupport-rest';

const componentServer = {
    /**
     * 构件列表,按条件查询
     * @param params.page, params.rows分页
     * @param params [catagory, name, page, rows, objectid, materialid, id...]
     * @returns {Promise<*>}
     */

    pdfPreview: async params => {
        let url = `/agsupport/applicationManager/bimCheck/preview`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },
    pdfDownload: async params => {
        let url = `/agsupport/applicationManager/bimCheck/download`;
        return window.open(proxyUrl + url + "?filePath=" + params);
    },
    //保存图片
    imgUpLoad: async params => {
        let url = `/agsupport/problemDiscern/save`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },
    //获取图片
    getImage: async params => {
        let url = `/agsupport/problemDiscern/get`;
        return axiosWraper.getData(proxyUrl + url, params);
    },
    //获取审查结果数据
    getBimData: async params => {
        let url = `/agsupport/applicationManager/bimCheck/find`;
        return axiosWraper.getData(proxyUrl + url, params);
    },
    //获取审查结果数据
    handleBimData: async params => {
        let url = `/agsupport/applicationManager/bimCheck/add`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },
    // BIM审查项目列表
    getBimCheckProject: async params => {
        let url = `/agsupport/applicationManager/bimCheckProject/find`;
        return axiosWraper.getData(proxyUrl + url, params);
    },
    // BIM审查统计
    getStatisticsUsingPOST: async params => {
        let url = `/agsupport/applicationManager/bimCheck/statistics`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },

}

export default componentServer;