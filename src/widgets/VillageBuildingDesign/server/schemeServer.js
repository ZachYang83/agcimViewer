/*
 * @Author: luojh
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: luojh
 * @LastEditTime: 2020-09-22 17:18:09
 * @FilePath: \village-building-design\src\net\server\schemeServer.js
 */

import axiosWraper from "@/views/js/net/axiosWraper";

let proxyUrl = '/agsupport-rest';

const schemeServer = {
    /**
     * 添加设计方案
     * @param params.userId必填
     * @param params  [createTime, description, file, landInfo, location, materials, name, userId...]
     * @returns {AxiosPromise<any>}
     */
    addScheme: params => {
        let url = `/agsupport/BIM/scheme/add`;
        return axiosWraper.getDataByPost(proxyUrl + url, params);
    },

    /**
     * 删除设计方案
     * @param params.id必填
     * @returns {Promise<*>}
     */
   deleteScheme: params => {
       let url = `/agsupport/BIM/scheme/delete?id=${params}`;
       return axiosWraper.delete(proxyUrl + url, params);
   },
    /**
     * 设计方案详情
     * @param params.paramType=1，查询方案详情 [id]
     * @param params.paramType=2，获取小品/房屋/构件 [id, materialsId]
     * @returns {Promise<*>}
     */
    getScheme: params => {
        let url = `/agsupport/BIM/scheme/get`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    /**
     * 设计方案列表
     * @param params.page, params.rows分页
     * @param params.isDefault=1默认方案；params.isDefault=0非默认方案；参数不传两者都有）
     * @param params  [isDefault, name, page, rows, userId...]
     * @returns {Promise<*>}
     */
    findScheme: async params => {
        let url = `/agsupport/BIM/scheme/find`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    /**
     * 设置修改方案
     * @param params.paramType=1，修改方案,修改可选参数params [description, file, id, landInfo, location, materials, name, userId...]
     * @param params.paramType=2设置默认 id
     * @returns {Promise<*>}
     */
    updateScheme: params => {
        let url = `/agsupport/BIM/scheme/update`;
        return axiosWraper.put(proxyUrl + url, params);
    },

    previewSchemeUrl: proxyUrl + `/agsupport/BIM/scheme/preview`,

    /**
     * 方案预览
     * @param params.thumb背景图存储位置
     * @returns {Promise<*>}
     */
    previewScheme: async params => {
        let url = `/agsupport/BIM/scheme/preview`;
        return axiosWraper.getData(proxyUrl + url, params);
    },
}

export default schemeServer;