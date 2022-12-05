/*
 * @Author: luojh
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: luojh
 * @LastEditTime: 2020-09-22 17:18:09
 * @FilePath: \village-building-design\src\net\server\projectServer.js
 */

import axiosWraper from "@/views/js/net/axiosWraper";

let proxyUrl = '/agsupport-rest';

const projectServer = {
    /**
     * 房屋列表，按条件查询
     * @param params.page, params.rows分页
     * @param params.hourseName 房屋名称（搜索条件）
     * @param params [hourseName, page, rows, userId, type, tableName...]
     * @returns {Promise<*>}
     */
    findProject: async params => {
        let url = `/agsupport/BIM/Project/find`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    /**
     * 房屋户型图，配置信息
     * @param params.paramType=1，查询户型图,需要传params.id
     * @param params.paramType=2，查询配置信息
     * @returns {Promise<*>}
     */
    findProjectById: async params => {
        let url = `/agsupport/BIM/Project/get`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    /**
     * 添加房屋zip
     * @param params.modelFile 房屋模型（只支持zip压缩文件）
     * @returns {AxiosPromise<any>}
     */
    addProject: params => {
        let url = `/agsupport/BIM/Project/add`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },

    /**
     * 上传资源
     * @param params [hourseName, homesteadArea, floorArea, coveredArea, costEstimates, tableName, remark, modelFiles, thumbFile, dirFiles]
     * @returns {AxiosPromise}
     */
    saveResources: params => {
        let url = `/agcloud/resource/saveResources`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },

    /**
     * 上传材质
     * @param params [componentName, componentType, texture, measure, vendor, singlePrice, remark, modelFile, thumbFile]
     * @returns {AxiosPromise}
     */
    saveMaterials: params => {
        let url = `/agcloud/materials/saveMaterials`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },

    //读取系统配置
    findSysSetting: async () => {
        let url = `/resource/findSysSetting`;
        return axiosWraper.getData(proxyUrl + url);
    },
}

export default projectServer;