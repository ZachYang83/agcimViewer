/*
 * @Author: luojh
 * @Date: 2020-09-22 17:01:56
 * @LastEditors: pwz
 * @LastEditTime: 2020-09-22 18:04:20
 * @FilePath: \village-building-design\src\net\server\tableServer.js
 */

import axiosWraper from "@/views/js/net/axiosWraper";

let proxyUrl = '/agsupport-rest';

const tableServer = {
    /**
     * agcim3dentity_a表统计，按条件
     * @param params [boundingbox, catagory, categorypath, countKey, id, materialid, name, objectid...]
     * @returns {Promise<*>}
     */
    statisticsDentitya: async params => {
        let url = `/agsupport/BIM/dentitya/statistics`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    filterDentityaUrl: proxyUrl + `/agsupport/BIM/dentitya/filter`,

    /**
     * agcim3dentity_a表过滤
     * @param params [boundingbox, catagory, categorypath, countKey, id, materialid, name, objectid...]
     * @returns {Promise<*>}
     */
    filterDentitya: async params => {
        return axiosWraper.getData(tableServer.filterDentityaUrl, params);
    },

    /**
     * agcim3dentity_a列表
     * @param params [boundingbox, catagory, categorypath, countKey, id, materialid, name, objectid...]
     * @returns {Promise<*>}
     */
    findDentitya: async params => {
        let url = `/agsupport/BIM/dentitya/find`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    /**
     * agcim3dentity_xx表统计分类
     * @param params.tableName必填
     * @param params [catagory, level, name, tableName]
     * @returns {Promise<*>}
     */
    statisticsDentity: async params => {
        let url = `/agsupport/BIM/dentity/statistics`;
        return axiosWraper.getData(proxyUrl + url, params);
    },

    findDentityUrl: proxyUrl + `/agsupport/BIM/dentity/find`,
    previewUrl:proxyUrl + `/agsupport/BIM/dentity/preview`,

    /**
     * agcim3dentity_xx列表，按条件查询
     * @param params.page, params.rows分页
     * @param params.tableName必填
     * @param params [catagory, categorypath, filterType, id, infotype, level, materialid, name, objectid, page, rows, tableName...]
     * @returns {Promise<*>}
     */
    findDentity: async params => {
        return axiosWraper.getData(tableServer.findDentityUrl, params);
    },

    findAllByTableName: async (tableName, param) => {
        let url = `/table/findAll/` + tableName;
        if(param){
            url += "?param=" + param;
        }
        return axiosWraper.getData(encodeURI(proxyUrl + url));
    },

    getMapAllBySql: async sql => {
        let url = `/map/getAll?sql=` + sql;
        return axiosWraper.getData(proxyUrl + url);
    },
}

export default tableServer;